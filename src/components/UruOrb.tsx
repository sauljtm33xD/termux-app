import React from 'react';
// import { motion } from 'motion'; // TODO: Enable animations when motion/react is properly configured
import { AutonomousState, EmotionalState, UruTheme } from '../types';
import { Sparkles, Zap, Shield, Flame, Snowflake } from 'lucide-react';

interface UruOrbProps {
  theme: UruTheme;
  state: AutonomousState;
  emotion: EmotionalState;
  size?: number; // default 180dp
  interactive?: boolean;
  onClick?: () => void;
}

export const UruOrb: React.FC<UruOrbProps> = ({
  theme,
  state,
  emotion,
  size = 180,
  interactive = true,
  onClick,
}) => {
  // Theme Color Palettes based on Master Document
  const themeStyles = {
    fuego: {
      primary: '#FF6B35', // Naranja fuego
      secondary: '#FF4444', // Rojo
      accent: '#FFB84D', // Amarillo cálido
      glow: 'rgba(255, 107, 53, 0.45)',
      deepGlow: 'rgba(255, 68, 68, 0.25)',
      innerCore: 'radial-gradient(circle, #FFE4A0 0%, #FF6B35 50%, #B31E00 100%)',
      ringColor: '#FF944D',
      icon: Flame
    },
    azul_frio: {
      primary: '#0099FF', // Azul puro
      secondary: '#00D4FF', // Cian
      accent: '#E8E8E8', // Blanco hielo
      glow: 'rgba(0, 212, 255, 0.45)',
      deepGlow: 'rgba(0, 153, 255, 0.25)',
      innerCore: 'radial-gradient(circle, #FFFFFF 0%, #00D4FF 45%, #004D99 100%)',
      ringColor: '#66E0FF',
      icon: Snowflake
    },
    azul_electrico: {
      primary: '#0055FF', // Azul eléctrico
      secondary: '#38BDF8', // Rayos azules
      accent: '#FFFFFF', // Blanco puro
      glow: 'rgba(0, 85, 255, 0.55)',
      deepGlow: 'rgba(56, 189, 248, 0.35)',
      innerCore: 'radial-gradient(circle, #FFFFFF 0%, #38BDF8 40%, #002B99 100%)',
      ringColor: '#0055FF',
      icon: Zap
    }
  };

  const currentTheme = themeStyles[theme];

  // State-based pulse durations and scales
  const getPulsingSpeed = () => {
    switch (state) {
      case 'PROCESSING': return 0.8;
      case 'EXECUTING': return 0.6;
      case 'DECIDING': return 0.9;
      case 'LEARNING': return 1.2;
      case 'LISTENING': return 0.7;
      case 'ERROR': return 0.4;
      case 'AWAITING': return 1.5;
      default: return 2.0; // IDLE
    }
  };

  const getEmotionalBadge = () => {
    switch (emotion) {
      case 'HAPPY': return { label: 'HAPPY 95%+', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40' };
      case 'NORMAL': return { label: 'NORMAL 85%', color: 'text-sky-400 bg-sky-950/80 border-sky-500/40' };
      case 'STRESSED': return { label: 'STRESSED 55%', color: 'text-amber-400 bg-amber-950/80 border-amber-500/40' };
      case 'TIRED': return { label: 'TIRED 25%', color: 'text-rose-400 bg-rose-950/80 border-rose-500/40' };
    }
  };

  const emotionalBadge = getEmotionalBadge();
  const speed = getPulsingSpeed();

  return (
    <div 
      className="flex flex-col items-center justify-center relative select-none"
      style={{ width: size, height: size + 40 }}
      onClick={onClick}
    >
      {/* Outer Ambient Aura Glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: speed * 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute rounded-full pointer-events-none filter blur-2xl"
        style={{
          width: size * 1.2,
          height: size * 1.2,
          backgroundColor: currentTheme.glow,
        }}
      />

      {/* Rotating Energy Confinement Rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute rounded-full border border-dashed pointer-events-none"
        style={{
          width: size * 1.08,
          height: size * 1.08,
          borderColor: currentTheme.ringColor,
          opacity: 0.45,
        }}
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute rounded-full border border-dotted pointer-events-none"
        style={{
          width: size * 0.95,
          height: size * 0.95,
          borderColor: currentTheme.accent,
          opacity: 0.35,
        }}
      />

      {/* Main Core Orb Sphere */}
      <motion.div
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
        animate={{
          scale: state === 'PROCESSING' || state === 'EXECUTING' ? [1, 1.08, 0.98, 1] : [1, 1.04, 1],
          boxShadow: [
            `0 0 25px ${currentTheme.glow}, inset 0 0 20px ${currentTheme.secondary}`,
            `0 0 45px ${currentTheme.glow}, inset 0 0 30px ${currentTheme.accent}`,
            `0 0 25px ${currentTheme.glow}, inset 0 0 20px ${currentTheme.secondary}`,
          ]
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="rounded-full relative flex items-center justify-center shadow-2xl cursor-pointer overflow-hidden border-2 border-white/40 backdrop-blur-sm"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: currentTheme.innerCore,
        }}
      >
        {/* Shimmer Light Reflection overlay */}
        <div className="absolute top-2 left-3 w-1/3 h-1/3 rounded-full bg-white/40 filter blur-xs pointer-events-none" />

        {/* Dynamic Electric / Flame Particle Center */}
        <div className="flex flex-col items-center justify-center text-white drop-shadow-md z-10">
          <currentTheme.icon className="w-8 h-8 animate-pulse text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <span className="font-extrabold tracking-widest text-[11px] font-mono mt-1 text-white/90 drop-shadow">
            URU
          </span>
        </div>

        {/* Theme-specific texture animation */}
        {theme === 'fuego' && (
          <motion.div
            animate={{ y: [-5, 5, -5], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-t from-red-600/50 via-transparent to-yellow-300/30 pointer-events-none"
          />
        )}
        {theme === 'azul_electrico' && (
          <motion.div
            animate={{ opacity: [0.2, 0.9, 0.2, 0.8] }}
            transition={{ duration: 0.4, repeat: Infinity }}
            className="absolute inset-0 bg-[radial-gradient(circle,_#ffffff_10%,_transparent_60%)] pointer-events-none mix-blend-overlay"
          />
        )}
      </motion.div>

      {/* State & Emotion Indicators below Orb */}
      <div className="mt-3 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-200 border border-slate-700 font-mono shadow-sm">
            {state}
          </span>
          <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${emotionalBadge.color}`}>
            {emotion}
          </span>
        </div>
      </div>
    </div>
  );
};
