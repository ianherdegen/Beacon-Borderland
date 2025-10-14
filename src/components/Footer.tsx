import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t-2 border-zinc-800 bg-black/80 backdrop-blur-sm flex-shrink-0">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/50" style={{ animationDelay: '0.3s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-lg shadow-secondary/50" style={{ animationDelay: '0.6s' }} />
          </div>
          <p className="arcade-font text-[0.4rem] sm:text-[0.5rem] text-zinc-500">
            © {currentYear} BORDERLAND
          </p>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-lg shadow-secondary/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/50" style={{ animationDelay: '0.3s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>
      </div>
    </footer>
  );
};
