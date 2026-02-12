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

## How to connect your Google account (step-by-step)

If you are seeing connection/auth errors, follow this exact checklist:

1. Go to **Google Cloud Console** → select/create a project.
2. Open **APIs & Services → Library** and enable **Google Drive API**.
3. Open **APIs & Services → OAuth consent screen**:
   - Choose External (or Internal for Workspace).
   - Fill app name and email.
   - Add your Google account as a test user (if app is in testing mode).
4. Open **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Add Authorized JavaScript origin exactly as you run the app, e.g. `http://localhost:8080`.
   - Save and copy the generated **Client ID**.
5. Run this app with:

```bash
python3 -m http.server 8080
```

6. Open `http://localhost:8080`, paste Client ID, keep default scope, click **Authorize**.
7. In Google popup, choose account and grant Drive permissions.
8. After first successful grant, next **Authorize** clicks will try silent sign-in first (no forced account-selection popup).

### Common issues

- **"origin_mismatch"**: your local URL is not listed in Authorized JavaScript origins.
- **"access blocked" or unverified app**: consent screen/test users are not configured yet.
- **Popup closes with no token**: browser blocked third-party popup/cookies; allow popups for localhost.
- **You are asked to verify/select account every time**: this app now avoids forced consent on repeat authorizations; if you click **Revoke**, Google may ask again next time (expected).

## Notes

- Scope defaults to full Drive access (`https://www.googleapis.com/auth/drive`) so the app can create, update, share, and delete files.
- The app is intentionally client-side only; access token remains in browser memory.
- Some file previews depend on Google Drive preview support for that file type.
