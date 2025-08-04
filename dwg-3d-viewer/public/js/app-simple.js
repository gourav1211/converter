import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

console.log('App.js loading...');

class SimpleDWGViewer {
    constructor() {
        console.log('SimpleDWGViewer constructor called');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
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
        this.resetViewBtn = document.getElementById('reset-view-btn');

        if (!this.dragDropArea) {
            console.error('Could not find drag-drop-area element');
            return;
        }

        console.log('DOM elements found, setting up event listeners...');

        // File input events
        this.selectFileBtn?.addEventListener('click', () => {
            console.log('Select file button clicked');
            this.fileInput.click();
        });

        this.fileInput?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                console.log('File selected:', e.target.files[0].name);
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
                console.log('File dropped:', files[0].name);
                this.handleFileSelection(files[0]);
            }
        });

        // Reset view button
        this.resetViewBtn?.addEventListener('click', () => {
            this.resetView();
        });

        console.log('Event listeners set up successfully');
    }

    handleFileSelection(file) {
        console.log('Handling file selection:', file.name);
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.dwg')) {
            this.showError('Please select a valid DWG file.');
            return;
        }

        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('File size is too large. Please select a file smaller than 50MB.');
            return;
        }

        this.uploadAndConvertFile(file);
    }

    async uploadAndConvertFile(file) {
        try {
            console.log('Starting upload and conversion...');
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

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Conversion result:', result);

            if (result.success) {
                this.showLoading('Loading 3D model...');
                await this.load3DModel(result.modelUrl);
                this.showSuccess('Model loaded successfully!');
                this.hideLoading();
            } else {
                throw new Error(result.error || 'Conversion failed');
            }

        } catch (error) {
            console.error('Upload/conversion error:', error);
            this.showError(error.message || 'An error occurred during file processing.');
            this.hideLoading();
        }
    }

    async load3DModel(modelUrl) {
        console.log('Loading 3D model from:', modelUrl);
        
        try {
            // Initialize viewer if needed
            if (!this.scene) {
                await this.initViewer();
            }

            // Clear existing model
            if (this.model) {
                this.scene.remove(this.model);
                this.model = null;
            }

            // Load the model
            const loader = new GLTFLoader();
            
            return new Promise((resolve, reject) => {
                loader.load(
                    modelUrl,
                    (gltf) => {
                        console.log('glTF loaded successfully:', gltf);
                        
                        this.model = gltf.scene;
                        
                        // Make all geometry visible
                        let totalMeshes = 0;
                        gltf.scene.traverse((child) => {
                            console.log(`Processing: ${child.type} "${child.name}"`);
                            
                            if (child.isMesh) {
                                totalMeshes++;
                                
                                // Create bright, visible material
                                child.material = new THREE.MeshBasicMaterial({
                                    color: 0x00ff00,
                                    wireframe: true
                                });
                                
                                console.log(`Mesh ${totalMeshes}: ${child.geometry.attributes.position?.count || 0} vertices`);
                            }
                        });
                        
                        console.log(`Total meshes processed: ${totalMeshes}`);
                        
                        // Add to scene
                        this.scene.add(this.model);
                        
                        // Calculate bounds and position camera
                        const box = new THREE.Box3().setFromObject(this.model);
                        const center = box.getCenter(new THREE.Vector3());
                        const size = box.getSize(new THREE.Vector3());
                        
                        console.log('Model bounds:', {
                            center: center.toArray(),
                            size: size.toArray()
                        });
                        
                        if (size.length() > 0) {
                            // Center model
                            this.model.position.sub(center);
                            
                            // Position camera
                            const maxDim = Math.max(size.x, size.y, size.z);
                            const distance = maxDim * 2;
                            
                            this.camera.position.set(distance, distance, distance);
                            this.camera.lookAt(0, 0, 0);
                            this.controls.target.set(0, 0, 0);
                            this.controls.update();
                            
                            console.log(`Camera positioned at distance: ${distance}`);
                        }
                        
                        // Show viewer
                        this.viewerCanvas.classList.remove('hidden');
                        this.viewerPlaceholder.classList.add('hidden');
                        this.viewerControls.classList.remove('hidden');
                        
                        // Start rendering
                        this.animate();
                        
                        console.log('Model setup complete');
                        resolve();
                    },
                    (progress) => {
                        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                    },
                    (error) => {
                        console.error('glTF loading error:', error);
                        reject(new Error('Failed to load 3D model: ' + error.message));
                    }
                );
            });

        } catch (error) {
            console.error('Model loading error:', error);
            throw new Error('Failed to load 3D model: ' + error.message);
        }
    }

    async initViewer() {
        console.log('Initializing 3D viewer...');
        
        const container = this.viewerCanvas;
        const containerRect = container.parentElement.getBoundingClientRect();

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f5);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            containerRect.width / containerRect.height, 
            0.1, 
            10000
        );
        this.camera.position.set(100, 100, 100);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: container,
            antialias: true 
        });
        this.renderer.setSize(containerRect.width, containerRect.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Add reference axes
        const axesHelper = new THREE.AxesHelper(50);
        this.scene.add(axesHelper);

        console.log('3D viewer initialized successfully');
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resetView() {
        if (this.model && this.camera && this.controls) {
            const box = new THREE.Box3().setFromObject(this.model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const distance = maxDim * 2;
            
            this.camera.position.set(distance, distance, distance);
            this.camera.lookAt(0, 0, 0);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            
            console.log('View reset');
        }
    }

    // UI Helper Methods
    showLoading(message) {
        if (this.statusText) this.statusText.textContent = message;
        if (this.uploadContent) this.uploadContent.classList.add('hidden');
        if (this.loadingContent) this.loadingContent.classList.remove('hidden');
    }

    hideLoading() {
        if (this.uploadContent) this.uploadContent.classList.remove('hidden');
        if (this.loadingContent) this.loadingContent.classList.add('hidden');
    }

    showError(message) {
        console.error('UI Error:', message);
        if (this.errorText) this.errorText.textContent = message;
        if (this.errorMessage) this.errorMessage.classList.remove('hidden');
        if (this.successMessage) this.successMessage.classList.add('hidden');
    }

    showSuccess(message) {
        console.log('UI Success:', message);
        if (this.successText) this.successText.textContent = message;
        if (this.successMessage) this.successMessage.classList.remove('hidden');
        if (this.errorMessage) this.errorMessage.classList.add('hidden');
    }

    hideMessages() {
        if (this.errorMessage) this.errorMessage.classList.add('hidden');
        if (this.successMessage) this.successMessage.classList.add('hidden');
    }

    isLoading() {
        return this.loadingContent && !this.loadingContent.classList.contains('hidden');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SimpleDWGViewer...');
    try {
        window.dwgViewer = new SimpleDWGViewer();
        console.log('SimpleDWGViewer initialized successfully');
    } catch (error) {
        console.error('Failed to initialize SimpleDWGViewer:', error);
    }
});

console.log('App.js loaded successfully');
