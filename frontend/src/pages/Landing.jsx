import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Radar, ShieldAlert, Network, BrainCircuit, Crosshair, Satellite, Globe2, Activity } from 'lucide-react';
export default function Landing() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);
  const coverageY = useTransform(scrollYProgress, [0.1, 0.3], [150, 0]);
  const coverageOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const aiScale = useTransform(scrollYProgress, [0.4, 0.6], [0.8, 1]);
  const aiOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  return (
    <div ref={containerRef} className="bg-transparent text-slate-100 font-sans selection:bg-skywatch-emerald/30 relative">
      {}
      {}
      {}
      <motion.section
        className="relative h-[100svh] flex flex-col items-center justify-center z-10 px-6"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col items-center text-center max-w-5xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-skywatch-emerald/30 bg-skywatch-emerald/5 text-skywatch-emerald text-xs font-mono tracking-[0.3em] uppercase animate-glow shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-skywatch-emerald animate-pulse"></span>
            ORBITAL NETWORK ONLINE
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-2xl">
            SKYWATCH
          </h1>
          <h2 className="text-2xl md:text-4xl font-light text-skywatch-emerald tracking-widest uppercase mb-8">
            Autonomous ISR
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12 font-mono leading-relaxed opacity-80">
            Persistent overhead threat detection. Edge AI processing. Tactical mesh coordination. Secure immutable blackbox logging.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="group relative px-8 py-4 bg-skywatch-bg/80 backdrop-blur-md border border-skywatch-emerald text-skywatch-emerald font-mono font-bold text-lg rounded overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-3 tracking-widest">
              <Radar className="w-5 h-5 group-hover:animate-spin" />
              INITIATE UPLINK
            </span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-skywatch-emerald/20 to-transparent -translate-x-full group-hover:animate-[scanline_1s_ease-in-out_infinite]"></div>
          </motion.button>
        </motion.div>
        {}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]"
        >
          <span>Descend to Orbit</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-skywatch-emerald to-transparent"
          />
        </motion.div>
      </motion.section>
      {}
      {}
      {}
      <section className="relative min-h-[100svh] flex items-center justify-center z-10 py-24 px-6 overflow-hidden">
        <motion.div
          style={{ y: coverageY, opacity: coverageOpacity }}
          className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {}
          <div className="relative aspect-square md:aspect-video lg:aspect-square w-full flex items-center justify-center">
            {}
            <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border border-slate-800/50 bg-[#040914]/40 backdrop-blur-md shadow-[inset_0_0_50px_rgba(16,185,129,0.1)] overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              {}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="absolute inset-[-10%] rounded-full border border-dashed border-skywatch-emerald/20 flex items-center justify-center"
              >
                <div className="absolute top-0 w-3 h-3 bg-skywatch-emerald rounded-full shadow-[0_0_15px_#10b981]"></div>
              </motion.div>
              <Globe2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-slate-800 opacity-50" />
            </div>
          </div>
          {}
          <div className="flex flex-col gap-6">
            <div className="text-skywatch-emerald font-mono text-sm tracking-[0.2em] uppercase">01</div>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Tactical Mesh <br/> <span className="text-slate-400">Coordination</span>
            </h3>
            <p className="text-slate-400 font-mono leading-relaxed">
              Deploy autonomous drone swarms over critical infrastructure. SkyWatch nodes automatically establish an encrypted P2P mesh network, relaying telemetry and intercept vectors back to the command center in real-time.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 border border-slate-800/50 rounded-lg bg-slate-900/20 backdrop-blur-md shadow-lg">
                <Network className="text-skywatch-emerald mb-3 w-6 h-6" />
                <div className="text-2xl font-bold font-mono">P2P</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Encrypted Mesh</div>
              </div>
              <div className="p-4 border border-slate-800/50 rounded-lg bg-slate-900/20 backdrop-blur-md shadow-lg">
                <Satellite className="text-skywatch-emerald mb-3 w-6 h-6" />
                <div className="text-2xl font-bold font-mono">&lt; 20ms</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Telemetry Latency</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      {}
      {}
      {}
      <section className="relative min-h-[100svh] flex items-center justify-center z-10 py-24 px-6 bg-gradient-to-b from-transparent via-[#010204]/40 to-transparent backdrop-blur-[2px]">
        <motion.div
          style={{ scale: aiScale, opacity: aiOpacity }}
          className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse"
        >
          {}
          <div className="order-1 lg:order-2 relative aspect-video w-full border border-red-500/20 bg-black/20 backdrop-blur-md overflow-hidden rounded-lg shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <div className="absolute inset-0 starry-radar-bg opacity-30"></div>
            {}
            <motion.div
              animate={{
                x: [0, 50, -30, 20, 0],
                y: [0, -20, 40, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 w-32 h-32 border border-red-500 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 bg-red-500/5 backdrop-blur-sm"
            >
              <Crosshair className="text-red-500 w-full h-full opacity-50 absolute inset-0" strokeWidth={1} />
              <div className="absolute -top-6 left-0 text-red-500 font-mono text-[10px] bg-red-500/10 px-2 py-0.5 border border-red-500/30 uppercase tracking-wider">
                TRGT_ACQ
              </div>
            </motion.div>
          </div>
          {}
          <div className="order-2 lg:order-1 flex flex-col gap-6">
            <div className="text-red-500 font-mono text-sm tracking-[0.2em] uppercase">02</div>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Autonomous <br/> <span className="text-slate-400">Threat Detection</span>
            </h3>
            <p className="text-slate-400 font-mono leading-relaxed">
              Every node is equipped with localized YOLOv8 neural engines. Threat detection happens at the edge—identifying unauthorized personnel and vehicles in under 50ms without round-trip server latency.
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              <li className="flex items-center gap-4 text-slate-300 font-mono text-sm">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></div>
                Dynamic Vector Calculation
              </li>
              <li className="flex items-center gap-4 text-slate-300 font-mono text-sm">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]"></div>
                Multi-class Object Tracking
              </li>
              <li className="flex items-center gap-4 text-slate-300 font-mono text-sm">
                <div className="w-1.5 h-1.5 bg-skywatch-emerald rounded-full shadow-[0_0_10px_#10b981]"></div>
                Automated Geofence Triggers
              </li>
            </ul>
          </div>
        </motion.div>
      </section>
      {}
      {}
      {}
      <section className="relative min-h-[80svh] flex flex-col items-center justify-center z-10 py-24 px-6 text-center border-t border-slate-800/50 bg-gradient-to-t from-[#020408]/60 to-transparent backdrop-blur-sm">
        <ShieldAlert className="w-12 h-12 text-slate-700 mb-6" />
        <div className="text-skywatch-emerald font-mono text-sm tracking-[0.2em] uppercase mb-4">03</div>
        <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
          Real-Time Blackbox
        </h3>
        <p className="text-slate-400 font-mono max-w-2xl mx-auto mb-12">
          Critical incidents trigger immediate 5-second 720p tactical video uploads to the secure SEC-OPS vault. Fully categorized. Fully auditable.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="px-10 py-5 bg-white text-black font-bold font-mono text-lg rounded tracking-widest hover:bg-skywatch-emerald hover:text-black transition-colors duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
        >
          ENTER THE DASHBOARD
        </motion.button>
      </section>
    </div>
  );
}
