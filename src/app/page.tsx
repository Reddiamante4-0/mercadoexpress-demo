"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  ShieldCheck, 
  Rocket,
  ChevronRight,
  ChevronLeft,
  Star,
  Sparkles,
  Award,
  Volume2,
  VolumeX,
  Check,
  Zap,
  Play,
  Droplets,
  GlassWater,
  Share2,
  Copy,
  QrCode,
  UserPlus,
  User,
  Activity,
  HeartHandshake,
  Wallet,
  PiggyBank,
  Coins,
  CircleDollarSign
} from 'lucide-react';

// ==========================================
// AUDIO SYNTHESIS & PLAYBACK
// ==========================================
let globalAudioCtx: AudioContext | null = null;
let isMuted = false;

const initAudio = () => {
  if (!globalAudioCtx) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      globalAudioCtx = new AudioContext();
    }
  }
  if (globalAudioCtx?.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

const playEpicFallback = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  
  // 1. Soft bass base (Drone)
  const bass = ctx.createOscillator();
  bass.type = 'triangle';
  bass.frequency.setValueAtTime(55, now); // Low A
  bass.frequency.linearRampToValueAtTime(110, now + 2.5);
  
  const bassGain = ctx.createGain();
  bassGain.gain.setValueAtTime(0, now);
  bassGain.gain.linearRampToValueAtTime(0.3, now + 1);
  bassGain.gain.linearRampToValueAtTime(0.3, now + 2.5);
  bassGain.gain.exponentialRampToValueAtTime(0.01, now + 3.5);
  bass.connect(bassGain).connect(gain);
  bass.start(now);
  bass.stop(now + 3.5);

  // 2. Electronic arpeggio
  const arp = ctx.createOscillator();
  arp.type = 'square';
  const arpGain = ctx.createGain();
  arp.connect(arpGain).connect(gain);
  
  const notes = [220, 277, 330, 440, 554, 659, 880, 1108, 1318]; // A major pentatonic extended
  let t = now;
  notes.forEach((freq) => {
    if (t < now + 2.0) {
      arp.frequency.setValueAtTime(freq, t);
      arpGain.gain.setValueAtTime(0, t);
      arpGain.gain.linearRampToValueAtTime(0.08, t + 0.05);
      arpGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      t += 0.2;
    }
  });
  arp.start(now);
  arp.stop(now + 2.2);
  
  // 3. Rapid energy rise (sweep)
  const sweep = ctx.createOscillator();
  sweep.type = 'sawtooth';
  sweep.frequency.setValueAtTime(100, now + 1.5);
  sweep.frequency.exponentialRampToValueAtTime(1200, now + 2.5);
  
  const sweepGain = ctx.createGain();
  sweepGain.gain.setValueAtTime(0, now + 1.5);
  sweepGain.gain.linearRampToValueAtTime(0.15, now + 2.5);
  sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 2.6);
  sweep.connect(sweepGain).connect(gain);
  sweep.start(now + 1.5);
  sweep.stop(now + 3.0);

  // 4. Final Hit at exactly 2.5s (Syncs with visual flash)
  const hit = ctx.createOscillator();
  hit.type = 'sine';
  hit.frequency.setValueAtTime(150, now + 2.5);
  hit.frequency.exponentialRampToValueAtTime(20, now + 3.5);
  
  const hitGain = ctx.createGain();
  hitGain.gain.setValueAtTime(0, now + 2.49);
  hitGain.gain.setValueAtTime(0.6, now + 2.5);
  hitGain.gain.exponentialRampToValueAtTime(0.01, now + 4.0);
  hit.connect(hitGain).connect(gain);
  hit.start(now + 2.5);
  hit.stop(now + 4.0);
};

const playEpicIntro = () => {
  if (isMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  try {
    const audio = new Audio('/audio/evolux-intro.mp3');
    audio.volume = 0.6;
    audio.play().catch(e => {
      console.log("Intro audio file missing or blocked, using Web Audio fallback.");
      playEpicFallback(ctx);
    });
  } catch (e) {
    console.log("Audio playback error:", e);
    playEpicFallback(ctx);
  }
};

const playSound = (type: 'slide' | 'success' | 'epic-win' | 'click' | 'water' | 'team-win' | 'coins') => {
  if (isMuted) return;
  const ctx = initAudio();
  if (!ctx) return;
  
  try {
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'epic-win') {
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.1, now + 0.1);
        env.gain.exponentialRampToValueAtTime(0.01, now + 2);
        
        osc.connect(env).connect(gain);
        osc.start(now);
        osc.stop(now + 2);
      });
      
      const sweep = ctx.createOscillator();
      sweep.type = 'sine';
      sweep.frequency.setValueAtTime(800, now);
      sweep.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
      
      const sweepGain = ctx.createGain();
      sweepGain.gain.setValueAtTime(0, now);
      sweepGain.gain.linearRampToValueAtTime(0.1, now + 0.1);
      sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      sweep.connect(sweepGain).connect(gain);
      sweep.start(now);
      sweep.stop(now + 0.5);
    } else if (type === 'team-win') {
      const freqs = [330, 415.3, 493.88, 659.25, 830.61]; // E Major chord
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.12, now + 0.1);
        env.gain.exponentialRampToValueAtTime(0.01, now + 2.5);
        
        osc.connect(env).connect(gain);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } else if (type === 'coins') {
      // Rapid metallic clinking sounds
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200 + Math.random() * 800, now + i * 0.1);
        
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, now + i * 0.1);
        env.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.02);
        env.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
        
        osc.connect(env).connect(gain);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
      }
      
      // Underlying victory chord for financial success
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + 0.3);
        
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, now + 0.3);
        env.gain.linearRampToValueAtTime(0.08, now + 0.4);
        env.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        
        osc.connect(env).connect(gain);
        osc.start(now + 0.3);
        osc.stop(now + 1.5);
      });
    } else if (type === 'slide') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
      
      const slideGain = ctx.createGain();
      slideGain.gain.setValueAtTime(0, now);
      slideGain.gain.linearRampToValueAtTime(0.05, now + 0.05);
      slideGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      osc.connect(slideGain).connect(gain);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.1);
      osc.frequency.setValueAtTime(659.25, now + 0.2);
      osc.frequency.setValueAtTime(880, now + 0.3);
      
      const sGain = ctx.createGain();
      sGain.gain.setValueAtTime(0, now);
      sGain.gain.linearRampToValueAtTime(0.05, now + 0.05);
      sGain.gain.exponentialRampToValueAtTime(0.01, now + 1);
      
      osc.connect(sGain).connect(gain);
      osc.start(now);
      osc.stop(now + 1);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      
      const cGain = ctx.createGain();
      cGain.gain.setValueAtTime(0, now);
      cGain.gain.linearRampToValueAtTime(0.05, now + 0.02);
      cGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      osc.connect(cGain).connect(gain);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'water') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 2);
      
      const wGain = ctx.createGain();
      wGain.gain.setValueAtTime(0, now);
      wGain.gain.linearRampToValueAtTime(0.05, now + 1);
      wGain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);
      
      osc.connect(wGain).connect(gain);
      osc.start(now);
      osc.stop(now + 2.5);
    }
  } catch (e) {
    console.log("Audio play failed", e);
  }
};

