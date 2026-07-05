import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRADIENTS = {
    violet: 'linear-gradient(150deg, #7C3AED, #4F46E5)',
    indigo: 'linear-gradient(150deg, #4F46E5, #4338CA)',
    emerald: 'linear-gradient(150deg, #059669, #047857)',
};

// Mobile: tooltip drops below the node, centered. sm+: it flanks outward so it
// never collides with the sibling branch or the center trunk line.
const TOOLTIP_POSITION = {
    below: 'top-full mt-3 left-1/2 -translate-x-1/2',
    right: 'top-full mt-3 left-1/2 -translate-x-1/2 sm:top-1/2 sm:mt-0 sm:left-full sm:ml-4 sm:-translate-y-1/2 sm:translate-x-0',
    left: 'top-full mt-3 left-1/2 -translate-x-1/2 sm:top-1/2 sm:mt-0 sm:right-full sm:mr-4 sm:left-auto sm:-translate-y-1/2 sm:translate-x-0',
};

function Tooltip({ show, gradient, category, title, description, nextNote, position }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.15 }}
                    className={cn('pointer-events-none absolute z-30 w-48 sm:w-56 rounded-2xl p-4 shadow-xl origin-top', TOOLTIP_POSITION[position])}
                    style={{ background: gradient }}
                >
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">{category}</span>
                    <span className="block text-sm font-black text-white leading-snug mb-1.5">{title}</span>
                    <p className="text-[11px] text-white/80 leading-relaxed">{description}</p>
                    {nextNote && (
                        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/15 text-[10px] font-semibold text-white/70">
                            <ArrowRight className="w-3 h-3 shrink-0" />
                            {nextNote}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function TrunkNode({ step, isActive, onSelect, connectDown, nextNote }) {
    const Icon = step.icon;

    return (
        <div className="relative flex flex-col items-center">
            <button
                type="button"
                onMouseEnter={() => onSelect(step.id)}
                onFocus={() => onSelect(step.id)}
                onClick={() => onSelect(isActive ? null : step.id)}
                className="group relative flex flex-col items-center gap-1.5 rounded-2xl px-3 py-1.5 transition-colors hover:bg-violet-50/60"
            >
                <span
                    className={cn(
                        'relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300',
                        isActive
                            ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/25 scale-110'
                            : 'bg-white border-slate-200 text-violet-600 shadow-sm group-hover:border-violet-300'
                    )}
                >
                    <Icon className="w-4 h-4" />
                    <span
                        className={cn(
                            'absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold font-mono transition-colors duration-300',
                            isActive ? 'bg-violet-900 text-white' : 'bg-slate-100 text-slate-400'
                        )}
                    >
                        {step.id}
                    </span>
                </span>
                <span className="text-center">
                    <span
                        className={cn(
                            'block text-[9px] font-bold uppercase tracking-wide transition-colors duration-300',
                            isActive ? 'text-violet-600' : 'text-slate-400'
                        )}
                    >
                        {step.category}
                    </span>
                    <span
                        className={cn(
                            'block text-[12px] font-bold leading-snug transition-colors duration-300',
                            isActive ? 'text-slate-900' : 'text-slate-600'
                        )}
                    >
                        {step.title}
                    </span>
                </span>
            </button>

            <Tooltip
                show={isActive}
                gradient={GRADIENTS.violet}
                category={step.category}
                title={step.title}
                description={step.content}
                nextNote={nextNote}
                position="below"
            />

            {connectDown && (
                <span aria-hidden="true" className={cn('w-px h-4 transition-colors duration-300', isActive ? 'bg-violet-300' : 'bg-slate-200')} />
            )}
        </div>
    );
}

function BranchLabel({ label, color, active }) {
    const isIndigo = color === 'indigo';
    return (
        <div className="flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', isIndigo ? 'bg-indigo-500' : 'bg-emerald-500')} />
            <span
                className={cn(
                    'text-[9px] font-bold uppercase tracking-widest transition-colors duration-300',
                    active ? (isIndigo ? 'text-indigo-600' : 'text-emerald-600') : 'text-slate-400'
                )}
            >
                {label}
            </span>
        </div>
    );
}

function BranchNode({ step, color, isActive, onSelect, tooltipPosition, nextNote }) {
    const Icon = step.icon;
    const isIndigo = color === 'indigo';

    return (
        <div className="relative w-full flex justify-center">
            <button
                type="button"
                onMouseEnter={() => onSelect(step.id)}
                onFocus={() => onSelect(step.id)}
                onClick={() => onSelect(isActive ? null : step.id)}
                className={cn(
                    'group w-full max-w-[128px] flex flex-col items-center text-center gap-1.5 rounded-2xl border p-2.5 transition-all duration-300',
                    isActive
                        ? isIndigo
                            ? 'border-transparent bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-500/25 scale-[1.04]'
                            : 'border-transparent bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-lg shadow-emerald-500/25 scale-[1.04]'
                        : isIndigo
                            ? 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/50'
                            : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50'
                )}
            >
                <span
                    className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300',
                        isActive
                            ? 'bg-white/15 border-white/30 text-white'
                            : isIndigo
                                ? 'bg-white border-indigo-100 text-indigo-600'
                                : 'bg-white border-emerald-100 text-emerald-600'
                    )}
                >
                    <Icon className="w-[15px] h-[15px]" />
                </span>
                <span className={cn('block text-[9px] font-bold uppercase tracking-wide', isActive ? 'text-white/70' : 'text-slate-400')}>
                    {step.category}
                </span>
                <span className={cn('block text-[11px] font-bold leading-snug', isActive ? 'text-white' : 'text-slate-700')}>{step.title}</span>
            </button>

            <Tooltip
                show={isActive}
                gradient={isIndigo ? GRADIENTS.indigo : GRADIENTS.emerald}
                category={step.category}
                title={step.title}
                description={step.content}
                nextNote={nextNote}
                position={tooltipPosition}
            />
        </div>
    );
}

