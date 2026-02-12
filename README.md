# Google Drive Workspace Manager

Single-page web app to manage your Google Drive from one place:

- Connect with Google OAuth.
- Browse folders/files and view thumbnails.
- Preview supported files in-app.
- Create folders.
- Upload new files or update existing file content.
- Share files/folders with `reader`, `commenter`, or `writer` permissions.
- View current permissions.
- Open folders, open files in Drive, copy IDs.
- Delete files/folders (move to trash).

## Quick start

1. Create an OAuth 2.0 Client ID in Google Cloud Console (type: **Web application**).
2. Enable the **Google Drive API** in your project.
3. Add your local origin (for example `http://localhost:8080`) to Authorized JavaScript origins.
4. Serve this folder locally:

```bash
python3 -m http.server 8080
```

5. Open `http://localhost:8080`.
6. Paste your OAuth Client ID and click **Authorize**.

## Notes

- Scope defaults to full Drive access (`https://www.googleapis.com/auth/drive`) so the app can create, update, share, and delete files.
- The app is intentionally client-side only; access token remains in browser memory.
- Some file previews depend on Google Drive preview support for that file type.
