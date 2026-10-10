"use client";

import { useState, useEffect, useCallback } from "react";

export interface ParallaxState {
  scrollY: number;
  scrollProgress: number;
  mousePos: { x: number; y: number };
}

export function useParallax(): ParallaxState {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleScroll = useCallback(() => {
    if (typeof window === "undefined") return;
    const currentY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, Math.max(0, (currentY / docHeight) * 100)) : 0;

    setScrollY(currentY);
    setScrollProgress(progress);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (typeof window === "undefined") return;
    const x = (e.clientX / window.innerWidth) * 2 - 1; // -1 to 1
    const y = (e.clientY / window.innerHeight) * 2 - 1; // -1 to 1
    setMousePos({ x, y });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  return { scrollY, scrollProgress, mousePos };
}
