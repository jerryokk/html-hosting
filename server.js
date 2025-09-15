const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


const app = express();
const port = 3000;

// 存储上传文件信息的 JSON 文件
const dataFile = path.join(__dirname, 'data.json');

// 确保必要的目录和文件存在
async function ensureDataFile() {
  // 确保 uploads 目录存在
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!await fs.pathExists(uploadsDir)) {
    await fs.ensureDir(uploadsDir);
  }
  
  // 确保数据文件存在
  if (!await fs.pathExists(dataFile)) {
    await fs.writeJson(dataFile, { files: [] });
  }
}

// 读取文件数据
async function getFileData() {
  await ensureDataFile();
  return await fs.readJson(dataFile);
}

// 保存文件数据
async function saveFileData(data) {
  await fs.writeJson(dataFile, data, { spaces: 2 });
}

// 计算下一个版本号
function getNextVersion(fileInfo) {
  const allVersions = [fileInfo.version];
  if (fileInfo.backups) {
    allVersions.push(...fileInfo.backups.map(b => b.version));
  }
  return Math.max(...allVersions) + 1;
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, uniqueId + ext);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const isHtml = file.mimetype === 'text/html' || 
                   path.extname(file.originalname).toLowerCase() === '.html';
    
    cb(isHtml ? null : new Error('只能上传 HTML 文件'), isHtml);
  }
});

// 中间件配置
app.use(express.json());

