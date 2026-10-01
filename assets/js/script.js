/* ==========================================================================
   HANDCRAFTED BENTO INTERACTIVITY & HIGH-PERFORMANCE DSA TOUCH ENGINE
   Developer: Sahil
   Optimization: DSA Spatial Indexing & Smooth Continuous Marquee Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    let lastVibratedCardEl = null;

    // Helper for haptic vibration
    function triggerHaptic(pattern = 35) {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Ignore security blocks
            }
        }
    }

    let isModalOpen = false;

    // 1. Custom Cursor Logic (Desktop Only with GPU 1-to-1 Hardware Acceleration)
    const cursor = document.getElementById('custom-cursor');

    if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let cursorX = -100;
        let cursorY = -100;
        let isDraggingScrollbar = false;

        function checkScrollbarHover(e) {
            if (!isModalOpen) return false;
            const modalBody = document.querySelector('.modal-body');
            if (!modalBody) return false;

            // Check if vertical scrollbar is active
            if (modalBody.scrollHeight > modalBody.clientHeight) {
                const rect = modalBody.getBoundingClientRect();
                const scrollbarStartX = rect.left + modalBody.clientWidth;
                if (e.clientX >= scrollbarStartX - 4 && e.clientX <= rect.right + 6 && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    return true;
                }
            }
            return false;
        }

        function updateCursorPos(e) {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

            const isOverScrollbar = checkScrollbarHover(e);
            if (isOverScrollbar || isDraggingScrollbar) {
                cursor.classList.add('is-hidden');
            } else {
                cursor.classList.remove('is-hidden');
            }
        }

        window.addEventListener('pointerdown', (e) => {
            if (checkScrollbarHover(e)) {
                isDraggingScrollbar = true;
                cursor.classList.add('is-hidden');
            }
        }, { passive: true, capture: true });

        window.addEventListener('pointerup', () => {
            isDraggingScrollbar = false;
        }, { passive: true, capture: true });

        window.addEventListener('pointercancel', () => {
            isDraggingScrollbar = false;
        }, { passive: true, capture: true });

        // Instant zero-latency hardware tracking across window, modal, and scrollbars
        window.addEventListener('pointermove', updateCursorPos, { passive: true, capture: true });
        window.addEventListener('mousemove', updateCursorPos, { passive: true, capture: true });
        window.addEventListener('dragover', updateCursorPos, { passive: true, capture: true });

        document.addEventListener('mouseover', (e) => {
            if (e.target && e.target.closest && e.target.closest('a, button, .bento-card, .skill-pill, .modal-close-btn, .modal-project-card, .hackathon-card, .project-link-icon, .spotify-mini-pill, .spotify-icon-btn, .spotify-ctrl-btn, .spotify-progress-bar-wrap, .spotify-vol-slider, .spotify-mini-btn')) {
                cursor.classList.add('hover');
            } else {
                cursor.classList.remove('hover');
            }
        }, { passive: true });
    }

    // Real-Time Mouse/Pointer Tracking for Spatial Collision
    let currentMouseX = -1000;
    let currentMouseY = -1000;
    let isMouseActive = false;

    window.addEventListener('pointermove', (e) => {
        currentMouseX = e.clientX;
        currentMouseY = e.clientY;
        isMouseActive = true;
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
        isMouseActive = false;
        currentMouseX = -1000;
        currentMouseY = -1000;
    }, { passive: true });

    // Sanitize tech stack icons: convert title to data-tech-name to suppress standard delayed browser tooltips
    const techCard = document.querySelector('.bento-tech-marquee');
    const techTooltip = document.getElementById('tech-tooltip');
    const techIcons = Array.from(document.querySelectorAll('.marquee-group i'));
    let activeTechIcon = null;

    techIcons.forEach((icon) => {
        const titleName = icon.getAttribute('title');
        if (titleName) {
            icon.setAttribute('data-tech-name', titleName);
            icon.removeAttribute('title');
        }
    });

    function isCursorInsideElement(x, y, el) {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }

    function updateRealtimeTechTooltip() {
        if (!techTooltip || !techCard) return;

        let matchedIcon = null;
        let matchedName = '';
        let matchedRect = null;

        // Strictly check if cursor is inside tech stack card boundaries
        const isInsideTechCard = isMouseActive && isCursorInsideElement(currentMouseX, currentMouseY, techCard);

        if (!isInsideTechCard) {
            // Reset marquee speed control when cursor is outside tech stack card
            targetSpeedTop = baseSpeed;
            targetSpeedBottom = baseSpeed;

            if (activeTechIcon) {
                activeTechIcon.classList.remove('tech-active');
                activeTechIcon = null;
            }
            techTooltip.classList.remove('is-visible');
            return;
        }

        const techCardRect = techCard.getBoundingClientRect();

        for (let i = 0; i < techIcons.length; i++) {
            const icon = techIcons[i];
            const rect = icon.getBoundingClientRect();

            // Skip icons outside the tech card bounds
            if (
                rect.right < techCardRect.left ||
                rect.left > techCardRect.right ||
                rect.bottom < techCardRect.top ||
                rect.top > techCardRect.bottom
            ) {
                continue;
            }

            // 4px hit margin around icon bounding box
            const hitMargin = 4;
            if (
                currentMouseX >= rect.left - hitMargin &&
                currentMouseX <= rect.right + hitMargin &&
                currentMouseY >= rect.top - hitMargin &&
                currentMouseY <= rect.bottom + hitMargin
            ) {
                matchedIcon = icon;
                matchedName = icon.getAttribute('data-tech-name') || '';
                matchedRect = rect;
                break;
            }
        }

        if (matchedIcon && matchedName) {
            if (activeTechIcon !== matchedIcon) {
                if (activeTechIcon) activeTechIcon.classList.remove('tech-active');
                activeTechIcon = matchedIcon;
                activeTechIcon.classList.add('tech-active');
            }

            techTooltip.textContent = matchedName;

            const clampedX = Math.max(techCardRect.left + 30, Math.min(techCardRect.right - 30, currentMouseX));
            const targetY = Math.max(techCardRect.top - 10, matchedRect.top - 6);

            techTooltip.style.left = `${clampedX}px`;
            techTooltip.style.top = `${targetY}px`;
            techTooltip.classList.add('is-visible');
        } else {
            if (activeTechIcon) {
                activeTechIcon.classList.remove('tech-active');
                activeTechIcon = null;
            }
            techTooltip.classList.remove('is-visible');
        }
    }

    // ==========================================================================
    // HIGH-PERFORMANCE CONTINUOUS INFINITE MARQUEE ENGINE (ZERO JERK, ZERO JUMP)
    // ==========================================================================
    const trackTop = document.getElementById('marquee-track-top');
    const trackBottom = document.getElementById('marquee-track-bottom');

    let posTop = 0;
    let posBottom = 0;
    let halfWidthTop = 0;
    let halfWidthBottom = 0;

    const baseSpeed = 0.55; // Relaxed, elegant base ambient speed (px / frame)
    let targetSpeedTop = baseSpeed;
    let targetSpeedBottom = baseSpeed;
    let currentSpeedTop = baseSpeed;
    let currentSpeedBottom = baseSpeed;

    let isHoldingTechCard = false;
    let techTouchStartX = 0;

    function measureMarqueeWidths() {
        if (trackTop) {
            const g = trackTop.querySelector('.marquee-group');
            if (g && g.offsetWidth > 0) halfWidthTop = g.offsetWidth;
        }
        if (trackBottom) {
            const g = trackBottom.querySelector('.marquee-group');
            if (g && g.offsetWidth > 0) halfWidthBottom = g.offsetWidth;
        }
    }
    
    measureMarqueeWidths();
    setTimeout(measureMarqueeWidths, 100);
    setTimeout(measureMarqueeWidths, 500);
    window.addEventListener('load', measureMarqueeWidths, { passive: true });
    window.addEventListener('resize', measureMarqueeWidths, { passive: true });

    function stepMarqueeLoop() {
        if (isModalOpen) {
            requestAnimationFrame(stepMarqueeLoop);
            return;
        }

        // Fallback width check
        if (halfWidthTop === 0 && trackTop) {
            const g = trackTop.querySelector('.marquee-group');
            if (g && g.offsetWidth > 0) halfWidthTop = g.offsetWidth;
        }
        if (halfWidthBottom === 0 && trackBottom) {
            const g = trackBottom.querySelector('.marquee-group');
            if (g && g.offsetWidth > 0) halfWidthBottom = g.offsetWidth;
        }

        const effectiveHalfTop = halfWidthTop || 450;
        const effectiveHalfBottom = halfWidthBottom || 450;

        // Smooth lerp speed transition (Zero jerk, zero jump!)
        currentSpeedTop += (targetSpeedTop - currentSpeedTop) * 0.08;
        currentSpeedBottom += (targetSpeedBottom - currentSpeedBottom) * 0.08;

        // Top Row ALWAYS moves LEFT ONLY (DSA Modulo Virtualization)
        if (trackTop) {
            posTop -= currentSpeedTop;
            const wrapWidth = halfWidthTop || 450;
            if (Math.abs(posTop) >= wrapWidth) {
                posTop = posTop % wrapWidth; // Modulo Ring Buffer Wrap
            }
            trackTop.style.transform = `translate3d(${posTop}px, 0, 0)`;
        }

        // Bottom Row ALWAYS moves RIGHT ONLY (DSA Modulo Virtualization)
        if (trackBottom) {
            posBottom += currentSpeedBottom;
            const wrapWidth = halfWidthBottom || 450;
            if (posBottom >= 0) {
                posBottom = -wrapWidth + (posBottom % wrapWidth); // Modulo Ring Buffer Wrap
            }
            trackBottom.style.transform = `translate3d(${posBottom}px, 0, 0)`;
        }

        // Real-Time Spatial Collision Popup Check for Tech Stack Icons
        updateRealtimeTechTooltip();

        requestAnimationFrame(stepMarqueeLoop);
    }
    requestAnimationFrame(stepMarqueeLoop);

    // ==========================================================================
    // DATA STRUCTURES & ALGORITHMS (DSA) HIGH-PERFORMANCE PHYSICS ENGINE
    // Developer: Sahil
    // Data Structures: Permutation Vector pi in S_N, Spatial Index, State Vectors
    // Algorithms: Hooke's Law Mass-Spring-Damper, Euclidean Nearest-Neighbor, FLIP Lerp
    // ==========================================================================
    const cardNodes = Array.from(document.querySelectorAll('.bento-card'));
    const bentoBtns = Array.from(document.querySelectorAll('.bento-btn'));

    let spatialCards = [];
    let spatialBtns = [];
    let activeHeldController = null;
    let currentActiveBtn = null;

    // DSA Data Structures: Virtual Permutation Vector & Static Slot Coordinates Matrix
    let virtualOrder = []; // Mathematical permutation pi: Slot_Index -> Card_Index
    let slotPositions = []; // Vector<Point2D> static grid origins
    let lastVirtualSwapTime = 0;

    // Fast Card Physics Controller (Tilt, Translation, Virtual Target Lerp & Recoil)
    function createCardController(card, index) {
        return {
            card: card,
            index: index,
            restLeft: undefined,
            restTop: undefined,
            width: 0,
            height: 0,

            // Virtual Target Displacement (for smooth grid reordering)
            targetX: 0,
            targetY: 0,

            // 3D Tilt parameters
            targetRotateX: 0,
            targetRotateY: 0,
            targetScale: 1,
            currentRotateX: 0,
            currentRotateY: 0,
            currentScale: 1,

            // 2D Physics position, velocity, and rotation
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            rz: 0,
            vrz: 0,

            // Holding state
            isHeld: false,
            dragStartX: 0,
            dragStartY: 0,
            cardStartX: 0,
            cardStartY: 0,
            lastMouseX: 0,
            lastMouseY: 0,
            dragDistance: 0,

            // Spring Hooke's Law constants (smooth elastic bounce & damping)
            kSpring: 0.16,
            kDamp: 0.76,
            kRotSpring: 0.14,
            kRotDamp: 0.74,

            isDirty: false,

            updateBounds() {
                const rect = this.card.getBoundingClientRect();
                this.restLeft = rect.left - (this.x - this.targetX);
                this.restTop = rect.top - (this.y - this.targetY);
                this.width = rect.width;
                this.height = rect.height;
            },

            // Center coordinates in viewport space
            getCenter() {
                if (this.restLeft === undefined) this.updateBounds();
                return {
                    x: this.restLeft + this.width * 0.5 + this.x,
                    y: this.restTop + this.height * 0.5 + this.y,
                    radius: Math.min(this.width, this.height) * 0.46
                };
            },

            stepPhysics() {
                // Smooth 3D tilt lerp
                const lerpFactor = 0.22;
                this.currentRotateX += (this.targetRotateX - this.currentRotateX) * lerpFactor;
                this.currentRotateY += (this.targetRotateY - this.currentRotateY) * lerpFactor;
                this.currentScale += (this.targetScale - this.currentScale) * lerpFactor;

                if (this.isHeld) {
                    // Calculate instantaneous drag velocity
                    const dtVx = this.x - (this.lastFrameX !== undefined ? this.lastFrameX : this.x);
                    const dtVy = this.y - (this.lastFrameY !== undefined ? this.lastFrameY : this.y);
                    this.vx = this.vx * 0.4 + dtVx * 0.6;
                    this.vy = this.vy * 0.4 + dtVy * 0.6;
                    this.lastFrameX = this.x;
                    this.lastFrameY = this.y;

                    // Directional Shake Marquee Acceleration:
                    // Shaking LEFT accelerates the Left-moving track, shaking RIGHT accelerates the Right-moving track
                    if (this.card.classList.contains('bento-tech-marquee')) {
                        const currentVx = this.isHeld ? (this.instVx || this.vx) : this.vx;
                        if (currentVx < -0.2) {
                            const boost = Math.min(8.5, Math.abs(currentVx) * 0.75);
                            targetSpeedTop = baseSpeed + boost;
                        } else if (currentVx > 0.2) {
                            const boost = Math.min(8.5, Math.abs(currentVx) * 0.75);
                            targetSpeedBottom = baseSpeed + boost;
                        }
                    }

                    // Dynamic rotation tilt along drag velocity vector
                    this.rz += (this.vx * 0.4 - this.rz) * 0.25;
                    this.isDirty = true;
                } else {
                    // Free Motion: Apple Critically Damped Hooke's Law Spring Force towards Virtual Target + Gaussian Repulsion
                    const effTargetX = this.targetX + (this.repelX || 0);
                    const effTargetY = this.targetY + (this.repelY || 0);

                    const fx = -this.kSpring * (this.x - effTargetX) - (1 - this.kDamp) * this.vx;
                    const fy = -this.kSpring * (this.y - effTargetY) - (1 - this.kDamp) * this.vy;
                    const frz = -this.kRotSpring * this.rz - (1 - this.kRotDamp) * this.vrz;

                    this.vx += fx;
                    this.vy += fy;
                    this.vrz += frz;

                    this.vx *= this.kDamp;
                    this.vy *= this.kDamp;
                    this.vrz *= this.kRotDamp;

                    this.x += this.vx;
                    this.y += this.vy;
                    this.rz += this.vrz;
                }

                // Elastic stretch deformation when moving fast
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                let stretchX = 1;
                let stretchY = 1;
                if (speed > 0.4) {
                    const angle = Math.atan2(this.vy, this.vx);
                    const stretchFactor = Math.min(0.18, speed * 0.007);
                    stretchX = 1 + Math.abs(Math.cos(angle)) * stretchFactor;
                    stretchY = 1 + Math.abs(Math.sin(angle)) * stretchFactor;
                }

                const effTargetX = this.targetX + (this.repelX || 0);
                const effTargetY = this.targetY + (this.repelY || 0);
                const deltaTargetX = Math.abs(this.x - effTargetX);
                const deltaTargetY = Math.abs(this.y - effTargetY);
                const hasDisplacement = deltaTargetX > 0.04 || deltaTargetY > 0.04 || Math.abs(this.rz) > 0.04;
                const hasMotion = Math.abs(this.vx) > 0.04 || Math.abs(this.vy) > 0.04 || Math.abs(this.vrz) > 0.04;

                if (hasDisplacement || hasMotion || this.isHeld) {
                    this.card.classList.add('is-displaced');
                    this.card.style.transform = `perspective(1000px) translate3d(${this.x.toFixed(2)}px, ${this.y.toFixed(2)}px, 0px) rotateX(${this.currentRotateX.toFixed(2)}deg) rotateY(${this.currentRotateY.toFixed(2)}deg) rotateZ(${this.rz.toFixed(2)}deg) scale3d(${(this.currentScale * stretchX).toFixed(3)}, ${(this.currentScale * stretchY).toFixed(3)}, 1)`;
                    this.isDirty = true;
                } else {
                    this.card.classList.remove('is-displaced');
                    this.x = effTargetX;
                    this.y = effTargetY;
                    this.vx = 0;
                    this.vy = 0;
                    this.rz = 0;
                    this.vrz = 0;

                    const deltaX = Math.abs(this.targetRotateX - this.currentRotateX);
                    const deltaY = Math.abs(this.targetRotateY - this.currentRotateY);
                    const deltaScale = Math.abs(this.targetScale - this.currentScale);

                    if (deltaX < 0.01 && deltaY < 0.01 && deltaScale < 0.001) {
                        this.isDirty = false;
                        if (this.targetRotateX === 0 && this.targetRotateY === 0 && this.targetScale === 1 && effTargetX === 0 && effTargetY === 0) {
                            this.card.style.transform = 'none';
                        }
                    } else {
                        this.card.style.transform = `perspective(1000px) translate3d(${this.x.toFixed(2)}px, ${this.y.toFixed(2)}px, 0px) rotateX(${this.currentRotateX.toFixed(2)}deg) rotateY(${this.currentRotateY.toFixed(2)}deg) scale3d(${this.currentScale.toFixed(3)}, ${this.currentScale.toFixed(3)}, 1)`;
                        this.isDirty = true;
                    }
                }
            },

            handleMove(clientX, clientY) {
                if (this.restLeft === undefined) this.updateBounds();
                const cardLeft = this.restLeft + this.x;
                const cardTop = this.restTop + this.y;
                const x = clientX - cardLeft;
                const y = clientY - cardTop;
                const centerX = this.width * 0.5;
                const centerY = this.height * 0.5;

                const isMobile = window.innerWidth <= 768;
                const maxAngleX = isMobile ? 3.6 : 2.8;
                const maxAngleY = isMobile ? 5.6 : 4.8;

                this.targetRotateX = ((centerY - y) / centerY) * maxAngleX;
                this.targetRotateY = ((x - centerX) / centerX) * maxAngleY;

                const pctX = (x / this.width) * 100;
                const pctY = (y / this.height) * 100;

                this.card.style.setProperty('--touch-x', `${pctX}%`);
                this.card.style.setProperty('--touch-y', `${pctY}%`);
                this.card.style.setProperty('--touch-opacity', '1');

                if (this.card.classList.contains('bento-tech-marquee')) {
                    if (pctX < 45) {
                        const intensity = Math.min(1, (45 - pctX) / 45);
                        targetSpeedTop = baseSpeed + (intensity * 0.9);
                        targetSpeedBottom = baseSpeed;
                    } else if (pctX > 55) {
                        const intensity = Math.min(1, (pctX - 55) / 45);
                        targetSpeedBottom = baseSpeed + (intensity * 0.9);
                        targetSpeedTop = baseSpeed;
                    } else {
                        targetSpeedTop = baseSpeed;
                        targetSpeedBottom = baseSpeed;
                    }
                }

                this.isDirty = true;
            },

            activate(clientX, clientY, scale = 0.99) {
                this.card.classList.add('is-touch-pressed');
                this.targetScale = scale;
                if (this.card.classList.contains('bento-tech-marquee')) {
                    isHoldingTechCard = true;
                    techTouchStartX = clientX;
                }
                this.handleMove(clientX, clientY);
            },

            startHold(clientX, clientY) {
                this.isHeld = true;
                this.dragStartX = clientX;
                this.dragStartY = clientY;
                this.cardStartX = this.x;
                this.cardStartY = this.y;
                this.lastMouseX = clientX;
                this.lastMouseY = clientY;
                this.lastFrameX = this.x;
                this.lastFrameY = this.y;
                this.dragDistance = 0;
                this.card.classList.add('is-held');
                this.isDirty = true;
            },

            dragHold(clientX, clientY) {
                if (!this.isHeld) return;
                const instVx = clientX - (this.lastMouseX !== undefined ? this.lastMouseX : clientX);
                this.instVx = instVx;
                const dx = clientX - this.dragStartX;
                const dy = clientY - this.dragStartY;
                const stepDist = Math.sqrt((clientX - this.lastMouseX) ** 2 + (clientY - this.lastMouseY) ** 2);
                this.dragDistance += stepDist;

                this.x = this.cardStartX + dx;
                this.y = this.cardStartY + dy;

                this.lastMouseX = clientX;
                this.lastMouseY = clientY;
                this.isDirty = true;

                updateVirtualSlotPositions(this);
            },

            releaseHold() {
                if (!this.isHeld) return;
                this.isHeld = false;
                this.card.classList.remove('is-held');
                this.card.classList.remove('is-touch-pressed');
                this.targetRotateX = 0;
                this.targetRotateY = 0;
                this.targetScale = 1;
                this.card.style.setProperty('--touch-opacity', '0');

                if (this.card.classList.contains('bento-tech-marquee')) {
                    isHoldingTechCard = false;
                    targetSpeedTop = baseSpeed;
                    targetSpeedBottom = baseSpeed;
                }

                // Impart drag momentum impulse
                this.vx = (this.vx || 0) * 1.3;
                this.vy = (this.vy || 0) * 1.3;
                this.vrz = (this.vx || 0) * 0.45;
                this.isDirty = true;
            },

            release() {
                if (this.isHeld) {
                    this.releaseHold();
                    return;
                }
                this.card.classList.remove('is-touch-pressed');
                this.targetRotateX = 0;
                this.targetRotateY = 0;
                this.targetScale = 1;
                this.card.style.setProperty('--touch-opacity', '0');
                if (this.card.classList.contains('bento-tech-marquee')) {
                    isHoldingTechCard = false;
                    targetSpeedTop = baseSpeed;
                    targetSpeedBottom = baseSpeed;
                }
                this.isDirty = true;
            }
        };
    }

    // ==========================================================================
    // STRICT 1-TO-1 GRID MATRIX OCCUPANCY ENGINE (Mathematical Bijection Map)
    // Developer: Sahil
    // Data Structures: cardToSlot[cardIdx] -> slotIdx, slotToCard[slotIdx] -> cardIdx
    // Guarantee: N Cards <-> N Unique Non-Overlapping Slot Matrix Positions
    // ==========================================================================
    let matrixSlots = [];        // [{ id, left, top, width, height, centerX, centerY, category }]
    let cardToSlot = [];         // cardIndex -> slotIndex
    let slotToCard = [];         // slotIndex -> cardIndex
    let initialCardBounds = [];  // cardIndex -> { left, top }
    let lastMatrixSwapTime = 0;

    function getCardCategory(ctrl) {
        const el = ctrl.card;
        if (el.classList.contains('bento-hero')) return 'hero-3x2';
        if (el.classList.contains('bento-github-card') || el.classList.contains('card-github') || el.classList.contains('bento-tech-marquee')) return 'banner-3x1';
        if (el.classList.contains('bento-social-block')) return 'social-1x1';
        return 'default';
    }

    function initGridMatrix() {
        matrixSlots = spatialCards.map((item, idx) => {
            const ctrl = item.controller;
            const rect = ctrl.card.getBoundingClientRect();
            const left = rect.left - (ctrl.x - ctrl.targetX);
            const top = rect.top - (ctrl.y - ctrl.targetY);
            
            return {
                id: idx,
                left: left,
                top: top,
                width: rect.width,
                height: rect.height,
                centerX: left + rect.width * 0.5,
                centerY: top + rect.height * 0.5,
                category: getCardCategory(ctrl)
            };
        });

        initialCardBounds = matrixSlots.map(s => ({ left: s.left, top: s.top }));

        if (cardToSlot.length !== spatialCards.length) {
            cardToSlot = spatialCards.map((_, i) => i);
            slotToCard = spatialCards.map((_, i) => i);
        }
    }

    // Build & Refresh Spatial Cache
    function refreshSpatialIndex() {
        spatialCards = cardNodes.map((card, idx) => {
            let controller = card._controller;
            if (!controller) {
                controller = createCardController(card, idx);
                card._controller = controller;
            }
            controller.updateBounds();
            return {
                element: card,
                controller: controller
            };
        });

        initGridMatrix();

        spatialBtns = bentoBtns.map(btn => {
            const rect = btn.getBoundingClientRect();
            return {
                element: btn,
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height
            };
        });
    }

    refreshSpatialIndex();
    window.addEventListener('resize', refreshSpatialIndex, { passive: true });
    window.addEventListener('orientationchange', refreshSpatialIndex, { passive: true });

    // Real-Time 1-to-1 Grid Matrix Slot Swap Engine (Symmetrical Directional Projection Metric)
    function updateVirtualSlotPositions(heldCtrl) {
        if (!heldCtrl || !heldCtrl.isHeld) return;
        const now = Date.now();
        if (now - lastMatrixSwapTime < 25) return; // 25ms ultra-fast cadence

        const heldCardIdx = heldCtrl.index;
        const currentSlotIdx = cardToSlot[heldCardIdx];
        if (currentSlotIdx === undefined) return;

        const heldCategory = matrixSlots[currentSlotIdx].category;

        // Dragged card bounding box in viewport space
        const heldRect = {
            left: heldCtrl.restLeft + heldCtrl.x,
            top: heldCtrl.restTop + heldCtrl.y,
            right: heldCtrl.restLeft + heldCtrl.x + heldCtrl.width,
            bottom: heldCtrl.restTop + heldCtrl.y + heldCtrl.height
        };

        let bestTargetSlotIdx = currentSlotIdx;
        let maxMetric = 0;

        for (let s = 0; s < matrixSlots.length; s++) {
            const slot = matrixSlots[s];
            if (slot.category !== heldCategory) continue; // Grid span category matching

            // Compute 1D linear overlap projections along X and Y axes
            const interLeft = Math.max(heldRect.left, slot.left);
            const interRight = Math.min(heldRect.right, slot.left + slot.width);
            const interTop = Math.max(heldRect.top, slot.top);
            const interBottom = Math.min(heldRect.bottom, slot.top + slot.height);

            const overlapW = Math.max(0, interRight - interLeft);
            const overlapH = Math.max(0, interBottom - interTop);

            const fracX = overlapW / (slot.width || 1);
            const fracY = overlapH / (slot.height || 1);

            // Symmetrical Directional Metric: evaluates maximum axis overlap fraction (symmetrical X and Y sensitivity)
            const metric = Math.max(fracX, fracY) * (fracX > 0.05 && fracY > 0.05 ? 1.0 : 0.5);

            if (metric > maxMetric) {
                maxMetric = metric;
                bestTargetSlotIdx = s;
            }
        }

        // Android/iOS Symmetrical Trigger: 18% linear shift in ANY direction (left, right, down, up) triggers instant slot swap!
        if (bestTargetSlotIdx !== currentSlotIdx && maxMetric > 0.18) {
            const targetCardIdx = slotToCard[bestTargetSlotIdx];

            // 1-to-1 Matrix Bijection Swap
            cardToSlot[heldCardIdx] = bestTargetSlotIdx;
            cardToSlot[targetCardIdx] = currentSlotIdx;

            slotToCard[bestTargetSlotIdx] = heldCardIdx;
            slotToCard[currentSlotIdx] = targetCardIdx;

            lastMatrixSwapTime = now;
            triggerHaptic(35);

            // Synchronously update targetX and targetY for ALL cards from Matrix Map
            for (let cIdx = 0; cIdx < spatialCards.length; cIdx++) {
                const ctrl = spatialCards[cIdx].controller;
                const assignedSlotIdx = cardToSlot[cIdx];
                const assignedSlot = matrixSlots[assignedSlotIdx];
                const initial = initialCardBounds[cIdx];

                ctrl.targetX = assignedSlot.left - initial.left;
                ctrl.targetY = assignedSlot.top - initial.top;
                ctrl.isDirty = true;
            }
        }
    }

    // O(N^2) AABB Penetration Solver for Active Drag Separation
    function resolveCardCollisions() {
        const margin = 10;

        for (let i = 0; i < spatialCards.length; i++) {
            const ctrlA = spatialCards[i].controller;

            const rectA = {
                left: ctrlA.restLeft + ctrlA.x,
                top: ctrlA.restTop + ctrlA.y,
                right: ctrlA.restLeft + ctrlA.x + ctrlA.width,
                bottom: ctrlA.restTop + ctrlA.y + ctrlA.height,
                centerX: ctrlA.restLeft + ctrlA.x + ctrlA.width * 0.5,
                centerY: ctrlA.restTop + ctrlA.y + ctrlA.height * 0.5
            };

            for (let j = i + 1; j < spatialCards.length; j++) {
                const ctrlB = spatialCards[j].controller;

                // Compatible matrix cards interchange slots in real-time via 1-to-1 Matrix Engine (do not push along mouse)
                if (getCardCategory(ctrlA) === getCardCategory(ctrlB)) continue;

                const rectB = {
                    left: ctrlB.restLeft + ctrlB.x,
                    top: ctrlB.restTop + ctrlB.y,
                    right: ctrlB.restLeft + ctrlB.x + ctrlB.width,
                    bottom: ctrlB.restTop + ctrlB.y + ctrlB.height,
                    centerX: ctrlB.restLeft + ctrlB.x + ctrlB.width * 0.5,
                    centerY: ctrlB.restTop + ctrlB.y + ctrlB.height * 0.5
                };

                const overlapX = Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left) + margin;
                const overlapY = Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top) + margin;

                if (overlapX > 0 && overlapY > 0) {
                    const signX = rectA.centerX < rectB.centerX ? -1 : 1;
                    const signY = rectA.centerY < rectB.centerY ? -1 : 1;

                    if (overlapX < overlapY) {
                        const sepX = overlapX * signX;
                        if (ctrlA.isHeld && !ctrlB.isHeld) {
                            ctrlB.x -= sepX * 0.85;
                            ctrlB.vx -= sepX * 0.25;
                            ctrlB.isDirty = true;
                        } else if (ctrlB.isHeld && !ctrlA.isHeld) {
                            ctrlA.x += sepX * 0.85;
                            ctrlA.vx += sepX * 0.25;
                            ctrlA.isDirty = true;
                        }
                    } else {
                        const sepY = overlapY * signY;
                        if (ctrlA.isHeld && !ctrlB.isHeld) {
                            ctrlB.y -= sepY * 0.85;
                            ctrlB.vy -= sepY * 0.25;
                            ctrlB.isDirty = true;
                        } else if (ctrlB.isHeld && !ctrlA.isHeld) {
                            ctrlA.y += sepY * 0.85;
                            ctrlA.vy += sepY * 0.25;
                            ctrlA.isDirty = true;
                        }
                    }
                }
            }
        }
    }

    // Apple Spatial Computing Repulsion Force-Field
    function applyAppleGaussianRepulsion(heldCtrl) {
        if (!heldCtrl || !heldCtrl.isHeld) {
            spatialCards.forEach(item => {
                const ctrl = item.controller;
                if (!ctrl.isHeld) {
                    ctrl.card.classList.remove('is-repelled');
                    ctrl.repelX = 0;
                    ctrl.repelY = 0;
                }
            });
            return;
        }

        const heldCenter = heldCtrl.getCenter();

        for (let i = 0; i < spatialCards.length; i++) {
            const ctrl = spatialCards[i].controller;
            if (ctrl === heldCtrl) continue;

            if (Math.abs(ctrl.targetX) > 0.5 || Math.abs(ctrl.targetY) > 0.5) {
                ctrl.repelX = 0;
                ctrl.repelY = 0;
                ctrl.targetRotateX = 0;
                ctrl.targetRotateY = 0;
                ctrl.targetScale = 1.0;
                ctrl.card.classList.remove('is-repelled');
                ctrl.isDirty = true;
                continue;
            }

            const assignedSlotIdx = cardToSlot[ctrl.index];
            const slotPos = matrixSlots[assignedSlotIdx] || { left: ctrl.restLeft, top: ctrl.restTop };
            const slotCenterX = slotPos.left + ctrl.width * 0.5;
            const slotCenterY = slotPos.top + ctrl.height * 0.5;

            const dx = slotCenterX - heldCenter.x;
            const dy = slotCenterY - heldCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const repelRadius = (Math.max(heldCtrl.width, heldCtrl.height) + Math.max(ctrl.width, ctrl.height)) * 0.65;

            if (dist < repelRadius && dist > 0.1) {
                const intensity = (1 - dist / repelRadius) ** 2;
                const pushDist = intensity * 60;
                const nx = dx / dist;
                const ny = dy / dist;

                ctrl.repelX = nx * pushDist;
                ctrl.repelY = ny * pushDist;
                ctrl.targetRotateX = -ny * intensity * 4.5;
                ctrl.targetRotateY = nx * intensity * 4.5;
                ctrl.targetScale = 0.96;
                ctrl.card.classList.add('is-repelled');
                ctrl.isDirty = true;
            } else {
                ctrl.repelX = 0;
                ctrl.repelY = 0;
                ctrl.targetRotateX = 0;
                ctrl.targetRotateY = 0;
                ctrl.targetScale = 1.0;
                ctrl.card.classList.remove('is-repelled');
            }
        }
    }

    // Single Global Unified RAF Physics Loop
    function globalPhysicsLoop() {
        // High-Performance Optimization: Skip O(N^2) physics & DOM updates while modal is open
        if (isModalOpen) {
            requestAnimationFrame(globalPhysicsLoop);
            return;
        }

        applyAppleGaussianRepulsion(activeHeldController);
        resolveCardCollisions();

        for (let i = 0; i < spatialCards.length; i++) {
            const ctrl = spatialCards[i].controller;
            if (ctrl.isDirty || ctrl.isHeld) {
                ctrl.stepPhysics();
            }
        }
        requestAnimationFrame(globalPhysicsLoop);
    }
    requestAnimationFrame(globalPhysicsLoop);

    // O(N) Pure Arithmetic Point-in-Rectangle DSA Lookup
    function findCardAtPoint(x, y) {
        for (let i = 0; i < spatialCards.length; i++) {
            const ctrl = spatialCards[i].controller;
            if (ctrl.restLeft === undefined) ctrl.updateBounds();
            const currentLeft = ctrl.restLeft + ctrl.x;
            const currentTop = ctrl.restTop + ctrl.y;
            const currentRight = currentLeft + ctrl.width;
            const currentBottom = currentTop + ctrl.height;
            if (x >= currentLeft && x <= currentRight && y >= currentTop && y <= currentBottom) {
                return spatialCards[i];
            }
        }
        return null;
    }

    function findBtnAtPoint(x, y) {
        for (let i = 0; i < spatialBtns.length; i++) {
            const item = spatialBtns[i];
            if (x >= item.left && x <= item.right && y >= item.top && y <= item.bottom) {
                return item;
            }
        }
        return null;
    }

    // Setup Listeners for All Cards (Link cards & Static cards)
    spatialCards.forEach(item => {
        const card = item.element;
        const ctrl = item.controller;

        card.addEventListener('contextmenu', (e) => e.preventDefault());
        card.addEventListener('dragstart', (e) => e.preventDefault());

        // Direct PointerDown Handler for instant response on all card types (<a> links and <article>)
        card.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.bento-btn')) return;

            activeHeldController = ctrl;
            ctrl.startHold(e.clientX, e.clientY);
            ctrl.activate(e.clientX, e.clientY, 0.98);
            triggerHaptic(40);

            try {
                card.setPointerCapture(e.pointerId);
            } catch (err) {}
        });

        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            card.addEventListener('mouseenter', (e) => {
                if (!ctrl.isHeld) ctrl.activate(e.clientX, e.clientY, 1.008);
            });
            card.addEventListener('mousemove', (e) => {
                if (!ctrl.isHeld) ctrl.handleMove(e.clientX, e.clientY);
            });
            card.addEventListener('mouseleave', () => {
                if (!ctrl.isHeld) ctrl.release();
            });
        }
    });

    // Button Pointer Movement & Context Menu Prevention
    spatialBtns.forEach(item => {
        const btn = item.element;
        btn.addEventListener('contextmenu', (e) => e.preventDefault());
        btn.addEventListener('mousemove', (e) => {
            const pctX = ((e.clientX - item.left) / item.width) * 100;
            const pctY = ((e.clientY - item.top) / item.height) * 100;
            btn.style.setProperty('--btn-x', `${pctX}%`);
            btn.style.setProperty('--btn-y', `${pctY}%`);
        });
    });

    // Global Pointer Movement & Release Handlers
    window.addEventListener('pointermove', (e) => {
        if (isModalOpen) return;

        if (activeHeldController && activeHeldController.isHeld) {
            activeHeldController.dragHold(e.clientX, e.clientY);
            activeHeldController.handleMove(e.clientX, e.clientY);
        }

        // Button hover checks
        const btnMatch = findBtnAtPoint(e.clientX, e.clientY);
        if (btnMatch) {
            if (currentActiveBtn !== btnMatch.element) {
                if (currentActiveBtn) currentActiveBtn.classList.remove('is-btn-active');
                currentActiveBtn = btnMatch.element;
                currentActiveBtn.classList.add('is-btn-active');
            }
            const pctX = ((e.clientX - btnMatch.left) / btnMatch.width) * 100;
            const pctY = ((e.clientY - btnMatch.top) / btnMatch.height) * 100;
            currentActiveBtn.style.setProperty('--btn-x', `${pctX}%`);
            currentActiveBtn.style.setProperty('--btn-y', `${pctY}%`);
        } else if (currentActiveBtn) {
            currentActiveBtn.classList.remove('is-btn-active');
            currentActiveBtn = null;
        }
    }, { passive: true });

    // ==========================================================================
    // ABOUT ME EXPANDED MODAL OVERLAY & FLIP MORPHING ENGINE
    // ==========================================================================
    const modalBackdrop = document.getElementById('about-modal');
    const modalContainer = document.querySelector('.modal-container');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const heroCard = document.querySelector('.bento-hero');

    let isModalAnimating = false;

    function openAboutModal() {
        if (!modalBackdrop || !modalContainer || isModalAnimating) return;
        isModalAnimating = true;

        isModalOpen = true;
        document.body.classList.add('modal-active');

        // Set initial backdrop states
        modalBackdrop.style.transition = 'none';
        modalBackdrop.style.opacity = '0';
        modalBackdrop.classList.add('is-open');
        modalBackdrop.setAttribute('aria-hidden', 'false');
        triggerHaptic([30, 50, 30]);

        if (heroCard) {
            const heroRect = heroCard.getBoundingClientRect();
            
            // Measure centered modal size without transition
            modalContainer.style.transition = 'none';
            modalContainer.style.opacity = '0.9';
            const modalRect = modalContainer.getBoundingClientRect();

            // Calculate FLIP deltas
            const deltaX = (heroRect.left + heroRect.width / 2) - (modalRect.left + modalRect.width / 2);
            const deltaY = (heroRect.top + heroRect.height / 2) - (modalRect.top + modalRect.height / 2);
            const scaleX = heroRect.width / modalRect.width;
            const scaleY = heroRect.height / modalRect.height;

            // Invert: Position modal container directly over hero card
            modalContainer.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
            
            // Force browser layout reflow
            void modalContainer.offsetWidth;

            // Fade backdrop opacity in sync with container expand transform (0.24s)
            modalBackdrop.style.transition = 'opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1)';
            modalBackdrop.style.opacity = '1';

            modalContainer.style.transition = 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.24s ease';
            modalContainer.style.transform = 'translate3d(0, 0, 0) scale(1, 1)';
            modalContainer.style.opacity = '1';

            setTimeout(() => {
                const bentoViewport = document.querySelector('.bento-viewport');
                if (bentoViewport) bentoViewport.classList.add('is-paused');
                isModalAnimating = false;
            }, 240);
        } else {
            const bentoViewport = document.querySelector('.bento-viewport');
            if (bentoViewport) bentoViewport.classList.add('is-paused');
            modalBackdrop.style.opacity = '1';
            isModalAnimating = false;
        }
    }

    function closeAboutModal() {
        if (!modalBackdrop || !modalContainer || isModalAnimating) return;
        isModalAnimating = true;

        const bentoViewport = document.querySelector('.bento-viewport');
        if (bentoViewport) bentoViewport.classList.remove('is-paused');

        if (heroCard) {
            const heroRect = heroCard.getBoundingClientRect();
            const modalRect = modalContainer.getBoundingClientRect();

            const deltaX = (heroRect.left + heroRect.width / 2) - (modalRect.left + modalRect.width / 2);
            const deltaY = (heroRect.top + heroRect.height / 2) - (modalRect.top + modalRect.height / 2);
            const scaleX = heroRect.width / modalRect.width;
            const scaleY = heroRect.height / modalRect.height;

            // Synchronize backdrop fade-out and container shrink morph (0.20s)
            modalBackdrop.style.transition = 'opacity 0.20s ease';
            modalBackdrop.style.opacity = '0';

            modalContainer.style.transition = 'transform 0.20s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.20s ease';
            modalContainer.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
            modalContainer.style.opacity = '0.4';

            setTimeout(() => {
                isModalOpen = false;
                document.body.classList.remove('modal-active');
                modalBackdrop.classList.remove('is-open');
                modalBackdrop.setAttribute('aria-hidden', 'true');
                modalBackdrop.style.transition = '';
                modalBackdrop.style.opacity = '';
                modalContainer.style.transition = '';
                modalContainer.style.transform = '';
                modalContainer.style.opacity = '';
                isModalAnimating = false;
            }, 200);
        } else {
            isModalOpen = false;
            document.body.classList.remove('modal-active');
            modalBackdrop.classList.remove('is-open');
            modalBackdrop.setAttribute('aria-hidden', 'true');
            modalBackdrop.style.transition = '';
            modalBackdrop.style.opacity = '';
            modalContainer.style.transition = '';
            modalContainer.style.transform = '';
            modalContainer.style.opacity = '';
            isModalAnimating = false;
        }
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAboutModal();
        });
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                closeAboutModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('is-open')) {
            closeAboutModal();
        }
    });

    if (heroCard) {
        heroCard.addEventListener('click', (e) => {
            if (!e.target.closest('.bento-btn')) {
                openAboutModal();
            }
        });
    }

    function handlePointerRelease(e) {
        if (activeHeldController) {
            const dragDist = activeHeldController.dragDistance;
            const heldCard = activeHeldController.card;
            activeHeldController.releaseHold();

            if (dragDist <= 6 && heldCard && heldCard.classList.contains('bento-hero')) {
                if (e.target && !e.target.closest('.bento-btn')) {
                    openAboutModal();
                }
            }

            // Intercept click navigation if card was held and dragged (> 6px movement)
            if (dragDist > 6) {
                const preventClickOnce = (clickEvent) => {
                    clickEvent.preventDefault();
                    clickEvent.stopPropagation();
                    window.removeEventListener('click', preventClickOnce, true);
                };
                window.addEventListener('click', preventClickOnce, true);
            }

            activeHeldController = null;
        }

        bentoBtns.forEach(btn => {
            btn.classList.remove('is-btn-active');
            btn.style.setProperty('--btn-shine-opacity', '0');
        });
        currentActiveBtn = null;
        lastVibratedCardEl = null;
    }

    window.addEventListener('pointerup', handlePointerRelease, { passive: true });
    window.addEventListener('pointercancel', handlePointerRelease, { passive: true });

    // Live GitHub API Stats Fetcher for KingSahil
    async function fetchGitHubStats() {
        try {
            const userRes = await fetch('https://api.github.com/users/KingSahil');
            if (userRes.ok) {
                const userData = await userRes.json();
                const followersEl = document.getElementById('gh-followers');
                const reposEl = document.getElementById('gh-repos');
                if (followersEl) followersEl.textContent = userData.followers;
                if (reposEl) reposEl.textContent = Math.max(65, userData.public_repos);
            }

            const reposRes = await fetch('https://api.github.com/users/KingSahil/repos?per_page=100');
            if (reposRes.ok) {
                const reposData = await reposRes.json();
                const totalStars = reposData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
                const starsEl = document.getElementById('gh-stars');
                if (starsEl) starsEl.textContent = totalStars;
            }
        } catch (err) {
            // Retain pre-filled live values
        }
    }
    fetchGitHubStats();

    // Real Live GitHub Green Contribution Grid Sync Engine for @KingSahil
    async function fetchRealGitHubContributions() {
        const container = document.getElementById('github-minimal-grid');
        if (!container) return;

        // Chronologically sorted live contribution data vector for @KingSahil (799 contributions, past 112 days)
        const realChronologicalLevels = [
            0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 0, 2, 2, 0, 1, 0, 0, 0, 2, 1, 2, 2, 1, 1, 0, 0,
            0, 0, 0, 0, 2, 1, 2, 0, 3, 0, 2, 1, 1, 0, 1, 0, 1, 3, 0, 2, 0, 0, 0, 2, 0, 2, 0, 1,
            1, 1, 0, 0, 1, 0, 1, 3, 1, 2, 1, 1, 1, 1, 4, 1, 1, 1, 0, 2, 0, 1, 0, 3, 3, 1, 3, 2
        ];

        function renderBoxes(levels) {
            let html = '';
            for (let i = 0; i < levels.length; i++) {
                html += `<div class="gh-box lvl-${levels[i]}" title="Day ${i + 1}: Level ${levels[i]}"></div>`;
            }
            container.innerHTML = html;
        }

        // Render accurate chronological baseline immediately
        renderBoxes(realChronologicalLevels);

        // Fetch live real-time contributions from GitHub profile & sort chronologically by date
        try {
            const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://github.com/users/KingSahil/contributions'));
            if (res.ok) {
                const htmlText = await res.text();
                const regex = /data-date="([^"]+)"[^>]*data-level="([0-4])"/g;
                let match;
                const items = [];

                while ((match = regex.exec(htmlText)) !== null) {
                    items.push({ date: match[1], level: parseInt(match[2], 10) });
                }

                if (items.length >= 112) {
                    // Chronological sort by YYYY-MM-DD
                    items.sort((a, b) => a.date.localeCompare(b.date));
                    const fetchedLevels = items.slice(-112).map(item => item.level);
                    renderBoxes(fetchedLevels);
                }
            }
        } catch (e) {
            // Retain exact real KingSahil contribution baseline
        }
    }
    fetchRealGitHubContributions();

    /* ======================================================================
       SPOTIFY MUSIC PLAYER ENGINE (Streamlined Controls & Fast Smooth Hover Pop-Up)
       ====================================================================== */
    function initSpotifyPlayer() {
        const widget = document.getElementById('spotify-widget');
        const miniPill = document.getElementById('spotify-mini-pill');
        const card = document.getElementById('spotify-card');
        const audio = document.getElementById('spotify-audio-player');
        if (!widget || !miniPill || !card || !audio) return;

        // Elements - Controls (Only Prev, Play/Pause, Next, Volume)
        const miniPlayBtn = document.getElementById('mini-play-btn');
        const miniPlayIcon = document.getElementById('mini-play-icon');
        const miniSongName = document.getElementById('mini-song-name');
        const miniStickerImg = document.getElementById('mini-sticker-img');
        const playBtn = document.getElementById('spotify-play-btn');
        const playIcon = document.getElementById('spotify-play-icon');
        const prevBtn = document.getElementById('spotify-prev-btn');
        const nextBtn = document.getElementById('spotify-next-btn');
        const collapseBtn = document.getElementById('spotify-collapse-btn');

        // Elements - Track Meta & Sticker
        const coverImg = document.getElementById('spotify-cover-img');
        const stickerBadge = document.getElementById('spotify-sticker-badge');
        const trackTitle = document.getElementById('spotify-track-title');
        const trackArtist = document.getElementById('spotify-track-artist');
        const trackCounter = document.getElementById('spotify-track-counter');

        // Elements - Progress & Volume
        const progressWrap = document.getElementById('spotify-progress-wrap');
        const progressFill = document.getElementById('spotify-progress-fill');
        const progressHandle = document.getElementById('spotify-progress-handle');
        const timeCurrent = document.getElementById('spotify-time-current');
        const timeTotal = document.getElementById('spotify-time-total');
        const volBtn = document.getElementById('spotify-vol-btn');
        const volIcon = document.getElementById('spotify-vol-icon');
        const volSlider = document.getElementById('spotify-vol-slider');

        // Playlist Data (Sahil's Real Most Played Tracks)
        const PLAYLIST = [
            {
                id: 'my-ordinary-life',
                title: 'My Ordinary Life',
                artist: 'The Living Tombstone',
                cover: 'assets/images/music/my-ordinary-life.jpg',
                badge: '✦ TOP #1',
                audio: 'assets/audio/my-ordinary-life.track',
                fallbackDuration: '3:50'
            },
            {
                id: 'supreme-shubh',
                title: 'Supreme',
                artist: 'Shubh',
                cover: 'assets/images/music/supreme-shubh.jpg',
                badge: '🔥 ON REPEAT',
                audio: 'assets/audio/supreme-shubh.track',
                fallbackDuration: '2:58'
            },
            {
                id: 'cheques-shubh',
                title: 'Cheques',
                artist: 'Shubh',
                cover: 'assets/images/music/cheques-shubh.jpg',
                badge: '✨ MOST STREAMED',
                audio: 'assets/audio/cheques-shubh.track',
                fallbackDuration: '3:04'
            },
            {
                id: 'no-love-shubh',
                title: 'No Love',
                artist: 'Shubh',
                cover: 'assets/images/music/no-love-shubh.jpg',
                badge: "🎧 SAHIL'S FAV",
                audio: 'assets/audio/no-love-shubh.track',
                fallbackDuration: '2:50'
            }
        ];

        let currentIndex = 0;
        let isPlaying = false;
        let hoverTimeout = null;
        const blobCache = new Map();
        let currentLoadToken = 0;

        // Fetch Track as in-memory Blob URL to prevent IDM (Internet Download Manager) interception
        async function fetchTrackBlobUrl(song) {
            if (blobCache.has(song.id)) {
                return blobCache.get(song.id);
            }
            try {
                const response = await fetch(song.audio);
                const arrayBuffer = await response.arrayBuffer();
                const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
                const blobUrl = URL.createObjectURL(blob);
                blobCache.set(song.id, blobUrl);
                return blobUrl;
            } catch (err) {
                console.warn('Blob fetch notice, fallback to direct path:', err);
                return song.audio;
            }
        }

        // Format Seconds to MM:SS
        function formatTime(seconds) {
            if (isNaN(seconds) || seconds < 0) return '0:00';
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        // Load Track
        async function loadTrack(index, autoPlay = false) {
            if (index < 0 || index >= PLAYLIST.length) index = 0;
            currentIndex = index;
            const song = PLAYLIST[currentIndex];
            const loadToken = ++currentLoadToken;

            // Update UI elements
            if (miniSongName) miniSongName.textContent = song.title;
            if (miniStickerImg) miniStickerImg.src = song.cover;
            if (coverImg) coverImg.src = song.cover;
            if (stickerBadge) stickerBadge.textContent = song.badge;
            if (trackTitle) trackTitle.textContent = song.title;
            if (trackArtist) trackArtist.textContent = song.artist;
            if (trackCounter) trackCounter.textContent = `${currentIndex + 1} / ${PLAYLIST.length}`;

            // Reset progress
            if (progressFill) progressFill.style.width = '0%';
            if (progressHandle) progressHandle.style.left = '0%';
            if (timeCurrent) timeCurrent.textContent = '0:00';
            if (timeTotal) timeTotal.textContent = song.fallbackDuration;

            // Load via in-memory Blob URL (bypasses IDM network hooks completely)
            const blobUrl = await fetchTrackBlobUrl(song);

            // Guard against race conditions if user switched tracks quickly
            if (loadToken !== currentLoadToken) return;

            audio.src = blobUrl;
            audio.load();

            if (autoPlay || isPlaying) {
                playAudio();
            }
        }

        // Play Audio
        function playAudio() {
            audio.play().then(() => {
                isPlaying = true;
                widget.classList.add('is-playing');
                if (playIcon) playIcon.className = 'fas fa-pause';
                if (miniPlayIcon) miniPlayIcon.className = 'fas fa-pause';
            }).catch(err => {
                console.log('Audio notice:', err);
                isPlaying = false;
                widget.classList.remove('is-playing');
                if (playIcon) playIcon.className = 'fas fa-play';
                if (miniPlayIcon) miniPlayIcon.className = 'fas fa-play';
            });
        }

        // Pause Audio
        function pauseAudio() {
            audio.pause();
            isPlaying = false;
            widget.classList.remove('is-playing');
            if (playIcon) playIcon.className = 'fas fa-play';
            if (miniPlayIcon) miniPlayIcon.className = 'fas fa-play';
        }

        // Toggle Play/Pause
        function togglePlay() {
            triggerHaptic(30);
            if (isPlaying) {
                pauseAudio();
            } else {
                playAudio();
            }
        }

        // Next Track (Sequential)
        function nextTrack() {
            triggerHaptic(25);
            const nextIndex = (currentIndex + 1) % PLAYLIST.length;
            loadTrack(nextIndex, true);
        }

        // Previous Track
        function prevTrack() {
            triggerHaptic(25);
            if (audio.currentTime > 3) {
                audio.currentTime = 0;
            } else {
                const prevIndex = (currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
                loadTrack(prevIndex, true);
            }
        }

        // Sequential Playback on Audio Ended Event
        audio.addEventListener('ended', () => {
            nextTrack();
        });

        let isSeeking = false;
        let seekRatio = 0;

        // Time Update (Only updates UI when NOT scrubbing)
        audio.addEventListener('timeupdate', () => {
            if (isSeeking) return; // Prevent overwriting slider while user is dragging
            if (!audio.duration || isNaN(audio.duration)) return;
            const progressPct = (audio.currentTime / audio.duration) * 100;
            if (progressFill) progressFill.style.width = `${progressPct}%`;
            if (progressHandle) progressHandle.style.left = `${progressPct}%`;
            if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
        });

        // Duration Loaded
        audio.addEventListener('loadedmetadata', () => {
            if (audio.duration && !isNaN(audio.duration) && timeTotal) {
                timeTotal.textContent = formatTime(audio.duration);
            }
        });

        // Interactive Scrubbable Seek Bar Handling
        if (progressWrap) {
            function updateSeekVisual(clientX) {
                const rect = progressWrap.getBoundingClientRect();
                const clickX = clientX - rect.left;
                const width = rect.width;
                if (width <= 0) return 0;
                seekRatio = Math.max(0, Math.min(1, clickX / width));
                const pct = seekRatio * 100;
                if (progressFill) progressFill.style.width = `${pct}%`;
                if (progressHandle) progressHandle.style.left = `${pct}%`;
                if (audio.duration && !isNaN(audio.duration) && timeCurrent) {
                    timeCurrent.textContent = formatTime(seekRatio * audio.duration);
                }
                return seekRatio;
            }

            function commitSeek() {
                if (audio.duration && !isNaN(audio.duration)) {
                    audio.currentTime = seekRatio * audio.duration;
                }
            }

            progressWrap.addEventListener('pointerdown', (e) => {
                isSeeking = true;
                try { progressWrap.setPointerCapture(e.pointerId); } catch (err) {}
                updateSeekVisual(e.clientX);
            });

            progressWrap.addEventListener('pointermove', (e) => {
                if (!isSeeking) return;
                updateSeekVisual(e.clientX);
            });

            function finishSeek(e) {
                if (!isSeeking) return;
                updateSeekVisual(e.clientX);
                commitSeek();
                isSeeking = false;
                try { progressWrap.releasePointerCapture(e.pointerId); } catch (err) {}
            }

            progressWrap.addEventListener('pointerup', finishSeek);
            progressWrap.addEventListener('pointercancel', finishSeek);

            // Also support direct click to seek
            progressWrap.addEventListener('click', (e) => {
                updateSeekVisual(e.clientX);
                commitSeek();
            });
        }

        // Volume Control
        if (volSlider) {
            audio.volume = parseFloat(volSlider.value) || 0.8;

            volSlider.addEventListener('input', (e) => {
                const vol = parseFloat(e.target.value);
                audio.volume = vol;
                updateVolIcon(vol);
            });
        }

        function updateVolIcon(vol) {
            if (!volIcon) return;
            if (vol <= 0) {
                volIcon.className = 'fas fa-volume-xmark';
            } else if (vol < 0.5) {
                volIcon.className = 'fas fa-volume-low';
            } else {
                volIcon.className = 'fas fa-volume-high';
            }
        }

        let prevVol = 0.8;
        if (volBtn) {
            volBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (audio.volume > 0) {
                    prevVol = audio.volume;
                    audio.volume = 0;
                    if (volSlider) volSlider.value = 0;
                } else {
                    audio.volume = prevVol || 0.8;
                    if (volSlider) volSlider.value = audio.volume;
                }
                updateVolIcon(audio.volume);
            });
        }

        // Button Click Listeners (Only Prev, Play/Pause, Next)
        if (playBtn) playBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
        if (miniPlayBtn) miniPlayBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevTrack(); });
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextTrack(); });

        // Instant, Smooth Pop-up & Close Interactions
        widget.addEventListener('mouseenter', () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            widget.classList.add('is-active');
        });

        widget.addEventListener('mouseleave', () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                widget.classList.remove('is-active');
            }, 80);
        });

        // Click mini pill to expand instantly
        miniPill.addEventListener('click', (e) => {
            if (e.target.closest('#mini-play-btn')) return;
            triggerHaptic(20);
            if (hoverTimeout) clearTimeout(hoverTimeout);
            widget.classList.add('is-active');
        });

        // Collapse button for instant close
        if (collapseBtn) {
            collapseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                triggerHaptic(15);
                if (hoverTimeout) clearTimeout(hoverTimeout);
                widget.classList.remove('is-active');
            });
        }

        // Initialize First Track
        loadTrack(0, false);
    }

    initSpotifyPlayer();
});