// ==========================================
// DATA
// ==========================================
const slides = [
  {
    id: 1,
    title: "Bienvenido a una nueva forma de crecer",
    text: "Aquí vas a aprender, avanzar y mejorar jugando. Cada pequeña acción contará como una victoria en tu camino hacia una vida más saludable, consciente y próspera.",
    icon: <Gamepad2 className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.9)] group-hover:scale-110 transition-transform duration-500" />,
    color: "from-cyan-500 to-blue-600"
  },
  {
    id: 2,
    title: "Cumple misiones y gana recompensas",
    text: "Cada actividad completada te permitirá ganar experiencia, estrellas, insignias y premios digitales que irás desbloqueando durante tu recorrido.",
    icon: <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.9)] group-hover:scale-110 transition-transform duration-500" />,
    color: "from-yellow-400 to-orange-500"
  },
  {
    id: 3,
    title: "Crecer es mejor en equipo",
    text: "Podrás invitar a otras personas, formar tu propio equipo y realizar actividades juntos. Cada invitado quedará vinculado a ti para que puedan crecer, apoyarse y avanzar como comunidad.",
    icon: <Users className="w-20 h-20 text-pink-400 drop-shadow-[0_0_20px_rgba(244,114,182,0.9)] group-hover:scale-110 transition-transform duration-500" />,
    color: "from-pink-500 to-rose-600"
  },
  {
    id: 4,
    title: "Tu honestidad es la regla principal",
    text: "Nadie puede comprobar completamente cada actividad que realizas. Por eso, este juego se basa en un pacto personal: confirmar solamente las misiones que hayas cumplido de verdad.",
    icon: <ShieldCheck className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.9)] group-hover:scale-110 transition-transform duration-500" />,
    color: "from-emerald-400 to-teal-600"
  },
  {
    id: 5,
    title: "Del juego a una oportunidad real",
    text: "Aquí no solo ganarás puntos, estrellas y premios digitales.\n\nTambién podrás descubrir una oportunidad real y voluntaria para generar ingresos en la vida real, aplicando lo que aprendas dentro del juego.",
    highlight: "Pasa de recompensas digitales a una experiencia real de crecimiento personal y financiero.",
    footer: "Los ingresos no provienen del juego ni están garantizados. Dependen de tu decisión, participación y trabajo dentro del proyecto.",
    icon: <Rocket className="w-20 h-20 text-violet-400 drop-shadow-[0_0_20px_rgba(167,139,250,0.9)] group-hover:scale-110 transition-transform duration-500" />,
    color: "from-violet-500 to-purple-700"
  }
];

const teamActivities = [
  "Tomar un vaso de agua.",
  "Caminar durante cinco minutos.",
  "Escribir una meta personal.",
  "Compartir algo por lo que sienten gratitud.",
  "Identificar un gasto que podrían evitar."
];

// ==========================================
// BACKGROUND COMPONENTS
// ==========================================
const GlowingOrb = ({ className }: { className: string }) => (
  <div className={`absolute rounded-full mix-blend-screen filter blur-[80px] opacity-50 animate-pulse-slow pointer-events-none ${className}`} />
);

