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
  const ropeRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  // Physics constants - gentle movement
  const gravity = 0.35;
  const damping = 0.97;
  const friction = 0.98;
  const maxAngle = 20; // Limit maximum swing angle

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
        let newAngle = (prev + velocity * deltaTime) * friction;
        // Clamp angle to prevent excessive swinging
        newAngle = Math.max(-maxAngle, Math.min(maxAngle, newAngle));
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
  }, [angle, velocity, gravity, damping, ropeLength, maxAngle]);

  const handleRopeMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!ropeRef.current) return;

    const rect = ropeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;
    const distance = mouseX - centerX;

    // Apply gentle force based on mouse position
    const force = (distance / 40) * 0.8;
    setVelocity((prev) => {
      const newVel = prev + force;
      // Limit velocity to prevent wild swinging
      return Math.max(-3, Math.min(3, newVel));
    });
  };

  const handleRopeMouseEnter = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = ropeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;
    const direction = mouseX > centerX ? 1 : -1;

    // Give initial push
    setVelocity((prev) => {
      const newVel = prev + direction * 1.5;
      return Math.max(-3, Math.min(3, newVel));
    });
  };

  const buttonStyles = {
    primary:
      "bg-[rgb(18,135,173)] text-white hover:bg-[rgb(15,115,148)] hover:shadow-[0_0_20px_rgba(18,135,173,0.3)]",
    secondary:
      "border border-white/10 bg-white/5 text-white hover:border-[rgb(18,135,173)] hover:bg-white/10",
  };

  return (
    <div
      className="relative flex flex-col items-center w-48"
      style={{ height: ropeLength + 80 }}
    >
      {/* Swinging container - rope and button rotate together */}
      <div
        className="absolute top-0 left-1/2 flex flex-col items-center"
        style={{
          transform: `translateX(-50%) rotate(${angle}deg)`,
          transformOrigin: "top center",
        }}
      >
        {/* Rope - only this element responds to mouse */}
        <svg
          ref={ropeRef}
          className="overflow-visible cursor-pointer"
          width="20"
          height={ropeLength}
          onMouseMove={handleRopeMouseMove}
          onMouseEnter={handleRopeMouseEnter}
        >
          {/* Rope gradient for 3D effect */}
          <defs>
            <linearGradient
              id={`ropeGradient-${href}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#8B7355" />
              <stop offset="50%" stopColor="#D4A574" />
              <stop offset="100%" stopColor="#8B7355" />
            </linearGradient>
          </defs>
          {/* Main rope */}
          <line
            x1="10"
            y1="0"
            x2="10"
            y2={ropeLength}
            stroke={`url(#ropeGradient-${href})`}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Rope texture lines */}
          {Array.from({ length: Math.floor(ropeLength / 8) }).map((_, i) => (
            <line
              key={i}
              x1="8.5"
              y1={i * 8 + 2}
              x2="11.5"
              y2={i * 8 + 6}
              stroke="#6B5344"
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}
          {/* Knot at bottom */}
          <circle cx="10" cy={ropeLength - 2} r="4" fill="#A08060" />
          <circle cx="10" cy={ropeLength - 2} r="2.5" fill="#C4A070" />
        </svg>

        {/* Button - attached directly below rope */}
        <Link
          href={href}
          className={`block whitespace-nowrap rounded-lg px-6 py-3 text-center font-semibold transition-colors ${buttonStyles[variant]}`}
        >
          {children}
        </Link>
      </div>
    </div>
  );
}
