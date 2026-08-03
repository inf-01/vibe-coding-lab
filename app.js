// =========================================================================
// THREE.JS BACKGROUND — Data Lattice
// A restrained, single-hue-family node network (not scattered wireframe
// shapes). Nodes are generated once, connected within a distance threshold,
// then the whole lattice drifts slowly with a gentle mouse/scroll parallax.
// =========================================================================
const initThreeJS = () => {
    const canvas = document.getElementById('webgl-canvas');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07070b, 0.012);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);

    const NODE_COUNT = 130;
    const nodePositions = [];
    for (let i = 0; i < NODE_COUNT; i++) {
        nodePositions.push(new THREE.Vector3(
            (Math.random() - 0.5) * 64,
            (Math.random() - 0.5) * 38,
            (Math.random() - 0.5) * 60 - 8
        ));
    }

    // Points (violet -> cyan gradient per node)
    const posArray = new Float32Array(NODE_COUNT * 3);
    const colorArray = new Float32Array(NODE_COUNT * 3);
    const cViolet = new THREE.Color(0x7c5cff);
    const cCyan = new THREE.Color(0x4ce0d2);
    nodePositions.forEach((v, i) => {
        posArray[i * 3] = v.x; posArray[i * 3 + 1] = v.y; posArray[i * 3 + 2] = v.z;
        const c = cViolet.clone().lerp(cCyan, Math.random());
        colorArray[i * 3] = c.r; colorArray[i * 3 + 1] = c.g; colorArray[i * 3 + 2] = c.b;
    });
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    pointsGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    const pointsMat = new THREE.PointsMaterial({
        size: 0.5, vertexColors: true, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    group.add(new THREE.Points(pointsGeo, pointsMat));

    // Connective lines (computed once — within-threshold pairs only)
    const linePositions = [];
    const THRESHOLD = 10.5;
    for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
            if (nodePositions[i].distanceTo(nodePositions[j]) < THRESHOLD) {
                const a = nodePositions[i], b = nodePositions[j];
                linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
            }
        }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.1 });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    camera.position.set(0, 3, 14);

    let mouseX = 0, mouseY = 0, scrollY = 0;
    const halfX = window.innerWidth / 2, halfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX - halfX;
        mouseY = e.clientY - halfY;
    });
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        group.rotation.y = t * 0.02;
        group.rotation.x = Math.sin(t * 0.1) * 0.04;

        const targetX = mouseX * 0.006;
        const targetY = -mouseY * 0.006 - scrollY * 0.004;
        camera.position.x += (targetX - camera.position.x) * 0.04;
        camera.position.y += (targetY + 3 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, -10);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// =========================================================================
// CUSTOM CURSOR RING (desktop only)
// =========================================================================
const initCursor = () => {
    const ring = document.getElementById('cursorRing');
    if (!ring) return;
    let tx = -100, ty = -100, cx = -100, cy = -100;
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
    document.querySelectorAll('a, button, input, select, .card').forEach((el) => {
        el.addEventListener('mouseenter', () => { ring.style.width = '38px'; ring.style.height = '38px'; ring.style.borderColor = 'rgba(76,224,210,0.7)'; });
        el.addEventListener('mouseleave', () => { ring.style.width = '22px'; ring.style.height = '22px'; ring.style.borderColor = 'rgba(124,92,255,0.55)'; });
    });
    (function loop() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        ring.style.left = cx + 'px'; ring.style.top = cy + 'px';
        requestAnimationFrame(loop);
    })();
};

// =========================================================================
// SCROLL REVEAL (IntersectionObserver)
// =========================================================================
const initReveal = () => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
};

