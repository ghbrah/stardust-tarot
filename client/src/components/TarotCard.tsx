import { useState } from "react";
import { motion } from "framer-motion";
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
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl font-serif font-semibold text-primary/80 uppercase tracking-widest">
        {label}
      </div>
      
      <div className={cn("relative w-64 h-96 cursor-pointer card-flip", isRevealed ? "is-flipped" : "")}>
        <div className="card-inner w-full h-full duration-700">
          {/* Back of Card */}
          <div className="card-back absolute w-full h-full backface-hidden rounded-xl border-2 border-primary/30 shadow-xl flex items-center justify-center bg-slate-900">
            <div className="w-full h-full opacity-60 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            <div className="absolute inset-4 border border-primary/20 rounded-lg flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-primary/40 flex items-center justify-center">
                <div className="w-12 h-12 rotate-45 border border-primary/40"></div>
              </div>
            </div>
          </div>

          {/* Front of Card */}
          <div className="card-front absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-2xl bg-white border border-primary/20 rotate-y-180">
            {card && (
              <div className="relative w-full h-full flex flex-col">
                <div className="relative flex-1 overflow-hidden">
                  <img 
                    src={card.url} 
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 w-full p-4 text-white text-center">
                    <h3 className="font-serif text-2xl font-bold tracking-wide text-shadow-sm">{card.name}</h3>
                    <p className="text-xs uppercase tracking-widest opacity-80 mt-1">{card.orientation}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/95 backdrop-blur-sm border-t border-primary/10">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {card.keywords.slice(0, 3).map((keyword, i) => (
                      <span key={i} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-secondary rounded-full text-secondary-foreground font-medium">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
