"use client";

import React from "react";

export default function LinearParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>
        {`
          @keyframes moveTLBR {
            0% { transform: translate(-10px, -10px); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translate(100vw, 100vh); opacity: 0; }
          }
          @keyframes moveBLTR {
            0% { transform: translate(-10px, 100vh); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translate(100vw, -10px); opacity: 0; }
          }
        `}
      </style>

      {/* Top-Left to Bottom-Right Particles */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={`tlbr-${i}`}
          className="absolute top-0 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"
          style={{
            left: `${(i * 12) % 100}%`,
            animation: `moveTLBR ${10 + (i % 3) * 3}s linear infinite`,
            animationDelay: `${i * 1.5}s`,
            opacity: 0,
          }}
        />
      ))}

      {/* Bottom-Left to Top-Right Particles */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={`bltr-${i}`}
          className="absolute top-0 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"
          style={{
            left: `${(i * 12) % 100}%`,
            animation: `moveBLTR ${10 + (i % 3) * 3}s linear infinite`,
            animationDelay: `${i * 1.5}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