// =========================================================================
// 3D CARD TILT
// =========================================================================
const initCards = () => {
    document.querySelectorAll('.card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            const cx = rect.width / 2, cy = rect.height / 2;
            const rotateX = ((y - cy) / cy) * -6;
            const rotateY = ((x - cx) / cx) * 6;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
};

// =========================================================================
// GALAGA-STYLE MINIGAME (mechanics preserved from the original build,
// palette unified to the new violet / cyan / amber system)
// =========================================================================
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
        if (e && e.type === 'touchstart') e.preventDefault();
        if (!isPlaying) {
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
    overlay.addEventListener('touchstart', startGameAction, { passive: false });
    canvas.addEventListener('dblclick', stopGameAction);

    const player = { x: gWidth / 2, y: gHeight - 60, width: 30, height: 30, vX: 0 };
    const keys = {};
    let isTouching = false, touchX = null;

    canvas.addEventListener('touchstart', (e) => {
        if (isPlaying) e.preventDefault();
        isTouching = true;
        const rect = canvas.getBoundingClientRect();
        touchX = e.touches[0].clientX - rect.left;
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
        if (isPlaying) e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        touchX = e.touches[0].clientX - rect.left;
    }, { passive: false });
    canvas.addEventListener('touchend', (e) => {
        if (isPlaying) e.preventDefault();
        isTouching = false; touchX = null;
    }, { passive: false });
    canvas.addEventListener('touchcancel', () => { isTouching = false; touchX = null; });

    document.addEventListener('keydown', (e) => {
        if (isPlaying && (e.code === 'Space' || ['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key))) e.preventDefault();
        keys[e.key] = true;
    });
    document.addEventListener('keyup', (e) => { keys[e.key] = false; });

    let lasers = [], enemies = [], particles = [], stars = [];
    let score = 0;
    let highScore = localStorage.getItem('vibeHighScore') || 0;

    for (let i = 0; i < 100; i++) {
        stars.push({ x: Math.random() * 2000, y: Math.random() * 2000, speed: 0.5 + Math.random() * 2, size: Math.random() * 2 });
    }

    const spawnEnemyWave = () => {
        const rows = 3, cols = 6, spacingX = 60, spacingY = 50;
        const startX = (gWidth - (cols * spacingX)) / 2;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                enemies.push({
                    x: startX + c * spacingX, y: -100 - r * spacingY, targetY: 50 + r * spacingY,
                    width: 25, height: 25, phase: Math.random() * Math.PI * 2,
                    speedY: 1 + Math.random(), type: Math.random() > 0.8 ? 'fast' : 'normal'
                });
            }
        }
    };

    document.addEventListener('keydown', (e) => { if (e.code === 'Space' && isPlaying) fireLaser(); });

    const fireLaser = () => {
        if (lasers.length < 5) lasers.push({ x: player.x, y: player.y - 15, vy: -12, color: '#4ce0d2' });
    };

    const createExplosion = (x, y, color) => {
        for (let i = 0; i < 20; i++) {
            particles.push({ x, y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 20 + Math.random() * 20, color });
        }
    };

    let lastTime = 0, waveTimer = 5;

    const startGameLoop = () => {
        player.y = gHeight - 60;
        lastTime = performance.now();
        gameLoop(lastTime);
    };

    const gameLoop = (time) => {
        if (!isPlaying) return;
        animationId = requestAnimationFrame(gameLoop);
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        waveTimer += dt;
        if (enemies.length === 0 || waveTimer > 10) { spawnEnemyWave(); waveTimer = 0; }

        if (isTouching && touchX !== null) {
            if (touchX < player.x - 15) player.vX -= 2;
            if (touchX > player.x + 15) player.vX += 2;
            fireLaser();
        }

        if (keys['ArrowLeft'] || keys['a']) player.vX -= 1.5;
        if (keys['ArrowRight'] || keys['d']) player.vX += 1.5;
        player.vX *= 0.85;
        player.x += player.vX;
        if (player.x < 20) player.x = 20;
        if (player.x > gWidth - 20) player.x = gWidth - 20;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, gWidth, gHeight);

        ctx.fillStyle = '#ffffff';
        stars.forEach((s) => {
            s.y += s.speed;
            if (s.y > gHeight) { s.y = 0; s.x = Math.random() * gWidth; }
            if (s.x <= gWidth) {
                ctx.globalAlpha = 0.5 + Math.random() * 0.5;
                ctx.fillRect(s.x, s.y, s.size, s.size);
                ctx.globalAlpha = 1.0;
            }
        });

        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.fillStyle = 'rgba(76,224,210,0.85)';
        ctx.fillText(`SCORE: ${score}`, 20, 28);
        ctx.fillStyle = 'rgba(124,92,255,0.85)';
        ctx.fillText(`HI: ${highScore}`, gWidth - 120, 28);

        // Player ship
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.fillStyle = '#eef0f6';
        ctx.fillRect(-6, -10, 12, 16);
        ctx.fillRect(-2, -16, 4, 6);
        ctx.fillStyle = '#7c5cff';
        ctx.fillRect(-14, 0, 8, 10);
        ctx.fillRect(6, 0, 8, 10);
        ctx.fillRect(-18, 4, 4, 8);
        ctx.fillRect(14, 4, 4, 8);
        ctx.fillStyle = '#ffb454';
        ctx.fillRect(-18, -2, 4, 6);
        ctx.fillRect(14, -2, 4, 6);
        ctx.fillStyle = '#4ce0d2';
        ctx.fillRect(-4, -4, 8, 4);
        if (Math.random() > 0.5) {
            ctx.fillStyle = '#ffb454';
            ctx.fillRect(-4, 6, 8, 6);
            ctx.fillStyle = '#fff2cc';
            ctx.fillRect(-2, 6, 4, 4);
        }
        ctx.restore();

        ctx.lineWidth = 3;
        for (let i = lasers.length - 1; i >= 0; i--) {
            const l = lasers[i];
            l.y += l.vy;
            ctx.strokeStyle = l.color;
            ctx.shadowColor = l.color;
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.x, l.y + 10);
            ctx.stroke();
            if (l.y < 0) lasers.splice(i, 1);
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy; p.life--;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 5; ctx.shadowColor = p.color;
            ctx.globalAlpha = p.life / 40;
            ctx.fillRect(p.x, p.y, 3, 3);
            ctx.globalAlpha = 1.0;
            if (p.life <= 0) particles.splice(i, 1);
        }

        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (e.y < e.targetY) { e.y += e.speedY * 3; }
            else {
                e.phase += 0.05;
                e.x += Math.sin(e.phase) * 2;
                if (e.type === 'fast') e.y += Math.cos(e.phase) * 1;
            }

            ctx.save();
            ctx.translate(e.x, e.y);
            if (e.type === 'fast') {
                ctx.fillStyle = '#7c5cff';
                ctx.fillRect(-12, -8, 24, 16);
                ctx.fillStyle = '#ffb454';
                ctx.fillRect(-8, -12, 16, 4);
                ctx.fillRect(-16, 0, 4, 12);
                ctx.fillRect(12, 0, 4, 12);
                ctx.fillStyle = '#fff2cc';
                ctx.fillRect(-6, -4, 4, 4);
                ctx.fillRect(2, -4, 4, 4);
            } else {
                ctx.fillStyle = '#ffb454';
                ctx.fillRect(-10, -6, 20, 12);
                ctx.fillStyle = '#4ce0d2';
                ctx.fillRect(-6, -10, 12, 4);
                ctx.fillRect(-14, -2, 4, 10);
                ctx.fillRect(10, -2, 4, 10);
                ctx.fillStyle = '#7c5cff';
                ctx.fillRect(-4, -2, 2, 2);
                ctx.fillRect(2, -2, 2, 2);
            }
            ctx.restore();

            for (let lIdx = lasers.length - 1; lIdx >= 0; lIdx--) {
                const l = lasers[lIdx];
                if (l.x > e.x - e.width / 2 && l.x < e.x + e.width / 2 && l.y > e.y - e.height / 2 && l.y < e.y + e.height / 2) {
                    createExplosion(e.x, e.y, '#ffb454');
                    enemies.splice(i, 1);
                    lasers.splice(lIdx, 1);
                    score += (e.type === 'fast' ? 200 : 100);
                    if (score > highScore) { highScore = score; localStorage.setItem('vibeHighScore', highScore); }
                    break;
                }
            }
        }
    };
};

