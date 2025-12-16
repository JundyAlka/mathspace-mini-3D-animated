// ===================== SHAPES.JS - SOLID & GHOST PROOF & GEOM FIX =====================
/**
 * REVISION 10: GEOMETRY ROTATION FIX (KUBUS & BALOK)
 * 1. Cube & Box: Applied specific geometry rotation for Base as requested.
 * 2. Visuals: Solid Look (No Grids).
 * 3. SceneManager: Strict Ghost Fix.
 */

let scene, camera, renderer, controls;
let shapeGroup;
let currentMesh = null;
let currentShapeType = 'cube';

// --- CONFIGURATION ---
const defaultParams = {
    cube: { s: 4 },
    box: { p: 6, l: 4, t: 3 },
    cylinder: { r: 2, t: 5 },
    pyramid: { s: 4, t: 5 },
    cone: { r: 2, t: 5 },
    prism: { a: 4, t_alas: 3, t_prisma: 6 }
};

const COLORS = {
    cube: 0x8D6E63,
    box: 0xA1887F,
    prism: 0x66BB6A,
    pyramid: 0xFFCA28,
    cylinder: 0x42A5F5,
    cone: 0xFF7043,
    edge: 0x1A237E,
    background: 0xf0f2f5
};

// ===================== MESH FACTORY =====================

function createMaterial(color) {
    return new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide,
        shininess: 30,
        flatShading: true,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });
}

function createEdges(geometry) {
    const edges = new THREE.EdgesGeometry(geometry);
    return new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: COLORS.edge, linewidth: 2 }));
}