function SplitConnector({ emailActive, whatsappActive }) {
    return (
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-8" aria-hidden="true">
            <path
                d="M50 0 L50 10 C50 22 26 20 26 40"
                fill="none"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className={cn('transition-colors duration-300', emailActive ? 'stroke-indigo-400' : 'stroke-slate-200')}
            />
            <path
                d="M50 0 L50 10 C50 22 74 20 74 40"
                fill="none"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className={cn('transition-colors duration-300', whatsappActive ? 'stroke-emerald-400' : 'stroke-slate-200')}
            />
        </svg>
    );
}

function MergeConnector({ emailActive, whatsappActive }) {
    return (
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-8" aria-hidden="true">
            <path
                d="M26 0 C26 20 50 18 50 30 L50 40"
                fill="none"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className={cn('transition-colors duration-300', emailActive ? 'stroke-indigo-400' : 'stroke-slate-200')}
            />
            <path
                d="M74 0 C74 20 50 18 50 30 L50 40"
                fill="none"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className={cn('transition-colors duration-300', whatsappActive ? 'stroke-emerald-400' : 'stroke-slate-200')}
            />
        </svg>
    );
}

export default function FlowTree({ steps, activeId, onSelect }) {
    const byId = (id) => steps.find((s) => s.id === id);
    const [s1, s2, s3, s4, s5, s6, s7, s8] = [1, 2, 3, 4, 5, 6, 7, 8].map(byId);

    const emailActive = activeId === 4 || activeId === 5;
    const whatsappActive = activeId === 6;

    return (
        <div className="flex flex-col items-center" onMouseLeave={() => onSelect(null)}>
            <TrunkNode step={s1} isActive={activeId === 1} onSelect={onSelect} connectDown nextNote={s2.title} />
            <TrunkNode step={s2} isActive={activeId === 2} onSelect={onSelect} connectDown nextNote={s3.title} />
            <TrunkNode step={s3} isActive={activeId === 3} onSelect={onSelect} nextNote="Splits into Email & WhatsApp" />

            <SplitConnector emailActive={emailActive} whatsappActive={whatsappActive} />

            <div className="grid grid-cols-2 gap-2 sm:gap-6 w-full items-stretch">
                <div className="flex flex-col items-center gap-1.5">
                    <BranchLabel label="Email path" color="indigo" active={emailActive} />
                    <BranchNode step={s4} color="indigo" isActive={activeId === 4} onSelect={onSelect} tooltipPosition="left" nextNote={s5.title} />
                    <span aria-hidden="true" className={cn('w-px h-3.5 transition-colors duration-300', emailActive ? 'bg-indigo-300' : 'bg-slate-200')} />
                    <BranchNode step={s5} color="indigo" isActive={activeId === 5} onSelect={onSelect} tooltipPosition="left" nextNote={s7.title} />
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5">
                    <BranchLabel label="WhatsApp path" color="emerald" active={whatsappActive} />
                    <BranchNode step={s6} color="emerald" isActive={activeId === 6} onSelect={onSelect} tooltipPosition="right" nextNote={s7.title} />
                </div>
            </div>

            <MergeConnector emailActive={emailActive} whatsappActive={whatsappActive} />

            <div className="-mt-1 mb-1 flex justify-center">
                <span className="rounded-full bg-violet-50 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-violet-500">
                    Both paths reconnect here
                </span>
            </div>

            <TrunkNode step={s7} isActive={activeId === 7} onSelect={onSelect} connectDown nextNote={s8.title} />
            <TrunkNode step={s8} isActive={activeId === 8} onSelect={onSelect} />
        </div>
    );
}
