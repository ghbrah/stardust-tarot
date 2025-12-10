import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TarotCardData {
  serial_number: number;
  name: string;
  url: string;
  orientation: "upright" | "reversed";
  keywords: string[];
}

interface TarotCardProps {
  card: TarotCardData | null;
  isRevealed: boolean;
  index: number;
  label: string;
}

export function TarotCard({ card, isRevealed, index, label }: TarotCardProps) {
  // 3D Tilt Effect Logic
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="flex flex-col items-center gap-4 group perspective-1000">
      <div className="text-xl font-serif font-semibold text-primary/80 uppercase tracking-widest transition-colors group-hover:text-primary">
        {label}
      </div>
      
      <motion.div 
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: isRevealed ? rotateX : 0,
          rotateY: isRevealed ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative w-64 h-96 cursor-pointer card-flip transition-all duration-300", 
          isRevealed ? "is-flipped" : ""
        )}
      >
        <div className="card-inner w-full h-full duration-700">
          {/* Back of Card */}
          <div className="card-back absolute w-full h-full backface-hidden rounded-xl border-2 border-primary/30 shadow-xl flex items-center justify-center bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60 animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>
            
            {/* Ornate Pattern */}
            <div className="absolute inset-4 border border-primary/20 rounded-lg flex items-center justify-center">
              <div className="w-48 h-48 border border-primary/10 rounded-full flex items-center justify-center">
                 <div className="w-32 h-32 border border-primary/10 rounded-full flex items-center justify-center rotate-45">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/40 flex items-center justify-center bg-primary/5 backdrop-blur-sm shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                      <div className="w-12 h-12 rotate-45 border border-primary/40"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Front of Card */}
          <div className="card-front absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-2xl bg-white border border-primary/20 rotate-y-180">
            {card && (
              <div className="relative w-full h-full flex flex-col h-full">
                <div className="relative flex-1 overflow-hidden">
                  <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src={card.url} 
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Sheen Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
                  
                  <div className="absolute bottom-0 left-0 w-full p-4 text-white text-center z-10">
                    <h3 className="font-serif text-2xl font-bold tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-primary-foreground/90">{card.name}</h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mt-1 font-semibold">{card.orientation}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/95 backdrop-blur-md border-t border-primary/10 min-h-[80px] flex flex-col justify-center">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {card.keywords.slice(0, 3).map((keyword, i) => (
                      <span key={i} className="text-[9px] uppercase tracking-wider px-2 py-1 bg-primary/10 border border-primary/10 rounded-full text-primary-foreground/80 font-bold">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
