require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

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

// --- API Endpoints ---

// POST /api/register
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name, profilePic } = req.body;

        if (!username || !password || !name) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        
        // In a real app, hash passwords! We're skipping for simplicity.
        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = {
            username,
            password,
            name,
            profilePic: profilePic || null,
            registeredAt: new Date().toISOString()
        };

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'Registration successful!', userId: result.insertedId });

    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await usersCollection.findOne({ username, password });

        if (user) {
            // Rename _id to id for frontend compatibility
            user.id = user._id;
            delete user._id;
            res.json(user);
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// GET /api/users
app.get('/api/users', async (req, res) => {
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
        res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
    }
});

// PUT /api/users/:id
app.put('/api/users/:id', async (req, res) => {
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
        res.status(500).json({ message: 'Failed to update profile.', error: error.message });
    }
});

// GET /api/attendance
app.get('/api/attendance', async (req, res) => {
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
        res.status(500).json({ message: 'Failed to fetch attendance.', error: error.message });
    }
});

// POST /api/attendance
app.post('/api/attendance', async (req, res) => {
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
        res.status(500).json({ message: 'Failed to record attendance.', error: error.message });
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

