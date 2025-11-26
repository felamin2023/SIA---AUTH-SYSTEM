"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface HangingButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  ropeLength?: number;
}

export default function HangingButton({
  href,
  children,
  variant = "primary",
  ropeLength = 80,
}: HangingButtonProps) {
  const [angle, setAngle] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  // Physics constants
  const gravity = 0.5;
  const damping = 0.98;
  const friction = 0.99;

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 16, 2);
      lastTimeRef.current = currentTime;

      // Pendulum physics
      const acceleration =
        (-gravity * Math.sin(angle * (Math.PI / 180))) / (ropeLength / 50);

      setVelocity((prev) => {
        const newVelocity = (prev + acceleration * deltaTime) * damping;
        return Math.abs(newVelocity) < 0.001 ? 0 : newVelocity;
      });

      setAngle((prev) => {
        const newAngle = (prev + velocity * deltaTime) * friction;
        return Math.abs(newAngle) < 0.01 && Math.abs(velocity) < 0.001
          ? 0
          : newAngle;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [angle, velocity, gravity, damping, ropeLength]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;
    const distance = mouseX - centerX;

    // Apply force based on mouse position relative to center
    const force = (distance / rect.width) * 8;
    setVelocity((prev) => prev + force * 0.3);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;
    const direction = mouseX > centerX ? 1 : -1;

    // Give initial push
    setVelocity((prev) => prev + direction * 3);
  };

  const buttonStyles = {
    primary:
      "bg-[rgb(18,135,173)] text-white hover:bg-[rgb(15,115,148)] hover:shadow-[0_0_20px_rgba(18,135,173,0.3)]",
    secondary:
      "border border-white/10 bg-white/5 text-white hover:border-[rgb(18,135,173)] hover:bg-white/10",
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center cursor-pointer w-48"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      style={{ height: ropeLength + 60 }}
    >
      {/* Rope */}
      <svg
        className="absolute top-0 left-1/2 -translate-x-1/2 overflow-visible"
        width="4"
        height={ropeLength}
        style={{
          transform: `translateX(-50%) rotate(${angle}deg)`,
          transformOrigin: "top center",
        }}
      >
        {/* Rope gradient for 3D effect */}
        <defs>
          <linearGradient id="ropeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B7355" />
            <stop offset="50%" stopColor="#D4A574" />
            <stop offset="100%" stopColor="#8B7355" />
          </linearGradient>
        </defs>
        {/* Main rope */}
        <line
          x1="2"
          y1="0"
          x2="2"
          y2={ropeLength}
          stroke="url(#ropeGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Rope texture lines */}
        {Array.from({ length: Math.floor(ropeLength / 8) }).map((_, i) => (
          <line
            key={i}
            x1="0.5"
            y1={i * 8 + 2}
            x2="3.5"
            y2={i * 8 + 6}
            stroke="#6B5344"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}
        {/* Knot at bottom */}
        <circle cx="2" cy={ropeLength - 2} r="4" fill="#A08060" />
        <circle cx="2" cy={ropeLength - 2} r="2.5" fill="#C4A070" />
      </svg>

      {/* Button */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: ropeLength,
          transform: `translateX(-50%) rotate(${angle}deg)`,
          transformOrigin: `center -${ropeLength}px`,
        }}
      >
        <Link
          href={href}
          className={`block whitespace-nowrap rounded-lg px-6 py-3 text-center font-semibold transition-all ${buttonStyles[variant]}`}
        >
          {children}
        </Link>
      </div>
    </div>
  );
}