// 主页 - 专业高效界面
app.get('/', async (req, res) => {
  const data = await getFileData();
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML 托管服务</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #334155;
            line-height: 1.5;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
            padding: 0 8px;
        }
        
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #0f172a;
        }
        
        .stats {
            font-size: 14px;
            color: #64748b;
        }
        
        .drop-zone {
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 48px 24px;
            text-align: center;
            margin-bottom: 32px;
            transition: all 0.2s;
            background: white;
            cursor: pointer;
        }
        
        .drop-zone:hover, .drop-zone.drag-over {
            border-color: #3b82f6;
            background: #f0f9ff;
        }
        
        .drop-zone-text {
            font-size: 16px;
            color: #64748b;
            margin-top: 12px;
        }
        
        .hidden-input {
            display: none;
        }
        
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .service-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }
        
        .service-card:hover {
            border-color: #3b82f6;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
            transform: translateY(-1px);
        }
        
        .card-header {
            padding: 20px 20px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }
        
        .name-section {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
        }
        
        .service-name {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
            margin: 0;
            flex: 1;
            word-break: break-word;
            min-width: 0;
        }
        
        .name-input {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 6px;
            padding: 4px 8px;
            flex: 1;
            outline: none;
            min-width: 0;
        }
        
        .edit-btn {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            font-size: 14px;
            opacity: 0;
            transition: all 0.2s;
            flex-shrink: 0;
        }
        
        .service-card:hover .edit-btn {
            opacity: 1;
        }
        
        .edit-btn:hover {
            background: #f1f5f9;
            color: #3b82f6;
        }
        
        .version {
            background: #f1f5f9;
            color: #64748b;
            font-size: 11px;
            font-weight: 500;
            padding: 2px 6px;
            border-radius: 4px;
            flex-shrink: 0;
        }
        
        .card-body {
            padding: 12px 20px 20px;
        }
        
        .service-info {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            font-size: 13px;
            color: #64748b;
        }
        
        .service-url {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 12px;
            color: #3b82f6;
            background: #f8fafc;
            padding: 6px 8px;
            border-radius: 6px;
            word-break: break-all;
            border: 1px solid #e2e8f0;
        }
        
        .card-actions {
            padding: 16px 20px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        
        .btn {
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid transparent;
        }
        
        .btn-primary {
            background: #3b82f6;
            color: white;
        }
        
        .btn-primary:hover {
            background: #2563eb;
        }
        
        .btn-secondary {
            background: white;
            color: #374151;
            border-color: #d1d5db;
        }
        
        .btn-secondary:hover {
            background: #f9fafb;
            border-color: #9ca3af;
        }
        
        .btn-danger {
            background: white;
            color: #dc2626;
            border-color: #fca5a5;
        }
        
        .btn-danger:hover {
            background: #fef2f2;
        }
        
        .empty-state {
            text-align: center;
            padding: 80px 20px;
            color: #64748b;
        }
        
        
        .drag-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(59, 130, 246, 0.1);
            border: 2px dashed #3b82f6;
            border-radius: 12px;
            display: none;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: #3b82f6;
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            transform: translateX(400px);
            transition: transform 0.3s;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.error {
            background: #ef4444;
        }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .modal-overlay.show {
            opacity: 1;
        }
        
        .modal {
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            transition: transform 0.3s;
        }
        
        .modal-overlay.show .modal {
            transform: scale(1);
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            color: #64748b;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: background-color 0.2s;
        }
        
        .close-btn:hover {
            background: #f1f5f9;
        }
        
        .modal-content {
            padding: 20px;
        }
        
        .modal-content p {
            margin: 0 0 16px 0;
            color: #64748b;
        }
        
        .backup-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .backup-item {
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .backup-item:hover {
            background: #f8fafc;
            border-color: #3b82f6;
        }
        
        .backup-version {
            font-weight: 600;
            color: #0f172a;
            font-size: 14px;
        }
        
        .backup-time {
            font-size: 12px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">HTML Services</div>
            <div class="stats">${data.files.length} active services</div>
        </div>
        
        <div class="drop-zone" onclick="document.getElementById('fileInput').click()">
            📤 Drop HTML file here or click to upload
            <div class="drop-zone-text">Auto-deploy with CORS proxy enabled</div>
            <input type="file" id="fileInput" class="hidden-input" accept=".html" multiple>
        </div>
        
        ${data.files.length > 0 ? `
        <div class="services-grid">
            ${data.files.map(file => `
            <div class="service-card" data-id="${file.id}">
                <div class="card-header">
                    <div class="name-section">
                        <h3 class="service-name" id="name-${file.id}">${file.originalName}</h3>
                        <input type="text" class="name-input" id="input-${file.id}" value="${file.originalName}" style="display: none;">
                        <button class="edit-btn" onclick="toggleEdit('${file.id}')" id="edit-btn-${file.id}">✎</button>
                    </div>
                    <span class="version">v${file.version}</span>
                </div>
                
                <div class="card-body">
                    <div class="service-info">
                        <span class="size">${(file.size/1024).toFixed(1)}KB</span>
                        <span class="date">${new Date(file.uploadTime).toLocaleDateString()}</span>
                    </div>
                    <div class="service-url">/view/${file.id}</div>
                </div>
                
                <div class="card-actions">
                    <button onclick="copyLink('${file.id}')" class="btn btn-secondary">Copy</button>
                    ${file.backups && file.backups.length > 0 ? 
                      '<button onclick="showRestore(\'' + file.id + '\')" class="btn btn-secondary">Restore</button>' : ''}
                    <button onclick="deleteFile('${file.id}')" class="btn btn-danger">Delete</button>
                </div>
                
                <div class="drag-overlay">Drop new version here</div>
            </div>
            `).join('')}
        </div>
        ` : `
        <div class="empty-state">
            <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
            <div>No services deployed yet</div>
        </div>
        `}
    </div>
    
    <div class="notification" id="notification"></div>
    
    <script>
        // 拖拽区域处理
        let dragCounter = 0;
        let isDraggingOverService = false;
        
        // 只在 drop-zone 区域处理全局上传
        const dropZone = document.querySelector('.drop-zone');
        
        dropZone.addEventListener('dragenter', e => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', e => {
            e.preventDefault();
            e.stopPropagation();
            // 检查是否真的离开了 drop-zone
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });
        
        dropZone.addEventListener('dragover', e => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
            
            const allFiles = Array.from(e.dataTransfer.files);
            const htmlFiles = allFiles.filter(f => f.name.endsWith('.html'));
            const nonHtmlFiles = allFiles.filter(f => !f.name.endsWith('.html'));
            
            if (htmlFiles.length > 0) {
                uploadFiles(htmlFiles);
            }
            
            if (nonHtmlFiles.length > 0) {
                showNotification('只能上传 HTML 文件，已忽略 ' + nonHtmlFiles.length + ' 个非HTML文件', true);
            }
            
            if (allFiles.length > 0 && htmlFiles.length === 0) {
                showNotification('只能上传 HTML 文件，请选择正确的文件类型', true);
            }
        });
        
        // 防止在页面其他区域的意外拖拽处理
        document.addEventListener('dragover', e => {
            e.preventDefault();
        });
        
        document.addEventListener('drop', e => {
            // 检查是否在允许的拖拽区域内
            const isInDropZone = dropZone.contains(e.target);
            const isInServiceCard = isDraggingOverService && document.querySelector('.service-card:hover');
            
            // 如果不在任何允许的区域内，阻止默认行为和文件处理
            if (!isInDropZone && !isInServiceCard) {
                e.preventDefault();
                e.stopPropagation();
                
                // 显示提示信息
                if (e.dataTransfer.files.length > 0) {
                    const hasHtmlFiles = Array.from(e.dataTransfer.files).some(f => f.name.endsWith('.html'));
                    if (hasHtmlFiles) {
                        showNotification('请将文件拖拽到上传区域或服务卡片上', true);
                    }
                }
            }
        });
        
        // 服务卡片拖拽替换和点击处理
        document.querySelectorAll('.service-card').forEach(card => {
            let isDraggingOverCard = false;
            
            // 整个卡片点击打开服务
            card.addEventListener('click', e => {
                // 检查是否点击在按钮或输入框上
                const isButton = e.target.tagName === 'BUTTON' || e.target.closest('button');
                const isInput = e.target.tagName === 'INPUT';
                const isInCardActions = e.target.closest('.card-actions');
                
                if (!isButton && !isInput && !isInCardActions) {
                    const serviceId = card.dataset.id;
                    window.open('/view/' + serviceId, '_blank');
                }
            });
            
            card.addEventListener('dragenter', e => {
                e.preventDefault();
                e.stopPropagation();
                isDraggingOverService = true;
                isDraggingOverCard = true;
                card.querySelector('.drag-overlay').style.display = 'flex';
            });
            
            card.addEventListener('dragleave', e => {
                e.preventDefault();
                e.stopPropagation();
                if (!card.contains(e.relatedTarget)) {
                    isDraggingOverService = false;
                    isDraggingOverCard = false;
                    card.querySelector('.drag-overlay').style.display = 'none';
                }
            });
            
            card.addEventListener('dragover', e => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            card.addEventListener('drop', e => {
                e.preventDefault();
                e.stopPropagation();
                isDraggingOverService = false;
                isDraggingOverCard = false;
                
                const allFiles = Array.from(e.dataTransfer.files);
                const htmlFiles = allFiles.filter(f => f.name.endsWith('.html'));
                
                if (htmlFiles.length > 0) {
                    replaceFile(card.dataset.id, htmlFiles[0]);
                } else if (allFiles.length > 0) {
                    showNotification('只能上传 HTML 文件来替换服务', true);
                }
                
                card.querySelector('.drag-overlay').style.display = 'none';
            });
        });
        
        // 文件输入处理
        document.getElementById('fileInput').addEventListener('change', e => {
            const files = Array.from(e.target.files);
            uploadFiles(files);
            e.target.value = '';
        });
        
        // 上传文件
        async function uploadFiles(files) {
            for (const file of files) {
                const formData = new FormData();
                formData.append('htmlFile', file);
                
                try {
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (response.ok) {
                        showNotification('Service deployed: ' + file.name);
                    } else {
                        throw new Error('Upload failed');
                    }
                } catch (error) {
                    showNotification('Failed to deploy: ' + file.name, true);
                }
            }
            
            setTimeout(() => location.reload(), 1000);
        }
        
        // 替换文件
        async function replaceFile(id, file) {
            const formData = new FormData();
            formData.append('htmlFile', file);
            
            try {
                const response = await fetch('/replace/' + id, {
                    method: 'POST', 
                    body: formData
                });
                
                if (response.ok) {
                    showNotification('Service updated: ' + file.name);
                    setTimeout(() => location.reload(), 1000);
                } else {
                    throw new Error('Replace failed');
                }
            } catch (error) {
                showNotification('Failed to update service', true);
            }
        }
        
        // 复制链接
        function copyLink(id) {
            const url = window.location.origin + '/view/' + id;
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Link copied to clipboard');
            });
        }
        
        // 删除文件
        async function deleteFile(id) {
            if (!confirm('Delete this service?')) return;
            
            try {
                const response = await fetch('/delete/' + id, { method: 'DELETE' });
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Service deleted');
                    location.reload();
                } else {
                    showNotification('Failed to delete service', true);
                }
            } catch (error) {
                showNotification('Delete failed', true);
            }
        }
        
        // 显示通知
        function showNotification(message, isError = false) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = 'notification' + (isError ? ' error' : '');
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // 还原备份
        function showRestore(id) {
            // 获取备份列表并显示选择界面
            fetch('/backups/' + id)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.backups.length > 0) {
                        showBackupModal(id, data.backups);
                    } else {
                        showNotification('No backups available', true);
                    }
                })
                .catch(() => {
                    showNotification('Failed to load backups', true);
                });
        }
        
        // 显示备份选择模态框
        function showBackupModal(serviceId, backups) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = \`
                <div class="modal">
                    <div class="modal-header">
                        <h3>Restore Service</h3>
                        <button onclick="closeModal()" class="close-btn">×</button>
                    </div>
                    <div class="modal-content">
                        <p>Select a version to restore (will create new version):</p>
                        <div class="backup-list">
                            \${backups.map((backup, index) => \`
                            <div class="backup-item" onclick="restoreVersion('\${serviceId}', \${index})">
                                <div class="backup-version">v\${backup.version} (历史版本)</div>
                                <div class="backup-time">\${new Date(backup.backupTime).toLocaleString()}</div>
                            </div>
                            \`).join('')}
                        </div>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 10);
        }
        
        // 还原到指定版本
        async function restoreVersion(serviceId, backupIndex) {
            try {
                const response = await fetch('/restore/' + serviceId + '/' + backupIndex, {
                    method: 'POST'
                });
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Restored to v' + data.version);
                    closeModal();
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification('Restore failed: ' + data.error, true);
                }
            } catch (error) {
                showNotification('Restore failed', true);
            }
        }
        
        // 关闭模态框
        function closeModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        }

        // 切换编辑模式
        function toggleEdit(id) {
            const nameElement = document.getElementById('name-' + id);
            const inputElement = document.getElementById('input-' + id);
            const editBtn = document.getElementById('edit-btn-' + id);
            
            if (inputElement.style.display === 'none') {
                // 进入编辑模式
                nameElement.style.display = 'none';
                inputElement.style.display = 'block';
                inputElement.focus();
                inputElement.select();
                editBtn.textContent = '✓';
                editBtn.style.opacity = '1';
                
                // 添加键盘事件
                inputElement.onkeydown = (e) => {
                    if (e.key === 'Enter') {
                        saveEdit(id);
                    } else if (e.key === 'Escape') {
                        cancelEdit(id);
                    }
                };
            } else {
                // 保存编辑
                saveEdit(id);
            }
        }

        // 保存编辑
        async function saveEdit(id) {
            const nameElement = document.getElementById('name-' + id);
            const inputElement = document.getElementById('input-' + id);
            const newName = inputElement.value.trim();
            
            if (newName && newName !== nameElement.textContent) {
                try {
                    const response = await fetch('/rename/' + id, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ newName })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        nameElement.textContent = data.newName;
                        showNotification('重命名成功');
                    } else {
                        showNotification('重命名失败: ' + data.error, true);
                        inputElement.value = nameElement.textContent;
                    }
                } catch (error) {
                    showNotification('重命名失败', true);
                    inputElement.value = nameElement.textContent;
                }
            }
            
            exitEditMode(id);
        }

        // 取消编辑
        function cancelEdit(id) {
            const nameElement = document.getElementById('name-' + id);
            const inputElement = document.getElementById('input-' + id);
            inputElement.value = nameElement.textContent;
            exitEditMode(id);
        }

        // 退出编辑模式
        function exitEditMode(id) {
            const nameElement = document.getElementById('name-' + id);
            const inputElement = document.getElementById('input-' + id);
            const editBtn = document.getElementById('edit-btn-' + id);
            
            nameElement.style.display = 'block';
            inputElement.style.display = 'none';
            editBtn.textContent = '✎';
            editBtn.style.opacity = '';
            inputElement.onkeydown = null;
        }
    </script>
</body>
</html>
  `;
  res.send(html);
});

