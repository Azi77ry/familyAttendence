# 👨‍👩‍👧‍👦 Family Attendance System

A modern, location-based attendance tracking system for families. Track morning and night check-ins with GPS verification to ensure family members are home safely.

![Family Attendance System](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🔐 User Management
- **Multi-user Registration & Login** - Create accounts for all family members
- **Profile Management** - Upload profile pictures and edit personal information
- **Secure Authentication** - Username and password-based login system

### 📍 Location-Based Check-ins
- **GPS Verification** - Automatically verify users are within 50 meters of home
- **Dual Sessions** - Morning (🌅) and Night (🌙) check-in tracking
- **Real-time Distance Calculation** - Shows exact distance from home location
- **Demo Mode** - Simulated location for testing when GPS is unavailable

### 📊 Attendance Tracking
- **Personal Dashboard** - View your own attendance history and statistics
- **Family Overview** - See all family members' attendance at a glance
- **7-Day Visual Tracker** - Quick visual representation of the last week
- **Detailed Member View** - Click any member to see their complete attendance history

### 📈 Statistics & Analytics
- **Total Days Tracked** - Count of unique attendance days
- **Session Counts** - Separate tracking for morning and night sessions
- **Streak Counter** - Track consecutive days of attendance
- **Visual Indicators** - Color-coded attendance status

### 💾 Data Persistence
- **Local Storage** - All data saved in browser's localStorage
- **No Server Required** - Fully client-side application
- **Persistent Records** - Data survives browser refresh

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or build tools required!

### Installation

1. **Download the file**
   ```bash
   # Clone or download the repository
   git clone https://github.com/yourusername/family-attendance.git
   ```

2. **Open the application**
   - Simply double-click `index.html` or
   - Right-click → Open with → Your preferred browser
   - Or drag and drop into browser window

3. **Start using**
   - Create your first family member account
   - Login and start tracking attendance!

## 📖 How to Use

### First Time Setup

1. **Register a New Account**
   - Click "Create Account" on the login screen
   - Fill in your full name, username, and password
   - (Optional) Upload a profile picture
   - Click "Register"

2. **Login**
   - Enter your username and password
   - Click "Login" to access your dashboard

### Daily Check-ins

1. **Morning Check-in (🌅)**
   - Click the "Morning Session" button
   - System will verify your location
   - If within 50m of home, attendance is recorded

2. **Night Check-in (🌙)**
   - Click the "Night Session" button
   - Same location verification process
   - Attendance recorded if location is valid

### View Family Records

1. **All Members View**
   - Click "All Members" button in the header
   - See a table with all family members
   - View last 7 days attendance at a glance
   - Color coding:
     - 🟢 Green: Both sessions complete
     - 🟡 Yellow: One session complete
     - ⚪ Gray: No attendance

2. **Individual Member Details**
   - Click on any member row in the table
   - View complete attendance history
   - See detailed statistics (total days, streaks, etc.)

### Edit Profile

1. Click the edit icon (✏️) on your profile picture
2. Upload a new photo or change your name
3. Click "Save Changes"

## ⚙️ Configuration

### Setting Your Home Location

Open `index.html` and modify these constants (around line 49):

```javascript
const HOME_LAT = -6.7924;      // Your home latitude
const HOME_LNG = 39.2083;      // Your home longitude
const MAX_DISTANCE = 50;       // Maximum distance in meters
```

**How to find your coordinates:**
1. Open Google Maps
2. Right-click on your home location
3. Click on the coordinates to copy them
4. Update `HOME_LAT` and `HOME_LNG` values

### Adjusting Distance Threshold

Change `MAX_DISTANCE` to your preferred radius (in meters):
- `50` = 50 meters (default)
- `100` = 100 meters
- `200` = 200 meters

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework (via CDN) |
| **Tailwind CSS** | Styling framework |
| **Babel Standalone** | JSX transformation in browser |
| **Geolocation API** | GPS location tracking |
| **localStorage API** | Client-side data persistence |
| **Custom SVG Icons** | Inline icon components |

## 📁 Project Structure

```
GhettoAttendence/
│
├── index.html          # Main application file (single-file app)
└── README.md          # Documentation (this file)
```

## 🎨 Features Breakdown

### User Interface
- **Gradient Design** - Modern gradient backgrounds and cards
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Hover effects and transitions
- **Visual Feedback** - Color-coded status indicators
- **Profile Pictures** - Support for custom avatars

### Data Management
- **Individual User Records** - Separate attendance tracking per user
- **Date-based Organization** - Records organized by date
- **Session Tracking** - Morning and night sessions tracked separately
- **Automatic Calculations** - Stats computed in real-time

### Security & Privacy
- **Local-only Storage** - No data sent to external servers
- **Browser-based** - All processing happens on your device
- **No Account Recovery** - Keep your passwords safe!

## 🔒 Privacy & Data

- **100% Client-side**: All data stays in your browser
- **No Server**: No data transmission over the internet
- **No Tracking**: No analytics or third-party scripts
- **Your Data**: You have full control, stored in browser's localStorage

## ⚠️ Important Notes

1. **Browser Data**: Clearing browser data will delete all attendance records
2. **Backup**: No automatic backup - consider exporting data periodically
3. **Single Browser**: Data is tied to the browser/device where it was created
4. **GPS Required**: For accurate location verification, enable location services
5. **Demo Mode**: When GPS is unavailable, system uses simulated location

## 🐛 Troubleshooting

### Location Not Working
- **Enable GPS**: Make sure location services are enabled in browser
- **Allow Permissions**: Grant location permission when prompted
- **HTTPS**: Some browsers require HTTPS for GPS (use local file:// for testing)
- **Demo Mode**: System automatically falls back to demo mode

### Data Not Saving
- **Storage Full**: Check if browser storage quota is exceeded
- **Private Browsing**: Some browsers don't persist localStorage in private mode
- **Browser Settings**: Ensure localStorage is enabled

### Icons Not Showing
- Icons are inline SVG components, should work in all browsers
- If issues persist, check browser console for errors

## 📝 Future Enhancements

Potential features for future versions:
- [ ] Export attendance data to CSV/PDF
- [ ] Weekly/Monthly reports
- [ ] Multiple location support (home, office, etc.)
- [ ] Notifications for missed check-ins
- [ ] Dark mode support
- [ ] Data backup/restore functionality
- [ ] Admin dashboard for family head
- [ ] Attendance reminders

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developer

Created with ❤️ for families who care about safety and accountability.

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the developer

---

**Made with React • Tailwind CSS • JavaScript**

*Stay connected, stay safe! 👨‍👩‍👧‍👦*
