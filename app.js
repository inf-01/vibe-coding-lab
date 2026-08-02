// --- THREE.JS BACKGROUND (Cyberpunk Gaming Style) ---
const initThreeJS = () => {
    const canvas = document.getElementById('webgl-canvas');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Moving Grid
    const gridHelper = new THREE.GridHelper(400, 100, 0x00ff41, 0x00ff41);
    gridHelper.position.y = -15;
    scene.add(gridHelper);

    // Floating Data Cubes / Angular Shapes
    const objects = [];
    const geometries = [
        new THREE.BoxGeometry(4, 4, 4),
        new THREE.OctahedronGeometry(5, 0),
        new THREE.TetrahedronGeometry(4, 0)
    ];
    
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.15 }), // Cyan
        new THREE.MeshBasicMaterial({ color: 0x00ff41, wireframe: true, transparent: true, opacity: 0.15 }), // Neon Green
        new THREE.MeshBasicMaterial({ color: 0xff003c, wireframe: true, transparent: true, opacity: 0.15 })  // Crimson
    ];

    for(let i=0; i<20; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)];
        const mat = materials[Math.floor(Math.random() * materials.length)];
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.set(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 40 + 10,
            (Math.random() - 0.5) * -100 - 20
        );
        
        scene.add(mesh);
        objects.push({ 
            mesh, 
            rotX: Math.random() * 0.01, 
            rotY: Math.random() * 0.01,
            offsetY: Math.random() * Math.PI * 2
        });
    }

    // Digital Data Rain (Particles)
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 200;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.4,
        color: 0x00ff41,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    camera.position.z = 10;
    camera.position.y = 5;

    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        
        const targetX = mouseX * 0.01;
        const targetY = -mouseY * 0.01 - (scrollY * 0.01);
        
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (targetY + 5 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, -20);
        
        // Grid motion
        gridHelper.position.z = (time * 20) % 4;

        // Data rain drops slowly
        particlesMesh.position.y = -(time * 5) % 100;

        // Animate Objects
        objects.forEach((obj) => {
            obj.mesh.rotation.x += obj.rotX;
            obj.mesh.rotation.y += obj.rotY;
            obj.mesh.position.y += Math.sin(time * 1.5 + obj.offsetY) * 0.02;
        });

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// --- 3D CARD PARALLAX INTERACTION ---
const initCards = () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        });
    });
};