// =========================================================================
// FORM SUBMIT — confetti burst in the brand palette
// =========================================================================
const initForm = () => {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const rect = submitBtn.getBoundingClientRect();
        const colors = ['#7c5cff', '#4ce0d2', '#ffb454'];

        for (let i = 0; i < 36; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = (rect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top + rect.height / 2) + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.borderRadius = '50%';
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.background = color;
            particle.style.boxShadow = `0 0 8px ${color}`;
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '10000';
            document.body.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 4 + Math.random() * 16;
            let vx = Math.cos(angle) * velocity;
            let vy = Math.sin(angle) * velocity;
            let opacity = 1;

            (function animateParticle() {
                particle.style.left = parseFloat(particle.style.left) + vx + 'px';
                particle.style.top = parseFloat(particle.style.top) + vy + 'px';
                vy += 0.35;
                opacity -= 0.022;
                particle.style.opacity = opacity;
                if (opacity > 0) requestAnimationFrame(animateParticle);
                else particle.remove();
            })();
        }

        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Transmisión enviada ✓';
        submitBtn.style.background = 'linear-gradient(120deg, #4ce0d2, #7c5cff)';

        setTimeout(() => {
            submitBtn.innerText = originalText;
            submitBtn.style.background = '';
            form.reset();
        }, 3000);
    });
};

// =========================================================================
// INIT
// =========================================================================
window.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initCursor();
    initReveal();
    initCards();
    initGame();
    initForm();
});
