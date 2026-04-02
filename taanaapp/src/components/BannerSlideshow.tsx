import { useState, useEffect, useCallback, useRef } from "react";
import api from '@/lib/api';

const defaultSlides = [
  {
    id: 'default-1',
    title: 'Welcome',
    subtitle: 'Check out our latest collections',
    bg: 'from-primary to-accent',
    image_url: null,
    cta_text: null,
  },
];

const BannerSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [prev, setPrev] = useState<number>(0);
  const [slides, setSlides] = useState<any[]>(defaultSlides);
  const [paused, setPaused] = useState(false);
  const autoplayRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    api.get('/slides')
      .then(res => {
        if (!mounted) return;
        const data = res.data?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map((s: any) => ({
            id: s.id,
            title: s.title,
            subtitle: s.subtitle,
            image_url: s.image_url,
            cta_text: s.cta_text,
            cta_link: s.cta_link,
            animation_type: s.animation_type || 'fade',
            bg_color_start: s.bg_color_start || '#0ea5a4',
            bg_color_end: s.bg_color_end || s.bg_color_start || '#0ea5a4',
            bg_type: s.bg_type || 'solid',
          })));
        }
      })
      .catch(() => {
        // ignore; keep defaults
      });
    return () => { mounted = false; };
  }, []);

  const next = useCallback(() => {
    setPrev(current);
    setDirection("right");
    setCurrent((current + 1) % slides.length);
  }, [current, slides.length]);

  // Autoplay every 2 seconds (2000ms). Pause on hover/focus.
  useEffect(() => {
    const interval = 2000; // 1-2 seconds; set to 2000ms by default
    if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    if (!paused) {
      autoplayRef.current = window.setInterval(() => {
        next();
      }, interval);
    }
    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    };
  }, [next, paused]);

  const goTo = (idx: number) => {
    setPrev(current);
    setDirection(idx > current ? "right" : "left");
    setCurrent(idx);
  };

  const slide = slides[current] || defaultSlides[0];

  return (
    <div className="container mx-auto px-2 py-2">
      <div
        className="relative overflow-hidden rounded-xl h-[120px] md:h-[140px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slide */}
        {slides.map((s, idx) => {
          const isEntering = idx === current;
          const isExiting = idx === prev && prev !== current;

          // choose animation name based on slide type and whether entering/exiting
          let anim = '';
          if (s.animation_type === 'slide') {
            if (isEntering) anim = direction === 'right' ? 'enterFromRight' : 'enterFromLeft';
            else if (isExiting) anim = direction === 'right' ? 'exitToLeft' : 'exitToRight';
          } else if (s.animation_type === 'zoom') {
            if (isEntering) anim = 'enterZoom';
            else if (isExiting) anim = 'exitZoom';
          } else {
            // fade
            if (isEntering) anim = 'enterFade';
            else if (isExiting) anim = 'exitFade';
          }

          const style: any = {
            animation: anim ? `${anim} 650ms cubic-bezier(0.4,0,0.2,1) forwards` : undefined,
            // let the keyframes drive opacity/transform; use z-index to layer slides
            zIndex: isEntering ? 20 : (isExiting ? 10 : 0),
            pointerEvents: isEntering ? 'auto' : 'none',
          };

          return (
            <div key={s.id || idx} className="absolute inset-0 flex items-center" style={style}>
              <div
                className="absolute inset-0"
                style={{
                  background: s.bg_type === 'gradient' && s.bg_color_start && s.bg_color_end
                    ? `linear-gradient(90deg, ${s.bg_color_start}, ${s.bg_color_end})`
                    : (s.bg_color_start || '#0ea5a4')
                }}
              />

              <div className="relative z-10 w-full px-4 md:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm md:text-base text-white font-bold truncate">{s.title}</h3>
                    <p className="text-white/95 text-base md:text-lg font-semibold leading-tight truncate">{s.subtitle}</p>
                  </div>

                  <div className="w-36 flex-shrink-0 ml-4">
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.title || ''} className="w-full h-20 object-cover rounded shadow-sm border" />
                    ) : (
                      <div className="w-full h-20 rounded border" style={{ background: s.bg_type === 'gradient' && s.bg_color_start && s.bg_color_end ? `linear-gradient(90deg, ${s.bg_color_start}, ${s.bg_color_end})` : (s.bg_color_start || '#eee') }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
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
        @keyframes enterFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes enterFromLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes exitToLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-50%); opacity: 0; }
        }
        @keyframes exitToRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(50%); opacity: 0; }
        }
        @keyframes enterZoom {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes exitZoom {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(1.05); opacity: 0; }
        }
        @keyframes enterFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes exitFade {
          from { opacity: 1; }
          to { opacity: 0; }
        }
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
