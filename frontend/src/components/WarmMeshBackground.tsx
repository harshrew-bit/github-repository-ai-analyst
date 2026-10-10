import React, { useEffect, useRef } from 'react';

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * WARM MESH BACKGROUND — Continuous Application-Wide Atmosphere
 * ═════════════════════════════════════════════════════════════════════════════
 * Provides an organic, art-directed mesh gradient combining soft coral,
 * vibrant peach, sunlit orange, blush pink, and warm cream.
 *
 * Stays fixed behind all pages and states (landing, indexing, workspace),
 * covers 100% of the viewport and full scrollable height, and gently reacts
 * to cursor motion and scroll depth without causing layout shifts or repaint lag.
 */
export const WarmMeshBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Respect user motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    let targetMouseX = 50;
    let targetMouseY = 30;
    let currentMouseX = 50;
    let currentMouseY = 30;
    let targetScrollY = 0;
    let currentScrollY = 0;
    let animId: number;

    const onPointerMove = (e: PointerEvent) => {
      // Calculate cursor position as viewport percentages
      targetMouseX = Math.round((e.clientX / window.innerWidth) * 100);
      targetMouseY = Math.round((e.clientY / window.innerHeight) * 100);
      if (!ticking) {
        ticking = true;
        animId = requestAnimationFrame(updateStyles);
      }
    };

    const onScroll = () => {
      targetScrollY = window.scrollY;
      if (!ticking) {
        ticking = true;
        animId = requestAnimationFrame(updateStyles);
      }
    };

    const updateStyles = () => {
      // Smooth interpolation for subtle liquid feel
      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;
      currentScrollY += (targetScrollY - currentScrollY) * 0.1;

      el.style.setProperty('--mouse-x', `${currentMouseX.toFixed(2)}%`);
      el.style.setProperty('--mouse-y', `${currentMouseY.toFixed(2)}%`);
      el.style.setProperty('--scroll-y', `${currentScrollY.toFixed(1)}px`);

      if (
        Math.abs(targetMouseX - currentMouseX) > 0.1 ||
        Math.abs(targetMouseY - currentMouseY) > 0.1 ||
        Math.abs(targetScrollY - currentScrollY) > 0.5
      ) {
        animId = requestAnimationFrame(updateStyles);
      } else {
        ticking = false;
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
      style={{
        // Default center-high coordinates before interaction
        ['--mouse-x' as string]: '52%',
        ['--mouse-y' as string]: '28%',
        ['--scroll-y' as string]: '0px',
      }}
    >
      {/* ── Base Foundation: Warm Cream / Cashmere Canvas */}
      <div className="absolute inset-0 bg-[#FAF7F2]" />

      {/* ── Layer 1: Primary Art-Directed Diffused Mesh Fields */}
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: 'translateY(calc(var(--scroll-y, 0px) * -0.05))',
        }}
      >
        {/* Soft Coral & Peach Sunrise (Top-Right / Center) */}
        <div
          className="absolute -top-[15%] right-[-10%] w-[75vw] max-w-[1100px] h-[75vw] max-h-[1100px] rounded-full opacity-65 mix-blend-multiply blur-[90px] sm:blur-[130px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 128, 98, 0.45) 0%, rgba(255, 160, 122, 0.32) 40%, rgba(254, 215, 170, 0.15) 70%, transparent 85%)',
          }}
        />

        {/* Blush Pink & Apricot Bloom (Top-Left / Header & Hero left) */}
        <div
          className="absolute -top-[10%] -left-[15%] w-[65vw] max-w-[900px] h-[65vw] max-h-[900px] rounded-full opacity-60 mix-blend-multiply blur-[80px] sm:blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 155, 175, 0.40) 0%, rgba(254, 205, 195, 0.28) 45%, rgba(255, 237, 213, 0.12) 75%, transparent 85%)',
          }}
        />

        {/* Golden Sunlit Orange / Warm Honey (Mid-Canvas / Architecture section) */}
        <div
          className="absolute top-[38%] left-[20%] w-[60vw] max-w-[850px] h-[60vw] max-h-[850px] rounded-full opacity-55 mix-blend-multiply blur-[85px] sm:blur-[125px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 158, 87, 0.38) 0%, rgba(254, 186, 116, 0.25) 45%, rgba(254, 243, 199, 0.12) 70%, transparent 85%)',
          }}
        />

        {/* Coral Rose Dawn (Mid-Right / Workspace View) */}
        <div
          className="absolute top-[55%] -right-[15%] w-[70vw] max-w-[950px] h-[70vw] max-h-[950px] rounded-full opacity-55 mix-blend-multiply blur-[90px] sm:blur-[130px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 138, 120, 0.36) 0%, rgba(254, 180, 160, 0.24) 45%, rgba(254, 215, 170, 0.10) 70%, transparent 85%)',
          }}
        />

        {/* Soft Peach & Warm Amber (Bottom-Left / Footer & Sources) */}
        <div
          className="absolute -bottom-[15%] -left-[10%] w-[80vw] max-w-[1100px] h-[80vw] max-h-[1100px] rounded-full opacity-60 mix-blend-multiply blur-[100px] sm:blur-[140px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 168, 115, 0.38) 0%, rgba(255, 195, 160, 0.25) 45%, rgba(255, 247, 237, 0.12) 75%, transparent 85%)',
          }}
        />
      </div>

      {/* ── Layer 2: Interactive Pointer Ambient Light (Desktop) */}
      <div
        className="absolute inset-0 opacity-45 mix-blend-soft-light transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 30%), rgba(255, 150, 120, 0.28), rgba(254, 215, 170, 0.12) 50%, transparent 75%)',
        }}
      />

      {/* ── Layer 3: Microscopic Organic Paper Texture (Prevents Banding) */}
      <div
        className="absolute inset-0 opacity-[0.022] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
