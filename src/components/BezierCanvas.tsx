import { useEffect, useRef, useCallback, useState } from 'react';
import {
  bezierPoint,
  sampleBezierCurve,
  sampleTangents,
  type Point,
} from '@/lib/bezier';
import {
  createSpringState,
  updateSpring,
  setSpringTarget,
  DEFAULT_SPRING_CONFIG,
  type SpringState,
} from '@/lib/physics';

interface BezierCanvasProps {
  className?: string;
  targetFps?: number;
}

// Colors from our design system (in HSL format for canvas)
const COLORS = {
  background: 'hsl(220, 20%, 6%)',
  grid: 'hsl(220, 15%, 12%)',
  curve: 'hsl(185, 90%, 60%)',
  curveGlow: 'rgba(56, 227, 232, 0.3)',
  tangent: 'hsl(185, 40%, 45%)',
  endpoint: 'hsl(25, 90%, 55%)',
  controlPoint: 'hsl(280, 70%, 60%)',
  controlLine: 'hsla(280, 70%, 60%, 0.3)',
  text: 'hsl(210, 20%, 90%)',
  textMuted: 'hsl(215, 15%, 55%)',
};

export function BezierCanvas({ className, targetFps = 60 }: BezierCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);

  // Fixed endpoints
  const p0Ref = useRef<Point>({ x: 0, y: 0 });
  const p3Ref = useRef<Point>({ x: 0, y: 0 });

  // Spring states for control points
  const spring1Ref = useRef<SpringState | null>(null);
  const spring2Ref = useRef<SpringState | null>(null);

  // Base positions for control points (without mouse offset)
  const baseP1Ref = useRef<Point>({ x: 0, y: 0 });
  const baseP2Ref = useRef<Point>({ x: 0, y: 0 });


  const [fps, setFps] = useState(0);
  const fpsCountRef = useRef(0);
  const fpsTimeRef = useRef(0);
  
  // Frame interval based on target FPS
  const frameIntervalRef = useRef(1000 / targetFps);

  // Initialize canvas and positions
  const initializePositions = useCallback((width: number, height: number) => {
    const margin = 100;
    const centerY = height / 2;

    // Fixed endpoints
    p0Ref.current = { x: margin, y: centerY };
    p3Ref.current = { x: width - margin, y: centerY };

    // Control points start positions (creating a nice curve)
    const third = (width - 2 * margin) / 3;
    baseP1Ref.current = { x: margin + third, y: centerY - 150 };
    baseP2Ref.current = { x: margin + 2 * third, y: centerY + 150 };

    // Initialize springs
    spring1Ref.current = createSpringState(baseP1Ref.current);
    spring2Ref.current = createSpringState(baseP2Ref.current);
  }, []);

  // Calculate distance between two points
  const getDistance = (p1: Point, p2: Point) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };

  // Handle mouse/touch movement
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container || !spring1Ref.current || !spring2Ref.current) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Get mouse position in canvas coordinates
    const mousePos: Point = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    // Get current positions of control points
    const p1Pos = spring1Ref.current.position;
    const p2Pos = spring2Ref.current.position;

    // Calculate distances to each control point
    const distToP1 = getDistance(mousePos, p1Pos);
    const distToP2 = getDistance(mousePos, p2Pos);

    // Calculate offset from center for movement
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const sensitivity = 0.3;
    const offset: Point = {
      x: (clientX - rect.left - centerX) * sensitivity,
      y: (clientY - rect.top - centerY) * sensitivity,
    };

    // Only move the nearest control point, reset the other to base position
    if (distToP1 < distToP2) {
      // P1 is closer - move it, reset P2
      spring1Ref.current = setSpringTarget(spring1Ref.current, {
        x: baseP1Ref.current.x + offset.x * 0.8,
        y: baseP1Ref.current.y + offset.y * 1.2,
      });
      spring2Ref.current = setSpringTarget(spring2Ref.current, baseP2Ref.current);
    } else {
      // P2 is closer - move it, reset P1
      spring2Ref.current = setSpringTarget(spring2Ref.current, {
        x: baseP2Ref.current.x + offset.x * 0.8,
        y: baseP2Ref.current.y + offset.y * 0.8,
      });
      spring1Ref.current = setSpringTarget(spring1Ref.current, baseP1Ref.current);
    }
  }, []);

  // Draw grid background
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 40;
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, []);

  // Draw control point handles (lines from endpoints to control points)
  const drawControlHandles = useCallback(
    (ctx: CanvasRenderingContext2D, p0: Point, p1: Point, p2: Point, p3: Point) => {
      ctx.strokeStyle = COLORS.controlLine;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      // P0 to P1
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();

      // P3 to P2
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.setLineDash([]);
    },
    []
  );

  // Draw the Bézier curve with glow effect
  const drawCurve = useCallback(
    (ctx: CanvasRenderingContext2D, p0: Point, p1: Point, p2: Point, p3: Point) => {
      const points = sampleBezierCurve(p0, p1, p2, p3, 150);

      // Draw glow layer
      ctx.strokeStyle = COLORS.curveGlow;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Draw main curve
      ctx.strokeStyle = COLORS.curve;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    },
    []
  );

  // Draw tangent vectors
  const drawTangents = useCallback(
    (ctx: CanvasRenderingContext2D, p0: Point, p1: Point, p2: Point, p3: Point) => {
      const tangents = sampleTangents(p0, p1, p2, p3, 8);
      const tangentLength = 80;

      ctx.strokeStyle = COLORS.tangent;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      tangents.forEach(({ point, normalizedTangent }) => {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(
          point.x + normalizedTangent.x * tangentLength,
          point.y + normalizedTangent.y * tangentLength
        );
        ctx.stroke();

        // Draw small circle at tangent origin
        ctx.fillStyle = COLORS.tangent;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    []
  );

  // Draw control points
  const drawControlPoints = useCallback(
    (ctx: CanvasRenderingContext2D, p0: Point, p1: Point, p2: Point, p3: Point) => {
      // Draw endpoints (P0 and P3)
      [p0, p3].forEach((p, i) => {
        // Outer glow
        ctx.fillStyle = 'rgba(245, 130, 49, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        ctx.fill();

        // Inner circle
        ctx.fillStyle = COLORS.endpoint;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = COLORS.text;
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(i === 0 ? 'P₀' : 'P₃', p.x, p.y - 24);
      });

      // Draw control points (P1 and P2)
      [p1, p2].forEach((p, i) => {
        // Outer glow
        ctx.fillStyle = 'rgba(167, 99, 212, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fill();

        // Inner circle
        ctx.fillStyle = COLORS.controlPoint;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = COLORS.text;
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(i === 0 ? 'P₁' : 'P₂', p.x, p.y - 20);
      });
    },
    []
  );

  // Draw info text
  const drawInfo = useCallback((ctx: CanvasRenderingContext2D, width: number) => {
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '13px Space Grotesk, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Move mouse to interact with the curve', 20, 30);
    
    ctx.textAlign = 'right';
    ctx.fillText(`${fps} FPS`, width - 20, 30);
  }, [fps]);

  // Update frame interval when targetFps changes
  useEffect(() => {
    frameIntervalRef.current = 1000 / targetFps;
  }, [targetFps]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    animationRef.current = requestAnimationFrame(animate);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !spring1Ref.current || !spring2Ref.current) {
      return;
    }

    // Throttle based on target FPS
    const elapsed = timestamp - lastRenderTimeRef.current;
    if (elapsed < frameIntervalRef.current) {
      return;
    }
    lastRenderTimeRef.current = timestamp - (elapsed % frameIntervalRef.current);

    // Calculate delta time
    const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0.016;
    lastTimeRef.current = timestamp;

    // Cap delta time to prevent instability
    const dt = Math.min(deltaTime, 0.033);

    // Update FPS counter
    fpsCountRef.current++;
    if (timestamp - fpsTimeRef.current >= 1000) {
      setFps(fpsCountRef.current);
      fpsCountRef.current = 0;
      fpsTimeRef.current = timestamp;
    }

    // Update spring physics
    spring1Ref.current = updateSpring(spring1Ref.current, DEFAULT_SPRING_CONFIG, dt);
    spring2Ref.current = updateSpring(spring2Ref.current, DEFAULT_SPRING_CONFIG, dt);

    const p0 = p0Ref.current;
    const p1 = spring1Ref.current.position;
    const p2 = spring2Ref.current.position;
    const p3 = p3Ref.current;

    const width = canvas.width;
    const height = canvas.height;

    // Clear and draw
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    drawGrid(ctx, width, height);
    drawControlHandles(ctx, p0, p1, p2, p3);
    drawCurve(ctx, p0, p1, p2, p3);
    drawTangents(ctx, p0, p1, p2, p3);
    drawControlPoints(ctx, p0, p1, p2, p3);
    drawInfo(ctx, width);
  }, [drawGrid, drawControlHandles, drawCurve, drawTangents, drawControlPoints, drawInfo]);

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    initializePositions(rect.width, rect.height);
  }, [initializePositions]);

  // Setup effect
  useEffect(() => {
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [handleResize, handlePointerMove, animate]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
      />
    </div>
  );
}
