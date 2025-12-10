import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { TarotCard, type TarotCardData } from "@/components/TarotCard";
import { StardustCursor } from "@/components/StardustCursor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Shuffle, RotateCcw, Lock, Share2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import tarotDeck from "@assets/tarot_cards_complete_(1)_1765374570042.json";

// Schema for the question input
const formSchema = z.object({
  question: z.string().min(3, "Please ask a question to the cards.").max(100, "Your question is too long."),
});

type ReadingState = "locked" | "idle" | "shuffling" | "drawing" | "revealing" | "interpreting" | "complete";

export default function Home() {
  const [readingState, setReadingState] = useState<ReadingState>("locked");
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const [drawnCards, setDrawnCards] = useState<TarotCardData[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [interpretation, setInterpretation] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length === 6) {
      const sum = value.split("").reduce((acc, curr) => acc + parseInt(curr), 0);
      if (sum === 18) {
        // Success
        setTimeout(() => setReadingState("idle"), 300);
      } else {
        // Failure
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPassword("");
        }, 500);
      }
    }
  };

  const shareReading = () => {
    const text = `Lumina Tarot Reading\n\nQuestion: ${form.getValues().question}\n\nPast: ${drawnCards[0].name}\nPresent: ${drawnCards[1].name}\nFuture: ${drawnCards[2].name}\n\nInterpretation:\n${interpretation}\n\nDiscover your fate at Lumina Tarot.`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Your reading is ready to share.",
      duration: 3000,
    });
  };

  const shuffleDeck = () => {
    setReadingState("shuffling");
    setDrawnCards([]);
    setRevealedCount(0);
    setInterpretation("");
    
    // Simulate shuffle time
    setTimeout(() => {
      setReadingState("drawing");
    }, 2000);
  };

  const drawCard = () => {
    if (drawnCards.length >= 3) return;

    // Pick a random card that hasn't been drawn yet
    let randomCard: TarotCardData;
    do {
      const randomIndex = Math.floor(Math.random() * tarotDeck.length);
      // Cast the JSON import to our type
      randomCard = tarotDeck[randomIndex] as TarotCardData;
    } while (drawnCards.some(c => c.serial_number === randomCard.serial_number));

    const newCards = [...drawnCards, randomCard];
    setDrawnCards(newCards);

    if (newCards.length === 3) {
      setReadingState("revealing");
    }
  };

  const revealNextCard = () => {
    if (revealedCount < 3) {
      setRevealedCount(prev => prev + 1);
      
      // If this was the last card (3rd card), trigger interpretation
      if (revealedCount + 1 === 3) {
        getInterpretation();
      }
    }
  };

  const getInterpretation = async () => {
    setReadingState("interpreting");
    const question = form.getValues().question;
    
    try {
      const response = await fetch("/.netlify/functions/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          cards: drawnCards.map(c => ({ 
            name: c.name, 
            orientation: c.orientation, 
            keywords: c.keywords,
            position: c === drawnCards[0] ? "Past" : c === drawnCards[1] ? "Present" : "Future"
          }))
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get interpretation");
      }

      const data = await response.json();
      setInterpretation(data.interpretation);
    } catch (error) {
      console.error("Error fetching interpretation:", error);
      // Fallback for development/mockup without backend
      setInterpretation(
        "The cards suggest a journey of transformation. " +
        `The ${drawnCards[0].name} in your past indicates a foundation of ${drawnCards[0].keywords[0]}. ` +
        `Currently, the ${drawnCards[1].name} brings energy of ${drawnCards[1].keywords[0]}, asking you to focus on the present moment. ` +
        `Looking ahead, the ${drawnCards[2].name} reveals a potential for ${drawnCards[2].keywords[0]} if you stay true to your path. ` +
        "Trust your intuition as you move forward."
      );
      if (process.env.NODE_ENV === "development") {
        toast({
          title: "Dev Mode",
          description: "Using mock interpretation (Netlify function not available locally).",
          duration: 3000,
        });
      }
    } finally {
      setReadingState("complete");
    }
  };

  const resetReading = () => {
    setReadingState("idle");
    setDrawnCards([]);
    setRevealedCount(0);
    setInterpretation("");
    form.reset();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 md:px-8 cursor-none">
      <StardustCursor />
      
      {/* Header */}
      <header className="mb-12 text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary mb-2 tracking-tight drop-shadow-sm">Lumina Tarot</h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide max-w-lg mx-auto">
            Unveil the threads of fate weaving your Past, Present, and Future.
          </p>
        </motion.div>
      </header>

      {/* Locked State */}
      <AnimatePresence mode="wait">
        {readingState === "locked" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: shake ? [0, -10, 10, -10, 10, 0] : 0
            }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white/50 backdrop-blur-md p-10 rounded-2xl border border-white/50 shadow-xl flex flex-col items-center space-y-8"
          >
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="font-serif text-2xl text-primary font-bold tracking-wide">Sanctum Access</h2>
              <p className="text-sm text-muted-foreground font-sans">Enter the 6-digit seal code to enter.</p>
            </div>

            <div className="flex justify-center w-full">
              <InputOTP
                maxLength={6}
                value={password}
                onChange={handlePasswordChange}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-white/60 border-primary/20" />
                  <InputOTPSlot index={1} className="bg-white/60 border-primary/20" />
                  <InputOTPSlot index={2} className="bg-white/60 border-primary/20" />
                  <InputOTPSlot index={3} className="bg-white/60 border-primary/20" />
                  <InputOTPSlot index={4} className="bg-white/60 border-primary/20" />
                  <InputOTPSlot index={5} className="bg-white/60 border-primary/20" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <p className="text-xs text-center text-muted-foreground/50 italic">
              "The sum of the parts reveals the path."
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Section */}
      <AnimatePresence mode="wait">
        {readingState === "idle" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-md bg-white/50 backdrop-blur-md p-8 rounded-2xl border border-white/50 shadow-xl"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(shuffleDeck)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="What does the universe hold for me?" 
                          className="text-center text-lg h-14 bg-white/80 border-primary/20 focus:border-primary/50 font-serif placeholder:font-sans transition-all duration-300 focus:ring-primary/20" 
                          autoComplete="off"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 text-lg font-serif bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Shuffle the Deck
                </Button>
                <p className="text-xs text-center text-muted-foreground/60 italic font-serif">
                  Press "Shuffle" first, then you will be guided to draw 3 cards.
                </p>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shuffling State */}
      {readingState === "shuffling" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-64"
        >
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="text-primary w-6 h-6 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 font-serif text-2xl text-primary animate-pulse">Shuffling the cards...</p>
        </motion.div>
      )}

      {/* Drawing State */}
      {readingState === "drawing" && (
        <div className="flex flex-col items-center space-y-8">
           <motion.h2 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             className="font-serif text-3xl text-primary/80"
           >
             Draw your cards
           </motion.h2>
           <Button 
             onClick={drawCard} 
             size="xl"
             className="h-24 px-12 text-2xl font-serif bg-primary hover:bg-primary/90 shadow-2xl hover:scale-105 hover:shadow-primary/20 transition-all duration-300 rounded-xl"
           >
             <div className="flex flex-col items-center gap-2">
               <span>Draw Card {drawnCards.length + 1}/3</span>
               <span className="text-xs font-sans uppercase tracking-widest opacity-80 font-normal">
                 {drawnCards.length === 0 ? "The Past" : drawnCards.length === 1 ? "The Present" : "The Future"}
               </span>
             </div>
           </Button>
           
           <div className="flex gap-4 mt-8">
             {[0, 1, 2].map((i) => (
               <div 
                 key={i} 
                 className={cn(
                   "w-12 h-16 rounded border-2 border-dashed border-primary/30 flex items-center justify-center transition-all duration-500",
                   i < drawnCards.length ? "bg-primary/20 border-solid border-primary shadow-[0_0_10px_rgba(218,165,32,0.3)]" : ""
                 )}
               >
                 {i < drawnCards.length && (
                   <motion.div 
                     initial={{ scale: 0 }} 
                     animate={{ scale: 1 }} 
                     className="w-full h-full bg-primary/40" 
                   />
                 )}
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Revealing / Reading State */}
      {(readingState === "revealing" || readingState === "interpreting" || readingState === "complete") && (
        <div className="w-full max-w-6xl flex flex-col items-center space-y-12 pb-20">
          
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full px-4">
            {drawnCards.map((card, index) => (
              <motion.div
                key={card.serial_number}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                onClick={() => {
                  if (index === revealedCount) revealNextCard();
                }}
                className={cn(
                  "transition-all duration-500",
                  index === revealedCount ? "scale-105 z-10" : "scale-100 z-0",
                  index > revealedCount ? "blur-sm grayscale opacity-70" : "",
                  readingState === "complete" ? "blur-0 grayscale-0 opacity-100" : ""
                )}
              >
                <TarotCard 
                  card={card} 
                  index={index} 
                  isRevealed={index < revealedCount}
                  label={index === 0 ? "The Past" : index === 1 ? "The Present" : "The Future"}
                />
                
                {/* Reveal Button for each card if not auto-revealed */}
                {index === revealedCount && readingState === "revealing" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex justify-center"
                  >
                    <Button 
                      onClick={revealNextCard} 
                      variant="outline" 
                      className="font-serif text-lg border-primary/50 text-primary hover:bg-primary/5 hover:border-primary transition-all duration-300"
                    >
                      Reveal Card
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Interpretation Section */}
          <AnimatePresence>
            {readingState === "interpreting" && (
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }}
                 className="flex flex-col items-center mt-12 p-8 bg-white/40 backdrop-blur-sm rounded-xl max-w-2xl text-center border border-white/40 shadow-lg"
               >
                 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                 <p className="font-serif text-xl italic text-muted-foreground animate-pulse">Consulting the oracle...</p>
               </motion.div>
            )}

            {readingState === "complete" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-3xl bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-2xl shadow-2xl border border-white/60 mt-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <h3 className="font-serif text-3xl md:text-4xl text-primary text-center mb-6 drop-shadow-sm">The Oracle Speaks</h3>
                
                <div className="prose prose-lg prose-slate mx-auto font-serif leading-relaxed text-slate-700 text-justify">
                  <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 float-left font-serif">
                    {interpretation.charAt(0)}
                  </p>
                  <p>{interpretation.slice(1)}</p>
                </div>

                <div className="flex justify-center mt-12 gap-4">
                  <Button 
                    onClick={shareReading} 
                    variant="outline" 
                    className="text-primary hover:text-primary-foreground hover:bg-primary gap-2 font-serif text-lg border-primary/20 transition-all duration-300"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Reading
                  </Button>
                  <Button 
                    onClick={resetReading} 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-primary gap-2 font-serif text-lg hover:bg-primary/5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Ask another question
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-6 mt-auto text-center">
        <p className="font-serif text-sm text-muted-foreground/60">
          Made with love and wisdom by Terence
        </p>
      </footer>
    </div>
  );
}
