const state = {
  accessToken: null,
  tokenClient: null,
  currentItems: [],
};

const els = {
  clientIdInput: document.getElementById('clientIdInput'),
  scopeInput: document.getElementById('scopeInput'),
  authorizeBtn: document.getElementById('authorizeBtn'),
  revokeBtn: document.getElementById('revokeBtn'),
  authStatus: document.getElementById('authStatus'),
  folderIdInput: document.getElementById('folderIdInput'),
  searchInput: document.getElementById('searchInput'),
  refreshBtn: document.getElementById('refreshBtn'),
  goRootBtn: document.getElementById('goRootBtn'),
  itemsBody: document.getElementById('itemsBody'),
  newFolderName: document.getElementById('newFolderName'),
  newFolderParentId: document.getElementById('newFolderParentId'),
  createFolderBtn: document.getElementById('createFolderBtn'),
  uploadFolderId: document.getElementById('uploadFolderId'),
  uploadFileInput: document.getElementById('uploadFileInput'),
  uploadBtn: document.getElementById('uploadBtn'),
  updateFileId: document.getElementById('updateFileId'),
  updateBtn: document.getElementById('updateBtn'),
  shareItemId: document.getElementById('shareItemId'),
  shareEmail: document.getElementById('shareEmail'),
  shareRole: document.getElementById('shareRole'),
  shareBtn: document.getElementById('shareBtn'),
  listPermissionsBtn: document.getElementById('listPermissionsBtn'),
  permissionsOutput: document.getElementById('permissionsOutput'),
  previewFrame: document.getElementById('previewFrame'),
  logOutput: document.getElementById('logOutput'),
};

function log(message, data) {
  const ts = new Date().toLocaleTimeString();
  const line = `[${ts}] ${message}`;
  const payload = data ? `\n${JSON.stringify(data, null, 2)}` : '';
  els.logOutput.textContent = `${line}${payload}\n${els.logOutput.textContent}`.trim();
}

function setAuthStatus(message, ok = false) {
  els.authStatus.textContent = message;
  els.authStatus.style.color = ok ? '#0a7a2f' : '#9b1c1c';
}

function assertAuth() {
  if (!state.accessToken) {
    throw new Error('Please authorize first.');
  }
}

async function driveRequest(path, options = {}) {
  assertAuth();
  const headers = {
    Authorization: `Bearer ${state.accessToken}`,
    ...(options.headers || {}),
  };
  const res = await fetch(`https://www.googleapis.com/drive/v3${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Drive API error (${res.status}): ${errText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function renderItems(items) {
  state.currentItems = items;
  els.itemsBody.innerHTML = '';

  for (const item of items) {
    const tr = document.createElement('tr');
    const thumb = item.thumbnailLink
      ? `<img class="thumb" src="${item.thumbnailLink}" alt="thumbnail" />`
      : '<div class="thumb"></div>';

    const isFolder = item.mimeType === 'application/vnd.google-apps.folder';

    tr.innerHTML = `
      <td>${thumb}</td>
      <td>${item.name}</td>
      <td>${isFolder ? 'Folder' : item.mimeType}</td>
      <td>${new Date(item.modifiedTime).toLocaleString()}</td>
      <td>
        <div class="actions">
          <button data-action="preview" data-id="${item.id}">Preview</button>
          <button data-action="open" data-id="${item.id}">Open</button>
          <button data-action="copy-id" data-id="${item.id}">Copy ID</button>
          <button data-action="delete" data-id="${item.id}" class="secondary">Delete</button>
        </div>
      </td>
    `;
    els.itemsBody.appendChild(tr);
  }
}

async function listItems() {
  const folderId = els.folderIdInput.value.trim() || 'root';
  const search = els.searchInput.value.trim();
  const qParts = [`'${folderId}' in parents`, 'trashed = false'];
  if (search) qParts.push(`name contains '${search.replace(/'/g, "\\'")}'`);
  const q = encodeURIComponent(qParts.join(' and '));

  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,thumbnailLink,webViewLink)');
  const data = await driveRequest(`/files?q=${q}&fields=${fields}&orderBy=folder,name`);
  renderItems(data.files || []);
  log(`Loaded ${data.files?.length || 0} items from folder ${folderId}`);
}

function ensureGisReady() {
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services not loaded yet. Wait a few seconds and retry.');
  }
}

function initTokenClient() {
  ensureGisReady();
  const clientId = els.clientIdInput.value.trim();
  if (!clientId) {
    throw new Error('Client ID is required.');
  }
  state.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: els.scopeInput.value.trim(),
    callback: (resp) => {
      if (resp.error) {
        setAuthStatus(`Auth failed: ${resp.error}`);
        log('Auth error', resp);
        return;
      }
      state.accessToken = resp.access_token;
      setAuthStatus('Connected to Google Drive', true);
      log('Authorization success');
      listItems().catch((err) => log(err.message));
    },
  });
}