function makeMesh(geom, color) {
    const mesh = new THREE.Mesh(geom, createMaterial(color));
    mesh.add(createEdges(geom));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

// 1. Rectangle: Pivot at bottom center. STANDS VERTICAL (+Y). XY Plane.
function createRectConfig(w, h) {
    const geom = new THREE.PlaneGeometry(w, h);
    geom.translate(0, h / 2, 0);
    return geom;
}

// 2. Triangle: Pivot at bottom center. STANDS VERTICAL (+Y). XY Plane.
function createTriConfig(base, height) {
    const shape = new THREE.Shape();
    shape.moveTo(-base / 2, 0);
    shape.lineTo(base / 2, 0);
    shape.lineTo(0, height);
    shape.lineTo(-base / 2, 0);
    return new THREE.ShapeGeometry(shape);
}

// 3. Circle/Polygon: Center pivot. FLAT (XY).
function createPolyConfig(radius, segments) {
    return new THREE.CircleGeometry(radius, segments);
}

// ===================== HINGE SYSTEM =====================

function createHinge(parent, position, axis, initialAngle = 0) {
    const hinge = new THREE.Group();
    hinge.position.copy(position);
    parent.add(hinge);
    hinge.userData = { axis: axis.normalize(), initial: initialAngle };
    hinge.setRotationFromAxisAngle(axis, initialAngle);
    return hinge;
}

function setHingeAngle(hinge, angleRad) {
    hinge.setRotationFromAxisAngle(hinge.userData.axis, angleRad);
}

function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ===================== SHAPE GENERATORS =====================

// --- 1. KUBUS (Cube) ---
function createRiggedCube(params) {
    const { s } = params;
    const root = new THREE.Group();
    const anims = [];

    // --- USER REQUESTED FIX ---
    const baseGeometry = new THREE.PlaneGeometry(s, s);
    baseGeometry.rotateX(Math.PI / 2); // Rotate Geometry +90 X

    const base = makeMesh(baseGeometry, COLORS.cube);
    base.rotation.x = 0;    // Geometry is already rotated
    root.add(base);

    const half = s / 2;
    const sideGeom = createRectConfig(s, s);

    const addSide = (pos, axis, openAngle, meshRotY = 0) => {
        const h = createHinge(base, pos, axis, 0);
        const m = makeMesh(sideGeom, COLORS.cube);
        if (meshRotY !== 0) m.rotation.y = meshRotY;
        h.add(m);
        anims.push(v => setHingeAngle(h, openAngle * easeOut(v)));
        return { mesh: m, hinge: h };
    };

    // North (-Z).
    const north = addSide(new THREE.Vector3(0, 0, -half), new THREE.Vector3(1, 0, 0), -Math.PI / 2);

    // Top (Attached to North).
    const hTop = createHinge(north.mesh, new THREE.Vector3(0, s, 0), new THREE.Vector3(1, 0, 0), Math.PI / 2);
    const mTop = makeMesh(sideGeom, COLORS.cube);
    hTop.add(mTop);
    anims.push(v => setHingeAngle(hTop, Math.PI / 2 * (1 - easeOut(v))));

    // South (+Z).
    addSide(new THREE.Vector3(0, 0, half), new THREE.Vector3(1, 0, 0), Math.PI / 2);

    // East (+X). Mesh Rot Y -90.
    addSide(new THREE.Vector3(half, 0, 0), new THREE.Vector3(0, 0, 1), -Math.PI / 2, -Math.PI / 2);

    // West (-X). Mesh Rot Y +90.
    addSide(new THREE.Vector3(-half, 0, 0), new THREE.Vector3(0, 0, 1), Math.PI / 2, Math.PI / 2);

    return { mesh: root, updateFold: t => anims.forEach(f => f(t)) };
}

// --- 2. BALOK (Box) ---
function createRiggedBox(params) {
    const { p, l, t } = params;
    const root = new THREE.Group();
    const anims = [];

    // Base: p x l
    // --- USER REQUESTED FIX (Applied to Balok too) ---
    const baseGeometry = new THREE.PlaneGeometry(p, l);
    baseGeometry.rotateX(Math.PI / 2);

    const base = makeMesh(baseGeometry, COLORS.box);
    base.rotation.x = 0;
    root.add(base);

    const halfP = p / 2;
    const halfL = l / 2;

    // Helper for Sides
    const addSideBox = (w, h, hingePos, hingeAxis, openA, meshRotY) => {
        const hinge = createHinge(base, hingePos, hingeAxis, 0);
        const mesh = makeMesh(createRectConfig(w, h), COLORS.box);
        if (meshRotY) mesh.rotation.y = meshRotY;
        hinge.add(mesh);
        anims.push(v => setHingeAngle(hinge, openA * easeOut(v)));
        return { mesh, hinge };
    };

    // Back (-Z). p x t.
    const back = addSideBox(p, t, new THREE.Vector3(0, 0, -halfL), new THREE.Vector3(1, 0, 0), -Math.PI / 2, 0);

    // Top (Attached to Back). p x l.
    const hTop = createHinge(back.mesh, new THREE.Vector3(0, t, 0), new THREE.Vector3(1, 0, 0), Math.PI / 2);
    const mTop = makeMesh(createRectConfig(p, l), COLORS.box);
    hTop.add(mTop);
    anims.push(v => setHingeAngle(hTop, Math.PI / 2 * (1 - easeOut(v))));

    // Front (+Z). p x t.
    addSideBox(p, t, new THREE.Vector3(0, 0, halfL), new THREE.Vector3(1, 0, 0), Math.PI / 2, 0);

    // Right (+X). l x t.
    addSideBox(l, t, new THREE.Vector3(halfP, 0, 0), new THREE.Vector3(0, 0, 1), -Math.PI / 2, -Math.PI / 2);

    // Left (-X). l x t.
    addSideBox(l, t, new THREE.Vector3(-halfP, 0, 0), new THREE.Vector3(0, 0, 1), Math.PI / 2, Math.PI / 2);

    return { mesh: root, updateFold: t => anims.forEach(f => f(t)) };
}

// --- 3. PRISMA SEGITIGA (Prism) ---
// --- 3. PRISMA SEGITIGA (Prism) ---
function createRiggedPrism(params) {
    const { a, t_alas, t_prisma } = params;
    const root = new THREE.Group();
    const anims = [];

    // 1. Base (Alas) - Rectangle on XZ plane
    const baseGeometry = new THREE.PlaneGeometry(a, t_prisma);
    baseGeometry.rotateX(Math.PI / 2); // Align to XZ
    const base = makeMesh(baseGeometry, COLORS.prism);
    base.rotation.x = 0;
    root.add(base);

    const halfA = a / 2;
    const halfLen = t_prisma / 2;

    // Calculate dimensions and angles
    const slope = Math.sqrt(halfA * halfA + t_alas * t_alas);
    const angleBase = Math.atan2(t_alas, halfA); // Base angle of the triangle
    const dihedral = Math.PI - angleBase; // Angle to fold up to

    // 2. End Triangles (Front & Back)
    const triGeom = createTriConfig(a, t_alas); // XY Plane, Bottom-Center Pivot

    // Front Triangle (-Z)
    const hFront = createHinge(base, new THREE.Vector3(0, 0, -halfLen), new THREE.Vector3(1, 0, 0), 0);
    const mFront = makeMesh(triGeom, COLORS.prism);
    hFront.add(mFront);
    // Net: Fold down to -90 (lie flat pointing -Z). Solid: 0 (Visual Up).
    anims.push(v => setHingeAngle(hFront, -Math.PI / 2 * easeOut(v)));

    // Back Triangle (+Z)
    const hBack = createHinge(base, new THREE.Vector3(0, 0, halfLen), new THREE.Vector3(1, 0, 0), 0);
    const mBack = makeMesh(triGeom, COLORS.prism);
    mBack.rotation.y = Math.PI; // Face outward
    hBack.add(mBack);
    // Net: Fold down to +90 (lie flat pointing +Z). Solid: 0.
    anims.push(v => setHingeAngle(hBack, Math.PI / 2 * easeOut(v)));

    // 3. Side Wings (Sayap) - Rectangles
    // Right Wing (+X)
    // Geometry: Width=slope, Height=t_prisma. 
    // Align so it lies flat on +X, pivoting at x=0.
    const rightGeom = new THREE.PlaneGeometry(slope, t_prisma);
    rightGeom.rotateX(-Math.PI / 2); // To XZ
    rightGeom.translate(slope / 2, 0, 0); // Pivot at Left edge, extend +X

    const hRight = createHinge(base, new THREE.Vector3(halfA, 0, 0), new THREE.Vector3(0, 0, 1), 0);
    const mRight = makeMesh(rightGeom, COLORS.prism);
    hRight.add(mRight);

    // Net: 0 (Flat). Solid: Rotate up by (180 - angleBase).
    // CCW rotation around Z lifts +X up.
    const targetRight = Math.PI - angleBase;
    // We fold FROM Solid TO Net?
    // The UpdateFold(v) goes from 0 (Solid) to 1 (Net).
    // Solid Interp: t=0 -> Angle = targetRight.
    // Net Interp: t=1 -> Angle = 0.
    anims.push(v => setHingeAngle(hRight, targetRight * (1 - easeOut(v))));

    // Left Wing (-X)
    const leftGeom = new THREE.PlaneGeometry(slope, t_prisma);
    leftGeom.rotateX(-Math.PI / 2); // To XZ
    leftGeom.translate(-slope / 2, 0, 0); // Pivot at Right edge, extend -X

    const hLeft = createHinge(base, new THREE.Vector3(-halfA, 0, 0), new THREE.Vector3(0, 0, 1), 0);
    const mLeft = makeMesh(leftGeom, COLORS.prism);
    hLeft.add(mLeft);

    // Net: 0 (Flat). Solid: Rotate up (CW) by -(180 - angleBase).
    const targetLeft = -(Math.PI - angleBase);
    anims.push(v => setHingeAngle(hLeft, targetLeft * (1 - easeOut(v))));

    return { mesh: root, updateFold: t => anims.forEach(f => f(t)) };
}

// --- 4. LIMAS (Pyramid) ---
function createRiggedPyramid(params) {
    const { s, t } = params;
    const root = new THREE.Group();
    const anims = [];

    const baseGeometry = new THREE.PlaneGeometry(s, s);
    baseGeometry.rotateX(Math.PI / 2);

    const base = makeMesh(baseGeometry, COLORS.pyramid);
    base.rotation.x = 0;
    root.add(base);

    const half = s / 2;
    const slant = Math.sqrt(half * half + t * t);
    const angle = Math.atan2(t, half);
    const triGeom = createTriConfig(s, slant);

    const addSide = (pos, axis, meshRotY, foldDir) => {
        let openA = foldDir === 1 ? Math.PI / 2 : -Math.PI / 2;
        let closedA = foldDir === 1 ? -(Math.PI / 2 - angle) : (Math.PI / 2 - angle);

        const h = createHinge(base, pos, axis, closedA);
        const m = makeMesh(triGeom, COLORS.pyramid);
        if (meshRotY !== 0) m.rotation.y = meshRotY;
        h.add(m);
        anims.push(val => setHingeAngle(h, closedA + (openA - closedA) * easeOut(val)));
    };

    addSide(new THREE.Vector3(0, 0, -half), new THREE.Vector3(1, 0, 0), 0, -1);
    addSide(new THREE.Vector3(0, 0, half), new THREE.Vector3(1, 0, 0), Math.PI, 1);
    addSide(new THREE.Vector3(half, 0, 0), new THREE.Vector3(0, 0, 1), -Math.PI / 2, -1);
    addSide(new THREE.Vector3(-half, 0, 0), new THREE.Vector3(0, 0, 1), Math.PI / 2, 1);

    return { mesh: root, updateFold: t => anims.forEach(f => f(t)) };
}

// --- 5. TABUNG (Cylinder) ---
// --- 5. TABUNG (Cylinder) - Deterministic Morph & Hinge (Solid Look) ---
function createRiggedCylinder(params) {
    const { r, t } = params;
    const root = new THREE.Group();
    const segments = 64;
    const circumference = 2 * Math.PI * r;

    // 1. Body (Selimut)
    // Geometry: Standard Plane (Width=Circumference, Height=t)
    // Rotate -90 X so it lies on the XZ plane (Width=X, Height=Z)
    // Translate Z -t/2 so the "Bottom" edge is at Z=0 and "Top" edge is at Z=-t
    const bodyGeom = new THREE.PlaneGeometry(circumference, t, segments, 1);
    bodyGeom.rotateX(-Math.PI / 2);
    bodyGeom.translate(0, 0, -t / 2);

    // Manual Mesh creation WITHOUT EdgesGeometry to avoid the "tilted rectangle" ghost
    const body = new THREE.Mesh(bodyGeom, createMaterial(COLORS.cylinder));
    body.castShadow = true;
    body.receiveShadow = true;

    // Body Pivot (The "Spine" base)
    const bodyPivot = new THREE.Group();
    bodyPivot.add(body);
    root.add(bodyPivot);

    // Store original positions for morphing
    const posAttribute = bodyGeom.attributes.position;
    const originalPositions = posAttribute.array.slice();

    // 2. Caps (Alas & Tutup)

    // Top Cap (Tutup)
    // Attached to Top Edge of Body (Local Z = -t)
    const topGeom = new THREE.CircleGeometry(r, segments);
    topGeom.rotateX(-Math.PI / 2); // Flat on XZ
    topGeom.translate(0, 0, -r);   // Shift so pivot is at tangent (extends to -Z)

    const topCap = makeMesh(topGeom, COLORS.cylinder);
    const topPivot = new THREE.Group();
    topPivot.position.set(0, 0, -t); // At the top edge
    topPivot.add(topCap);
    body.add(topPivot);

    // Bottom Cap (Alas)
    // Attached to Bottom Edge of Body (Local Z = 0)
    const bottomGeom = new THREE.CircleGeometry(r, segments);
    bottomGeom.rotateX(-Math.PI / 2); // Flat on XZ
    bottomGeom.translate(0, 0, r);    // Shift so pivot is at tangent (extends to +Z)

    const bottomCap = makeMesh(bottomGeom, COLORS.cylinder);
    const bottomPivot = new THREE.Group();
    bottomPivot.position.set(0, 0, 0); // At the bottom edge
    bottomPivot.add(bottomCap);
    body.add(bottomPivot);

    // UPDATE FUNCTION
    const updateFold = (val) => {
        // val: 1 (Net/Open) -> 0 (Solid/Closed)

        // 1. Body Deformation (Cylinder Unroll)
        const positions = bodyGeom.attributes.position;
        const count = positions.count;

        const maxAngle = 2 * Math.PI;
        // Clamp angle closely to avoid floating point gaps at 0
        let angle = (1 - val) * maxAngle;
        if (angle < 1e-5) angle = 1e-5;

        const effR = circumference / angle;

        for (let i = 0; i < count; i++) {
            // Original Geom (Rotated): x=Width, z=Length(0 to -t)
            const xx = originalPositions[i * 3];
            const zz = originalPositions[i * 3 + 2];

            // Morph Logic: Curl X around Y-axis (Upward from floor)
            const theta = xx / effR;

            const px = effR * Math.sin(theta);
            const py = effR * (1 - Math.cos(theta));

            positions.setXYZ(i, px, py, zz);
        }
        positions.needsUpdate = true;
        bodyGeom.computeVertexNormals();

        // 2. Body Orientation (Stand Up)
        // Net (1): Flat (Rot=0). Solid (0): Stand Up (RotX = +90).
        bodyPivot.rotation.x = (1 - val) * (Math.PI / 2);

        // 3. Caps Orientation

        // Top Cap: Extends -Z. Needs to fold to "Front" (Body Local Y).
        // Rotate +90 X: -Z -> +Y.
        topPivot.rotation.x = (1 - val) * (Math.PI / 2);

        // Bottom Cap: Extends +Z. Needs to fold to "Front" (Body Local Y).
        // Rotate -90 X: +Z -> +Y.
        bottomPivot.rotation.x = -(1 - val) * (Math.PI / 2);

        // Extra Flush Fix for Solid State
        if (val < 0.01) {
            topPivot.rotation.x = Math.PI / 2;
            bottomPivot.rotation.x = -Math.PI / 2;
        }
    };

    // Initial update
    updateFold(0);

    return { mesh: root, updateFold: updateFold };
}

// --- 6. KERUCUT (Cone) ---
function createRiggedCone(params) {
    const { r, t } = params;
    const root = new THREE.Group();
    const anims = [];
    const SEGMENTS = 48;

    const slant = Math.sqrt(r * r + t * t);
    const circApothem = r * Math.cos(Math.PI / SEGMENTS);
    const chord = 2 * r * Math.sin(Math.PI / SEGMENTS);
    const triHeight = Math.sqrt(slant * slant - (chord / 2) * (chord / 2));

    const baseGeometry = createPolyConfig(r, SEGMENTS);
    baseGeometry.rotateX(Math.PI / 2);

    const base = makeMesh(baseGeometry, COLORS.cone);
    base.rotation.x = 0;
    base.rotation.y = -Math.PI / 2 - (Math.PI / SEGMENTS);
    root.add(base);

    const angleAtBase = Math.atan2(t, circApothem);
    const closedA = -(Math.PI / 2 - angleAtBase);
    const openA = Math.PI / 2;

    const h1 = createHinge(base, new THREE.Vector3(0, 0, -circApothem), new THREE.Vector3(1, 0, 0), closedA);
    const segGeom = createTriConfig(chord, triHeight);
    const s1 = makeMesh(segGeom, COLORS.cone);
    h1.add(s1);
    anims.push(v => setHingeAngle(h1, closedA + (openA - closedA) * easeOut(v)));

    const convexAngle = (2 * Math.PI) / SEGMENTS;
    const vApex = new THREE.Vector3(0, t, 0);
    const vR1 = new THREE.Vector3(r, 0, 0);
    const vR2 = new THREE.Vector3(r * Math.cos(convexAngle), 0, r * Math.sin(convexAngle));
    const n1 = new THREE.Vector3().subVectors(vR1, vApex).cross(new THREE.Vector3().subVectors(vR2, vApex)).normalize();
    const n2 = n1.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), convexAngle);
    const dihedral = n1.angleTo(n2);

    let current = s1;
    const hingeAxis = new THREE.Vector3(-chord / 2, triHeight, 0).normalize();
    const pivotPos = new THREE.Vector3(chord / 2, 0, 0);
    const rotZ = -2 * Math.atan2(chord / 2, triHeight);

    for (let i = 1; i < SEGMENTS; i++) {
        const h = createHinge(current, pivotPos, hingeAxis, dihedral);
        const next = makeMesh(segGeom, COLORS.cone);
        next.position.set(chord / 2, 0, 0);
        next.rotation.z = rotZ;
        h.add(next);
        anims.push(v => setHingeAngle(h, dihedral * (1 - easeOut(v))));
        current = next;
    }

    return { mesh: root, updateFold: t => anims.forEach(f => f(t)) };
}