const FloatingStar = ({ className, delay = "0s", duration = "3s" }: { className: string, delay?: string, duration?: string }) => (
  <div 
    className={`absolute animate-float pointer-events-none ${className}`}
    style={{ animationDelay: delay, animationDuration: duration }}
  >
    <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-200 opacity-80 shadow-[0_0_10px_yellow]" fill="currentColor" />
  </div>
);

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(20)].map((_, i) => (
      <div 
        key={i}
        className="absolute w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_5px_cyan] animate-rise"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100 + 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${Math.random() * 3 + 4}s`,
          opacity: Math.random() * 0.5 + 0.2
        }}
      />
    ))}
  </div>
);

const Confetti = ({ colors = ['#22d3ee', '#facc15', '#f472b6', '#a78bfa', '#34d399'] }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-40">
    {[...Array(50)].map((_, i) => (
      <div 
        key={i}
        className="absolute w-2 h-2 rounded-full animate-confetti"
        style={{
          left: '50%',
          top: '50%',
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          '--tx': `${(Math.random() - 0.5) * 500}px`,
          '--ty': `${(Math.random() - 0.5) * 500 - 200}px`,
          animationDelay: `${Math.random() * 0.2}s`,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

const WaterDrops = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-40">
    {[...Array(15)].map((_, i) => (
      <div 
        key={`drop-${i}`}
        className="absolute bg-cyan-300 rounded-full opacity-60 animate-drop-fall shadow-[0_0_8px_cyan]"
        style={{
          width: `${Math.random() * 4 + 4}px`,
          height: `${Math.random() * 8 + 8}px`,
          left: `${Math.random() * 100}%`,
          top: `-20px`,
          animationDelay: `${Math.random() * 1}s`,
          animationDuration: `${Math.random() * 1 + 1}s`,
        }}
      />
    ))}
  </div>
);

const CoinDrops = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-40">
    {[...Array(20)].map((_, i) => (
      <div 
        key={`coin-${i}`}
        className="absolute rounded-full border border-yellow-400 bg-gradient-to-b from-yellow-300 to-yellow-600 shadow-[0_0_10px_yellow] flex items-center justify-center animate-drop-fall"
        style={{
          width: `${Math.random() * 10 + 15}px`,
          height: `${Math.random() * 10 + 15}px`,
          left: `${Math.random() * 100}%`,
          top: `-50px`,
          animationDelay: `${Math.random() * 1.5}s`,
          animationDuration: `${Math.random() * 1.5 + 1}s`,
        }}
      >
        <div className="w-[60%] h-[60%] rounded-full border border-yellow-200/50"></div>
      </div>
    ))}
  </div>
);

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function EvoluxWelcome() {
  const [viewState, setViewState] = useState<
    'pre-intro' | 'intro' | 'carousel' | 
    'activity1' | 'celebration1' | 
    'activity2' | 'celebration2' | 
    'activity3' | 'celebration3' | 
    'activity4-setup' | 'activity4-progress' | 'celebration4' | 
    'activity5-setup' | 'activity5-result' | 'celebration5' | 
    'next'
  >('pre-intro');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flash, setFlash] = useState(false);
  const [muted, setMuted] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  
  // Act 1 States
  const [pactChecked, setPactChecked] = useState(false);
  const [celebrationStep, setCelebrationStep] = useState(0);
  
  // Act 2 States
  const [fillingGlass, setFillingGlass] = useState(false);
  const [glassFilled, setGlassFilled] = useState(false);

  // Act 4 States
  const [selectedAct, setSelectedAct] = useState<number | null>(null);
  const [alexState, setAlexState] = useState<'idle' | 'inviting' | 'accepted'>('idle');
  const [userCompletedAct4, setUserCompletedAct4] = useState(false);
  const [alexCompletedAct4, setAlexCompletedAct4] = useState(false);

  // Act 5 States
  const [expense1, setExpense1] = useState({ name: '', amount: '' });
  const [expense2, setExpense2] = useState({ name: '', amount: '' });
  const [expense3, setExpense3] = useState({ name: '', amount: '' });
  const [avoidable, setAvoidable] = useState<string | null>(null);
  const [act5Step, setAct5Step] = useState(1);

  const canGoNextAct5 = () => {
    if (act5Step === 1) return expense1.name.trim() !== '' && expense1.amount.trim() !== '';
    if (act5Step === 2) return expense2.name.trim() !== '' && expense2.amount.trim() !== '';
    if (act5Step === 3) return expense3.name.trim() !== '' && expense3.amount.trim() !== '';
    if (act5Step === 4) return avoidable !== null;
    return false;
  };

  const handleStartIntro = () => {
    initAudio();
    playEpicIntro();
    setViewState('intro');
    
    setTimeout(() => setFlash(true), 2500); 
    setTimeout(() => {
      setViewState('carousel');
      setFlash(false);
    }, 3500);
  };

  const triggerFlash = (duration = 200) => {
    setFlash(true);
    setTimeout(() => setFlash(false), duration);
  };

  const handleToggleMute = () => {
    setMuted(toggleMute());
    playSound('click');
  };

  // ------------------------------------
  // NAVIGATION CONTROLS
  // ------------------------------------
  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1 && !isAnimating) {
      playSound('slide');
      setIsAnimating(true);
      triggerFlash();
      setCurrentSlide(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 600);
    }
  }, [currentSlide, isAnimating]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0 && !isAnimating) {
      playSound('slide');
      setIsAnimating(true);
      triggerFlash();
      setCurrentSlide(prev => prev - 1);
      setTimeout(() => setIsAnimating(false), 600);
    }
  }, [currentSlide, isAnimating]);

  const navigateTo = (view: any, delay = 300) => {
    playSound('click');
    triggerFlash(delay);
    setTimeout(() => setViewState(view), delay);
  };

  // ------------------------------------
  // ACTIVITY HANDLERS
  // ------------------------------------
  const handleAcceptPact = () => {
    playSound('epic-win');
    setTotalXP(20);
    setViewState('celebration1');
    setCelebrationStep(0);
    
    setTimeout(() => setCelebrationStep(1), 500);
    setTimeout(() => setCelebrationStep(2), 1500);
    setTimeout(() => setCelebrationStep(3), 3000);
  };

  const handleStartAct2 = () => {
    playSound('water');
    setFillingGlass(true);
    setTimeout(() => setGlassFilled(true), 2500);
  };

  const handleConfirmWater = () => {
    playSound('epic-win');
    setTotalXP(35);
    setViewState('celebration2');
    setCelebrationStep(0);
    
    setTimeout(() => setCelebrationStep(1), 500);
    setTimeout(() => setCelebrationStep(2), 1500);
    setTimeout(() => setCelebrationStep(3), 3000);
  };

  const handleSimulateInvite = () => {
    playSound('epic-win');
    setTotalXP(85);
    setViewState('celebration3');
    setCelebrationStep(0);
    
    setTimeout(() => setCelebrationStep(1), 500);
    setTimeout(() => setCelebrationStep(2), 1500);
    setTimeout(() => setCelebrationStep(3), 3000);
  };

  const handleInviteToMission = () => {
    playSound('click');
    setAlexState('inviting');
    setTimeout(() => {
      playSound('success');
      setAlexState('accepted');
    }, 2000);
  };

  const checkTeamCompletion = (userDone: boolean, alexDone: boolean) => {
    if (userDone && alexDone) {
      setTimeout(() => {
        playSound('team-win');
        setTotalXP(115);
        setViewState('celebration4');
        setCelebrationStep(0);
        
        setTimeout(() => setCelebrationStep(1), 500);
        setTimeout(() => setCelebrationStep(2), 1500);
        setTimeout(() => setCelebrationStep(3), 3000);
      }, 500);
    }
  };

  const handleUserCompleteAct4 = () => {
    playSound('click');
    setUserCompletedAct4(true);
    checkTeamCompletion(true, alexCompletedAct4);
  };

  const handleAlexCompleteAct4 = () => {
    playSound('click');
    setAlexCompletedAct4(true);
    checkTeamCompletion(userCompletedAct4, true);
  };

  // ACT 5 Handlers
  const handleShowResultAct5 = () => {
    playSound('click');
    setViewState('activity5-result');
    setTimeout(() => {
       playSound('coins');
       setCelebrationStep(1); // triggers piggy bank animation inside result
    }, 500);
    
    // Auto transition to celebration after showing result for a few seconds
    setTimeout(() => {
       handleCelebrateAct5();
    }, 4500);
  };

  const handleCelebrateAct5 = () => {
    playSound('epic-win');
    setTotalXP(140);
    setViewState('celebration5');
    setCelebrationStep(0);
    
    setTimeout(() => setCelebrationStep(1), 500);
    setTimeout(() => setCelebrationStep(2), 1500);
    setTimeout(() => setCelebrationStep(3), 3000);
  };

  const getAct5Total = () => {
    const sum = (parseFloat(expense1.amount) || 0) + (parseFloat(expense2.amount) || 0) + (parseFloat(expense3.amount) || 0);
    return sum.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // ------------------------------------
  // RENDER HELPERS
  // ------------------------------------
  const SoundToggle = () => (
    <button 
      onClick={handleToggleMute}
      className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-800/80 border border-slate-600/50 flex items-center justify-center text-slate-300 hover:text-white backdrop-blur shadow-lg active:scale-90 transition-all"
    >
      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );

  const CommonBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
      <GlowingOrb className="top-10 left-10 w-72 h-72 bg-cyan-600" />
      <GlowingOrb className="bottom-20 right-10 w-96 h-96 bg-purple-700" />
      <GlowingOrb className="top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/30" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <Particles />
      <FloatingStar className="top-32 left-1/4" delay="0s" duration="4s" />
      <FloatingStar className="top-48 right-1/5" delay="1s" duration="5s" />
      <FloatingStar className="bottom-40 left-1/3" delay="0.5s" duration="3.5s" />
      <FloatingStar className="top-1/4 right-12" delay="1.5s" duration="4.5s" />
    </div>
  );

  // --------------------------------------------------------
  // VIEWS
  // --------------------------------------------------------

  if (viewState === 'pre-intro') {
    return (
      <main className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 to-black"></div>
        <Particles />
        <button 
          onClick={handleStartIntro}
          className="relative z-10 group flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-400/50 flex items-center justify-center mb-6 group-hover:scale-110 group-active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_50px_rgba(34,211,238,0.5)]">
            <Play className="w-10 h-10 text-cyan-400 ml-2 drop-shadow-[0_0_10px_cyan] animate-pulse" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-widest text-cyan-300 uppercase animate-pulse">
            Toca para entrar
          </span>
        </button>
      </main>
    );
  }

  if (viewState === 'intro') {
    return (
      <main className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center font-sans">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black"></div>
          <GlowingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500 animate-pulse-fast" />
          <GlowingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600 animate-spin-slow" />
          <Particles />
        </div>
        
        <div className="relative z-10 flex flex-col items-center animate-zoom-in">
          <div className="flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-cyan-400 animate-spin-slow drop-shadow-[0_0_15px_cyan]" />
            <h1 className="text-6xl md:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-500 uppercase drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] animate-pulse-fast">
              EVOLUX
            </h1>
            <Sparkles className="w-10 h-10 text-purple-400 animate-spin-reverse drop-shadow-[0_0_15px_purple]" />
          </div>
          <div className="mt-4 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-expand-x"></div>
        </div>

        <div className={`absolute inset-0 bg-white z-50 transition-opacity duration-300 ${flash ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes zoom-in { 0% { transform: scale(0.5); opacity: 0; filter: blur(20px); } 50% { opacity: 1; filter: blur(0px); } 100% { transform: scale(1.1); opacity: 1; } }
          .animate-zoom-in { animation: zoom-in 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          @keyframes expand-x { 0% { transform: scaleX(0); opacity: 0; } 100% { transform: scaleX(1); opacity: 1; } }
          .animate-expand-x { animation: expand-x 1.5s ease-out forwards; animation-delay: 0.5s; opacity: 0; }
        `}} />
      </main>
    );
  }

  if (viewState === 'carousel') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col selection:bg-cyan-500/30 touch-manipulation">
        <SoundToggle />
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-40' : 'opacity-0'}`}></div>
        <CommonBackground />

        <div className="relative z-20 w-full pt-12 pb-6 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse drop-shadow-[0_0_8px_cyan]" />
            <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 uppercase drop-shadow-[0_2px_10px_rgba(34,211,238,0.5)]">
              EVOLUX
            </h1>
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse drop-shadow-[0_0_8px_purple]" />
          </div>
          <p className="text-[13px] md:text-sm font-semibold text-slate-300 tracking-[0.2em] uppercase text-center px-4 opacity-80">
            Juega. Evoluciona. Transforma tu vida.
          </p>
        </div>

        <div className="relative z-10 flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-6 py-2">
          <div className="relative w-full h-[520px] md:h-[550px] perspective-1000">
            {slides.map((slide, index) => {
              const isActive = index === currentSlide;
              const isPrev = index < currentSlide;
              const isNext = index > currentSlide;
              
              let transform = "translateX(0) scale(1) rotateY(0deg)";
              let opacity = isActive ? 1 : 0;
              let zIndex = isActive ? 10 : 0;
              let filter = isActive ? "blur(0px)" : "blur(10px)";

              if (isPrev) transform = "translateX(-130%) scale(0.85) rotateY(-25deg)";
              else if (isNext) transform = "translateX(130%) scale(0.85) rotateY(25deg)";

              return (
                <div
                  key={slide.id}
                  className="absolute inset-0 w-full h-full transition-all duration-[600ms] cubic-bezier-out flex flex-col"
                  style={{ transform, opacity, zIndex, filter, pointerEvents: isActive ? 'auto' : 'none' }}
                >
                  <div className="relative w-full h-full rounded-[2rem] overflow-hidden backdrop-blur-2xl border border-slate-700/60 bg-slate-900/70 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col group">
                    <div className={`h-3 w-full bg-gradient-to-r ${slide.color}`}></div>
                    <div className={`absolute inset-0 bg-gradient-to-b ${slide.color} opacity-5 pointer-events-none`}></div>

                    <div className={`flex-1 flex flex-col items-center text-center custom-scrollbar ${slide.id === 5 ? 'overflow-hidden p-4 sm:p-6' : 'overflow-y-auto p-8'}`}>
                      <div className="relative mb-3 group-hover:-translate-y-1 transition-transform duration-500">
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-20 blur-2xl rounded-full animate-pulse-slow`}></div>
                        <div className={`relative rounded-full border border-slate-600/50 bg-slate-800/90 flex items-center justify-center shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] ${slide.id === 5 ? 'w-20 h-20' : 'w-32 h-32 mt-2 mb-5'}`}>
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/30 animate-spin-slow mix-blend-overlay"></div>
                          {slide.icon}
                        </div>
                      </div>

                      <h2 className={`font-bold text-white drop-shadow-md leading-tight ${slide.id === 5 ? 'text-xl mb-2' : 'text-2xl md:text-3xl mb-4'}`}>
                        {slide.title}
                      </h2>
                      
                      <p className={`text-slate-300 leading-snug whitespace-pre-line ${slide.id === 5 ? 'text-[13px] mb-2' : 'text-[15px] md:text-base leading-relaxed mb-4'}`}>
                        {slide.text}
                      </p>

                      {slide.highlight && (
                        <div className={`rounded-xl bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/30 text-orange-200 font-bold leading-snug shadow-[inset_0_0_20px_rgba(249,115,22,0.1)] w-full ${slide.id === 5 ? 'p-3 mt-1 mb-2 text-xs' : 'p-5 mt-2 mb-4 text-sm md:text-[15px] rounded-2xl'}`}>
                          {slide.highlight}
                        </div>
                      )}
                      
                      {slide.footer && (
                        <div className={`mt-auto text-cyan-300/80 font-medium italic border-t border-slate-700/50 w-full ${slide.id === 5 ? 'pt-2 text-[11px] leading-tight' : 'pt-2 text-[13px]'}`}>
                          {slide.footer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-20 w-full max-w-md mx-auto px-6 pb-16 pt-4 mt-auto">
          <div className="flex justify-center items-center gap-3 mb-8">
            {slides.map((_, index) => (
              <div 
                key={index}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  index === currentSlide 
                    ? "w-10 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.9)]" 
                    : index < currentSlide ? "w-4 bg-cyan-700/50" : "w-2 bg-slate-700"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            {currentSlide > 0 ? (
              <button
                onClick={prevSlide}
                disabled={isAnimating}
                className="w-16 h-16 shrink-0 rounded-full flex items-center justify-center bg-slate-800/80 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-90 active:bg-slate-600 shadow-xl backdrop-blur-md relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
              </button>
            ) : (
              <div className="w-16 h-16 shrink-0"></div>
            )}

            {currentSlide < slides.length - 1 ? (
              <button
                onClick={nextSlide}
                disabled={isAnimating}
                className="flex-1 h-16 rounded-[2rem] flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-lg md:text-xl shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 group-active:opacity-50 transition-opacity"></div>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                SIGUIENTE
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => navigateTo('activity1')}
                disabled={isAnimating}
                className="flex-1 h-16 rounded-[2rem] flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-purple-500 text-white font-black text-xs sm:text-[14px] md:text-lg shadow-[0_0_30px_rgba(192,38,211,0.6)] transition-all active:scale-95 px-2 relative overflow-hidden group leading-none"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 group-active:opacity-50 transition-opacity"></div>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-30 group-hover:animate-shine"></div>
                <span className="drop-shadow-md text-center">ACEPTO EL PACTO Y COMIENZO MI AVENTURA</span>
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------
  // MISSION 1
  // --------------------------------------------------------

  if (viewState === 'activity1') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation animate-fade-in">
        <SoundToggle />
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-40' : 'opacity-0'}`}></div>
        <CommonBackground />

        <div className="relative z-10 flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-6 py-12">
          <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black tracking-widest text-sm text-white drop-shadow-md">
                <ShieldCheck className="w-5 h-5" /> MISIÓN 1
              </div>
              <div className="bg-black/30 rounded-full px-3 py-1 flex items-center gap-1 text-yellow-300 font-bold text-xs border border-yellow-300/30">
                <Zap className="w-3 h-3 fill-current" /> +20 XP
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col">
              <h2 className="text-2xl font-black text-white mb-3 leading-tight">Mi pacto personal</h2>
              <p className="text-emerald-400 font-medium text-[15px] mb-4">
                Tu progreso comienza con una decisión: jugar con honestidad.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                En EVOLUX podrás ganar puntos, estrellas, niveles y premios digitales. Pero el verdadero valor del juego depende de confirmar solamente las actividades que realmente hayas cumplido.
              </p>

              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 mb-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-xl"></div>
                <ul className="text-slate-200 text-sm space-y-3 font-medium">
                  <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-400 shrink-0" /> Me comprometo a jugar con honestidad.</li>
                  <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-400 shrink-0" /> Confirmaré únicamente las misiones que realmente realice.</li>
                  <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-400 shrink-0" /> Acepto aprender, avanzar y ayudar a otras personas a crecer conmigo.</li>
                </ul>
              </div>

              <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-700/50 cursor-pointer hover:border-emerald-500/50 transition-colors bg-black/20">
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  <input 
                    type="checkbox" 
                    className="appearance-none w-6 h-6 border-2 border-slate-500 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                    checked={pactChecked}
                    onChange={(e) => {
                      setPactChecked(e.target.checked);
                      if (e.target.checked) playSound('click');
                    }}
                  />
                  {pactChecked && <Check className="absolute w-4 h-4 text-white pointer-events-none" />}
                </div>
                <span className="text-sm font-medium text-slate-300 select-none">
                  Me comprometo a confirmar solo lo que realmente cumpla.
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-md mx-auto px-6 pb-12">
          <button
            onClick={handleAcceptPact}
            disabled={!pactChecked}
            className={`w-full h-16 rounded-[2rem] flex items-center justify-center font-black text-lg transition-all relative overflow-hidden ${
              pactChecked ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 group' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-80'
            }`}
          >
            {pactChecked && (
              <>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
              </>
            )}
            ACEPTO MI PACTO
          </button>
        </div>
      </main>
    );
  }

  if (viewState === 'celebration1') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation items-center justify-center px-6 animate-fade-in">
        <SoundToggle />
        <CommonBackground />
        
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-1000 ${celebrationStep === 0 ? 'opacity-80' : 'opacity-0'}`}></div>
        {celebrationStep > 0 && <Confetti />}

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-10 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-slide-down text-center uppercase tracking-wider">
            ¡Primer logro desbloqueado!
          </h2>

          <div className={`transition-all duration-1000 ${celebrationStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="relative w-48 h-48 mb-8 mx-auto group">
              <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_yellow,inset_0_0_30px_yellow] bg-gradient-to-b from-yellow-700 to-yellow-900 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <Award className="w-24 h-24 text-yellow-300 drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black text-sm px-4 py-1 rounded-full whitespace-nowrap shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-yellow-300 uppercase tracking-wide">
                Jugador con propósito
              </div>
            </div>
          </div>

          <div className={`w-full max-w-xs transition-all duration-1000 delay-300 ${celebrationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-cyan-400 fill-current animate-bounce" />
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_cyan]">+20 XP</span>
            </div>
            
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-[20%] rounded-full shadow-[0_0_10px_cyan] transition-all duration-1000"></div>
            </div>
            <p className="text-center text-slate-400 text-xs mt-3 font-semibold tracking-wider">NIVEL 1 INICIADO</p>
          </div>

          <div className={`w-full mt-12 transition-all duration-1000 ${celebrationStep >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <p className="text-center text-emerald-300 font-medium mb-6 px-4">
              Tu aventura comienza con una decisión: ser honesto contigo mismo.
            </p>
            <button
              onClick={() => navigateTo('activity2')}
              className="w-full h-16 rounded-[2rem] flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-lg shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
              CONTINUAR MI AVENTURA
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------
  // MISSION 2
  // --------------------------------------------------------

  if (viewState === 'activity2') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation animate-fade-in">
        <SoundToggle />
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-40' : 'opacity-0'}`}></div>
        <CommonBackground />

        <div className="relative z-10 flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-6 py-12">
          <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black tracking-widest text-sm text-white drop-shadow-md">
                <GlassWater className="w-5 h-5" /> MISIÓN 2
              </div>
              <div className="bg-black/30 rounded-full px-3 py-1 flex items-center gap-1 text-yellow-300 font-bold text-xs border border-yellow-300/30">
                <Zap className="w-3 h-3 fill-current" /> +15 XP
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col items-center text-center">
              <h2 className="text-2xl font-black text-white mb-2 leading-tight uppercase">El vaso que activa tu día</h2>
              <p className="text-cyan-400 font-medium text-sm mb-6">
                Tu cuerpo necesita agua para comenzar. Esta misión solo requiere un minuto, pero representa tu primera acción consciente de bienestar.
              </p>
              
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6 w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
                <h3 className="text-lg font-bold text-white mb-4">Toma un vaso de agua.</h3>
                
                <div className="relative w-20 h-28 mx-auto border-4 border-white/20 rounded-b-2xl border-t-0 bg-white/5 overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <div className={`absolute bottom-0 left-0 w-full bg-cyan-400/80 transition-all duration-[2500ms] ease-in-out ${fillingGlass ? 'h-full' : 'h-0'}`}></div>
                </div>
              </div>

              {fillingGlass && !glassFilled && (
                <p className="text-slate-300 text-sm font-medium animate-pulse text-cyan-200">Llenando vaso...</p>
              )}
              {glassFilled && (
                <p className="text-slate-300 text-sm font-bold text-cyan-300 animate-slide-down">Toma un vaso de agua y vuelve para confirmar.</p>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-md mx-auto px-6 pb-12">
          {!fillingGlass ? (
            <button
              onClick={handleStartAct2}
              className="w-full h-16 rounded-[2rem] flex items-center justify-center font-black text-lg transition-all bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(34,211,238,0.4)] active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
              COMENZAR MISIÓN
            </button>
          ) : (
            <button
              onClick={handleConfirmWater}
              disabled={!glassFilled}
              className={`w-full h-16 rounded-[2rem] flex items-center justify-center font-black text-lg transition-all relative overflow-hidden ${
                glassFilled ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95 group' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-80'
              }`}
            >
              {glassFilled && (
                <>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                </>
              )}
              YA TOMÉ MI VASO DE AGUA
            </button>
          )}
        </div>
      </main>
    );
  }

  if (viewState === 'celebration2') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation items-center justify-center px-6 animate-fade-in">
        <SoundToggle />
        <CommonBackground />
        
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-1000 ${celebrationStep === 0 ? 'opacity-80' : 'opacity-0'}`}></div>
        {celebrationStep > 0 && <WaterDrops />}
        {celebrationStep > 0 && <Confetti />}

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 mb-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-slide-down text-center uppercase tracking-wider">
            ¡Misión Completada!
          </h2>

          <div className={`transition-all duration-1000 ${celebrationStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="flex gap-2 mb-8">
               <Star className="w-12 h-12 text-yellow-400 fill-current drop-shadow-[0_0_15px_yellow] animate-bounce" style={{animationDelay: '0s'}} />
               <Star className="w-12 h-12 text-yellow-400 fill-current drop-shadow-[0_0_15px_yellow] animate-bounce" style={{animationDelay: '0.2s'}} />
               <Star className="w-12 h-12 text-yellow-400 fill-current drop-shadow-[0_0_15px_yellow] animate-bounce" style={{animationDelay: '0.4s'}} />
            </div>
          </div>

          <div className={`w-full max-w-xs transition-all duration-1000 delay-300 ${celebrationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-cyan-400 fill-current animate-pulse" />
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_cyan]">+{totalXP - 20} XP</span>
            </div>
            
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-[35%] rounded-full shadow-[0_0_10px_cyan] transition-all duration-1000"></div>
            </div>
            <div className="flex justify-between text-slate-400 text-xs mt-2 font-bold px-1">
               <span>20 XP</span>
               <span className="text-cyan-400">{totalXP} XP Total</span>
            </div>
          </div>

          <div className={`w-full mt-12 transition-all duration-1000 ${celebrationStep >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <p className="text-center text-cyan-300 font-medium mb-6 px-4">
              Una pequeña acción puede ser el comienzo de un gran cambio.
            </p>
            <button
              onClick={() => navigateTo('activity3')}
              className="w-full h-16 rounded-[2rem] flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-black text-lg shadow-[0_0_30px_rgba(167,139,250,0.5)] transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
              CONTINUAR MI AVENTURA
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------
  // MISSION 3
  // --------------------------------------------------------

  if (viewState === 'activity3') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation animate-fade-in">
        <SoundToggle />
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-40' : 'opacity-0'}`}></div>
        <CommonBackground />

        <div className="relative z-10 flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-6 py-12">
          <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black tracking-widest text-sm text-white drop-shadow-md">
                <Users className="w-5 h-5" /> MISIÓN 3
              </div>
              <div className="bg-black/30 rounded-full px-3 py-1 flex items-center gap-1 text-yellow-300 font-bold text-xs border border-yellow-300/30">
                <Zap className="w-3 h-3 fill-current" /> +50 XP
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col items-center text-center">
              <h2 className="text-2xl font-black text-white mb-2 leading-tight uppercase">Invita a tu primer compañero</h2>
              <p className="text-pink-300 font-medium text-sm mb-6">
                Toda gran aventura se disfruta más cuando alguien avanza contigo. Invita a una persona para que forme parte de tu equipo.
              </p>
              
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 w-full relative overflow-hidden mb-6 flex flex-col gap-3">
                <button className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors rounded-xl py-3 text-sm font-bold text-white shadow-md w-full">
                  <Share2 className="w-4 h-4" /> COMPARTIR ENLACE
                </button>
                <button className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors rounded-xl py-3 text-sm font-bold text-white shadow-md w-full">
                  <Copy className="w-4 h-4" /> COPIAR CÓDIGO
                </button>
                <button className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors rounded-xl py-3 text-sm font-bold text-white shadow-md w-full">
                  <QrCode className="w-4 h-4" /> MOSTRAR QR
                </button>
              </div>

              <div className="flex items-center gap-2 justify-center text-slate-400 font-medium text-sm animate-pulse">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                Esperando a tu primer compañero...
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-md mx-auto px-6 pb-12">
          <button
            onClick={handleSimulateInvite}
            className="w-full h-16 rounded-[2rem] flex items-center justify-center font-black text-lg transition-all bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-[0_0_30px_rgba(244,114,182,0.4)] active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
            SIMULAR REGISTRO DE INVITADO
          </button>
        </div>
      </main>
    );
  }

  if (viewState === 'celebration3') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation items-center justify-center px-6 animate-fade-in">
        <SoundToggle />
        <CommonBackground />
        
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-1000 ${celebrationStep === 0 ? 'opacity-80' : 'opacity-0'}`}></div>
        {celebrationStep > 0 && <Confetti colors={['#f472b6', '#e879f9', '#facc15', '#fb7185']} />}

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 mb-8 drop-shadow-[0_0_20px_rgba(244,114,182,0.5)] animate-slide-down text-center uppercase tracking-wider">
            ¡Tu equipo acaba de crecer!
          </h2>

          <div className={`transition-all duration-1000 ${celebrationStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="relative w-40 h-40 mb-6 mx-auto group">
              <div className="absolute inset-0 bg-pink-400/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-pink-400 shadow-[0_0_30px_pink,inset_0_0_30px_pink] bg-gradient-to-b from-pink-600 to-pink-900 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <UserPlus className="w-20 h-20 text-pink-200 drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-pink-500 text-white font-black text-sm px-4 py-1 rounded-full whitespace-nowrap shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-pink-300 uppercase tracking-wide">
                Primer compañero
              </div>
            </div>
            
            <div className="flex gap-2 mb-6 justify-center">
               {[...Array(5)].map((_, i) => (
                 <Star key={i} className="w-8 h-8 text-yellow-400 fill-current drop-shadow-[0_0_15px_yellow] animate-bounce" style={{animationDelay: `${i * 0.1}s`}} />
               ))}
            </div>
          </div>

          <div className={`w-full max-w-xs transition-all duration-1000 delay-300 ${celebrationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-pink-400 fill-current animate-pulse" />
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-400 drop-shadow-[0_0_15px_pink]">+{totalXP - 35} XP</span>
            </div>
            
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
              <div className="h-full bg-gradient-to-r from-pink-400 to-rose-500 w-[85%] rounded-full shadow-[0_0_10px_pink] transition-all duration-1000"></div>
            </div>
            <div className="flex justify-between text-slate-400 text-xs mt-2 font-bold px-1">
               <span>35 XP</span>
               <span className="text-pink-400">{totalXP} XP Total</span>
            </div>
          </div>

          <div className={`w-full mt-12 transition-all duration-1000 ${celebrationStep >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <p className="text-center text-pink-300 font-medium mb-6 px-4">
              Hoy no solo ganaste puntos. Comenzaste a construir un equipo.
            </p>
            <button
              onClick={() => navigateTo('activity4-setup')}
              className="w-full h-16 rounded-[2rem] flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-lg shadow-[0_0_30px_rgba(244,114,182,0.5)] transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
              CONOCER A MI COMPAÑERO
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------
  // MISSION 4: TEAM ACTIVITY
  // --------------------------------------------------------

  if (viewState === 'activity4-setup') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation animate-fade-in">
        <SoundToggle />
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-40' : 'opacity-0'}`}></div>
        <CommonBackground />

        <div className="relative z-10 flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-4 py-8">
          <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black tracking-widest text-sm text-white drop-shadow-md">
                <HeartHandshake className="w-5 h-5" /> MISIÓN 4
              </div>
              <div className="bg-black/30 rounded-full px-3 py-1 flex flex-col items-end border border-yellow-300/30">
                 <div className="flex items-center gap-1 text-yellow-300 font-bold text-xs">
                   <Zap className="w-3 h-3 fill-current" /> +30 XP c/u
                 </div>
                 <div className="text-[9px] text-yellow-200/80 font-semibold tracking-wider uppercase mt-0.5">
                   Insignia: Primera victoria en equipo
                 </div>
              </div>
            </div>

            <div className="p-5 md:p-8 flex flex-col items-center">
              <h2 className="text-2xl font-black text-white mb-2 text-center leading-tight uppercase">Nuestra primera misión juntos</h2>
              <p className="text-violet-300 font-medium text-sm text-center mb-6 px-2">
                Tu equipo ya comenzó a crecer. Ahora es momento de compartir su primera pequeña victoria.
              </p>
              
              {/* Partner Card */}
              <div className="w-full bg-slate-800/60 rounded-2xl p-4 border border-violet-500/30 flex items-center gap-4 mb-6 shadow-inner relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-violet-500/20 to-transparent"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 p-0.5 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                      <User className="w-7 h-7 text-violet-300" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-400 uppercase tracking-wider text-[10px]">Nuevo Compañero</span>
                  <span className="text-lg font-bold text-white leading-tight">Alex</span>
                  <span className="text-emerald-400 text-xs font-semibold">Disponible para una misión</span>
                </div>
              </div>

              {/* Activity Selection */}
              <div className="w-full mb-2">
                <h3 className="text-slate-300 text-sm font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-400" /> Elige una actividad para ambos:
                </h3>
                <div className="space-y-2">
                  {teamActivities.map((act, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedAct(index);
                        playSound('click');
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${
                        selectedAct === index 
                          ? 'bg-violet-500/20 border-violet-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-md mx-auto px-6 pb-12">
          {alexState === 'idle' && (
            <button
              onClick={handleInviteToMission}
              disabled={selectedAct === null}
              className={`w-full h-16 rounded-[2rem] flex items-center justify-center font-black text-lg transition-all relative overflow-hidden ${
                selectedAct !== null ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-95 group' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-80'
              }`}
            >
              {selectedAct !== null && (
                <>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                </>
              )}
              INVITAR A LA MISIÓN
            </button>
          )}

          {alexState === 'inviting' && (
             <div className="w-full h-16 rounded-[2rem] flex items-center justify-center gap-3 bg-slate-800 border border-violet-500/50 text-violet-300 font-bold text-lg shadow-[0_0_20px_rgba(139,92,246,0.3)]">
               <div className="w-5 h-5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin"></div>
               Invitación enviada...
             </div>
          )}

          {alexState === 'accepted' && (
            <div className="animate-slide-down">
              <p className="text-center text-emerald-400 font-bold mb-3 animate-pulse">¡Alex aceptó la misión!</p>
              <button
                onClick={() => navigateTo('activity4-progress')}
                className="w-full h-16 rounded-[2rem] flex items-center justify-center font-black text-lg transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                COMENZAR MISIÓN JUNTOS
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (viewState === 'activity4-progress') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation animate-fade-in">
        <SoundToggle />
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-40' : 'opacity-0'}`}></div>
        <CommonBackground />

        <div className="relative z-10 flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-4 py-8">
          <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black tracking-widest text-sm text-white drop-shadow-md">
                <HeartHandshake className="w-5 h-5" /> MISIÓN EN CURSO
              </div>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="bg-slate-800/80 rounded-xl p-4 border border-violet-500/30 text-center w-full mb-6">
                <span className="text-xs text-violet-400 font-bold uppercase tracking-wider block mb-1">Actividad actual</span>
                <span className="text-lg font-bold text-white">{selectedAct !== null ? teamActivities[selectedAct] : ''}</span>
              </div>

              {/* Dual Progress Panels */}
              <div className="flex gap-4 w-full mb-2">
                {/* User Panel */}
                <div className={`flex-1 rounded-2xl p-4 border transition-colors flex flex-col items-center text-center ${userCompletedAct4 ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/50 border-slate-700'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${userCompletedAct4 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {userCompletedAct4 ? <Check className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <span className="text-sm font-bold text-white mb-1">Tú</span>
                  <span className={`text-[11px] font-semibold uppercase ${userCompletedAct4 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {userCompletedAct4 ? 'Completado' : 'Pendiente'}
                  </span>
                </div>

                {/* Divider Line */}
                <div className="flex flex-col justify-center relative">
                   <div className="w-px h-full bg-gradient-to-b from-transparent via-violet-500/50 to-transparent"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 border border-violet-500/50 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-violet-400" />
                   </div>
                </div>

                {/* Alex Panel */}
                <div className={`flex-1 rounded-2xl p-4 border transition-colors flex flex-col items-center text-center ${alexCompletedAct4 ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/50 border-slate-700'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${alexCompletedAct4 ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'}`}>
                    {alexCompletedAct4 ? <Check className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <span className="text-sm font-bold text-white mb-1">Alex</span>
                  <span className={`text-[11px] font-semibold uppercase ${alexCompletedAct4 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {alexCompletedAct4 ? 'Completado' : 'Pendiente'}
                  </span>
                </div>
              </div>
              
              {(!userCompletedAct4 || !alexCompletedAct4) && (
                <p className="text-xs text-slate-400 text-center mt-4">La misión se completará cuando ambos confirmen.</p>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-md mx-auto px-6 pb-12 flex flex-col gap-3">
          {!userCompletedAct4 && (
            <button
              onClick={handleUserCompleteAct4}
              className="w-full h-14 rounded-[1.5rem] flex items-center justify-center font-black text-base transition-all bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              YA CUMPLÍ MI PARTE
            </button>
          )}
          
          {!alexCompletedAct4 && (
            <button
              onClick={handleAlexCompleteAct4}
              className="w-full h-14 rounded-[1.5rem] flex items-center justify-center font-bold text-sm transition-all bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 active:scale-95"
            >
              SIMULAR QUE ALEX CUMPLIÓ
            </button>
          )}

          {(userCompletedAct4 && alexCompletedAct4) && (
             <div className="w-full h-16 rounded-[2rem] flex items-center justify-center font-black text-lg text-emerald-400 bg-emerald-900/40 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
               Misión Completada...
             </div>
          )}
        </div>
      </main>
    );
  }

  if (viewState === 'celebration4') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation items-center justify-center px-6 animate-fade-in">
        <SoundToggle />
        <CommonBackground />
        
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-1000 ${celebrationStep === 0 ? 'opacity-80' : 'opacity-0'}`}></div>
        {celebrationStep > 0 && <Confetti colors={['#8b5cf6', '#3b82f6', '#facc15', '#a855f7']} />}

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-8 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)] animate-slide-down text-center uppercase tracking-wider leading-tight">
            ¡Victoria en equipo!
          </h2>

          <div className={`transition-all duration-1000 ${celebrationStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="relative flex justify-center items-center h-32 w-full mb-8">
              <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full animate-pulse"></div>
              
              <div className="z-10 w-20 h-20 rounded-full border-4 border-blue-400 shadow-[0_0_20px_blue] bg-slate-800 flex items-center justify-center -mr-4 transform hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-blue-300" />
              </div>
              
              <div className="z-20 w-16 h-16 rounded-full border-4 border-yellow-400 shadow-[0_0_20px_yellow,inset_0_0_20px_yellow] bg-gradient-to-b from-yellow-500 to-yellow-700 flex items-center justify-center animate-bounce">
                <Trophy className="w-8 h-8 text-yellow-100 drop-shadow-md" />
              </div>

              <div className="z-10 w-20 h-20 rounded-full border-4 border-violet-400 shadow-[0_0_20px_violet] bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center -ml-4 transform hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-white" />
              </div>

              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black text-[10px] sm:text-xs px-4 py-1.5 rounded-full whitespace-nowrap shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-violet-300 uppercase tracking-widest z-30">
                Primera victoria en equipo
              </div>
            </div>
            
            <div className="flex gap-2 mb-6 justify-center">
               {[...Array(5)].map((_, i) => (
                 <Star key={`s-${i}`} className="w-8 h-8 text-yellow-400 fill-current drop-shadow-[0_0_15px_yellow] animate-bounce" style={{animationDelay: `${i * 0.15}s`}} />
               ))}
            </div>
          </div>

          <div className={`w-full max-w-xs transition-all duration-1000 delay-300 ${celebrationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-violet-400 fill-current animate-pulse" />
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 drop-shadow-[0_0_15px_violet]">
                +30 XP <span className="text-xl">C/U</span>
              </span>
            </div>
            
            <div className="space-y-3">
               <div>
                 <div className="flex justify-between text-slate-300 text-[10px] font-bold px-1 mb-1 uppercase tracking-wider">
                   <span>Tu Progreso</span>
                   <span className="text-blue-400">{totalXP} XP</span>
                 </div>
                 <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                   <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-[100%] rounded-full shadow-[0_0_10px_blue] animate-expand-x origin-left"></div>
                 </div>
               </div>
               
               <div>
                 <div className="flex justify-between text-slate-300 text-[10px] font-bold px-1 mb-1 uppercase tracking-wider">
                   <span>Progreso de Alex</span>
                   <span className="text-violet-400">30 XP</span>
                 </div>
                 <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                   <div className="h-full bg-gradient-to-r from-violet-400 to-purple-500 w-[20%] rounded-full shadow-[0_0_10px_violet] animate-expand-x origin-left"></div>
                 </div>
               </div>
            </div>
          </div>

          <div className={`w-full mt-10 transition-all duration-1000 ${celebrationStep >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <p className="text-center text-violet-300 font-medium mb-6 px-4">
              Cuando dos personas avanzan juntas, cada pequeña acción se vuelve más poderosa.
            </p>
            <button
              onClick={() => navigateTo('activity5-setup')}
              className="w-full h-16 rounded-[2rem] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-black text-lg shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
              SEGUIR CRECIENDO JUNTOS
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------
  // MISSION 5: FINANCES
  // --------------------------------------------------------

  if (viewState === 'activity5-setup') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation animate-fade-in custom-scrollbar">
        <SoundToggle />
        <div className={`fixed inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-40' : 'opacity-0'}`}></div>
        
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
          <GlowingOrb className="top-1/4 right-1/4 w-80 h-80 bg-emerald-700/40" />
          <GlowingOrb className="bottom-1/4 left-1/4 w-96 h-96 bg-blue-800/30" />
          <Particles />
        </div>

        <div className="relative z-10 flex-1 w-full max-w-md mx-auto flex flex-col justify-start px-4 py-8 mt-4">
          <div className="w-full flex items-center justify-between mb-4 px-2">
            {act5Step > 1 ? (
              <button 
                onClick={() => { playSound('click'); setAct5Step(prev => prev - 1); }}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            ) : <div className="w-10 h-10"></div>}
            <div className="bg-emerald-900/50 border border-emerald-500/50 px-4 py-1.5 rounded-full text-emerald-400 font-bold text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              PASO {act5Step} DE 5
            </div>
            <div className="w-10 h-10"></div>
          </div>

          <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col mb-8">
            <div className="bg-gradient-to-r from-emerald-600 to-blue-700 p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2 font-black tracking-widest text-sm text-white drop-shadow-md">
                <Wallet className="w-5 h-5" /> MISIÓN 5
              </div>
              <div className="bg-black/30 rounded-full px-3 py-1 flex flex-col items-end border border-yellow-300/30">
                 <div className="flex items-center gap-1 text-yellow-300 font-bold text-xs">
                   <Zap className="w-3 h-3 fill-current" /> +25 XP
                 </div>
              </div>
            </div>

            <div className="p-6 flex flex-col">
              {act5Step === 1 && (
                <div className="animate-slide-down">
                  <h2 className="text-2xl font-black text-white mb-2 text-center uppercase drop-shadow-md">Gasto 1 de 3</h2>
                  <p className="text-emerald-300 font-medium text-sm text-center mb-6">Registra tu primer gasto reciente.</p>
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                    <input type="text" placeholder="¿Qué compraste?" value={expense1.name} onChange={e => setExpense1({...expense1, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 text-sm mb-4 focus:border-emerald-500 outline-none" />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input type="number" placeholder="¿Cuánto pagaste?" value={expense1.amount} onChange={e => setExpense1({...expense1, amount: e.target.value})} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 pl-8 text-sm focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {act5Step === 2 && (
                <div className="animate-slide-down">
                  <h2 className="text-2xl font-black text-white mb-2 text-center uppercase drop-shadow-md">Gasto 2 de 3</h2>
                  <p className="text-emerald-300 font-medium text-sm text-center mb-6">Registra tu segundo gasto.</p>
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                    <input type="text" placeholder="¿Qué compraste?" value={expense2.name} onChange={e => setExpense2({...expense2, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 text-sm mb-4 focus:border-emerald-500 outline-none" />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input type="number" placeholder="¿Cuánto pagaste?" value={expense2.amount} onChange={e => setExpense2({...expense2, amount: e.target.value})} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 pl-8 text-sm focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {act5Step === 3 && (
                <div className="animate-slide-down">
                  <h2 className="text-2xl font-black text-white mb-2 text-center uppercase drop-shadow-md">Gasto 3 de 3</h2>
                  <p className="text-emerald-300 font-medium text-sm text-center mb-6">Registra el último gasto.</p>
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                    <input type="text" placeholder="¿Qué compraste?" value={expense3.name} onChange={e => setExpense3({...expense3, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 text-sm mb-4 focus:border-emerald-500 outline-none" />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input type="number" placeholder="¿Cuánto pagaste?" value={expense3.amount} onChange={e => setExpense3({...expense3, amount: e.target.value})} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 pl-8 text-sm focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {act5Step === 4 && (
                <div className="animate-slide-down">
                  <h2 className="text-xl font-black text-white mb-6 text-center leading-tight drop-shadow-md">
                    ¿Alguno de estos gastos podrías haberlo evitado o reducido?
                  </h2>
                  <div className="flex flex-col gap-3">
                    {['Sí', 'No', 'No estoy seguro'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => { setAvoidable(opt); playSound('click'); }}
                        className={`w-full py-4 px-4 text-sm font-bold rounded-xl border transition-all ${avoidable === opt ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-[1.02]' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full pb-8">
            <button
              onClick={() => {
                if (act5Step < 4) {
                  playSound('slide');
                  setAct5Step(prev => prev + 1);
                } else {
                  handleShowResultAct5();
                }
              }}
              disabled={!canGoNextAct5()}
              className={`w-full h-16 rounded-[2rem] flex items-center justify-center font-black text-lg transition-all relative overflow-hidden ${
                canGoNextAct5() ? 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 group' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-80'
              }`}
            >
              {canGoNextAct5() && (
                <>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                </>
              )}
              {act5Step < 4 ? 'CONTINUAR' : 'DESCUBRIR MI RESULTADO'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (viewState === 'activity5-result') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation animate-fade-in items-center justify-start px-4 pt-12">
        <SoundToggle />
        <CommonBackground />
        
        {celebrationStep > 0 && <CoinDrops />}

        <div className="w-full max-w-md mx-auto flex items-center justify-center mb-4">
            <div className="bg-emerald-900/50 border border-emerald-500/50 px-4 py-1.5 rounded-full text-emerald-400 font-bold text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              PASO 5 DE 5
            </div>
        </div>

        <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-emerald-500/50 p-8 rounded-[2rem] text-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-slide-down flex flex-col items-center">
          
          <h2 className="text-xl font-bold text-slate-300 mb-2">En estas tres decisiones utilizaste:</h2>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] mb-8">
            ${getAct5Total()}
          </div>

          <div className="relative w-32 h-32 mb-8 mx-auto">
             <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
             <PiggyBank className="w-full h-full text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-yellow-300 bg-yellow-400 flex items-center justify-center animate-drop-fall" style={{ animationDuration: '0.8s', animationIterationCount: 'infinite' }}>
               <CircleDollarSign className="w-5 h-5 text-yellow-800" />
             </div>
          </div>

          <p className="text-emerald-300 font-medium text-[15px] leading-relaxed">
            No se trata de sentir culpa. Se trata de conocer tus decisiones para poder mejorarlas.
          </p>
        </div>
      </main>
    );
  }

  if (viewState === 'celebration5') {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col touch-manipulation items-center justify-center px-6 animate-fade-in">
        <SoundToggle />
        <CommonBackground />
        
        <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-1000 ${celebrationStep === 0 ? 'opacity-80' : 'opacity-0'}`}></div>
        {celebrationStep > 0 && <CoinDrops />}
        {celebrationStep > 0 && <Confetti colors={['#10b981', '#facc15', '#34d399', '#fef08a']} />}

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 mb-8 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-slide-down text-center uppercase tracking-wider leading-tight">
            ¡Visión Desbloqueada!
          </h2>

          <div className={`transition-all duration-1000 ${celebrationStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="relative w-40 h-40 mb-6 mx-auto group">
              <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 shadow-[0_0_30px_emerald,inset_0_0_30px_emerald] bg-gradient-to-b from-emerald-600 to-emerald-900 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <Wallet className="w-20 h-20 text-emerald-200 drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs px-4 py-1.5 rounded-full whitespace-nowrap shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-emerald-300 uppercase tracking-widest">
                Observador financiero
              </div>
            </div>
            
            <div className="flex gap-2 mb-6 justify-center">
               {[...Array(4)].map((_, i) => (
                 <Star key={`s-${i}`} className="w-8 h-8 text-yellow-400 fill-current drop-shadow-[0_0_15px_yellow] animate-bounce" style={{animationDelay: `${i * 0.15}s`}} />
               ))}
            </div>
          </div>

          <div className={`w-full max-w-xs transition-all duration-1000 delay-300 ${celebrationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-emerald-400 fill-current animate-pulse" />
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-yellow-400 drop-shadow-[0_0_15px_emerald]">
                +25 XP
              </span>
            </div>
            
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-yellow-400 w-[100%] rounded-full shadow-[0_0_10px_emerald] transition-all duration-1000"></div>
            </div>
            <div className="flex justify-between text-slate-400 text-xs mt-2 font-bold px-1 uppercase tracking-wider">
               <span>115 XP</span>
               <span className="text-emerald-400">{totalXP} XP Total</span>
            </div>
          </div>

          <div className={`w-full mt-10 transition-all duration-1000 ${celebrationStep >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <p className="text-center text-emerald-300 font-medium mb-6 px-4">
              Cuando sabes en qué usas tu dinero, comienzas a tomar el control.
            </p>
            <button
              onClick={() => navigateTo('next')}
              className="w-full h-16 rounded-[2rem] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
              CONTINUAR MI AVENTURA
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Final placeholder
  return (
    <main className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col items-center justify-center px-6 animate-fade-in touch-manipulation">
      <CommonBackground />
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 p-8 rounded-[2rem] text-center shadow-[0_0_40px_rgba(16,211,153,0.2)]">
        <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-pulse drop-shadow-[0_0_10px_emerald]" />
        <h2 className="text-2xl font-black text-white mb-2">Próxima misión:</h2>
        <p className="text-xl font-bold text-emerald-300">Caminata consciente</p>
      </div>
    </main>
  );
}

// Global styles appended directly below component for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
    @keyframes slide-down { 0% { opacity: 0; transform: translateY(-30px); } 100% { opacity: 1; transform: translateY(0); } }
    .animate-slide-down { animation: slide-down 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    @keyframes confetti { 0% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) rotate(720deg); opacity: 0; } }
    .animate-confetti { animation: confetti 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
    @keyframes drop-fall { 0% { transform: translateY(-50px) scale(1); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(100vh) scale(0.5); opacity: 0; } }
    .animate-drop-fall { animation: drop-fall linear forwards; }
    .perspective-1000 { perspective: 1000px; }
    .cubic-bezier-out { transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.15); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 10px; }
    @keyframes shine { 100% { left: 125%; } }
    .animate-shine { animation: shine 1s; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
    .animate-float { animation: float infinite ease-in-out; }
    @keyframes rise { 0% { transform: translateY(0) scale(1); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(-100vh) scale(0); opacity: 0; } }
    .animate-rise { animation: rise linear infinite; }
    @keyframes pulse-slow { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
    .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
    @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
    @keyframes expand-x { 0% { transform: scaleX(0); opacity: 0; } 100% { transform: scaleX(1); opacity: 1; } }
    .animate-expand-x { animation: expand-x 1.5s ease-out forwards; opacity: 0; animation-delay: 0.5s; }
  `;
  document.head.appendChild(style);
}
