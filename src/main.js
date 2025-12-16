/**
 * src/main.js
 * Main application entry point.
 */

// Wait for Three.js and OrbitControls to be loaded from CDN
function checkDependencies() {
    // Check if both THREE and OrbitControls are available globally
    if (typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
        initApp();
    } else {
        // Check again after a short delay
        setTimeout(checkDependencies, 100);
    }
}

/**
 * Initializes the application once all dependencies are loaded.
 */
function initApp() {
    // 1. Initialize the 3D scene
    window.SceneManager.initScene();

    // 2. Initialize the UI and event listeners
    window.UIManager.initUI();

    // 3. Load the default shape (Kubus)
    // This is already handled inside UIManager.initUI -> renderParameters/renderResults -> updateShapeAndCalculations
    // Calling it again here ensures the initial state is fully set up.
    window.UIManager.updateShapeAndCalculations();
}

// Start checking for dependencies once the DOM is ready
document.addEventListener('DOMContentLoaded', checkDependencies);
