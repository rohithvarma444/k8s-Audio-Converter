document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    });
    
    // File upload area functionality
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const uploadBtn = document.getElementById('upload-btn');
    const progressContainer = document.getElementById('progress-container');
    const progress = document.getElementById('progress');
    const uploadMessage = document.getElementById('upload-message');
    
    let selectedFile = null;
    
    // Click on upload area to select file
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('highlight');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('highlight');
        }, false);
    });
    
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, false);
    
    // Handle file selection
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFile(fileInput.files[0]);
        }
    });
    
    function handleFile(file) {
        // Check if file is a video
        if (!file.type.startsWith('video/')) {
            showMessage('Please select a video file', 'error');
            return;
        }
        
        selectedFile = file;
        fileInfo.textContent = `Selected file: ${file.name} (${formatFileSize(file.size)})`;
        uploadBtn.disabled = false;
    }
    
    // Upload button functionality
    uploadBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            showMessage('Please select a file first', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        uploadBtn.disabled = true;
        progressContainer.style.display = 'block';
        progress.style.width = '0%';
        
        try {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progress.style.width = percentComplete + '%';
                }
            });
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    showMessage('Upload successful!', 'success');
                    // Reset form
                    selectedFile = null;
                    fileInfo.textContent = '';
                    fileInput.value = '';
                    uploadBtn.disabled = true;
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                    }, 2000);
                } else {
                    showMessage(xhr.responseText || 'Upload failed', 'error');
                    uploadBtn.disabled = false;
                }
            };
            
            xhr.onerror = function() {
                showMessage('An error occurred during upload', 'error');
                uploadBtn.disabled = false;
            };
            
            xhr.open('POST', '/upload', true);
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.send(formData);
            
        } catch (error) {
            showMessage('An error occurred. Please try again.', 'error');
            console.error(error);
            uploadBtn.disabled = false;
        }
    });
    
    // Helper functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function showMessage(message, type) {
        uploadMessage.textContent = message;
        uploadMessage.className = 'message ' + type;
    }
});