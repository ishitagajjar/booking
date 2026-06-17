interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = 'h-8 w-8', showText = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo.png" alt="BookFlow" className={className} />
      {showText && <span className="text-xl font-bold tracking-tight">BookFlow</span>}
    </div>
  );
}