// --- GALAGA CLONE MINIGAME ---
const initGame = () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    let gWidth, gHeight;
    
    const resizeGame = () => {
        const rect = canvas.parentElement.getBoundingClientRect();
        gWidth = canvas.width = rect.width;
        gHeight = canvas.height = rect.height;
    };
    window.addEventListener('resize', resizeGame);
    resizeGame();

    let isPlaying = false;
    let animationId;
    const overlay = document.getElementById('game-overlay');

    const startGameAction = (e) => {
        if(e && e.type === 'touchstart') e.preventDefault();
        if(!isPlaying) {
            isPlaying = true;
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 200);
            startGameLoop();
        }
    };

    const stopGameAction = () => {
        isPlaying = false;
        overlay.style.display = 'flex';
        setTimeout(() => { overlay.style.opacity = '1'; }, 10);
        cancelAnimationFrame(animationId);
    };

    document.querySelector('.game-container').addEventListener('mouseenter', startGameAction);
    document.querySelector('.game-container').addEventListener('mouseleave', stopGameAction);
    
    // Touch support for mobile start
    overlay.addEventListener('touchstart', startGameAction, {passive: false});
    // Double tap to pause on canvas
    canvas.addEventListener('dblclick', stopGameAction);

    const player = { x: gWidth/2, y: gHeight - 60, width: 30, height: 30, vX: 0 };
    const keys = {};
    let isTouching = false;
    let touchX = null;

    canvas.addEventListener('touchstart', (e) => {
        if(isPlaying) e.preventDefault(); // Only prevent scroll if playing
        isTouching = true;
        const rect = canvas.getBoundingClientRect();
        touchX = e.touches[0].clientX - rect.left;
    }, {passive: false});
    
    canvas.addEventListener('touchmove', (e) => {
        if(isPlaying) e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        touchX = e.touches[0].clientX - rect.left;
    }, {passive: false});
    
    canvas.addEventListener('touchend', (e) => {
        if(isPlaying) e.preventDefault();
        isTouching = false;
        touchX = null;
    }, {passive: false});
    // Add touch cancel to prevent stuck states
    canvas.addEventListener('touchcancel', (e) => {
        isTouching = false;
        touchX = null;
    });

    document.addEventListener('keydown', e => {
        if(isPlaying && (e.code === 'Space' || ['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key))){
            e.preventDefault();
        }
        keys[e.key] = true;
    });
    document.addEventListener('keyup', e => keys[e.key] = false);

    let lasers = [];
    let enemies = [];
    let particles = [];
    let stars = [];
    let score = 0;
    let highScore = localStorage.getItem('vibeHighScore') || 0;

    // Initialize stars
    for(let i=0; i<100; i++) {
        stars.push({
            x: Math.random() * 2000, // Large area to handle resizing
            y: Math.random() * 2000,
            speed: 0.5 + Math.random() * 2,
            size: Math.random() * 2
        });
    }

    const spawnEnemyWave = () => {
        const rows = 3;
        const cols = 6;
        const spacingX = 60;
        const spacingY = 50;
        const startX = (gWidth - (cols * spacingX)) / 2;
        
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                enemies.push({
                    x: startX + c * spacingX,
                    y: -100 - r * spacingY,
                    targetY: 50 + r * spacingY,
                    width: 25,
                    height: 25,
                    phase: Math.random() * Math.PI * 2,
                    speedY: 1 + Math.random(),
                    type: Math.random() > 0.8 ? 'fast' : 'normal'
                });
            }
        }
    };

    document.addEventListener('keydown', e => {
        if(e.code === 'Space' && isPlaying) {
            fireLaser();
        }
    });

    const fireLaser = () => {
        if (lasers.length < 5) { // Limit fire rate
            lasers.push({ x: player.x, y: player.y - 15, vy: -12, color: '#00f3ff' });
        }
    };

    const createExplosion = (x, y, color) => {
        for(let i=0; i<20; i++){
            particles.push({
                x, y,
                vx: (Math.random()-0.5)*10,
                vy: (Math.random()-0.5)*10,
                life: 20 + Math.random()*20,
                color
            });
        }
    };

    let lastTime = 0;
    let waveTimer = 5;

    const startGameLoop = () => {
        player.y = gHeight - 60; // Move player higher up to avoid clip-path cuts
        lastTime = performance.now();
        gameLoop(lastTime);
    };

    const gameLoop = (time) => {
        if(!isPlaying) return;
        animationId = requestAnimationFrame(gameLoop);
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        // Wave Spawning
        waveTimer += dt;
        if(enemies.length === 0 || waveTimer > 10) {
            spawnEnemyWave();
            waveTimer = 0;
        }

        // Touch Movement and Auto-fire
        if(isTouching && touchX !== null) {
            if (touchX < player.x - 15) player.vX -= 2;
            if (touchX > player.x + 15) player.vX += 2;
            fireLaser();
        }

        // Player Movement
        if(keys['ArrowLeft'] || keys['a']) player.vX -= 1.5;
        if(keys['ArrowRight'] || keys['d']) player.vX += 1.5;
        
        player.vX *= 0.85; // Friction
        player.x += player.vX;
        
        // Bounds
        if(player.x < 20) player.x = 20;
        if(player.x > gWidth - 20) player.x = gWidth - 20;

        // Black Galaxy Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, gWidth, gHeight);

        // Draw Stars
        ctx.fillStyle = '#ffffff';
        stars.forEach(s => {
            s.y += s.speed;
            if(s.y > gHeight) {
                s.y = 0;
                s.x = Math.random() * gWidth;
            }
            if(s.x <= gWidth) {
                ctx.globalAlpha = 0.5 + Math.random() * 0.5; // Twinkle
                ctx.fillRect(s.x, s.y, s.size, s.size);
                ctx.globalAlpha = 1.0;
            }
        });

        // Draw Score & High Score
        ctx.font = "14px 'Press Start 2P'";
        ctx.fillStyle = "rgba(0, 255, 65, 0.8)";
        ctx.fillText(`SCORE: ${score}`, 20, 30);
        ctx.fillStyle = "rgba(0, 243, 255, 0.8)";
        ctx.fillText(`HI: ${highScore}`, gWidth - 140, 30);

        // Draw Player Ship (Galaga Style Pixel Art)
        ctx.save();
        ctx.translate(player.x, player.y);
        
        // Ship Body (White)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6, -10, 12, 16);
        ctx.fillRect(-2, -16, 4, 6);
        
        // Wings (Blue)
        ctx.fillStyle = '#0055ff';
        ctx.fillRect(-14, 0, 8, 10);
        ctx.fillRect(6, 0, 8, 10);
        ctx.fillRect(-18, 4, 4, 8);
        ctx.fillRect(14, 4, 4, 8);
        
        // Wing Tips (Red)
        ctx.fillStyle = '#ff003c';
        ctx.fillRect(-18, -2, 4, 6);
        ctx.fillRect(14, -2, 4, 6);
        
        // Cockpit (Cyan)
        ctx.fillStyle = '#00f3ff';
        ctx.fillRect(-4, -4, 8, 4);

        // Thruster
        if (Math.random() > 0.5) {
            ctx.fillStyle = '#ff003c';
            ctx.fillRect(-4, 6, 8, 6);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(-2, 6, 4, 4);
        }
        ctx.restore();

        // Update & Draw Lasers
        ctx.lineWidth = 3;
        for(let i=lasers.length-1; i>=0; i--) {
            let l = lasers[i];
            l.y += l.vy;
            ctx.strokeStyle = l.color;
            ctx.shadowColor = l.color;
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.x, l.y + 10);
            ctx.stroke();
            
            if(l.y < 0) lasers.splice(i, 1);
        }

        // Update & Draw Particles
        for(let i=particles.length-1; i>=0; i--) {
            let p = particles[i];
            p.x += p.vx; p.y += p.vy;
            p.life--;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = p.color;
            ctx.globalAlpha = p.life / 40;
            ctx.fillRect(p.x, p.y, 3, 3);
            ctx.globalAlpha = 1.0;
            if(p.life <= 0) particles.splice(i, 1);
        }

        // Update & Draw Enemies
        for(let i=enemies.length-1; i>=0; i--) {
            let e = enemies[i];
            
            // Descent & Hover Logic
            if (e.y < e.targetY) {
                e.y += e.speedY * 3;
            } else {
                e.phase += 0.05;
                e.x += Math.sin(e.phase) * 2;
                if (e.type === 'fast') e.y += Math.cos(e.phase) * 1;
            }

            // Draw Enemy (Galaga Style Bug)
            ctx.save();
            ctx.translate(e.x, e.y);
            
            if (e.type === 'fast') {
                // Boss type (Blue and Red)
                ctx.fillStyle = '#0055ff';
                ctx.fillRect(-12, -8, 24, 16);
                ctx.fillStyle = '#ff003c';
                ctx.fillRect(-8, -12, 16, 4);
                ctx.fillRect(-16, 0, 4, 12);
                ctx.fillRect(12, 0, 4, 12);
                // Eyes
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(-6, -4, 4, 4);
                ctx.fillRect(2, -4, 4, 4);
            } else {
                // Minion type (Red and Yellow)
                ctx.fillStyle = '#ff003c';
                ctx.fillRect(-10, -6, 20, 12);
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(-6, -10, 12, 4);
                ctx.fillRect(-14, -2, 4, 10);
                ctx.fillRect(10, -2, 4, 10);
                // Eyes
                ctx.fillStyle = '#00f3ff';
                ctx.fillRect(-4, -2, 2, 2);
                ctx.fillRect(2, -2, 2, 2);
            }
            
            ctx.restore();
            
            // Collision with Lasers
            for(let lIdx = lasers.length-1; lIdx >= 0; lIdx--) {
                let l = lasers[lIdx];
                if(l.x > e.x - e.width/2 && l.x < e.x + e.width/2 &&
                   l.y > e.y - e.height/2 && l.y < e.y + e.height/2) {
                    createExplosion(e.x, e.y, '#ff003c');
                    enemies.splice(i, 1);
                    lasers.splice(lIdx, 1);
                    score += (e.type === 'fast' ? 200 : 100);
                    if(score > highScore) {
                        highScore = score;
                        localStorage.setItem('vibeHighScore', highScore);
                    }
                    break;
                }
            }
        }
    };
};

