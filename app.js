console.log("🚀 Moodscape 3D - Loading Libraries...");

let scene, camera, renderer, butterfly, mixer, clock; // Declare clock here
let gsapLoaded = false;
let lastSection = null;

// Move the positions here, but we will use them inside the functions
const arrPositionModel = [
    { class: "hero",         position: { x: 1,    y: -0.17, z: 0 }, rotation: { x: -1,   y: 0, z: 0 } },
    { class: "features",     position: { x: 1.7,  y: -0.5, z: 0 }, rotation: { x: 0.2,  y: 0, z: 0 } },
    { class: "how-section",  position: { x: 1.58, y: -0.2, z: 0 }, rotation: { x: 0,    y: 0, z: 0 } }
];

const modelMove = () => {
    if (!butterfly || !gsapLoaded) return;

    const sections = document.querySelectorAll('section');
    let currentSection = null;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            currentSection = section.classList[0] || section.id;
        }
    });

    if (currentSection !== lastSection) {
        const activeIndex = arrPositionModel.findIndex(item => item.class === currentSection);
        if (activeIndex >= 0) {
            lastSection = currentSection;
            const target = arrPositionModel[activeIndex];

            gsap.to(butterfly.position, {
                x: target.position.x, y: target.position.y, z: target.position.z,
                duration: 2.2, ease: "power2.inOut", overwrite: true 
            });
            gsap.to(butterfly.rotation, {
                x: target.rotation.x, y: target.rotation.y, z: target.rotation.z,
                duration: 2.2, ease: "power2.inOut", overwrite: true
            });
        }
    }
};

function initScene() {
    // Initialize the clock ONLY after THREE is defined
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 13;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const container = document.getElementById("container3D");
    if(container) container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(500, 500, 500);
    scene.add(topLight);

    loadButterfly();
    animate();
}

function loadButterfly() {
    const loader = new THREE.GLTFLoader();
    loader.load('./butterfly.glb', (gltf) => {
        butterfly = gltf.scene;
        butterfly.scale.set(0.85, 0.85, 0.85);
        
        const startPos = arrPositionModel[0];
        butterfly.position.set(startPos.position.x, startPos.position.y, startPos.position.z);
        butterfly.rotation.set(startPos.rotation.x, startPos.rotation.y, startPos.rotation.z);

        scene.add(butterfly);

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(butterfly);
            // Try index 0 for flapping
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }
        modelMove();
    }, undefined, (error) => console.error('Butterfly Load Error:', error));
}

function animate() {
    requestAnimationFrame(animate);
    if (mixer && clock) {
        mixer.update(clock.getDelta()*0.5);
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// ==================== SCRIPT LOADING LOGIC ====================

const loadScript = (url) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = false; // Maintain order
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Execute sequence
loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js")
    .then(() => loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"))
    .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"))
    .then(() => {
        console.log("✅ All libraries loaded");
        gsapLoaded = true;
        initScene();
    })
    .catch(err => console.error("Library loading failed:", err));

window.addEventListener('scroll', modelMove, { passive: true });
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});