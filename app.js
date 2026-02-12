// Backend API base URL
const API_BASE = 'http://localhost:3000/api';

const state = {
  currentItems: [],
  serverReady: false,
};

const els = {
  serverStatus: document.getElementById('serverStatus'),
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

function setServerStatus(message, ok = false) {
  els.serverStatus.textContent = message;
  els.serverStatus.style.color = ok ? '#0a7a2f' : '#9b1c1c';
}

// Check server health on startup
async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    
    if (data.serviceAccountConfigured) {
      state.serverReady = true;
      setServerStatus('✅ Server ready - Connected to Google Drive', true);
      log('Server is configured and ready');
      listItems().catch(err => log(err.message));
    } else {
      setServerStatus('⚠️ Server running but service account not configured', false);
      log('Please configure service account credentials (see README)');
    }
  } catch (error) {
    state.serverReady = false;
    setServerStatus('❌ Backend server not running', false);
    log('Error: Cannot connect to backend server. Please start the server with: npm start');
  }
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
    const size = item.size ? `${(item.size / 1024).toFixed(2)} KB` : '-';

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
  
  const params = new URLSearchParams({ folderId });
  if (search) params.append('search', search);
  
  const res = await fetch(`${API_BASE}/drive/files?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to list files: ${await res.text()}`);
  }
  
  const data = await res.json();
  renderItems(data.files || []);
  log(`Loaded ${data.files?.length || 0} items from folder ${folderId}`);
}

async function createFolder() {
  const name = els.newFolderName.value.trim();
  const parentId = els.newFolderParentId.value.trim() || 'root';
  
  if (!name) {
    throw new Error('Folder name is required.');
  }
  
  const res = await fetch(`${API_BASE}/drive/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parentId }),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to create folder: ${await res.text()}`);
  }
  
  const data = await res.json();
  log('Folder created', data);
  els.newFolderName.value = '';
  await listItems();
}

async function uploadFile({ updateFileId = null } = {}) {
  const file = els.uploadFileInput.files[0];
  if (!file) {
    throw new Error('Select a file first.');
  }
  
  const folderId = els.uploadFolderId.value.trim() || 'root';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folderId', folderId);
  
  const endpoint = updateFileId
    ? `${API_BASE}/drive/files/${updateFileId}`
    : `${API_BASE}/drive/upload`;
  
  const method = updateFileId ? 'PATCH' : 'POST';
  
  const res = await fetch(endpoint, {
    method,
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error(`Upload failed: ${await res.text()}`);
  }
  
  const data = await res.json();
  log(updateFileId ? 'File updated' : 'File uploaded', data);
  els.uploadFileInput.value = '';
  if (updateFileId) els.updateFileId.value = '';
  await listItems();
}

async function shareItem() {
  const fileId = els.shareItemId.value.trim();
  const emailAddress = els.shareEmail.value.trim();
  const role = els.shareRole.value;
  
  if (!fileId || !emailAddress) {
    throw new Error('Item ID and user email are required.');
  }
  
  const res = await fetch(`${API_BASE}/drive/files/${fileId}/permissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailAddress, role }),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to share: ${await res.text()}`);
  }
  
  const data = await res.json();
  log('Permission created', data);
}

async function listPermissions() {
  const fileId = els.shareItemId.value.trim();
  if (!fileId) {
    throw new Error('Item ID required.');
  }
  
  const res = await fetch(`${API_BASE}/drive/files/${fileId}/permissions`);
  if (!res.ok) {
    throw new Error(`Failed to list permissions: ${await res.text()}`);
  }
  
  const data = await res.json();
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
  const res = await fetch(`${API_BASE}/drive/files/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    throw new Error(`Delete failed: ${await res.text()}`);
  }
  
  log(`Deleted item ${id}`);
  await listItems();
}

async function onTableClick(event) {
  const btn = event.target.closest('button[data-id]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  
  try {
    if (action === 'preview') {
      previewItem(id);
    }
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
      setServerStatus(err.message);
    }
  };
}

// Event Listeners
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

// Initialize
log('App ready - No login required!');
checkServerHealth();