function authorize() {
  initTokenClient();
  state.tokenClient.requestAccessToken({ prompt: 'consent' });
}

function revoke() {
  if (!state.accessToken) return;
  google.accounts.oauth2.revoke(state.accessToken, () => {
    state.accessToken = null;
    setAuthStatus('Token revoked');
    els.itemsBody.innerHTML = '';
    els.previewFrame.src = 'about:blank';
    log('Token revoked');
  });
}

async function createFolder() {
  const name = els.newFolderName.value.trim();
  const parentId = els.newFolderParentId.value.trim() || 'root';
  if (!name) throw new Error('Folder name is required.');

  const body = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId],
  };

  const data = await driveRequest('/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  log('Folder created', data);
  await listItems();
}

async function uploadFile({ updateFileId = null } = {}) {
  const file = els.uploadFileInput.files[0];
  if (!file) throw new Error('Select a file first.');
  const folderId = els.uploadFolderId.value.trim() || 'root';

  const metadata = updateFileId
    ? { name: file.name }
    : { name: file.name, parents: [folderId] };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  assertAuth();
  const endpoint = updateFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${updateFileId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

  const res = await fetch(endpoint, {
    method: updateFileId ? 'PATCH' : 'POST',
    headers: { Authorization: `Bearer ${state.accessToken}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  log(updateFileId ? 'File updated' : 'File uploaded', data);
  await listItems();
}

async function shareItem() {
  const fileId = els.shareItemId.value.trim();
  const emailAddress = els.shareEmail.value.trim();
  const role = els.shareRole.value;

  if (!fileId || !emailAddress) {
    throw new Error('Item ID and user email are required.');
  }

  const body = { type: 'user', role, emailAddress };
  const data = await driveRequest(`/files/${fileId}/permissions?sendNotificationEmail=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  log('Permission created', data);
}

async function listPermissions() {
  const fileId = els.shareItemId.value.trim();
  if (!fileId) throw new Error('Item ID required.');
  const data = await driveRequest(`/files/${fileId}/permissions`);
  els.permissionsOutput.textContent = JSON.stringify(data, null, 2);
}

function previewItem(id) {
  const item = state.currentItems.find((f) => f.id === id);
  if (!item) return;

  if (item.mimeType === 'application/vnd.google-apps.folder') {
    els.folderIdInput.value = item.id;
    listItems().catch((err) => log(err.message));
    return;
  }

  els.previewFrame.src = `https://drive.google.com/file/d/${id}/preview`;
}

async function deleteItem(id) {
  await driveRequest(`/files/${id}`, { method: 'DELETE' });
  log(`Deleted item ${id}`);
  await listItems();
}

async function onTableClick(event) {
  const btn = event.target.closest('button[data-id]');
  if (!btn) return;
  const { action, id } = btn.dataset;

  try {
    if (action === 'preview') previewItem(id);
    if (action === 'open') {
      const item = state.currentItems.find((f) => f.id === id);
      if (item?.mimeType === 'application/vnd.google-apps.folder') {
        els.folderIdInput.value = id;
        await listItems();
      } else if (item?.webViewLink) {
        window.open(item.webViewLink, '_blank');
      } else {
        previewItem(id);
      }
    }
    if (action === 'copy-id') {
      await navigator.clipboard.writeText(id);
      log(`Copied ID: ${id}`);
    }
    if (action === 'delete') {
      const ok = window.confirm('Delete this item? This moves it to trash.');
      if (ok) await deleteItem(id);
    }
  } catch (err) {
    log(err.message);
  }
}

function wrapAsync(handler) {
  return async () => {
    try {
      await handler();
    } catch (err) {
      log(err.message);
      setAuthStatus(err.message);
    }
  };
}

els.authorizeBtn.addEventListener('click', wrapAsync(authorize));
els.revokeBtn.addEventListener('click', wrapAsync(revoke));
els.refreshBtn.addEventListener('click', wrapAsync(listItems));
els.goRootBtn.addEventListener('click', () => {
  els.folderIdInput.value = 'root';
  listItems().catch((err) => log(err.message));
});
els.createFolderBtn.addEventListener('click', wrapAsync(createFolder));
els.uploadBtn.addEventListener('click', wrapAsync(() => uploadFile()));
els.updateBtn.addEventListener('click', wrapAsync(() => uploadFile({ updateFileId: els.updateFileId.value.trim() })));
els.shareBtn.addEventListener('click', wrapAsync(shareItem));
els.listPermissionsBtn.addEventListener('click', wrapAsync(listPermissions));
els.itemsBody.addEventListener('click', onTableClick);

log('App ready. Enter your OAuth Client ID and click Authorize.');
