const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // Serve frontend files

// Load Service Account credentials
const SERVICE_ACCOUNT_FILE = path.join(__dirname, "service-account-key.json");

// Initialize Google Drive API with Service Account
let drive;
try {
  const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf8"));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  drive = google.drive({ version: "v3", auth });
  console.log("✅ Google Drive API initialized with Service Account");
} catch (error) {
  console.error("❌ Error loading service account credentials:", error.message);
  console.log(
    "📝 Please create service-account-key.json file with your credentials",
  );
}

// API Routes

// 1. List files/folders
app.get("/api/drive/files", async (req, res) => {
  try {
    const { folderId = "root", search = "" } = req.query;

    const qParts = [`'${folderId}' in parents`, "trashed = false"];
    if (search) {
      qParts.push(`name contains '${search.replace(/'/g, "\\'")}'`);
    }

    const response = await drive.files.list({
      q: qParts.join(" and "),
      fields:
        "files(id,name,mimeType,modifiedTime,thumbnailLink,webViewLink,size)",
      orderBy: "folder,name",
    });

    res.json({ files: response.data.files || [] });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Create folder
app.post("/api/drive/folders", async (req, res) => {
  try {
    const { name, parentId = "root" } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const response = await drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id,name,mimeType,modifiedTime",
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Upload file
app.post("/api/drive/upload", upload.single("file"), async (req, res) => {
  try {
    const { folderId = "root" } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [folderId],
      },
      media: {
        body: fs.createReadStream(file.path),
      },
      fields: "id,name,mimeType,modifiedTime",
    });

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.json(response.data);
  } catch (error) {
    console.error("Error uploading file:", error);
    // Clean up on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// 4. Update file
app.patch(
  "/api/drive/files/:fileId",
  upload.single("file"),
  async (req, res) => {
    try {
      const { fileId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const response = await drive.files.update({
        fileId,
        requestBody: {
          name: file.originalname,
        },
        media: {
          body: fs.createReadStream(file.path),
        },
        fields: "id,name,mimeType,modifiedTime",
      });

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      res.json(response.data);
    } catch (error) {
      console.error("Error updating file:", error);
      // Clean up on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: error.message });
    }
  },
);

// 5. Delete file
app.delete("/api/drive/files/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    await drive.files.delete({ fileId });

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Share file/folder (create permission)
app.post("/api/drive/files/:fileId/permissions", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { emailAddress, role = "reader" } = req.body;

    if (!emailAddress) {
      return res.status(400).json({ error: "Email address is required" });
    }

    const response = await drive.permissions.create({
      fileId,
      requestBody: {
        type: "user",
        role,
        emailAddress,
      },
      sendNotificationEmail: true,
      fields: "id,emailAddress,role",
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error sharing file:", error);
    res.status(500).json({ error: error.message });
  }
});

// 7. List permissions
app.get("/api/drive/files/:fileId/permissions", async (req, res) => {
  try {
    const { fileId } = req.params;

    const response = await drive.permissions.list({
      fileId,
      fields: "permissions(id,emailAddress,role,type)",
    });

    res.json({ permissions: response.data.permissions || [] });
  } catch (error) {
    console.error("Error listing permissions:", error);
    res.status(500).json({ error: error.message });
  }
});

// 8. Download file
app.get("/api/drive/files/:fileId/download", async (req, res) => {
  try {
    const { fileId } = req.params;

    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" },
    );

    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  const isConfigured = fs.existsSync(SERVICE_ACCOUNT_FILE);
  res.json({
    status: "ok",
    serviceAccountConfigured: isConfigured,
    message: isConfigured
      ? "Service account is configured"
      : "Please add service-account-key.json file",
  });
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Frontend available at http://localhost:${PORT}`);
  console.log(`🔌 API available at http://localhost:${PORT}/api`);
});
