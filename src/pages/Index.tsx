import { useState } from 'react';
import { BezierCanvas } from '@/components/BezierCanvas';
import { InfoPanel } from '@/components/InfoPanel';
import { Slider } from '@/components/ui/slider';

const Index = () => {
  const [targetFps, setTargetFps] = useState(60);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Interactive Bézier Curve
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Physics-based simulation with spring dynamics
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded">React</span>
            <span className="px-2 py-1 bg-muted rounded">Canvas API</span>
            <span className="px-2 py-1 bg-muted rounded">Spring Physics</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 canvas-container relative min-h-[60vh] lg:min-h-0">
          <BezierCanvas className="absolute inset-0" targetFps={targetFps} />
        </div>

        {/* Info Panel */}
        <aside className="flex-shrink-0 lg:w-80 p-4 lg:p-6 lg:border-l border-border overflow-auto">
          {/* FPS Control */}
          <div className="mb-6 bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground text-sm">Target FPS</h3>
              <span className="text-xs font-mono text-primary">{targetFps} FPS</span>
            </div>
            <Slider
              value={[targetFps]}
              onValueChange={(value) => setTargetFps(value[0])}
              min={10}
              max={120}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>10</span>
              <span>120</span>
            </div>
          </div>

          <InfoPanel />

          {/* Instructions */}
          <div className="mt-6 bg-muted/50 rounded-lg p-4 text-sm">
            <h3 className="font-medium text-foreground mb-2">How it works</h3>
            <ul className="space-y-2 text-muted-foreground text-xs">
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span>Move your mouse to displace the control points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span>Spring physics create smooth, natural motion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span>Tangent vectors show curve direction at each point</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span>All math computed from scratch each frame</span>
              </li>
            </ul>
          </div>

          {/* Implementation Notes */}
          <div className="mt-4 text-xs text-muted-foreground/70">
            <p>
              Rendering at {targetFps} FPS using requestAnimationFrame with throttling. 
              Spring integration uses semi-implicit Euler for stability. Curve sampled at t = 0.01 increments.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Index;
