import { useState, useEffect, useCallback } from "react";


const slides = [
  {
    id: 1,
    bg: "from-[#4189DD] to-[#1a5cb5]",
    title: "🇸🇴 Soomaaliya Hanoolaato",
    subtitle: "Shop with pride — quality products for our people",
    accent: "text-[#FBFBFB]",
    showFlag: true,
  },
  {
    id: 2,
    bg: "from-primary to-accent",
    title: "⚡ Up to 80% OFF",
    subtitle: "Flash deals ending soon — don't miss out!",
    accent: "text-yellow-300",
    showFlag: false,
  },
  {
    id: 3,
    bg: "from-[#4189DD] to-[#2563eb]",
    title: "🚚 Free Shipping",
    subtitle: "On orders over $25 — delivered to your door",
    accent: "text-white",
    showFlag: false,
  },
  {
    id: 4,
    bg: "from-success to-[#059669]",
    title: "✨ New Arrivals Daily",
    subtitle: "Fresh styles added every day — be the first to shop",
    accent: "text-yellow-200",
    showFlag: false,
  },
];

const BannerSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");

  const next = useCallback(() => {
    setDirection("right");
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [next]);

  const goTo = (idx: number) => {
    setDirection(idx > current ? "right" : "left");
    setCurrent(idx);
  };

  const slide = slides[current];

  return (
    <div className="container mx-auto px-2 py-2">
      <div className="relative overflow-hidden rounded-xl h-[100px] md:h-[110px]">
        {/* Slide */}
        <div
          key={slide.id}
          className={`absolute inset-0 bg-gradient-to-r ${slide.bg} flex items-center px-5 md:px-8 animate-slide-in-right`}
          style={{
            animation: `${direction === "right" ? "slideFromRight" : "slideFromLeft"} 0.45s cubic-bezier(0.4,0,0.2,1) forwards`,
          }}
        >
         

          {/* Text content */}
          <div className="relative z-10 max-w-[70%]">
            <h2 className={`text-lg md:text-2xl font-extrabold ${slide.accent} leading-tight drop-shadow-sm`}>
              {slide.title}
            </h2>
            <p className="text-white/90 text-xs md:text-sm mt-1 font-medium leading-snug">
              {slide.subtitle}
            </p>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
        </div>

        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? "w-5 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes slideFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideFromLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BannerSlideshow;
