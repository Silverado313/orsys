# ORSYS-ARY Receipt System

## 📋 Project Overview

**ORSYS-ARY** is a comprehensive web-based receipt management system designed for ARY Services. The system provides secure voucher creation, management, reporting, and sharing capabilities with Firebase integration for real-time data synchronization.

## 🌟 Features

- **🔐 Multi-user Authentication** - Secure login system with Firebase Auth
- **📄 Voucher Management** - Create, edit, delete, and view receipt vouchers
- **📊 Advanced Reporting** - Date-range filtering with Excel/CSV export
- **🖨️ Print Functionality** - Professional receipt printing and sharing
- **📱 Progressive Web App** - Offline support with service worker
- **🎯 Admin Panel** - Head management and system administration
- **💰 Denomination Tracking** - Detailed cash breakdown by currency notes
- **🔍 Receipt Verification** - Secure voucher verification system
- **📤 WhatsApp Sharing** - Convert receipts to images for easy sharing

## 🏗️ Project Structure

```
ORSYS-ARY/
│
├── 📄 Root HTML Files
│   ├── index.html              # Main login/dashboard page
│   ├── dashboard.html          # Main dashboard interface
│   ├── receipt.html            # Receipt creation form
│   ├── prntview.html          # Print preview page
│   ├── ReceiptVerification.html # Voucher verification
│   ├── update_voucher_page.html # Edit existing vouchers
│   ├── test.html              # Testing/development page
│   └── sw.js                  # Service Worker for PWA
│
├── 👑 admin/                  # Administration Panel
│   ├── index.html             # Admin dashboard
│   └── add-head-page.html     # Head management interface
│
├── 💼 dv/                     # Document Verification
│   └── index.html             # DV interface
│
├── 🎨 assets/                 # Static Assets
│   ├── css/                   # Stylesheets
│   │   ├── styles.css         # Main application styles
│   │   ├── vstyles.css        # Voucher-specific styles
│   │   └── new.css           # Additional styling
│   │
│   └── js/                    # JavaScript Files
│       ├── firebaseConfig.js  # Firebase configuration
│       ├── app.js            # Main application logic
│       ├── dashboard.js      # Dashboard functionality
│       ├── insert.js         # Voucher insertion logic
│       ├── insertdv.js       # DV insertion logic
│       ├── report.js         # Reporting functionality
│       ├── share.js          # Sharing capabilities
│       └── slipverify.js     # Slip verification
│
├── 🖼️ image/                  # Images and Graphics
│   ├── ARY_Digital_Logo_2.png # Company logo
│   └── qrcode_orsys-ary.web.app.png # QR code for app
│
├── 📱 favicon_io/             # PWA Icons and Manifest
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   ├── app.webmanifest
│   └── site.webmanifest
│
└── 📸 screenshots/            # Application Screenshots
    ├── desktop-wide.png       # Desktop view
    └── mobile-narrow.png      # Mobile view
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for Firebase services
- Firebase project with Firestore database

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ORSYS-ARY
   ```

2. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore Database
   - Update `assets/js/firebaseConfig.js` with your config

3. **Deploy**
   - Upload files to your web hosting service
   - Ensure all paths are correctly configured
   - Test the application in a web browser

### Firebase Configuration

