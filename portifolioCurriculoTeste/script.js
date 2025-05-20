// Three.js background animation
document.addEventListener('DOMContentLoaded', function() {
    // Set up the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        alpha: true
    });
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    camera.position.setZ(30);
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Materials
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.4,
        color: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#4361ee',
        transparent: true,
        opacity: 0.6,
    });
    
    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        particlesMesh.rotation.x += 0.0005;
        particlesMesh.rotation.y += 0.0005;
        
        renderer.render(scene, camera);
    }
    
    // Handle resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate();

    // Dark mode toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;
    
    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        updateParticleColor('#6d8dff');
    } else {
        updateParticleColor('#4361ee');
    }
    
    // Toggle theme
    themeToggleBtn.addEventListener('click', function() {
        body.classList.toggle('dark-theme');
        
        // Save user preference
        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            updateParticleColor('#6d8dff');
        } else {
            localStorage.setItem('theme', 'light');
            updateParticleColor('#4361ee');
        }
    });
    
    // Update particle color based on theme
    function updateParticleColor(color) {
        particlesMaterial.color.set(color);
    }
});
