'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { WeatherTheme } from '@/lib/weather-utils';

interface AtmosphericBackgroundProps {
  theme: WeatherTheme;
}

// Deterministic particle coordinates to avoid SSR/client hydration mismatches
const STARS = [
  { top: '8%', left: '12%', size: 2, delay: '0s', duration: '3.2s' },
  { top: '14%', left: '28%', size: 3, delay: '0.8s', duration: '4.1s' },
  { top: '6%', left: '46%', size: 2, delay: '1.5s', duration: '3.6s' },
  { top: '19%', left: '64%', size: 2.5, delay: '0.3s', duration: '4.5s' },
  { top: '11%', left: '82%', size: 3, delay: '1.1s', duration: '3.8s' },
  { top: '26%', left: '18%', size: 2, delay: '2.0s', duration: '4.2s' },
  { top: '31%', left: '39%', size: 1.5, delay: '0.6s', duration: '3.4s' },
  { top: '23%', left: '55%', size: 2, delay: '1.8s', duration: '4.7s' },
  { top: '28%', left: '74%', size: 2.5, delay: '0.4s', duration: '3.9s' },
  { top: '16%', left: '91%', size: 2, delay: '1.3s', duration: '4.3s' },
  { top: '38%', left: '8%', size: 2, delay: '0.9s', duration: '3.7s' },
  { top: '42%', left: '87%', size: 2.5, delay: '2.2s', duration: '4.0s' },
];

const RAINDROPS = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 4.3 + 2) % 98}%`,
  delay: `${((i * 0.17) % 1.4).toFixed(2)}s`,
  duration: `${(0.75 + (i % 5) * 0.12).toFixed(2)}s`,
  opacity: 0.18 + (i % 4) * 0.08,
  height: 44 + (i % 3) * 18,
}));

const SNOWFLAKES = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 4.6 + 3) % 96}%`,
  delay: `${((i * 0.45) % 4.5).toFixed(2)}s`,
  duration: `${(6.5 + (i % 5) * 1.4).toFixed(1)}s`,
  size: 4 + (i % 4) * 2.5,
  opacity: 0.35 + (i % 4) * 0.15,
}));

export default function AtmosphericBackground({
  theme,
}: AtmosphericBackgroundProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Ambient radial glow orbs */}
          {theme === 'clear' && (
            <>
              <div className="sun-orb absolute -top-24 -right-20 w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] rounded-full bg-amber-300/25 blur-3xl" />
              <div className="sun-orb-secondary absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-orange-400/20 blur-3xl" />
            </>
          )}

          {theme === 'night' && (
            <>
              <div className="absolute -top-20 right-10 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
              {STARS.map((star, idx) => (
                <span
                  key={idx}
                  className="star-twinkle absolute rounded-full bg-white"
                  style={{
                    top: star.top,
                    left: star.left,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    animationDelay: star.delay,
                    animationDuration: star.duration,
                  }}
                />
              ))}
            </>
          )}

          {theme === 'clouds' && (
            <>
              <div className="cloud-drift-slow absolute -top-16 -left-24 w-[460px] h-56 rounded-full bg-white/10 blur-3xl" />
              <div className="cloud-drift-fast absolute top-1/4 -right-24 w-[520px] h-64 rounded-full bg-slate-200/10 blur-3xl" />
            </>
          )}

          {(theme === 'rain' || theme === 'thunderstorm') && (
            <>
              {theme === 'thunderstorm' && (
                <div className="lightning-flash absolute inset-0 bg-indigo-200/20" />
              )}
              <div className="absolute -top-24 left-1/3 w-[500px] h-64 rounded-full bg-sky-400/10 blur-3xl" />
              {RAINDROPS.map((drop, idx) => (
                <span
                  key={idx}
                  className="rain-streak absolute -top-20 w-[1.5px] rounded-full bg-gradient-to-b from-transparent via-sky-200/60 to-white/80"
                  style={{
                    left: drop.left,
                    height: `${drop.height}px`,
                    opacity: drop.opacity,
                    animationDelay: drop.delay,
                    animationDuration: drop.duration,
                  }}
                />
              ))}
            </>
          )}

          {theme === 'snow' && (
            <>
              <div className="absolute -top-20 right-1/4 w-96 h-96 rounded-full bg-white/50 blur-3xl" />
              {SNOWFLAKES.map((flake, idx) => (
                <span
                  key={idx}
                  className="snow-flake absolute -top-6 rounded-full bg-white shadow-sm"
                  style={{
                    left: flake.left,
                    width: `${flake.size}px`,
                    height: `${flake.size}px`,
                    opacity: flake.opacity,
                    animationDelay: flake.delay,
                    animationDuration: flake.duration,
                  }}
                />
              ))}
            </>
          )}

          {theme === 'default' && (
            <>
              <div className="cloud-drift-slow absolute -top-24 -right-20 w-[440px] h-[440px] rounded-full bg-sky-400/15 blur-3xl" />
              <div className="cloud-drift-fast absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full bg-indigo-400/15 blur-3xl" />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
