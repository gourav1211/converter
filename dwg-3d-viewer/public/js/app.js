class DWG3DViewer {
    constructor() {
        this.viewer = null;
        this.viewerInitialized = false;
        this.currentModel = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Get DOM elements
        this.dragDropArea = document.getElementById('drag-drop-area');
        this.fileInput = document.getElementById('file-input');
        this.selectFileBtn = document.getElementById('select-file-btn');
        this.uploadContent = document.getElementById('upload-content');
        this.loadingContent = document.getElementById('loading-content');
        this.statusText = document.getElementById('status-text');
        this.errorMessage = document.getElementById('error-message');
        this.successMessage = document.getElementById('success-message');
        this.errorText = document.getElementById('error-text');
        this.successText = document.getElementById('success-text');
        this.viewerCanvas = document.getElementById('viewer-canvas');
        this.viewerPlaceholder = document.getElementById('viewer-placeholder');
        this.viewerControls = document.getElementById('viewer-controls');

        // File input events
        this.selectFileBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0]);
            }
        });

        // Drag and drop events
        this.dragDropArea.addEventListener('click', () => {
            if (!this.isLoading()) {
                this.fileInput.click();
            }
        });

        this.dragDropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dragDropArea.classList.add('drag-over');
        });

        this.dragDropArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dragDropArea.classList.remove('drag-over');
        });

        this.dragDropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dragDropArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0]);
            }
        });

        // Window resize event for Autodesk Viewer
        window.addEventListener('resize', () => {
            if (this.viewer) {
                this.viewer.resize();
            }
        });
    }

    handleFileSelection(file) {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.dwg')) {
            this.showError('Please select a valid DWG file.');
            return;
        }

        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            this.showError('File size is too large. Please select a file smaller than 50MB.');
            return;
        }

        this.uploadAndConvertFile(file);
    }

    async uploadAndConvertFile(file) {
        try {
            this.showLoading('Uploading file...');
            this.hideMessages();

            // Create FormData
            const formData = new FormData();
            formData.append('dwgFile', file);

            // Upload and convert
            const response = await fetch('/api/convert', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showLoading('Loading 3D model...');
                await this.load3DModel(result.urn, result.viewerToken);
                this.showSuccess('Model loaded successfully!');
                this.hideLoading();
            } else {
                throw new Error(result.error || 'Conversion failed');
            }

        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message || 'An error occurred during file processing.');
            this.hideLoading();
        }
    }

    async load3DModel(urn, viewerToken) {
        try {
            // Initialize Autodesk Viewer if not already done
            if (!this.viewerInitialized) {
                await this.initAutodeskViewer();
            }

            // Unload existing model
            if (this.currentModel) {
                this.viewer.unloadModel(this.currentModel);
                this.currentModel = null;
            }

            // Load the model
            return new Promise((resolve, reject) => {
                const documentId = `urn:${urn}`;
                
                Autodesk.Viewing.Document.load(documentId, (doc) => {
                    const viewables = doc.getRoot().getDefaultGeometry();
                    if (viewables) {
                        this.viewer.loadDocumentNode(doc, viewables, {
                            keepCurrentModels: false
                        }).then((model) => {
                            this.currentModel = model;
                            
                            // Show viewer and hide placeholder
                            this.viewerCanvas.classList.remove('hidden');
                            this.viewerPlaceholder.classList.add('hidden');
                            this.viewerControls.classList.remove('hidden');
                            
                            // Fit model to view
                            this.viewer.fitToView();
                            
                            resolve();
                        }).catch((error) => {
                            console.error('Model loading error:', error);
                            reject(new Error('Failed to load model into viewer'));
                        });
                    } else {
                        reject(new Error('No viewable content found in the model'));
                    }
                }, (error) => {
                    console.error('Document loading error:', error);
                    reject(new Error('Failed to load document'));
                }, {
                    accessToken: viewerToken
                });
            });

        } catch (error) {
            throw new Error('Failed to load 3D model: ' + error.message);
        }
    }

    async initAutodeskViewer() {
        return new Promise((resolve, reject) => {
            const container = this.viewerCanvas;
            
            // Viewer options
            const options = {
                env: 'AutodeskProduction',
                api: 'derivativeV2',
                getAccessToken: async (callback) => {
                    try {
                        // Get a fresh token from our server
                        const response = await fetch('/api/viewer-token');
                        const data = await response.json();
                        if (data.success) {
                            callback(data.token, data.expires_in);
                        } else {
                            callback(null, 0);
                        }
                    } catch (error) {
                        console.error('Failed to get viewer token:', error);
                        callback(null, 0);
                    }
                }
            };

            // Initialize viewer
            Autodesk.Viewing.Initializer(options, () => {
                // Create viewer instance
                this.viewer = new Autodesk.Viewing.GuiViewer3D(container, {
                    extensions: ['Autodesk.DefaultTools.NavTools']
                });
                
                // Start viewer
                const startCode = this.viewer.start();
                if (startCode > 0) {
                    console.error('Failed to create viewer');
                    reject(new Error('Failed to initialize viewer'));
                    return;
                }

                // Set viewer background
                this.viewer.setBackgroundColor(245, 245, 245, 245, 245, 245);
                
                // Add event listeners
                this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
                    console.log('Geometry loaded');
                });

                this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, () => {
                    console.log('Object tree created');
                });

                this.viewerInitialized = true;
                resolve();
            });
        });
    }

    // UI Helper Methods
    showLoading(message) {
        this.statusText.textContent = message;
        this.uploadContent.classList.add('hidden');
        this.loadingContent.classList.remove('hidden');
    }

    hideLoading() {
        this.uploadContent.classList.remove('hidden');
        this.loadingContent.classList.add('hidden');
    }

    updateLoadingProgress(percent) {
        this.statusText.textContent = `Loading 3D model... ${Math.round(percent)}%`;
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.successMessage.classList.add('hidden');
    }

    showSuccess(message) {
        this.successText.textContent = message;
        this.successMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
    }

    hideMessages() {
        this.errorMessage.classList.add('hidden');
        this.successMessage.classList.add('hidden');
    }

    isLoading() {
        return !this.loadingContent.classList.contains('hidden');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DWG3DViewer();
});
