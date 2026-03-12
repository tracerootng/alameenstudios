import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<{ x: number; y: number; id: number }[]>([]);
  const [trails, setTrails] = useState<{ x: number; y: number; id: number; opacity: number }[]>([]);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const idRef = useRef(0);
  const rafRef = useRef<number>(0);
  const ringTarget = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Hide default cursor
    document.documentElement.style.cursor = "none";

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      setPos({ x, y });
      setIsVisible(true);
      ringTarget.current = { x, y };

      // Add trail
      const id = idRef.current++;
      trailsRef.current = [
        ...trailsRef.current.slice(-14),
        { x, y, id },
      ];

      setTrails(
        trailsRef.current.map((t, i, arr) => ({
          ...t,
          opacity: (i / arr.length) * 0.35,
        }))
      );
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    // Detect hover on interactive elements
    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.matches("a, button, [role=button], label, input, textarea, select, [data-cursor-hover]")
      ) {
        setIsHovering(true);
      }
    };
    const handleHoverEnd = () => setIsHovering(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseover", handleHoverStart);
    document.addEventListener("mouseout", handleHoverEnd);

    // Smooth ring follow via RAF
    const animateRing = () => {
      setRingPos((prev) => ({
        x: prev.x + (ringTarget.current.x - prev.x) * 0.12,
        y: prev.y + (ringTarget.current.y - prev.y) * 0.12,
      }));
      rafRef.current = requestAnimationFrame(animateRing);
    };
    rafRef.current = requestAnimationFrame(animateRing);

    return () => {
      document.documentElement.style.cursor = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", handleHoverStart);
      document.removeEventListener("mouseout", handleHoverEnd);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null; // Don't render on touch devices
  }

  return (
    <>
      {/* Particle trails */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="pointer-events-none fixed z-[9998]"
          style={{
            left: trail.x - 3,
            top: trail.y - 3,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: `hsl(32, 100%, 60%)`,
            opacity: trail.opacity,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Outer lagging ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed z-[9999]"
        style={{
          left: ringPos.x,
          top: ringPos.y,
          width: isHovering ? 56 : 36,
          height: isHovering ? 56 : 36,
          borderRadius: "50%",
          border: `1px solid hsl(32, 100%, 60%, ${isHovering ? 0.9 : 0.5})`,
          transform: "translate(-50%, -50%)",
          transition: "width 0.3s ease, height 0.3s ease, border-color 0.3s ease, opacity 0.2s ease",
          opacity: isVisible ? 1 : 0,
          boxShadow: isHovering ? "0 0 20px hsl(32, 100%, 60%, 0.3)" : "none",
        }}
      />

      {/* Inner precise dot */}
      <motion.div
        ref={cursorRef}
        className="pointer-events-none fixed z-[10000]"
        animate={{
          x: pos.x,
          y: pos.y,
          scale: isClicking ? 0.5 : isHovering ? 0 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 2000, damping: 50 }}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "hsl(32, 100%, 75%)",
          marginLeft: -3,
          marginTop: -3,
        }}
      />

      {/* Click ripple */}
      {isClicking && (
        <motion.div
          className="pointer-events-none fixed z-[9997]"
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            left: pos.x - 18,
            top: pos.y - 18,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid hsl(32, 100%, 60%, 0.6)",
          }}
        />
      )}
    </>
  );
}