// ===================== SCENE MANAGER =====================
window.SceneManager = {
    initScene: () => {
        const container = document.getElementById('canvas-container');
        scene = new THREE.Scene();
        scene.background = new THREE.Color(COLORS.background);

        const grid = new THREE.GridHelper(30, 30, 0xccddee, 0xeef2f5);
        scene.add(grid);

        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        scene.add(hemi);

        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(10, 20, 10);
        dir.castShadow = true;
        dir.shadow.mapSize.width = 2048;
        dir.shadow.mapSize.height = 2048;
        dir.shadow.bias = -0.0001;
        scene.add(dir);

        // Container for Shapes
        shapeGroup = new THREE.Group();
        shapeGroup.name = 'shapeGroup';
        scene.add(shapeGroup);

        camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(10, 10, 10);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    },

    loadShape: (type, params) => {
        // Robust Clear
        if (shapeGroup) {
            shapeGroup.clear();
        } else if (scene) {
            const existing = scene.getObjectByName('shapeGroup');
            if (existing) {
                existing.clear();
                shapeGroup = existing;
            } else {
                shapeGroup = new THREE.Group();
                shapeGroup.name = 'shapeGroup';
                scene.add(shapeGroup);
            }
        }

        currentShapeType = type;
        const p = params || defaultParams[type];

        const generators = {
            cube: createRiggedCube,
            box: createRiggedBox,
            prism: createRiggedPrism,
            pyramid: createRiggedPyramid,
            cylinder: createRiggedCylinder,
            cone: createRiggedCone
        };

        if (generators[type]) {
            currentMesh = generators[type](p);
            shapeGroup.add(currentMesh.mesh);
            window.SceneManager.updateFold(0);
        }
    },

    updateFold: (val) => {
        if (currentMesh && currentMesh.updateFold) currentMesh.updateFold(val);
    },

    unfold: () => window.SceneManager.animateSlider(1),
    fold: () => window.SceneManager.animateSlider(0),

    animateSlider: (target) => {
        const slider = document.getElementById('fold-slider');
        if (!slider) return;

        const start = parseFloat(slider.value);
        const duration = 2000;
        const startTime = performance.now();

        const loop = (now) => {
            const elapsed = now - startTime;
            let t = elapsed / duration;
            if (t > 1) t = 1;

            const curr = start + (target - start) * t;
            if (slider) slider.value = curr;
            window.SceneManager.updateFold(curr);

            if (t < 1) requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

    resetCamera: () => {
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
        controls.reset();
    }
};

window.createRiggedCube = createRiggedCube;
