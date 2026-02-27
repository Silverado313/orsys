# 🧾 ORSYS-ARY
### Online Receipt & Voucher Management System

![Version](https://img.shields.io/badge/Version-1.0-blue?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-9.23.0-orange?style=for-the-badge&logo=firebase)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-purple?style=for-the-badge&logo=bootstrap)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

**A comprehensive financial receipt and voucher management system built with Firebase.**

[🚀 Live System](https://orsys-ary.firebaseapp.com) • [👨‍💻 Developer](https://techpeer.web.app) • [📧 Support](mailto:support@techpeer.web.app)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [User Guide](#-user-guide)
- [Security & Authentication](#-security--authentication)
- [Reporting & Analytics](#-reporting--analytics)
- [Firestore Data Models](#-firestore-data-models)
- [Troubleshooting](#-troubleshooting)
- [Developer Notes](#-developer-notes)
- [Credits & License](#-credits--license)

---

## 🎯 Overview

**ORSYS-ARY** is a robust online receipt and voucher management system designed for streamlined financial operations. It enables organizations to digitally manage, track, and verify cash receipts and payment vouchers in real time.

| Feature | Description |
|--------|-------------|
| 🧾 **CRV** | Cash Receipt Voucher — records incoming payments |
| 💸 **CPV/DV** | Cash Payment / Debit Voucher — records outgoing payments |
| 📊 **Analytics** | Executive dashboard with real-time financial insights |
| 🔍 **Verification** | Public receipt verification via slip number |
| 👥 **Multi-user** | Role-based access with email authorization |
| 📤 **Export** | PDF, Image, and Excel export options |

---

## ✨ Features

### 🧾 Dual Voucher System
- **CRV** — Create and manage cash receipt vouchers with full denomination tracking
- **CPV/DV** — Create debit/payment vouchers linked to admin-configured payment heads

### 📊 Smart Analytics Dashboard
- Real-time KPI monitoring cards
- Interactive charts powered by Chart.js
- Trend analysis over 7 / 30 / 90 / 365 days
- Department-wise and head-wise spending breakdowns

### 📁 Advanced Reporting
- DataTables with server-side filtering
- Date range and status-based filters
- Excel, PDF, and print exports
- Top performers / point person rankings

### 🔒 Security
- Firebase Authentication (Email/Password)
- Pre-authorized email whitelist
- Receipt verification via unique slip numbers
- QR code integration on printed receipts

### 📱 Mobile Responsive
- Bootstrap 5 responsive layout
- PWA (Progressive Web App) ready
- Mobile-friendly interfaces across all pages

---

## 🛠 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| HTML5 / CSS3 | — | Structure & Styling |
| Bootstrap | 5.3.0 | Responsive UI Framework |
| JavaScript | ES6+ | Application Logic |
| Chart.js | 4.4.0 | Data Visualization |
| DataTables | 1.13.7 | Table Management |
| Font Awesome | 6.4.0 | Icons |
| jQuery | 3.7.1 | DataTables Dependency |

### Backend & Services
| Technology | Version | Purpose |
|-----------|---------|---------|
| Firebase Firestore | 9.22–9.23 | Database |
| Firebase Auth | 9.22–9.23 | Authentication |
| Firebase Hosting | — | Deployment |

### Utilities
| Library | Purpose |
|--------|---------|
| html2canvas | Screenshot / Image export |
| jsPDF / html2pdf.js | PDF generation |
| QRCode.js | QR code on receipts |
| JSZip + pdfmake | Excel/PDF DataTable exports |

---

## 📁 Project Structure

```
orsys-ary/
│
├── 📂 public/                        # Firebase Hosting root
│   ├── index.html                    # Login page
│   ├── dashboard.html                # Main dashboard
│   │
│   ├── 📂 src/
│   │   ├── 📂 pages/
│   │   │   ├── 📂 vouchers/          # Cash Receipt Voucher pages
│   │   │   │   ├── receipt.html      # Create new CRV
│   │   │   │   ├── verify.html       # Verify receipt
│   │   │   │   └── print.html        # Share/print receipt
│   │   │   │
│   │   │   ├── 📂 dv/                # Debit Voucher pages
│   │   │   │   ├── index.html        # Create new CPV
│   │   │   │   └── print.html        # Share/print DV
│   │   │   │
│   │   │   ├── 📂 admin/             # Admin pages
│   │   │   │   └── add-head.html     # Manage payment heads
│   │   │   │
│   │   │   └── 📂 dashboard/         # Dashboard pages
│   │   │       ├── index.html        # CRV dashboard
│   │   │       ├── dv.html           # DV dashboard
│   │   │       └── analytics.html    # Analytics dashboard
│   │   │
│   │   ├── 📂 scripts/
│   │   │   ├── 📂 config/
│   │   │   │   └── firebaseConfig.js
│   │   │   ├── 📂 dashboard/
│   │   │   ├── 📂 dv/
│   │   │   ├── 📂 vouchers/
│   │   │   └── 📂 admin/
│   │   │
│   │   └── 📂 styles/
│   │       ├── voucher.css
│   │       └── crv.css
│   │
│   ├── 📂 assets/
│   │   ├── 📂 css/
│   │   │   ├── styles.css
│   │   │   └── navbar.css
│   │   └── 📂 js/
│   │       ├── navbar.js
│   │       └── sign-in.js
│   │
│   └── 📂 favicon_io/                # Favicon assets
│
├── firebase.json
└── .firebaserc
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js & Firebase CLI installed
- Firebase project with **Firestore** and **Authentication** enabled
- Modern browser (Chrome 80+, Firefox 75+, Safari 13+)

### 1. Clone the Repository
```bash
git clone https://github.com/Silverado313/orsys.git
cd orsys
```

### 2. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 3. Configure Firebase
Edit `/src/scripts/config/firebaseConfig.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 4. Initialize Firestore Collections
Create the following collections in your Firebase console:

| Collection | Purpose |
|-----------|---------|
| `receipts` | CRV records |
| `dr.vouchers` | DV/CPV records |
| `head` | Payment heads |
| `users` | User management (optional) |

### 5. Configure Allowed Users
Edit `/assets/js/sign-in.js`:
```javascript
const allowedEmails = [
  'user1@example.com',
  'user2@example.com'
];
```

### 6. Run Locally
```bash
firebase serve --host 192.168.99.129 --port 5000
```

### 7. Deploy to Firebase Hosting
```bash
firebase deploy
```

---

## 📖 User Guide

### 🔑 Login
1. Open the system URL
2. Enter your authorized email and password
3. System validates against the allowed email list
4. Redirected to the main dashboard upon success

### 🧾 Creating a Cash Receipt Voucher (CRV)
1. Navigate to `/receipt.html`
2. Fill in required fields:
   - Cell No (12 digits)
   - Point Person
   - Payment Mode (Cash / Bank)
   - Payment From
   - Payment Status
   - Denomination breakdown
3. Submit → slip number auto-generated

### 💸 Creating a Debit Voucher (CPV/DV)
1. Navigate to `/dv/index.html`
2. Select **Payment Head** (configured by admin)
3. Fill remaining fields (same as CRV)
4. Submit → voucher number auto-generated

### 📊 Dashboard & Analytics
- **Main Dashboard** — View all vouchers, filter, export, view details
- **Analytics Dashboard** — KPI cards, trend charts, department breakdowns

### 🔍 Receipt Verification
1. Navigate to `/verify.html`
2. Enter the slip number
3. View verified receipt details
4. Print or share the receipt

### ⚙️ Admin — Payment Heads
1. Navigate to `/admin/add-head.html`
2. Add new heads (Expense / Income / Asset)
3. Edit or delete existing heads

---

## 🔒 Security & Authentication

### Access Control
- Email/password authentication via Firebase Auth
- Pre-defined allowed email whitelist
- Session managed by Firebase SDK

### Recommended Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /receipts/{document} {
      allow read, write: if request.auth != null;
    }
    match /dr.vouchers/{document} {
      allow read, write: if request.auth != null;
    }
    match /head/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📊 Reporting & Analytics

| Report | Description |
|--------|-------------|
| Voucher Report | Filter by date range and status |
| Analytics Dashboard | Executive-level insights |
| Top Performers | Point person rankings |
| Department Analysis | Spending by head/department |

### Export Options
| Format | Method |
|--------|--------|
| `.xlsx` Excel | DataTables Buttons + JSZip |
| `.pdf` PDF | jsPDF / html2pdf.js |
| `.png` Image | html2canvas |
| Print | Browser native print |

---

## 🗃 Firestore Data Models

### `receipts` Collection
```javascript
{
  slipNo: number,               // Auto-generated timestamp
  paymentFrom: string,
  pointPerson: string,
  paymentMode: string,          // Cash, HBL, MEZAN, etc.
  paymentStatus: string,        // Pending, Completed, Failed
  totalAmount: number,
  cellNo: string,
  user: string,
  email: string,
  remarks: string,
  denominations: {
    deno5000: number,
    deno1000: number,
    deno500: number,
    deno100: number,
    deno50: number,
    deno20: number,
    deno10: number
  },
  timestamp: Timestamp
}
```

### `head` Collection
```javascript
{
  name: string,
  code: string,
  status: string,               // active / inactive
  category: string,             // expense / income / asset
  description: string,
  createdDate: Timestamp
}
```

---

## 🐛 Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Login Failed | Email not in allowed list | Add email to `allowedEmails` array |
| Permission Denied | Firestore rules blocking | Update security rules |
| Charts Not Loading | CDN issue | Check internet / console errors |
| Export Not Working | Missing JSZip/pdfmake | Verify CDN links are loading |
| Blank Dashboard | Auth not initialized | Check `firebaseConfig.js` values |

### Enable Debug Logging
```javascript
// Add to any script for debugging
console.log('Module loaded:', moduleName);
console.log('Firestore data:', data);
```

---

## 👨‍💻 Developer Notes

### Code Standards
- Use Firebase SDK version `9.22.0` or `9.23.0` consistently
- Follow Bootstrap 5 markup conventions
- Use Font Awesome 6 for all icons
- File naming: HTML → `kebab-case`, JS → `camelCase`, CSS → `kebab-case`

### Browser Support
| Browser | Minimum Version |
|---------|----------------|
| Chrome | 80+ ✅ |
| Firefox | 75+ ✅ |
| Safari | 13+ ✅ |
| Edge | 80+ ✅ |

---

## 📞 Credits & License

**Developed by:** Syed Aneel Raza — [TechPeer](https://techpeer.web.app)  
**Powered by:** [Claude.AI](https://claude.ai)  
**Last Updated:** December 2024 | **Version:** 1.0

### Libraries & Frameworks
Bootstrap 5 • Firebase • Chart.js • DataTables • Font Awesome • QRCode.js • jsPDF • html2canvas

---



**© 2024 ORSYS-ARY — All Rights Reserved**  
*For internal use only. Ensure compliance with your organization's data policies.*

