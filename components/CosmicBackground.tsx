export function CosmicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-cosmic-gradient opacity-50" />
      
      {/* Ethereal glow effects - optimized with will-change */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-ethereal-glow rounded-full blur-3xl opacity-30 animate-float-smooth will-change-transform" 
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ethereal-glow rounded-full blur-3xl opacity-20 animate-float-smooth will-change-transform" 
        style={{ animationDelay: '3s' }} 
      />
      <div 
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-ethereal-glow rounded-full blur-3xl opacity-15 animate-pulse-glow will-change-transform" 
        style={{ animationDelay: '1.5s' }} 
      />
      
      {/* Optimized floating particles with reduced count */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-ethereal-purple rounded-full constellation-bg will-change-transform"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
          }}
        />
      ))}
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(167, 139, 250, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}
