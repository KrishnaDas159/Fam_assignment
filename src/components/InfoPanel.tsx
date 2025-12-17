interface InfoPanelProps {
  className?: string;
}

export function InfoPanel({ className }: InfoPanelProps) {
  return (
    <div className={`bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-foreground mb-4 glow-text">
        Bézier Curve Mathematics
      </h2>

      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-mono text-primary mb-1">Curve Formula</h3>
          <p className="text-muted-foreground font-mono text-xs">
            B(t) = (1−t)³P₀ + 3(1−t)²tP₁ + 3(1−t)t²P₂ + t³P₃
          </p>
        </div>

        <div>
          <h3 className="font-mono text-primary mb-1">Tangent (Derivative)</h3>
          <p className="text-muted-foreground font-mono text-xs">
            B'(t) = 3(1−t)²(P₁−P₀) + 6(1−t)t(P₂−P₁) + 3t²(P₃−P₂)
          </p>
        </div>

        <div>
          <h3 className="font-mono text-primary mb-1">Spring Physics</h3>
          <p className="text-muted-foreground font-mono text-xs">
            a = −k(x − x₀) − c·v
          </p>
          <p className="text-muted-foreground/70 text-xs mt-1">
            k = stiffness, c = damping
          </p>
        </div>

        <div className="pt-2 border-t border-border">
          <h3 className="font-mono text-secondary mb-2">Legend</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">Endpoints (fixed)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Control points</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-curve-tangent" />
              <span className="text-muted-foreground">Tangent vectors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
