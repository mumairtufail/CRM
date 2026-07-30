import { useEffect, useRef } from 'react';

/**
 * Interactive dot-grid background (ported from Vue Bits' <DotGrid />, no gsap).
 *
 * A canvas of evenly spaced dots that tint toward `activeColor` near the
 * cursor, fling away on fast mouse moves, ripple outward on click, and
 * spring back with an elastic wobble.
 *
 * Colors accept a CSS custom property name (e.g. "--brand-300") holding an
 * "R G B" triplet — the app.css --brand-* format — so the grid re-skins with
 * the public-site theme. Plain hex ("#8978AB") also works.
 */

function resolveColor(color) {
    if (color.startsWith('--')) {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(color).trim();
        const [r, g, b] = raw.split(/[\s,]+/).map(Number);
        if (![r, g, b].some(Number.isNaN)) return { r, g, b };
        return { r: 0, g: 0, b: 0 };
    }
    const m = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return { r: 0, g: 0, b: 0 };
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export default function DotGrid({
    dotSize = 5,
    gap = 22,
    baseColor = '--brand-300',
    activeColor = '--brand2-600',
    baseAlpha = 1,
    activeAlpha = 1,
    proximity = 130,
    speedTrigger = 100,
    shockRadius = 250,
    shockStrength = 5,
    maxSpeed = 5000,
    className = '',
    style = {},
}) {
    const wrapperRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const wrap = wrapperRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas) return undefined;

        const ctx = canvas.getContext('2d');
        const baseRgb = resolveColor(baseColor);
        const activeRgb = resolveColor(activeColor);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Underdamped spring gives both the inertia fling and the elastic return.
        const STIFFNESS = 110;
        const DAMPING = 9;

        let dots = [];
        const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, speed: 0, lastTime: 0, lastX: 0, lastY: 0 };

        const buildGrid = () => {
            const { width, height } = wrap.getBoundingClientRect();
            if (!width || !height) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const cell = dotSize + gap;
            const cols = Math.floor((width + gap) / cell);
            const rows = Math.floor((height + gap) / cell);
            const startX = (width - (cell * cols - gap)) / 2 + dotSize / 2;
            const startY = (height - (cell * rows - gap)) / 2 + dotSize / 2;

            dots = [];
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    dots.push({ cx: startX + x * cell, cy: startY + y * cell, ox: 0, oy: 0, vx: 0, vy: 0 });
                }
            }
        };

        let rafId = 0;
        let lastFrame = 0;
        // Redraws every dot every frame, indefinitely, unless gated — with
        // no gate this ran forever even scrolled off-screen or with the tab
        // backgrounded, on the highest-traffic page in the app.
        let inViewport = true;
        let tabVisible = document.visibilityState !== 'hidden';

        const frame = (now) => {
            const dt = Math.min((now - (lastFrame || now)) / 1000, 0.05);
            lastFrame = now;

            const { width, height } = wrap.getBoundingClientRect();
            ctx.clearRect(0, 0, width, height);

            const proxSq = proximity * proximity;
            const radius = dotSize / 2;

            for (const dot of dots) {
                // Spring physics toward rest position.
                if (dot.ox || dot.oy || dot.vx || dot.vy) {
                    dot.vx += (-STIFFNESS * dot.ox - DAMPING * dot.vx) * dt;
                    dot.vy += (-STIFFNESS * dot.oy - DAMPING * dot.vy) * dt;
                    dot.ox += dot.vx * dt;
                    dot.oy += dot.vy * dt;
                    if (Math.abs(dot.ox) < 0.05 && Math.abs(dot.oy) < 0.05 &&
                        Math.abs(dot.vx) < 0.5 && Math.abs(dot.vy) < 0.5) {
                        dot.ox = dot.oy = dot.vx = dot.vy = 0;
                    }
                }

                const dx = dot.cx - pointer.x;
                const dy = dot.cy - pointer.y;
                const dsq = dx * dx + dy * dy;

                let fill;
                if (dsq <= proxSq) {
                    const t = 1 - Math.sqrt(dsq) / proximity;
                    const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
                    const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
                    const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
                    const a = baseAlpha + (activeAlpha - baseAlpha) * t;
                    fill = `rgba(${r},${g},${b},${a})`;
                } else {
                    fill = `rgba(${baseRgb.r},${baseRgb.g},${baseRgb.b},${baseAlpha})`;
                }

                ctx.beginPath();
                ctx.arc(dot.cx + dot.ox, dot.cy + dot.oy, radius, 0, Math.PI * 2);
                ctx.fillStyle = fill;
                ctx.fill();
            }

            rafId = (inViewport && tabVisible) ? requestAnimationFrame(frame) : 0;
        };

        const startLoop = () => {
            if (!rafId && inViewport && tabVisible) {
                lastFrame = 0;
                rafId = requestAnimationFrame(frame);
            }
        };

        const toLocal = (e) => {
            const rect = canvas.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };

        let lastMove = 0;
        const onMove = (e) => {
            const now = performance.now();
            const { x, y } = toLocal(e);
            pointer.x = x;
            pointer.y = y;

            if (now - lastMove < 50) return; // throttle the physics kicks, not the highlight
            lastMove = now;

            const dtMs = pointer.lastTime ? now - pointer.lastTime : 16;
            let vx = ((e.clientX - pointer.lastX) / dtMs) * 1000;
            let vy = ((e.clientY - pointer.lastY) / dtMs) * 1000;
            let speed = Math.hypot(vx, vy);
            if (speed > maxSpeed) {
                const s = maxSpeed / speed;
                vx *= s; vy *= s; speed = maxSpeed;
            }
            pointer.lastTime = now;
            pointer.lastX = e.clientX;
            pointer.lastY = e.clientY;

            if (reducedMotion || speed <= speedTrigger) return;

            for (const dot of dots) {
                if (Math.hypot(dot.cx - x, dot.cy - y) < proximity &&
                    Math.hypot(dot.vx, dot.vy) < 30) {
                    dot.vx += (dot.cx - x + vx * 0.005) * 7;
                    dot.vy += (dot.cy - y + vy * 0.005) * 7;
                }
            }
        };

        const onClick = (e) => {
            if (reducedMotion) return;
            const { x, y } = toLocal(e);
            for (const dot of dots) {
                const dist = Math.hypot(dot.cx - x, dot.cy - y);
                if (dist < shockRadius) {
                    const falloff = Math.max(0, 1 - dist / shockRadius);
                    dot.vx += (dot.cx - x) * shockStrength * falloff * 5;
                    dot.vy += (dot.cy - y) * shockStrength * falloff * 5;
                }
            }
        };

        buildGrid();
        startLoop();

        const resizeObserver = new ResizeObserver(buildGrid);
        resizeObserver.observe(wrap);
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('click', onClick);

        // Pause the redraw loop off-screen (below the fold, scrolled past) and
        // while the tab is backgrounded — resume where it left off when either
        // condition clears.
        const intersectionObserver = new IntersectionObserver(([entry]) => {
            inViewport = entry.isIntersecting;
            if (inViewport && tabVisible) startLoop();
            else { cancelAnimationFrame(rafId); rafId = 0; }
        });
        intersectionObserver.observe(wrap);

        const onVisibilityChange = () => {
            tabVisible = document.visibilityState !== 'hidden';
            if (inViewport && tabVisible) startLoop();
            else { cancelAnimationFrame(rafId); rafId = 0; }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('click', onClick);
        };
    }, [dotSize, gap, baseColor, activeColor, baseAlpha, activeAlpha, proximity, speedTrigger, shockRadius, shockStrength, maxSpeed]);

    return (
        <div ref={wrapperRef} className={`absolute inset-0 ${className}`} style={style} aria-hidden="true">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
    );
}