// 文件上传处理
app.post('/upload', upload.single('htmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的文件' });
    }

    const fileId = path.parse(req.file.filename).name;
    const fileInfo = {
      id: fileId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadTime: new Date().toISOString(),
      version: 1,
      backups: []
    };

    const data = await getFileData();
    data.files.push(fileInfo);
    await saveFileData(data);

    res.json({ success: true, id: fileId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 替换文件处理
app.post('/replace/:id', upload.single('htmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的文件' });
    }

    const data = await getFileData();
    const fileIndex = data.files.findIndex(f => f.id === req.params.id);
    
    if (fileIndex === -1) {
      return res.status(404).json({ success: false, error: '文件不存在' });
    }

    const existingFile = data.files[fileIndex];
    
    // 备份当前文件
    const backupInfo = {
      filename: existingFile.filename,
      version: existingFile.version,
      backupTime: new Date().toISOString()
    };
    
    if (!existingFile.backups) existingFile.backups = [];
    existingFile.backups.unshift(backupInfo);
    
    // 只保留最近5个备份
    if (existingFile.backups.length > 5) {
      const oldBackup = existingFile.backups.pop();
      const oldPath = path.join(__dirname, 'uploads', oldBackup.filename);
      if (await fs.pathExists(oldPath)) {
        await fs.remove(oldPath);
      }
    }

    // 更新文件信息
    existingFile.filename = req.file.filename;
    existingFile.size = req.file.size;
    existingFile.uploadTime = new Date().toISOString();
    existingFile.version = getNextVersion(existingFile);

    await saveFileData(data);
    res.json({ success: true, version: existingFile.version });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 查看 HTML 文件 - 注入 CORS 绕过脚本
app.get('/view/:id', async (req, res) => {
  try {
    const data = await getFileData();
    const file = data.files.find(f => f.id === req.params.id);
    
    if (!file) {
      return res.status(404).send('文件不存在');
    }

    const filePath = path.join(__dirname, 'uploads', file.filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).send('文件不存在');
    }

    // 读取 HTML 文件内容
    let htmlContent = await fs.readFile(filePath, 'utf-8');
    
    // 注入 CORS 绕过脚本
    const corsScript = `
<script>
// CORS 绕过脚本 - 透明代理外部 API 请求
(function() {
    'use strict';
    
    // 备份原始 fetch 函数
    const originalFetch = window.fetch;
    
    // 重写 fetch 函数
    window.fetch = function(url, options = {}) {
        try {
            // 检查是否为外部 URL
            const urlObj = new URL(url, window.location.href);
            const isExternal = urlObj.origin !== window.location.origin;
            
            if (isExternal) {
                
                // 使用代理 URL
                const proxyUrl = '/proxy/' + encodeURIComponent(url);
                
                // 发送代理请求 - 现在服务器直接返回原始数据
                return originalFetch(proxyUrl, options)
                    .then(response => {
                        // 添加代理标志
                        response._corsProxy = true;
                        response._originalUrl = url;
                        
                        return response;
                    })
                    .catch(error => {
                        throw error;
                    });
            }
            
            // 内部请求直接调用原始 fetch
            return originalFetch(url, options);
            
        } catch (error) {
            // URL 解析失败，使用原始请求
            return originalFetch(url, options);
        }
    };
    
    // 保留原始 fetch 的属性
    Object.setPrototypeOf(window.fetch, originalFetch);
    Object.defineProperty(window.fetch, 'name', { value: 'fetch' });
    
    // CORS 绕过脚本已激活
    
})();
</script>`;
    
    // 在 </head> 之前注入脚本，如果没有 </head> 就在开头注入
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', corsScript + '\n</head>');
    } else {
      htmlContent = corsScript + '\n' + htmlContent;
    }
    
    // 返回修改后的 HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
    
  } catch (error) {
    console.error('查看文件错误:', error.message);
    res.status(500).send('访问文件失败');
  }
});

