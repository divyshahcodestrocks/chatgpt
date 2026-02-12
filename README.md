# 🚀 Google Drive Workspace Manager - No Login Required

A powerful Google Drive file manager that allows users to manage files and folders **without signing in**. All authentication is handled server-side using a Google Service Account.

## ✨ Features

- 📁 **Browse Files & Folders** - Navigate through your Drive without login
- 📤 **Upload Files** - Direct file uploads to Google Drive
- 📝 **Create Folders** - Organize your files easily
- ✏️ **Update Files** - Replace existing file contents
- 🗑️ **Delete Items** - Remove files and folders
- 🔗 **Share & Permissions** - Manage file sharing and access control
- 👁️ **Preview Files** - View files directly in the browser
- 🔍 **Search** - Find files quickly

## 🏗️ Architecture

```
┌─────────────┐      HTTP      ┌─────────────┐    Google Drive API    ┌─────────────┐
│   Browser   │ ◄──────────────► │  Backend    │ ◄────────────────────► │   Google    │
│  (Frontend) │   API Calls     │   Server    │   Service Account     │    Drive    │
└─────────────┘                 └─────────────┘                        └─────────────┘
```

**No user authentication required!** The backend handles all Drive operations using a Service Account.

---

## 📋 Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **Google Cloud Project** with Drive API enabled
3. **Service Account** credentials

---

## 🛠️ Setup Instructions

### Step 1: Create Google Cloud Project & Service Account

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project** (or use existing):
   - Click "Select a project" → "New Project"
   - Name it (e.g., "Drive Manager")
   - Click "Create"

3. **Enable Google Drive API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

4. **Create Service Account**:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `drive-manager` (or any name)
   - Click "Create and Continue"
   - Skip optional steps, click "Done"

5. **Create Service Account Key**:
   - Click on your newly created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Click "Create"
   - **A JSON file will download** - this is your credential file!

6. **Share Google Drive with Service Account**:
   - Copy the service account email (looks like: `drive-manager@your-project.iam.gserviceaccount.com`)
   - Go to your Google Drive: https://drive.google.com/
   - Right-click on the folder you want to manage
   - Click "Share"
   - Paste the service account email
   - Give it "Editor" permissions
   - Click "Send"

   **Important**: The service account can only access files/folders that are explicitly shared with it!

### Step 2: Install & Configure

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Add Service Account credentials**:
   - Rename the downloaded JSON file to `service-account-key.json`
   - Place it in the project root directory (same folder as `server.js`)

   **⚠️ Security Warning**: Never commit this file to Git! It's already in `.gitignore`

### Step 3: Run the Application

1. **Start the backend server**:

   ```bash
   npm start
   ```

   You should see:

   ```
   ✅ Google Drive API initialized with Service Account
   🚀 Server running on http://localhost:3000
   📁 Frontend available at http://localhost:3000
   ```

2. **Open your browser**:
   - Go to: http://localhost:3000
   - The app should show "✅ Server ready - Connected to Google Drive"
   - You can now manage Drive files without logging in!

---

## 🎯 Usage Guide

### Browse Files

1. Enter folder ID (or use "root" for main folder)
2. Click "Refresh" to load files
3. Use "Search" to filter files by name

### Create Folder

1. Enter new folder name
2. Enter parent folder ID (default: "root")
3. Click "Create Folder"

### Upload Files

1. Select folder to upload to (default: "root")
2. Choose file using "Select File"
3. Click "Upload New File"

### Update Existing File

1. Enter the file ID to update
2. Choose replacement file
3. Click "Update Existing File"

### Share Files/Folders

1. Enter the item ID
2. Enter user email address
3. Choose permission level (Read/Comment/Write)
4. Click "Share"

### Preview & Manage

- Click **Preview** to view files
- Click **Open** to open in Google Drive
- Click **Copy ID** to copy the file/folder ID
- Click **Delete** to move to trash

---

## 🔧 Configuration

### Change Port

Edit `server.js` at the bottom:

```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your preferred port
```

Or use environment variable:

```bash
PORT=8080 npm start
```

### Update API Base URL (Frontend)

If you change the port, update `app.js` line 2:

```javascript
const API_BASE = "http://localhost:3000/api"; // Change port here
```

---

## 📂 Project Structure

```
chatgpt/
├── server.js                          # Backend Express server
├── app.js                             # Frontend JavaScript (API client)
├── index.html                         # Frontend UI
├── styles.css                         # Styling
├── package.json                       # Dependencies
├── service-account-key.json          # Service account credentials (DO NOT COMMIT)
├── service-account-key.example.json  # Example credentials template
├── uploads/                          # Temporary upload directory
└── README.md                         # Documentation
```

---

## 🔒 Security Best Practices

1. **Never commit `service-account-key.json`** to version control
2. **Restrict service account permissions** - only share specific folders
3. **Use environment variables** for sensitive config in production
4. **Enable CORS** only for trusted domains in production
5. **Add rate limiting** to prevent abuse
6. **Use HTTPS** in production (not HTTP)

---

## 🐛 Troubleshooting

### "Backend server not running"

- Make sure you ran `npm start`
- Check if port 3000 is available
- Look for errors in the terminal

### "Service account not configured"

- Verify `service-account-key.json` exists in the project root
- Check the JSON file is valid
- Ensure Drive API is enabled in Google Cloud Console

### "Permission denied" errors

- Make sure you shared the Drive folder with the service account email
- Give the service account "Editor" permissions
- Check the folder ID is correct

### Files not showing up

- Verify the folder is shared with service account
- Check the folder ID is correct
- Try using "root" to access service account's own Drive

### "Invalid grant" error

- Service account key might be expired or deleted
- Create a new key from Google Cloud Console
- Replace the old `service-account-key.json` file

---

## 🚀 Deployment

### Deploy to Cloud (Heroku, Railway, etc.)

1. **Set environment variable** for service account:

   ```bash
   GOOGLE_SERVICE_ACCOUNT_KEY='<paste your JSON content here>'
   ```

2. **Update `server.js`** to read from environment:

   ```javascript
   const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
     ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
     : JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf8"));
   ```

3. **Update frontend API_BASE** to your deployed URL:
   ```javascript
   const API_BASE = "https://your-app.herokuapp.com/api";
   ```

---

## 📝 API Endpoints

| Method | Endpoint                               | Description          |
| ------ | -------------------------------------- | -------------------- |
| GET    | `/api/drive/files`                     | List files in folder |
| POST   | `/api/drive/folders`                   | Create new folder    |
| POST   | `/api/drive/upload`                    | Upload new file      |
| PATCH  | `/api/drive/files/:fileId`             | Update existing file |
| DELETE | `/api/drive/files/:fileId`             | Delete file/folder   |
| POST   | `/api/drive/files/:fileId/permissions` | Share file/folder    |
| GET    | `/api/drive/files/:fileId/permissions` | List permissions     |
| GET    | `/api/drive/files/:fileId/download`    | Download file        |
| GET    | `/api/health`                          | Server health check  |

---

## 🤝 Contributing

Feel free to submit issues and pull requests!

---

## 📄 License

MIT License - feel free to use this project however you like!

---

## 🎉 Success!

You now have a fully functional Google Drive manager that **requires no user login**!

All operations are handled by your service account, making it perfect for:

- Internal team tools
- Automated file management
- Public file browsers (read-only)
- Backend integrations

Enjoy! 🚀
