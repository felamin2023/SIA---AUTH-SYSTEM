"use client";

import { useEffect, useRef } from "react";

interface Particle {
  hue: number;
  sat: number;
  lum: number;
  x: number;
  y: number;
  xLast: number;
  yLast: number;
  xSpeed: number;
  ySpeed: number;
  speed: number;
  age: number;
  name: string;
}

interface Eddy {
  x: number;
  y: number;
  K: number;
  r0: number;
}

export default function ParticleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const stepCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configuration
    const lifespan = 300;
    const popPerBirth = 5;
    const maxPop = 1500;
    const birthFreq = 1;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    let dataToImageRatio = Math.max(width, height) / 1000;
    let xC = width / 2;
    let yC = height / 2;

    ctx.globalCompositeOperation = "darken";
    ctx.imageSmoothingEnabled = false;

    // Utility function
    const segmentAngleRad = (
      Xstart: number,
      Ystart: number,
      Xtarget: number,
      Ytarget: number,
      realOrWeb: boolean
    ): number => {
      let result: number;
      if (Xstart === Xtarget) {
        if (Ystart === Ytarget) {
          result = 0;
        } else if (Ystart < Ytarget) {
          result = Math.PI / 2;
        } else {
          result = (3 * Math.PI) / 2;
        }
      } else if (Xstart < Xtarget) {
        result = Math.atan((Ytarget - Ystart) / (Xtarget - Xstart));
      } else {
        result = Math.PI + Math.atan((Ytarget - Ystart) / (Xtarget - Xstart));
      }

      result = (result + 2 * Math.PI) % (2 * Math.PI);

      if (!realOrWeb) {
        result = 2 * Math.PI - result;
      }

      return result;
    };

    const dataXYtoCanvasXY = (x: number, y: number) => {
      const zoom = 0.72;
      const xx = xC + x * zoom * dataToImageRatio;
      const yy = yC + y * zoom * dataToImageRatio;
      return { x: xx, y: yy };
    };

    const birth = () => {
      const x = -800 + 1600 * Math.random();
      const y = -800 + 1600 * Math.random();

      const particle: Particle = {
        hue: 195 + 3 * Math.floor(3 * Math.random()),
        sat: 65 + 30 * Math.random(),
        lum: 15 + Math.floor(50 * Math.random()),
        x,
        y,
        xLast: x,
        yLast: y,
        xSpeed: 0,
        ySpeed: 0,
        speed: 0,
        age: 0,
        name: "seed-" + Math.ceil(10000000 * Math.random()),
      };

      particlesRef.current.push(particle);
    };

    const kill = (deadParticleName: string) => {
      particlesRef.current = particlesRef.current.filter(
        (p) => p.name !== deadParticleName
      );
    };

    const move = () => {
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.xLast = p.x;
        p.yLast = p.y;

        p.xSpeed = 0;
        p.ySpeed = 0;

        const eddies: Eddy[] = [];
        const baseK = 7;
        eddies.push({ x: -300, y: -300, K: 10 * baseK, r0: 180 });
        eddies.push({ x: 300, y: -300, K: 15 * baseK, r0: 150 });
        eddies.push({ x: 300, y: 300, K: 10 * baseK, r0: 250 });
        eddies.push({ x: -300, y: 300, K: 15 * baseK, r0: 150 });
        eddies.push({ x: 0, y: 0, K: 5 * baseK, r0: 20 });

        for (let e = 0; e < eddies.length; e++) {
          const eddy = eddies[e];
          const dx = p.x - eddy.x;
          const dy = p.y - eddy.y;
          const r = Math.sqrt(dx * dx + dy * dy);
          const theta = segmentAngleRad(0, 0, dx, dy, true);
          const cos = Math.cos(theta);
          const sin = Math.sin(theta);
          const K = eddy.K;
          const r0 = eddy.r0;

          const er = { x: cos, y: sin };
          const eO = { x: -sin, y: cos };

          const radialVelocity = (-0.003 * K * Math.abs(dx * dy)) / 3000;
          const sigma = 100;
          const azimutalVelocity =
            K * Math.exp(-Math.pow((r - r0) / sigma, 2));

          p.xSpeed += radialVelocity * er.x + azimutalVelocity * eO.x;
          p.ySpeed += radialVelocity * er.y + azimutalVelocity * eO.y;
        }

        const visc = 1;
        p.xSpeed *= visc;
        p.ySpeed *= visc;

        p.speed = Math.sqrt(p.xSpeed * p.xSpeed + p.ySpeed * p.ySpeed);

        p.x += 0.1 * p.xSpeed;
        p.y += 0.1 * p.ySpeed;

        p.age++;

        if (p.age > lifespan) {
          kill(p.name);
        }
      }
    };

    const initDraw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
    };

    const draw = () => {
      const particles = particlesRef.current;
      if (!particles.length) return;

      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.closePath();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const h = p.hue;
        const s = p.sat;
        const l = p.lum;
        const a = 0.3 + p.speed / 400;

        const last = dataXYtoCanvasXY(p.xLast, p.yLast);
        const now = dataXYtoCanvasXY(p.x, p.y);

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;
        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;

        ctx.moveTo(last.x, last.y);
        ctx.lineTo(now.x, now.y);

        const size = 0.4 * (3 - (4 * p.age) / 500);

        ctx.lineWidth = 1 * size * dataToImageRatio;
        ctx.stroke();
        ctx.closePath();
      }
    };

    const evolve = () => {
      stepCountRef.current++;

      if (
        stepCountRef.current % birthFreq === 0 &&
        particlesRef.current.length + popPerBirth < maxPop
      ) {
        for (let n = 0; n < popPerBirth; n++) {
          birth();
        }
      }

      move();
      draw();
    };

    // Handle resize
    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      dataToImageRatio = Math.max(width, height) / 1000;
      xC = width / 2;
      yC = height / 2;
      initDraw();
    };

    window.addEventListener("resize", handleResize);

    // Start animation
    particlesRef.current = [];
    stepCountRef.current = 0;
    initDraw();

    const frame = () => {
      evolve();
      animationRef.current = requestAnimationFrame(frame);
    };

    frame();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "white" }}
    />
  );
}
