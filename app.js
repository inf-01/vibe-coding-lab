        // --- THREE.JS BACKGROUND (Kung Fury / Webild Style) ---
        const initThreeJS = () => {
            const canvas = document.getElementById('webgl-canvas');
            const scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x050014, 0.015);

            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization

            // Moving Grid
            const gridHelper = new THREE.GridHelper(400, 100, 0xff00ff, 0x00ffff);
            gridHelper.position.y = -15;
            scene.add(gridHelper);

            // Floating Wireframe Shapes
            const objects = [];
            const geometries = [
                new THREE.TorusGeometry(4, 1, 16, 100),
                new THREE.OctahedronGeometry(5, 0),
                new THREE.IcosahedronGeometry(4, 0)
            ];
            
            // Generate multiple neon materials
            const materials = [
                new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.2 }),
                new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, transparent: true, opacity: 0.2 }),
                new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true, transparent: true, opacity: 0.2 })
            ];

            for(let i=0; i<15; i++) {
                const geo = geometries[Math.floor(Math.random() * geometries.length)];
                const mat = materials[Math.floor(Math.random() * materials.length)];
                const mesh = new THREE.Mesh(geo, mat);
                
                mesh.position.set(
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 40 + 10,
                    (Math.random() - 0.5) * -100 - 20
                );
                
                scene.add(mesh);
                objects.push({ 
                    mesh, 
                    rotX: Math.random() * 0.02, 
                    rotY: Math.random() * 0.02,
                    offsetY: Math.random() * Math.PI * 2
                });
            }

            // Neon Particles
            const particlesGeo = new THREE.BufferGeometry();
            const particlesCount = 800;
            const posArray = new Float32Array(particlesCount * 3);
            for(let i=0; i < particlesCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 200;
            }
            particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            const particlesMat = new THREE.PointsMaterial({
                size: 0.5,
                color: 0xff00ff,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
            scene.add(particlesMesh);

            camera.position.z = 10;
            camera.position.y = 5;

            // Mouse Interaction for Parallax Camera
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
                
                // Camera Parallax (Mouse + Scroll)
                const targetX = mouseX * 0.01;
                const targetY = -mouseY * 0.01 - (scrollY * 0.01);
                
                camera.position.x += (targetX - camera.position.x) * 0.05;
                camera.position.y += (targetY + 5 - camera.position.y) * 0.05;
                camera.lookAt(0, 0, -20);
                
                // Move Grid
                gridHelper.position.z = (time * 15) % 4;

                // Rotate Particles
                particlesMesh.rotation.y = time * 0.02;

                // Animate Objects
                objects.forEach((obj, i) => {
                    obj.mesh.rotation.x += obj.rotX;
                    obj.mesh.rotation.y += obj.rotY;
                    obj.mesh.position.y += Math.sin(time * 1.5 + obj.offsetY) * 0.02;
                });

                renderer.render(scene, camera);
            }
            animate();

            // Resize Handler
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
                    
                    const rotateX = ((y - centerY) / centerY) * -20;
                    const rotateY = ((x - centerX) / centerX) * 20;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
                });
            });
        };

        // --- ASTEROIDS CLONE MINIGAME ---
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

            document.querySelector('.game-container').addEventListener('mouseenter', () => {
                if(!isPlaying) {
                    isPlaying = true;
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.style.display = 'none', 300);
                    startGameLoop();
                }
            });
            document.querySelector('.game-container').addEventListener('mouseleave', () => {
                isPlaying = false;
                overlay.style.display = 'flex';
                setTimeout(() => overlay.style.opacity = '1', 10);
                cancelAnimationFrame(animationId);
            });

            const player = { x: gWidth/2, y: gHeight/2, angle: -Math.PI/2, vX: 0, vY: 0 };
            const keys = {};
            document.addEventListener('keydown', e => {
                // Prevent scrolling when playing
                if(isPlaying && ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)){
                    e.preventDefault();
                }
                keys[e.code] = true;
                keys[e.key] = true;
            });
            document.addEventListener('keyup', e => {
                keys[e.code] = false;
                keys[e.key] = false;
            });

            let lasers = [];
            let asteroids = [];
            let particles = [];
            let score = 0;

            const spawnAsteroid = () => {
                const size = 15 + Math.random() * 25;
                const side = Math.floor(Math.random() * 4);
                let x, y;
                if(side === 0) { x = Math.random() * gWidth; y = -size; }
                else if(side === 1) { x = gWidth + size; y = Math.random() * gHeight; }
                else if(side === 2) { x = Math.random() * gWidth; y = gHeight + size; }
                else { x = -size; y = Math.random() * gHeight; }

                // Aim roughly at center
                const angle = Math.atan2((gHeight/2) - y, (gWidth/2) - x) + (Math.random()-0.5);
                const speed = 1 + Math.random() * 2;

                asteroids.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size,
                    vertices: Math.floor(5 + Math.random() * 5),
                    offsets: Array.from({length: 10}, () => Math.random() * 0.4 + 0.8)
                });
            };

            // Click to shoot
            canvas.addEventListener('mousedown', e => {
                if(!isPlaying) return;
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const targetAngle = Math.atan2(mouseY - player.y, mouseX - player.x);
                player.angle = targetAngle;
                fireLaser();
            });

            document.addEventListener('keydown', e => {
                if(e.code === 'Space' && isPlaying) {
                    fireLaser();
                }
            });

            const fireLaser = () => {
                lasers.push({
                    x: player.x + Math.cos(player.angle)*15,
                    y: player.y + Math.sin(player.angle)*15,
                    vx: Math.cos(player.angle) * 12,
                    vy: Math.sin(player.angle) * 12,
                    life: 60
                });
            };

            const createExplosion = (x, y, color) => {
                for(let i=0; i<15; i++){
                    particles.push({
                        x, y,
                        vx: (Math.random()-0.5)*8,
                        vy: (Math.random()-0.5)*8,
                        life: 30 + Math.random()*20,
                        color
                    });
                }
            };

            let lastTime = 0;
            let asteroidTimer = 0;

            const startGameLoop = () => {
                lastTime = performance.now();
                gameLoop(lastTime);
            };

            const gameLoop = (time) => {
                if(!isPlaying) return;
                animationId = requestAnimationFrame(gameLoop);
                const dt = (time - lastTime) / 1000;
                lastTime = time;

                asteroidTimer += dt;
                if(asteroidTimer > 1.5 && asteroids.length < 8) {
                    spawnAsteroid();
                    asteroidTimer = 0;
                }

                // Update Player
                if(keys['ArrowLeft'] || keys['a']) player.angle -= 0.08;
                if(keys['ArrowRight'] || keys['d']) player.angle += 0.08;
                if(keys['ArrowUp'] || keys['w']) {
                    player.vX += Math.cos(player.angle) * 0.4;
                    player.vY += Math.sin(player.angle) * 0.4;
                }
                
                player.vX *= 0.95; // Friction
                player.vY *= 0.95;
                player.x += player.vX;
                player.y += player.vY;
                
                // Wrap player
                if(player.x < 0) player.x = gWidth;
                if(player.x > gWidth) player.x = 0;
                if(player.y < 0) player.y = gHeight;
                if(player.y > gHeight) player.y = 0;

                // Clear Canvas
                ctx.fillStyle = 'rgba(5, 0, 20, 0.4)'; // Trail effect
                ctx.fillRect(0, 0, gWidth, gHeight);

                // Draw Score
                ctx.font = "20px 'Press Start 2P'";
                ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
                ctx.fillText(`SCORE: ${score}`, 20, 40);

                // Draw Player
                ctx.save();
                ctx.translate(player.x, player.y);
                ctx.rotate(player.angle);
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ffff';
                ctx.beginPath();
                ctx.moveTo(15, 0);
                ctx.lineTo(-10, -10);
                ctx.lineTo(-5, 0);
                ctx.lineTo(-10, 10);
                ctx.closePath();
                ctx.stroke();
                
                // Engine thrust
                if(keys['ArrowUp'] || keys['w']) {
                    ctx.strokeStyle = '#ff00ff';
                    ctx.shadowColor = '#ff00ff';
                    ctx.beginPath();
                    ctx.moveTo(-6, 0);
                    ctx.lineTo(-15, (Math.random()-0.5)*10);
                    ctx.stroke();
                }
                ctx.restore();

                // Update & Draw Lasers
                ctx.strokeStyle = '#ff00ff';
                ctx.shadowColor = '#ff00ff';
                ctx.lineWidth = 3;
                for(let i=lasers.length-1; i>=0; i--) {
                    let l = lasers[i];
                    l.x += l.vx; l.y += l.vy;
                    l.life--;
                    
                    ctx.beginPath();
                    ctx.moveTo(l.x, l.y);
                    ctx.lineTo(l.x - l.vx*0.5, l.y - l.vy*0.5);
                    ctx.stroke();
                    
                    if(l.life <= 0 || l.x < 0 || l.x > gWidth || l.y < 0 || l.y > gHeight) {
                        lasers.splice(i, 1);
                    }
                }

                // Update & Draw Particles
                for(let i=particles.length-1; i>=0; i--) {
                    let p = particles[i];
                    p.x += p.vx; p.y += p.vy;
                    p.life--;
                    ctx.fillStyle = p.color;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = p.color;
                    ctx.globalAlpha = p.life / 50;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                    
                    if(p.life <= 0) particles.splice(i, 1);
                }

                // Update & Draw Asteroids
                ctx.strokeStyle = '#ffff00';
                ctx.shadowColor = '#ffff00';
                ctx.lineWidth = 2;
                
                for(let i=asteroids.length-1; i>=0; i--) {
                    let a = asteroids[i];
                    a.x += a.vx; a.y += a.vy;
                    
                    // Wrap asteroids
                    if(a.x < -100) a.x = gWidth + 50;
                    if(a.x > gWidth + 100) a.x = -50;
                    if(a.y < -100) a.y = gHeight + 50;
                    if(a.y > gHeight + 100) a.y = -50;
                    
                    ctx.beginPath();
                    for(let j=0; j<a.vertices; j++) {
                        const angle = (j / a.vertices) * Math.PI * 2;
                        const r = a.size * a.offsets[j];
                        const px = a.x + Math.cos(angle) * r;
                        const py = a.y + Math.sin(angle) * r;
                        if(j===0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.stroke();
                    
                    // Collision with Lasers
                    for(let lIdx = lasers.length-1; lIdx >= 0; lIdx--) {
                        let l = lasers[lIdx];
                        const dist = Math.hypot(l.x - a.x, l.y - a.y);
                        if(dist < a.size) {
                            createExplosion(a.x, a.y, '#ffff00');
                            asteroids.splice(i, 1);
                            lasers.splice(lIdx, 1);
                            score += 100;
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
                e.preventDefault(); // Prevent actual submission for MVP
                
                const rect = submitBtn.getBoundingClientRect();
                const colors = ['#ff00ff', '#00ffff', '#ffff00'];
                
                // Particle Burst
                for(let i=0; i<50; i++) {
                    const particle = document.createElement('div');
                    particle.style.position = 'fixed';
                    particle.style.left = (rect.left + rect.width / 2) + 'px';
                    particle.style.top = (rect.top + rect.height / 2) + 'px';
                    particle.style.width = (Math.random() * 8 + 4) + 'px';
                    particle.style.height = particle.style.width;
                    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                    particle.style.boxShadow = `0 0 15px ${particle.style.background}`;
                    particle.style.borderRadius = '50%';
                    particle.style.pointerEvents = 'none';
                    particle.style.zIndex = '10000';
                    document.body.appendChild(particle);
                    
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 5 + Math.random() * 15;
                    let vx = Math.cos(angle) * velocity;
                    let vy = Math.sin(angle) * velocity;
                    
                    let opacity = 1;
                    function animateParticle() {
                        particle.style.left = parseFloat(particle.style.left) + vx + 'px';
                        particle.style.top = parseFloat(particle.style.top) + vy + 'px';
                        vy += 0.2; // Gravity effect
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
                
                // Button UI Update
                const originalText = submitBtn.innerText;
                submitBtn.innerText = "¡PRE-INSCRIPCIÓN RECIBIDA!";
                submitBtn.style.background = "var(--cyan)";
                submitBtn.style.color = "var(--bg)";
                submitBtn.style.boxShadow = "0 0 50px var(--cyan)";
                
                setTimeout(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.style.background = "var(--fuchsia)";
                    submitBtn.style.color = "#fff";
                    submitBtn.style.boxShadow = "0 0 30px rgba(255, 0, 255, 0.6)";
                    form.reset();
                }, 4000);
            });
        };

        // --- INITIALIZATION ---
        window.addEventListener('DOMContentLoaded', () => {
            initThreeJS();
            initCards();
            initGame();
            initForm();
        });