// --- FORM SUBMIT PARTICLES ---
const initForm = () => {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const rect = submitBtn.getBoundingClientRect();
        const colors = ['#00f3ff', '#00ff41', '#ff003c'];
        
        for(let i=0; i<60; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = (rect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top + rect.height / 2) + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.boxShadow = `0 0 10px ${particle.style.background}`;
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '10000';
            document.body.appendChild(particle);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 20;
            let vx = Math.cos(angle) * velocity;
            let vy = Math.sin(angle) * velocity;
            
            let opacity = 1;
            function animateParticle() {
                particle.style.left = parseFloat(particle.style.left) + vx + 'px';
                particle.style.top = parseFloat(particle.style.top) + vy + 'px';
                vy += 0.4; // Stronger gravity for cyber feel
                opacity -= 0.02;
                particle.style.opacity = opacity;
                
                if(opacity > 0) {
                    requestAnimationFrame(animateParticle);
                } else {
                    particle.remove();
                }
            }
            requestAnimationFrame(animateParticle);
        }
        
        const originalText = submitBtn.innerText;
        submitBtn.innerText = ">> TRANSMISSION SENT //";
        submitBtn.style.background = "var(--neon-green)";
        submitBtn.style.color = "#000";
        submitBtn.style.boxShadow = "0 0 30px var(--neon-green)";
        
        setTimeout(() => {
            submitBtn.innerText = originalText;
            submitBtn.style.background = "var(--crimson)";
            submitBtn.style.color = "#fff";
            submitBtn.style.boxShadow = "none";
            form.reset();
        }, 3000);
    });
};

// --- CSS PARTICLES ---
const initCSSParticles = () => {
    const colors = ['#00f3ff', '#00ff41'];
    for(let i=0; i<40; i++) {
        let dust = document.createElement('div');
        dust.className = 'floating-dust';
        dust.style.left = Math.random() * 100 + 'vw';
        dust.style.animationDuration = (Math.random() * 10 + 10) + 's';
        dust.style.animationDelay = '-' + (Math.random() * 20) + 's';
        dust.style.background = colors[Math.floor(Math.random()*colors.length)];
        dust.style.boxShadow = `0 0 8px ${dust.style.background}`;
        document.body.appendChild(dust);
    }
};

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initCards();
    initGame();
    initForm();
    initCSSParticles();
});