// 删除文件
app.delete('/delete/:id', async (req, res) => {
  try {
    const data = await getFileData();
    const fileIndex = data.files.findIndex(f => f.id === req.params.id);
    
    if (fileIndex === -1) {
      return res.json({ success: false, error: '文件不存在' });
    }

    const file = data.files[fileIndex];
    
    // 删除主文件
    const mainFilePath = path.join(__dirname, 'uploads', file.filename);
    if (await fs.pathExists(mainFilePath)) {
      await fs.remove(mainFilePath);
    }
    
    // 删除所有备份文件
    if (file.backups) {
      for (const backup of file.backups) {
        const backupPath = path.join(__dirname, 'uploads', backup.filename);
        if (await fs.pathExists(backupPath)) {
          await fs.remove(backupPath);
        }
      }
    }
    
    // 从数据中删除记录
    data.files.splice(fileIndex, 1);
    await saveFileData(data);
    
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// 通用 HTTP 代理 - 解决 CORS 问题
app.all('/proxy/*', async (req, res) => {
  try {
    // 从路径中提取目标 URL
    const targetUrl = decodeURIComponent(req.path.replace('/proxy/', ''));
    
    // 验证 URL 格式
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return res.status(400).json({ 
        success: false, 
        error: '无效的 URL，必须以 http:// 或 https:// 开头' 
      });
    }

    // 构造请求选项
    const fetchOptions = {
      method: req.method,
      headers: {}
    };

    // 复制请求头（排除一些浏览器特有的头）
    const excludeHeaders = ['host', 'connection', 'content-length', 'user-agent', 'origin', 'referer'];
    for (const [key, value] of Object.entries(req.headers)) {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        fetchOptions.headers[key] = value;
      }
    }

    // 如果有请求体，添加到选项中
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // 发送请求
    const response = await fetch(targetUrl, fetchOptions);
    
    // 获取响应数据 - 正确处理 JSON 和文本
    let responseData;
    const contentType = response.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch (error) {
      try {
        responseData = await response.text();
      } catch (fallbackError) {
        responseData = '解析错误';
      }
    }

    // 设置响应状态和头部
    res.status(response.status);
    
    // 复制响应头
    response.headers.forEach((value, key) => {
      // 跳过一些不需要的头
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    
    // 返回原始数据
    if (typeof responseData === 'object') {
      res.json(responseData);
    } else {
      res.send(responseData);
    }
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});


// 重命名文件
app.post('/rename/:id', async (req, res) => {
  try {
    const { newName } = req.body;
    
    if (!newName || !newName.trim()) {
      return res.json({ success: false, error: '请提供新的文件名' });
    }

    const data = await getFileData();
    const fileIndex = data.files.findIndex(f => f.id === req.params.id);
    
    if (fileIndex === -1) {
      return res.json({ success: false, error: '文件不存在' });
    }

    // 更新文件名
    data.files[fileIndex].originalName = newName.trim();
    await saveFileData(data);

    res.json({ success: true, newName: data.files[fileIndex].originalName });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// 获取备份列表
app.get('/backups/:id', async (req, res) => {
  try {
    const data = await getFileData();
    const file = data.files.find(f => f.id === req.params.id);
    
    if (!file) {
      return res.json({ success: false, error: '文件不存在' });
    }

    res.json({ 
      success: true, 
      backups: file.backups || [],
      currentVersion: file.version
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// 还原到指定版本
app.post('/restore/:id/:backupIndex', async (req, res) => {
  try {
    const data = await getFileData();
    const fileIndex = data.files.findIndex(f => f.id === req.params.id);
    
    if (fileIndex === -1) {
      return res.json({ success: false, error: '文件不存在' });
    }

    const file = data.files[fileIndex];
    const backupIndex = parseInt(req.params.backupIndex);
    
    if (!file.backups || backupIndex >= file.backups.length || backupIndex < 0) {
      return res.json({ success: false, error: '备份版本不存在' });
    }

    const targetBackup = file.backups[backupIndex];
    
    // 备份当前版本
    const currentBackup = {
      filename: file.filename,
      version: file.version,
      backupTime: new Date().toISOString()
    };
    
    // 将当前版本添加到备份列表开头
    file.backups.unshift(currentBackup);
    
    // 移除要还原的备份（因为它将成为当前版本）
    file.backups.splice(backupIndex + 1, 1);
    
    // 更新文件信息为目标备份，但使用新的版本号
    file.filename = targetBackup.filename;
    file.version = getNextVersion(file);
    file.uploadTime = new Date().toISOString();
    
    // 获取文件大小
    const filePath = path.join(__dirname, 'uploads', targetBackup.filename);
    if (await fs.pathExists(filePath)) {
      const stats = await fs.stat(filePath);
      file.size = stats.size;
    }

    await saveFileData(data);
    res.json({ success: true, version: file.version });
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 HTML 托管服务已启动`);
  console.log(`📱 访问地址: http://localhost:${port}`);
  console.log(`📁 上传目录: ${path.join(__dirname, 'uploads')}`);
});