import React, { useEffect, useRef, useCallback, useMemo } from 'react';
const GLITTER_COUNT = 50;
const FLOAT_GLITTER_COUNT = 12;
const InteractiveBackground = () => {
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const glitters = useMemo(() =>
    Array.from({ length: GLITTER_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 8,
      duration: Math.random() * 3 + 2,
    })), []
  );
  const floaters = useMemo(() =>
    Array.from({ length: FLOAT_GLITTER_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      delay: Math.random() * 10,
      duration: Math.random() * 6 + 6,
    })), []
  );
  const handleMouseMove = useCallback((e) => {
    targetPos.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    };
  }, []);
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    const animate = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.025;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.025;
      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${currentPos.current.x * 60}px, ${currentPos.current.y * 60}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${currentPos.current.x * -45}px, ${currentPos.current.y * -45}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);
  return (
    <div className="interactive-bg">
      {/* Aurora blob 1 — Violet / Purple */}
      <div ref={blob1Ref} className="aurora-blob aurora-blob-1" />
      {/* Aurora blob 2 — Cyan / Teal */}
      <div ref={blob2Ref} className="aurora-blob aurora-blob-2" />
      {/* Static twinkling golden glitter */}
      {glitters.map(g => (
        <div
          key={`tw-${g.id}`}
          className="glitter-particle"
          style={{
            left: `${g.left}%`,
            top: `${g.top}%`,
            width: `${g.size}px`,
            height: `${g.size}px`,
            animationDelay: `${g.delay}s`,
            animationDuration: `${g.duration}s`,
          }}
        />
      ))}
      {/* Floating upward golden particles */}
      {floaters.map(f => (
        <div
          key={`fl-${f.id}`}
          className="glitter-float"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
          }}
        />
      ))}
      {/* Golden shimmer line — decorative */}
      <div className="golden-shimmer-line" />
    </div>
  );
};
export default InteractiveBackground;
