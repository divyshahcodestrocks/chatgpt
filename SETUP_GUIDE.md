# 🔑 Quick Setup Guide - Service Account Configuration

Follow these steps to get your Google Drive Manager running **without login**!

---

## Part 1: Google Cloud Console Setup (5 minutes)

### 1. Create Google Cloud Project

1. Visit: https://console.cloud.google.com/
2. Click dropdown at top → "New Project"
3. Project name: `Drive Manager` (or your choice)
4. Click **Create**

### 2. Enable Google Drive API

1. In your new project, go to: **APIs & Services** → **Library**
2. Search: `Google Drive API`
3. Click on it → Click **Enable**

### 3. Create Service Account

1. Go to: **IAM & Admin** → **Service Accounts**
2. Click **+ Create Service Account**
3. Fill in:
   - **Name**: `drive-manager`
   - **Description**: `Service account for Drive Manager app`
4. Click **Create and Continue**
5. Skip the optional steps → Click **Done**

### 4. Generate Credentials (JSON Key)

1. Click on your service account name (the one you just created)
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose format: **JSON**
5. Click **Create**

**📥 A JSON file will download automatically!**

### 5. Copy the Service Account Email

On the service account details page, you'll see an email like:

```
drive-manager@your-project-id.iam.gserviceaccount.com
```

**Copy this email** - you'll need it in the next step!

---

## Part 2: Share Your Google Drive

The service account can **only access folders you share with it**.

### Option A: Share Specific Folder (Recommended)

1. Go to: https://drive.google.com
2. Right-click on the folder you want to manage
3. Click **Share**
4. Paste the service account email you copied earlier
5. Set permission to **Editor**
6. **Uncheck** "Notify people" (it's a service account, not a real person)
7. Click **Send**

### Option B: Share Entire Drive (Use with caution)

1. Share your entire "My Drive" folder with the service account
2. Follow the same steps as Option A

**⚠️ Security Note**: Only share what you need! The service account will have full access to shared folders.

---

## Part 3: Configure Your Application

### 1. Place the Credentials File

1. Find the JSON file you downloaded (probably in your Downloads folder)
2. **Rename it** to: `service-account-key.json`
3. **Move it** to your project folder: `c:\DivyCode\chatgpt\`

Your folder should now have:

```
c:\DivyCode\chatgpt\
├── service-account-key.json   ← Your new file
├── server.js
├── app.js
├── index.html
└── package.json
```

### 2. Verify the File

Open `service-account-key.json` and verify it looks like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "drive-manager@your-project.iam.gserviceaccount.com",
  ...
}
```

**✅ If it looks similar, you're good to go!**

---

## Part 4: Run the Application

### 1. Start the Server

Open a terminal in `c:\DivyCode\chatgpt\` and run:

```bash
npm start
```

You should see:

```
✅ Google Drive API initialized with Service Account
🚀 Server running on http://localhost:3000
📁 Frontend available at http://localhost:3000
```

### 2. Open in Browser

Open your browser and go to: **http://localhost:3000**

You should see:

```
✅ Server ready - Connected to Google Drive
```

---

## Part 5: Test It Out!

### First Test: Browse Root Folder

1. The folder ID should show: `root`
2. Click **Refresh**
3. You should see the files from the service account's own drive

### Second Test: Access Shared Folder

1. Go to your Google Drive in browser
2. Right-click on the folder you shared → Click "Get link" → "Copy link"
3. The link looks like: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
4. Copy the **FOLDER_ID** part
5. Paste it in the "Current Folder ID" field
6. Click **Refresh**
7. You should now see the contents of that shared folder!

### Third Test: Create a Folder

1. Enter a folder name: `Test Folder`
2. Click **Create Folder**
3. It should appear in the list!

### Fourth Test: Upload a File

1. Click **Select File** and choose any file
2. Click **Upload New File**
3. The file should appear in the list!

---

## 🎉 Success!

You now have a **fully functional Google Drive manager with NO login required**!

### What You Can Do Now:

✅ Browse files/folders  
✅ Create folders  
✅ Upload files  
✅ Update files  
✅ Delete files  
✅ Share files with others  
✅ Preview files

### Important Notes:

- **Users don't need Google accounts** - they just access your app
- The service account manages **everything behind the scenes**
- You can share this app URL with anyone
- All operations happen under the service account's permissions

---

## 🐛 Troubleshooting

### Error: "Service account not configured"

- Make sure `service-account-key.json` exists in the project root
- Check the file name is exactly `service-account-key.json` (not `.example.json`)

### Error: "No files showing up"

- Make sure you shared the Google Drive folder with the service account email
- Try using `root` to see the service account's own drive first
- Verify you gave "Editor" permissions (not just "Viewer")

### Error: "Permission denied"

- The folder is not shared with the service account
- Go back to Part 2 and share the folder again

### Server won't start

- Make sure you ran `npm install` first
- Check if port 3000 is already in use
- Try a different port: `PORT=8080 npm start`

---

## 📞 Need Help?

1. Check the main README.md for detailed documentation
2. Verify all steps above were completed
3. Check the browser console (F12) for errors
4. Check the server terminal for error messages

---

## 🔐 Security Reminder

**NEVER commit `service-account-key.json` to Git or share it publicly!**

This file gives full access to your Google Drive. Treat it like a password!

---

Happy Drive Managing! 🚀
