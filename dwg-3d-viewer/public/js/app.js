import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class DWG3DViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.viewerInitialized = false;
        this.optimalCameraPosition = null;
        this.optimalCameraTarget = null;
        
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
        this.resetViewBtn = document.getElementById('reset-view-btn');

        // File input events
        this.selectFileBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0]);
            }
        });

        // Reset view button event
        if (this.resetViewBtn) {
            this.resetViewBtn.addEventListener('click', () => {
                this.resetView();
            });
        }

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

        // Window resize event for Three.js
        window.addEventListener('resize', () => {
            if (this.renderer && this.camera) {
                this.onWindowResize();
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

            // Upload and convert using local converter
            const response = await fetch('/api/convert', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showLoading('Loading 3D model...');
                await this.load3DModel(result.modelUrl);
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

    async load3DModel(modelUrl) {
        try {
            // Initialize Three.js viewer if not already done
            if (!this.viewerInitialized) {
                await this.initThreeJSViewer();
            }

            // Clear existing model
            if (this.currentModel) {
                this.scene.remove(this.currentModel);
                this.currentModel = null;
            }

            // Load the glTF model
            const loader = new GLTFLoader();
            
            return new Promise((resolve, reject) => {
                loader.load(
                    modelUrl,
                    (gltf) => {
                        console.log('glTF model loaded successfully');
                        
                        // Add the model to the scene
                        this.currentModel = gltf.scene;
                        this.scene.add(this.currentModel);

                        // Center and scale the model
                        this.centerAndScaleModel(this.currentModel);

                        // Show viewer and hide placeholder
                        this.viewerCanvas.classList.remove('hidden');
                        this.viewerPlaceholder.classList.add('hidden');
                        this.viewerControls.classList.remove('hidden');

                        // Start rendering
                        this.animate();

                        resolve();
                    },
                    (progress) => {
                        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                    },
                    (error) => {
                        console.error('Error loading glTF model:', error);
                        reject(new Error('Failed to load 3D model'));
                    }
                );
            });

        } catch (error) {
            throw new Error('Failed to load 3D model: ' + error.message);
        }
    }

    async initThreeJSViewer() {
        return new Promise((resolve) => {
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
                1000
            );
            this.camera.position.set(5, 5, 5);

            // Renderer
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: container,
                antialias: true 
            });
            this.renderer.setSize(containerRect.width, containerRect.height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.enableRotate = true;

            // Lighting
            this.setupLighting();

            this.viewerInitialized = true;
            console.log('Three.js viewer initialized');
            resolve();
        });
    }

    setupLighting() {
        // Ambient light - increased for better overall visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);

        // Additional directional light from opposite side for better illumination
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-10, -5, -10);
        this.scene.add(directionalLight2);

        // Point lights for better illumination from multiple angles
        const pointLight1 = new THREE.PointLight(0xffffff, 0.4);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 0.4);
        pointLight2.position.set(-5, 5, -5);
        this.scene.add(pointLight2);

        // Hemisphere light for natural lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x654321, 0.3);
        this.scene.add(hemisphereLight);
    }

    centerAndScaleModel(model) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model at origin
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // Calculate optimal scale to fit in view
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const desiredSize = 8; // Slightly larger desired size for better visibility
            const scale = desiredSize / maxDim;
            model.scale.setScalar(scale);
            
            // Recalculate size after scaling
            const scaledSize = size.multiplyScalar(scale);
            
            // Position camera at optimal distance to view the entire model
            const maxDimension = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
            const distance = maxDimension * 2.5; // Optimal viewing distance
            
            // Position camera to get a good view of the model
            this.camera.position.set(distance * 0.7, distance * 0.7, distance * 0.7);
            this.camera.lookAt(0, 0, 0);
            
            // Store optimal view settings for reset functionality
            this.optimalCameraPosition = this.camera.position.clone();
            this.optimalCameraTarget = new THREE.Vector3(0, 0, 0);
            
            // Update controls target to center of model
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            
            // Fit the view to show the entire model
            this.fitToView(scaledSize);
        }
    }

    fitToView(modelSize) {
        // Calculate the bounding sphere radius
        const radius = Math.sqrt(
            modelSize.x * modelSize.x + 
            modelSize.y * modelSize.y + 
            modelSize.z * modelSize.z
        ) / 2;

        // Calculate distance needed for the camera to see the entire model
        const fov = this.camera.fov * (Math.PI / 180); // Convert to radians
        const distance = radius / Math.sin(fov / 2);

        // Ensure minimum distance
        const minDistance = radius * 2;
        const optimalDistance = Math.max(distance, minDistance);

        // Position camera at optimal distance
        const direction = this.camera.position.clone().normalize();
        this.camera.position.copy(direction.multiplyScalar(optimalDistance));

        // Update camera near/far planes based on model size
        this.camera.near = optimalDistance / 100;
        this.camera.far = optimalDistance * 10;
        this.camera.updateProjectionMatrix();

        // Update controls
        this.controls.target.set(0, 0, 0);
        this.controls.minDistance = radius * 0.5;
        this.controls.maxDistance = optimalDistance * 3;
        this.controls.update();
    }

    resetView() {
        if (this.optimalCameraPosition && this.optimalCameraTarget && this.camera && this.controls) {
            // Animate camera back to optimal position
            const startPosition = this.camera.position.clone();
            const startTarget = this.controls.target.clone();
            
            // Simple animation using requestAnimationFrame
            const animateReset = (progress) => {
                if (progress >= 1) {
                    // Ensure final position is exact
                    this.camera.position.copy(this.optimalCameraPosition);
                    this.controls.target.copy(this.optimalCameraTarget);
                    this.controls.update();
                    return;
                }
                
                // Ease-out interpolation
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                // Interpolate camera position
                this.camera.position.lerpVectors(startPosition, this.optimalCameraPosition, easeOut);
                
                // Interpolate target
                this.controls.target.lerpVectors(startTarget, this.optimalCameraTarget, easeOut);
                
                this.controls.update();
                
                // Continue animation
                requestAnimationFrame(() => animateReset(progress + 0.02));
            };
            
            animateReset(0);
        }
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

    onWindowResize() {
        const containerRect = this.viewerCanvas.parentElement.getBoundingClientRect();
        
        this.camera.aspect = containerRect.width / containerRect.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(containerRect.width, containerRect.height);
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
