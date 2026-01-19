require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Joi = require('joi');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("FATAL ERROR: MONGODB_URI is not defined. Please create a .env file with your MongoDB connection string.");
    process.exit(1);
}

const client = new MongoClient(uri);

let db, usersCollection, attendanceCollection;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("family_attendance");
        usersCollection = db.collection("users");
        attendanceCollection = db.collection("attendance");
        console.log("Successfully connected to MongoDB Atlas!");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
}

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// Validation Schemas
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),

    name: Joi.string().required(),
    profilePic: Joi.string().allow(null, '')
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});


// --- API Endpoints ---

// POST /api/register
app.post('/api/register', async (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { username, password, name, profilePic } = req.body;
        
        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            name,
            profilePic: profilePic || null,
            registeredAt: new Date().toISOString()
        };

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'Registration successful!', userId: result.insertedId });

    } catch (error) {
        next(error);
    }
});

// POST /api/login
app.post('/api/login', async (req, res, next) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { username, password } = req.body;
        const user = await usersCollection.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Rename _id to id for frontend compatibility
            user.id = user._id;
            delete user._id;
            delete user.password;
            res.json(user);
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        next(error);
    }
});

// GET /api/users
app.get('/api/users', async (req, res, next) => {
    try {
        const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
        // Rename _id to id for frontend
        const safeUsers = users.map(user => {
            user.id = user._id;
            delete user._id;
            return user;
        });
        res.json(safeUsers);
    } catch (error) {
        next(error);
    }
});

// PUT /api/users/:id
app.put('/api/users/:id', async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { name, profilePic } = req.body;

        const result = await usersCollection.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $set: { name, profilePic } },
            { returnDocument: 'after', projection: { password: 0 } }
        );
        
        if (result) {
            result.id = result._id;
            delete result._id;
            res.json(result);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
});

// GET /api/attendance
app.get('/api/attendance', async (req, res, next) => {
    try {
        const allAttendance = await attendanceCollection.find({}).toArray();
        // Restructure for the frontend { userId: [records] }
        const recordsByUId = {};
        allAttendance.forEach(record => {
            if (!recordsByUId[record.userId]) {
                recordsByUId[record.userId] = [];
            }
            recordsByUId[record.userId].push(record.record);
        });
        res.json(recordsByUId);
    } catch (error) {
        next(error);
    }
});

// POST /api/attendance
app.post('/api/attendance', async (req, res, next) => {
    try {
        const { userId, record } = req.body;

        if (!userId || !record) {
            return res.status(400).json({ message: 'User ID and record are required.' });
        }

        await attendanceCollection.insertOne({ 
            userId: new ObjectId(userId), 
            record,
            createdAt: new Date()
        });

        // Fetch all records for that user to return
        const userRecords = await attendanceCollection.find({ userId: new ObjectId(userId) }).toArray();
        const formattedRecords = userRecords.map(r => r.record);

        res.status(201).json({ message: 'Attendance recorded', records: formattedRecords });
    } catch (error) {
        next(error);
    }
});


// Catch-all to serve the main HTML file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server after connecting to the DB
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
