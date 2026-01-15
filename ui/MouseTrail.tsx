import React, { useEffect, useRef } from 'react';

export const MouseTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points: {x: number, y: number, age: number}[] = [];
    let mouse = { x: 0, y: 0 };
    
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        points.push({ x: mouse.x, y: mouse.y, age: 0 });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw crosshair at current mouse
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mouse.x - 10, mouse.y);
        ctx.lineTo(mouse.x + 10, mouse.y);
        ctx.moveTo(mouse.x, mouse.y - 10);
        ctx.lineTo(mouse.x, mouse.y + 10);
        ctx.stroke();

        // Draw trail
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            
            // Draw small square for industrial feel
            const size = (1 - p.age / 50) * 4;
            const alpha = 1 - p.age / 50;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(p.x - size/2, p.y - size/2, size, size);
            
            p.age++;
        }
        
        // Remove old points
        points = points.filter(p => p.age < 50);
        
        requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-50 mix-blend-difference"
    />
  );
};