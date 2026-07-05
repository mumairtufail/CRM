import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Standalone hero/CTA motif: no dependency on Pipeline.jsx or any tenant-app module —
// this file recreates the real Kanban lead-card visual tokens locally so the marketing
// page never imports tenant-only components.

const EASE = [0.22, 1, 0.36, 1];

const FRAGMENTS = [
    { id: 'f1', kind: 'email', text: 'sara.q@cloudify.io',   top: '4%',  left: '8%',  rotate: -9 },
    { id: 'f2', kind: 'phone', text: '+92 300 1234567',      top: '0%',  left: '56%', rotate: 7 },
    { id: 'f3', kind: 'name',  text: 'Ahmed K...',           top: '28%', left: '30%', rotate: -5 },
    { id: 'f4', kind: 'note',  text: '📌 call back Thurs',   top: '52%', left: '2%',  rotate: 6 },
    { id: 'f5', kind: 'cell',  text: 'B14 · Techstars PK',   top: '44%', left: '54%', rotate: -7 },
    { id: 'f6', kind: 'email', text: 'o.siddiqui@nexara.pk', top: '76%', left: '16%', rotate: 5 },
    { id: 'f7', kind: 'phone', text: '+1 (415) 555-0199',    top: '66%', left: '64%', rotate: -6 },
    { id: 'f8', kind: 'name',  text: 'Priya A...',           top: '6%',  left: '32%', rotate: 9 },
];

const CARDS = [
    { id: 'c1', name: 'Ahmed Karim',   company: 'Techstars PK', value: '$1,500', accent: '#7C3AED', due: 'Thu' },
    { id: 'c2', name: 'Sara Qureshi',  company: 'Cloudify.io',  value: '$950',   accent: '#F59E0B', due: 'Mon' },
    { id: 'c3', name: 'Omar Siddiqui', company: 'Nexara Pvt',   value: '$2,000', accent: '#10B981', due: 'Wed' },
    { id: 'c4', name: 'Priya Anand',   company: 'Orion Labs',   value: '$2,400', accent: '#3B82F6', due: 'Fri' },
];

function fragmentClass(kind) {
    switch (kind) {
        case 'cell':
            return 'font-mono text-[11px] px-2 py-1 rounded border border-white/15 bg-white/[0.03] text-white/40';
        case 'note':
            return 'text-[12px] px-2.5 py-1 rounded-md border border-dashed border-amber-300/30 bg-amber-400/5 text-amber-200/70';
        default:
            return 'text-[12px] px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/35';
    }
}

export default function ChaosIntoOrder({ variant = 'full' }) {
    const mini = variant === 'mini';
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    const [settled, setSettled] = useState(false);

    useEffect(() => {
        if (!inView) return;
        const t = setTimeout(() => setSettled(true), mini ? 1000 : 1650);
        return () => clearTimeout(t);
    }, [inView, mini]);

    const fragments = mini ? FRAGMENTS.slice(0, 4) : FRAGMENTS;
    const cards = mini ? CARDS.slice(0, 2) : CARDS.slice(0, 3);

    return (
        <div ref={ref} className={`relative pointer-events-none select-none ${mini ? 'h-40' : 'h-[420px] sm:h-[460px]'}`}>
            <AnimatePresence>
                {!settled && (
                    <motion.div key="fragments" className="absolute inset-0" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
                        {fragments.map(({ id, kind, text, top, left, rotate }, i) => (
                            <motion.div
                                key={id}
                                className={`absolute whitespace-nowrap ${fragmentClass(kind)}`}
                                style={{ top, left }}
                                initial={{ opacity: 0, rotate, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    rotate,
                                    scale: 1,
                                    y: [0, i % 2 === 0 ? -6 : 6, 0],
                                }}
                                exit={{ opacity: 0, rotate: rotate * 2.2, scale: 0.8, x: rotate > 0 ? 40 : -40 }}
                                transition={{
                                    opacity: { duration: 0.5, delay: i * 0.05 },
                                    scale: { duration: 0.5, delay: i * 0.05 },
                                    y: { duration: 2.6 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 },
                                }}
                            >
                                {text}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="absolute inset-x-0 top-0 mx-auto max-w-sm space-y-2.5"
                initial="hidden"
                animate={settled ? 'show' : 'hidden'}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
            >
                {cards.map(({ id, name, company, value, accent, due }) => (
                    <motion.div
                        key={id}
                        variants={{
                            hidden: { opacity: 0, y: 18 },
                            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                        }}
                        className="bg-white rounded-lg border border-[#e5ddd5] p-3"
                        style={{ borderLeftWidth: 4, borderLeftColor: accent }}
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                                style={{ background: `linear-gradient(135deg, ${accent}, #4F46E5)` }}
                            >
                                {name[0]}
                            </div>
                            <span className="text-slate-800 text-[12px] font-semibold truncate">{name}</span>
                            <span className="text-slate-400 text-[11px] truncate">· {company}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-emerald-700 text-[11px] font-bold">{value}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                                Follow up {due}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