Update the Firebase configuration in `assets/js/firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## 📚 Usage Guide

### 🔐 Authentication

The system supports multi-user access with email-based authentication:

```javascript
const allowedEmails = [
  'aneel@aryservices.com.pk',
  'admin@aryservices.com.pk',
  'manager@aryservices.com.pk',
  'reports@aryservices.com.pk'
];
```

### 📄 Creating Vouchers

1. Navigate to **Receipt Creation** page
2. Fill in required fields:
   - Slip Number
   - Payment From
   - Point Person
   - Payment Mode
   - Denomination breakdown
3. Add remarks if needed
4. Submit the voucher

### 📊 Generating Reports

1. Go to **Reports** section
2. Select date range (From/To)
3. Choose payment status filter
4. Click **Generate Report**
5. Export to Excel or CSV

### 🖨️ Printing Receipts

1. Find voucher in dashboard
2. Click **Print** button
3. Receipt opens in new window
4. Use browser print function

## 🛠️ Technical Specifications

### Frontend Technologies

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Bootstrap 5
- **JavaScript ES6+** - Modern JavaScript features
- **Bootstrap 5.3.0** - Responsive UI framework
- **Font Awesome 6.4.0** - Icon library
- **DataTables.net** - Advanced table functionality

### Backend Services

- **Firebase Authentication** - User management
- **Cloud Firestore** - NoSQL database
- **Firebase Hosting** - Web hosting (optional)

### PWA Features

- **Service Worker** - Offline functionality
- **Web App Manifest** - Installation capability
- **Responsive Design** - Mobile-first approach
- **Caching Strategy** - Optimized performance

## 🗄️ Database Schema

### Firestore Collections

#### `vouchers` Collection
```javascript
{
  slipNo: number,
  paymentFrom: string,
  pointPerson: string,
  paymentMode: string,
  paymentStatus: string,
  user: string,
  entryDate: timestamp,
  deno5000: number,
  deno1000: number,
  deno500: number,
  deno100: number,
  deno50: number,
  deno20: number,
  deno10: number,
  deno1: number,
  remarks: string
}
```

#### `head` Collection
```javascript
{
  name: string,
  code: string,
  status: string,
  category: string,
  description: string,
  createdAt: timestamp,
  createdBy: string,
  updatedAt: timestamp,
  updatedBy: string
}
```

## 🔧 Configuration

### Service Worker

The application includes a comprehensive service worker (`sw.js`) for:
- **Static Resource Caching** - Faster load times
- **Dynamic Content Caching** - Offline functionality
- **Background Sync** - Offline form submissions
- **Push Notifications** - Future feature support

### Security Rules

Recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write vouchers
    match /vouchers/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write heads
    match /head/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Progressive Web App

The application is PWA-ready with:

- **Installable** - Can be installed on devices
- **Offline Capable** - Works without internet
- **Responsive** - Adapts to all screen sizes
- **Fast Loading** - Optimized caching strategies

### Installation

Users can install the app by:
1. Opening the website in a browser
2. Clicking the "Install" prompt
3. Or using "Add to Home Screen" option

## 🧪 Testing

### Test Files

- `test.html` - Development and testing interface
- Use browser developer tools for debugging
- Test offline functionality by disabling network

### Browser Compatibility

- **Chrome** 60+ ✅
- **Firefox** 55+ ✅
- **Safari** 11+ ✅
- **Edge** 79+ ✅

## 📈 Performance Optimization

- **Lazy Loading** - Images and non-critical resources
- **Code Splitting** - Modular JavaScript architecture
- **Compression** - Minified CSS and JavaScript
- **CDN Usage** - Bootstrap and Font Awesome from CDN
- **Caching Strategy** - Service worker optimization

## 🔒 Security Features

- **Firebase Authentication** - Secure user management
- **Email Whitelisting** - Restricted access control
- **HTTPS Required** - Secure data transmission
- **Input Validation** - Client-side and server-side validation
- **XSS Protection** - Sanitized user inputs

## 📞 Support & Contact

For technical support or questions:

- **Developer**: TechPeer
- **Project**: ORSYS-ARY Receipt System
- **Version**: 2.0
- **Last Updated**: January 2025

## 📄 License

This project is proprietary software developed for ARY Services. All rights reserved.

## 🚀 Deployment

### Production Deployment

1. **Build Optimization**
   - Minify CSS and JavaScript files
   - Optimize images and assets
   - Test all functionality

2. **Firebase Deployment**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

3. **Custom Domain Setup**
   - Configure DNS settings
   - Set up SSL certificate
   - Update Firebase hosting settings

### Environment Variables

Set up environment-specific configurations for:
- Firebase project IDs
- API endpoints
- Feature flags

## 🔄 Version History

- **v2.0** - Major UI overhaul, PWA features, enhanced reporting
- **v1.5** - Added WhatsApp sharing, improved mobile responsiveness
- **v1.0** - Initial release with basic voucher management

---

**Built with ❤️ by TechPeer for ARY Services**