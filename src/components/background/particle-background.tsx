'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const numberOfParticles = Math.floor(
        (canvas.width * canvas.height) / 6000
      );
      particles = [];
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = resolvedTheme === 'dark' ? '#FFFFFF' : '#000000';
      particles.forEach((particle) => {
        ctx.fillRect(
          Math.round(particle.x),
          Math.round(particle.y),
          particle.size,
          particle.size
        );

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width)
          particle.vx = -particle.vx;
        if (particle.y < 0 || particle.y > canvas.height)
          particle.vy = -particle.vy;
      });
    };

    const drawLines = () => {
      ctx.strokeStyle =
        resolvedTheme === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(Math.round(particles[i].x), Math.round(particles[i].y));
            ctx.lineTo(Math.round(particles[j].x), Math.round(particles[j].y));
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      drawParticles();
      drawLines();
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className='fixed inset-0 pointer-events-none'
      style={{ zIndex: -1 }}
    />
  );
}
