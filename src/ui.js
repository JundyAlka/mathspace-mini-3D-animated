/**
 * src/ui.js
 * Restored UI: Two buttons for Solid vs Net. No slider.
 */

const UIManager = (function () {
    let animateOpenBtn, animateCloseBtn, resetCameraBtn, descriptionPanel, autoOpenBtn, autoCloseBtn;
    let dimensionsContainer, formulaDisplay;
    let foldSlider;
    let currentShape = null; // Start null to ensure selectShape('cube') triggers
    let currentMode = 'solid'; // 'solid', 'net', or 'animating'

    const shapeConfig = {
        cube: {
            name: 'Kubus',
            desc: 'Kubus adalah bangun ruang sisi datar yang semua sisinya berbentuk persegi dan semua rusuknya sama panjang.',
            params: { s: { label: 'Sisi (s)', min: 2, max: 10, step: 0.1, val: 5 } },
            calc: (p) => ({
                vol: Math.pow(p.s, 3),
                sa: 6 * Math.pow(p.s, 2),
                volFormula: '$$V = s^3$$',
                saFormula: '$$L = 6 \\times s^2$$'
            })
        },
        box: {
            name: 'Balok',
            desc: 'Balok adalah bangun ruang sisi datar yang memiliki tiga pasang sisi yang saling berhadapan.',
            params: {
                p: { label: 'Panjang (p)', min: 3, max: 10, step: 0.1, val: 6 },
                l: { label: 'Lebar (l)', min: 2, max: 8, step: 0.1, val: 4 },
                t: { label: 'Tinggi (t)', min: 2, max: 8, step: 0.1, val: 3 }
            },
            calc: (p) => ({
                vol: p.p * p.l * p.t,
                sa: 2 * (p.p * p.l + p.p * p.t + p.l * p.t),
                volFormula: '$$V = p \\times l \\times t$$',
                saFormula: '$$L = 2(pl + pt + lt)$$'
            })
        },
        cylinder: {
            name: 'Tabung',
            desc: 'Tabung adalah bangun ruang tiga dimensi yang dibentuk oleh dua buah lingkaran identik yang sejajar.',
            params: {
                r: { label: 'Jari-jari (r)', min: 1, max: 6, step: 0.1, val: 3 },
                t: { label: 'Tinggi (t)', min: 3, max: 12, step: 0.1, val: 7 }
            },
            calc: (p) => ({
                vol: Math.PI * Math.pow(p.r, 2) * p.t,
                sa: 2 * Math.PI * p.r * (p.r + p.t),
                volFormula: '$$V = \\pi r^2 t$$',
                saFormula: '$$L = 2\\pi r (r + t)$$'
            })
        },
        pyramid: {
            name: 'Limas Segi Empat',
            desc: 'Limas segi empat adalah bangun ruang yang mempunyai alas segi empat dan sisi-sisi tegak berbentuk segitiga.',
            params: {
                s: { label: 'Sisi Alas (s)', min: 3, max: 10, step: 0.1, val: 8 },
                t: { label: 'Tinggi (t)', min: 3, max: 12, step: 0.1, val: 10 }
            },
            calc: (p) => {
                const slant = Math.sqrt(Math.pow(p.t, 2) + Math.pow(p.s / 2, 2));
                return {
                    vol: (1 / 3) * Math.pow(p.s, 2) * p.t,
                    sa: Math.pow(p.s, 2) + 2 * p.s * slant,
                    volFormula: '$$V = \\frac{1}{3} s^2 t$$',
                    saFormula: '$$L = s^2 + 2st_{miring}$$'
                };
            }
        },
        cone: {
            name: 'Kerucut',
            desc: 'Kerucut adalah sebuah limas istimewa yang beralas lingkaran.',
            params: {
                r: { label: 'Jari-jari (r)', min: 2, max: 7, step: 0.1, val: 5 },
                t: { label: 'Tinggi (t)', min: 3, max: 12, step: 0.1, val: 10 }
            },
            calc: (p) => {
                const s = Math.sqrt(p.r * p.r + p.t * p.t);
                return {
                    vol: (1 / 3) * Math.PI * p.r * p.r * p.t,
                    sa: Math.PI * p.r * (p.r + s),
                    volFormula: '$$V = \\frac{1}{3} \\pi r^2 t$$',
                    saFormula: '$$L = \\pi r (r + s)$$'
                };
            }
        },
        prism: {
            name: 'Prisma Segitiga',
            desc: 'Prisma segitiga adalah bangun ruang yang alas dan tutupnya berbentuk segitiga.',
            params: {
                a: { label: 'Alas Segitiga (a)', min: 3, max: 8, step: 0.1, val: 6 },
                t_alas: { label: 'Tinggi Segitiga (ta)', min: 2, max: 8, step: 0.1, val: 5 },
                t_prisma: { label: 'Tinggi Prisma (tp)', min: 3, max: 12, step: 0.1, val: 10 }
            },
            calc: (p) => {
                const hyp = Math.sqrt(Math.pow(p.a / 2, 2) + Math.pow(p.t_alas, 2));
                const baseArea = 0.5 * p.a * p.t_alas;
                const perimeter = p.a + 2 * hyp;
                return {
                    vol: baseArea * p.t_prisma,
                    sa: 2 * baseArea + perimeter * p.t_prisma,
                    volFormula: '$$V = L_{alas} \\times t_{prisma}$$',
                    saFormula: '$$L = 2L_{alas} + K_{alas} \\times t_{prisma}$$'
                };
            }
        }
    };

    function formatNumber(num) {
        return parseFloat(num).toFixed(2);
    }

    function getParamsValues(shape) {
        const config = shapeConfig[shape];
        const values = {};
        Object.keys(config.params).forEach(key => {
            values[key] = config.params[key].val;
        });
        return values;
    }

    function renderDimensions(shape) {
        if (!dimensionsContainer) return;
        dimensionsContainer.innerHTML = '';

        const config = shapeConfig[shape];
        if (!config) return;

        Object.entries(config.params).forEach(([key, param]) => {
            const div = document.createElement('div');
            // Keeping the improved styling
            div.className = 'parameter';
            div.innerHTML = `
                <label for="param-${key}">${param.label} (cm)</label>
                <input type="number" id="param-${key}" 
                       min="${param.min}" max="${param.max}" step="${param.step}" value="${param.val}">
            `;
            dimensionsContainer.appendChild(div);

            const input = div.querySelector('input');
            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                config.params[key].val = val;
                updateCalculations(shape);
                reloadCurrentShape();
            });
        });
    }

    function updateCalculations(shape) {
        if (!formulaDisplay) return;

        const config = shapeConfig[shape];
        const params = getParamsValues(shape);
        const result = config.calc(params);

        formulaDisplay.innerHTML = `
            <div class="formula-item">
                <strong>Volume</strong>
                <p class="formula-math">${result.volFormula}</p>
                <p>= ${formatNumber(result.vol)} cm³</p>
            </div>
            <div class="formula-item">
                <strong>Luas Permukaan</strong>
                <p class="formula-math">${result.saFormula}</p>
                <p>= ${formatNumber(result.sa)} cm²</p>
            </div>
        `;

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([formulaDisplay]);
        }
    }

    function updateDescription() {
        if (descriptionPanel) {
            descriptionPanel.innerHTML = `<p>${shapeConfig[currentShape].desc}</p>`;
        }
    }

    function reloadCurrentShape() {
        if (window.SceneManager) {
            window.SceneManager.loadShape(currentShape, getParamsValues(currentShape), currentMode);
        }
    }

    function setMode(mode) {
        // This function is now mostly deprecated as the animation handles the state.
        // We will keep it simple and just reload the shape if needed.
        currentMode = mode;
        // No need to reload shape here, the slider/buttons call the animator directly.
    }

    function selectShape(shape) {
        if (currentShape === shape) return;

        const oldActive = document.querySelector(`.shape-options button.active`);
        if (oldActive) oldActive.classList.remove('active');

        const newBtn = document.getElementById(`select-${shape}`);
        if (newBtn) newBtn.classList.add('active');

        currentShape = shape;
        // Reset to solid when changing shape
        currentMode = 'solid';
        if (window.SceneManager) window.SceneManager.updateFold(0); // Set slider to 0
        if (foldSlider) foldSlider.value = 0;

        updateDescription();
        renderDimensions(shape);
        updateCalculations(shape);
        reloadCurrentShape();
    }

    function initUI() {
        animateOpenBtn = document.getElementById('animate-open-btn');
        animateCloseBtn = document.getElementById('animate-close-btn');
        resetCameraBtn = document.getElementById('reset-camera-btn');
        descriptionPanel = document.getElementById('shape-description');
        dimensionsContainer = document.getElementById('dimensions-container');
        formulaDisplay = document.getElementById('formula-display');
        foldSlider = document.getElementById('fold-slider');

        // Setup shape selector buttons
        const shapeSelector = document.getElementById('shape-selector');
        if (shapeSelector) {
            shapeSelector.querySelectorAll('.shape-options button').forEach(button => {
                button.addEventListener('click', () => selectShape(button.dataset.shape));
            });
        }

        // Setup animation control buttons
        if (animateOpenBtn) {
            animateOpenBtn.textContent = 'Buka Otomatis';
            animateOpenBtn.onclick = () => {
                if (window.SceneManager) window.SceneManager.unfold();
            };
        }

        if (animateCloseBtn) {
            animateCloseBtn.textContent = 'Tutup Otomatis';
            animateCloseBtn.onclick = () => {
                if (window.SceneManager) window.SceneManager.fold();
            };
        }

        // Setup slider - starts at 1 (solid state)
        if (foldSlider) {
            foldSlider.parentElement.style.display = 'block';
            foldSlider.min = 0;
            foldSlider.max = 1;
            foldSlider.step = 0.01;
            foldSlider.value = 1; // Start in solid state
            foldSlider.oninput = (e) => {
                if (window.SceneManager) window.SceneManager.updateFold(parseFloat(e.target.value));
            };
        }

        // Setup reset camera button
        if (resetCameraBtn) {
            resetCameraBtn.addEventListener('click', () => {
                if (window.SceneManager) window.SceneManager.resetCamera();
            });
        }

        // Initialize with default shape
        selectShape('cube');
    }

    return {
        initUI,
        selectShape
    };
})();

window.UIManager = UIManager;
