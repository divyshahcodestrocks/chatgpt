# 🚀 QUICK START CARD

## 🎯 Goal: Run Google Drive Manager WITHOUT Login

---

## ⚡ Super Quick Setup (5 Minutes)

### 1️⃣ Get Credentials from Google

```
1. Visit: https://console.cloud.google.com/
2. Create Project → Enable "Google Drive API"
3. Create Service Account (IAM & Admin → Service Accounts)
4. Download JSON Key
```

### 2️⃣ Configure Your App

```
1. Rename downloaded file → service-account-key.json
2. Move to: c:\DivyCode\chatgpt\
```

### 3️⃣ Share Your Drive

```
1. Open Google Drive
2. Share folder with service account email
   (email from JSON file: name@project.iam.gserviceaccount.com)
3. Give "Editor" permission
```

### 4️⃣ Run!

```bash
cd c:\DivyCode\chatgpt
npm start
```

### 5️⃣ Open Browser

```
http://localhost:3000
```

---

## 📋 Files You Need

### ✅ Already Created

- server.js (backend)
- app.js (frontend - no auth!)
- index.html
- package.json
- Dependencies installed ✓

### ⚠️ YOU Need to Add

- **service-account-key.json** ← Download from Google Cloud

---

## 🎓 Detailed Guides Available

| File                  | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `SETUP_GUIDE.md`      | Detailed step-by-step text guide          |
| `setup-visual.html`   | Beautiful visual guide (open in browser!) |
| `README.md`           | Full documentation + API reference        |
| `PROJECT_COMPLETE.md` | Complete project summary                  |

---

## 🔑 Key Concept

```
❌ Before: Users → Google OAuth → Your App → Drive
✅ After:  Users → Your App (Service Account) → Drive
```

**No user authentication needed!**

---

## 🎯 What Users Can Do (Without Login!)

✅ Browse files & folders  
✅ Upload files  
✅ Create folders  
✅ Delete files  
✅ Share files  
✅ Preview files  
✅ Search files

---

## 🐛 Quick Troubleshooting

**Server won't start?**

```bash
npm install
npm start
```

**"Service account not configured"?**

- Add `service-account-key.json` to project root

**No files showing?**

- Share Drive folder with service account email
- Check folder ID is correct

**"Permission denied"?**

- Give service account "Editor" permission (not "Viewer")

---

## 📞 Help Resources

1. Open `setup-visual.html` in browser → Visual guide
2. Read `SETUP_GUIDE.md` → Step-by-step text
3. Read `README.md` → Full docs
4. Check server terminal → Error messages
5. Check browser console (F12) → Frontend errors

---

## 🎉 You're All Set When You See:

```
✅ Server ready - Connected to Google Drive
```

**Then users can manage Drive WITHOUT SIGNING IN! 🚀**

---

**Need help? Read SETUP_GUIDE.md or setup-visual.html**
