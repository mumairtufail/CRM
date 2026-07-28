import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Kanban, Mail, Phone, MessageCircle, Bot, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MODULES = [
    {
        tag: 'AI Prospecting',
        icon: Search,
        title: 'Stop guessing who to reach out to.',
        copy: "Type who you're looking for the way you'd describe it to a colleague, industry, title, company size, location. Lumenia searches Apollo.io and People Data Labs at the same time, ranks results by fit, and imports verified people straight into your workspace.",
        image: '/images/marketing/prospecting-data.jpg',
        alt: 'Analytics dashboard on a laptop screen showing lead data charts',
    },
    {
        tag: 'Sales Pipeline',
        icon: Kanban,
        title: 'See your whole pipeline without asking for a status update.',
        copy: 'Every lead lives on a Kanban board your team can actually use. Drag a card to move a deal forward, open it to see every call, email, and note, and filter by stage, owner, or tag in seconds.',
        image: '/images/marketing/pipeline-team.jpg',
        alt: 'A sales team reviewing deals together around a computer',
    },
    {
        tag: 'Dialer & Call Logs',
        icon: Phone,
        title: 'Call a lead from their profile. The log writes itself.',
        copy: "Connect your own Twilio number and dial straight from a lead's profile. Every call, inbound or outbound, is matched to the right lead automatically and logged with duration and recording, right next to their emails on the same timeline.",
        alt: 'A person on a call using a headset',
    },
    {
        tag: 'Email Campaigns',
        icon: Mail,
        title: 'Send once. Let the follow up handle itself.',
        copy: "Write a campaign, set a follow up timeline, and walk away. Anyone who hasn't opened your email gets a reminder automatically, on the schedule you choose, and you can see exactly who opened, who clicked, and which form they filled out after.",
        image: '/images/marketing/email-campaigns.jpg',
        alt: 'A glowing email envelope icon representing a sent campaign',
    },
    {
        tag: 'WhatsApp Campaigns',
        badge: 'Coming soon',
        icon: MessageCircle,
        title: 'The same playbook, on the channel people actually reply to.',
        copy: "Run campaigns and automatic follow ups over WhatsApp using the same lead list and the same rules as email, once this launches. Every message will land on the lead's timeline, right next to their emails and calls.",
        image: '/images/marketing/whatsapp-chat.jpg',
        alt: 'A hand holding a phone open to WhatsApp',
    },
    {
        tag: 'AI Configuration',
        icon: Bot,
        title: "Let AI have the conversation while you're busy.",
        copy: 'Connect OpenAI, Kimi, or Claude and teach it from a knowledge base you write yourself, pricing, hours, what makes you different. When a lead replies on email or WhatsApp, the AI answers from what you taught it and moves them into your pipeline the moment they show real interest.',
        image: '/images/marketing/ai-chatbot.jpg',
        alt: 'A phone showing a conversational AI chat interface',
    },
    {
        tag: 'Invoicing & Clients',
        icon: Receipt,
        title: 'From a won deal to a paid invoice, without leaving the tab.',
        copy: "Turn a lead into a client in one click, then create a project and send an invoice without re-entering a single detail. Track what's paid and what's outstanding right alongside the rest of the relationship.",
        image: '/images/marketing/invoicing-finance.jpg',
        alt: 'A person reviewing an invoice next to a laptop',
    },
];

function ModuleStepper({ activeIndex, onSelect }) {
    return (
        <div className="mt-2">
            {MODULES.map(({ tag, badge, icon: Icon }, i) => {
                const active = i === activeIndex;
                const past = i < activeIndex;
                return (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => onSelect(i)}
                        className="w-full text-left flex gap-4 group"
                    >
                        <div className="flex flex-col items-center">
                            <span
                                className={cn(
                                    'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                                    active
                                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 scale-105'
                                        : past
                                            ? 'bg-brand-50 text-brand-600 border border-brand-100'
                                            : 'bg-white text-slate-400 border border-slate-200 group-hover:border-brand-300 group-hover:text-brand-500',
                                )}
                            >
                                <Icon className="w-4 h-4" strokeWidth={2} />
                            </span>
                            {i < MODULES.length - 1 && (
                                <span className={cn('w-px flex-1 min-h-[18px] transition-colors duration-300', past || active ? 'bg-brand-200' : 'bg-slate-200')} />
                            )}
                        </div>
                        <div className={cn('pb-5 pt-1.5 min-w-0', i === MODULES.length - 1 && 'pb-1.5')}>
                            <div
                                className={cn(
                                    'text-sm font-bold transition-colors duration-200 truncate flex items-center gap-1.5',
                                    active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600',
                                )}
                            >
                                {tag}
                                {badge && (
                                    <span className="text-[9px] font-bold uppercase tracking-wide text-brand-500 bg-brand-50 rounded-full px-1.5 py-0.5 shrink-0">
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <motion.p
                                initial={false}
                                animate={{ height: active ? 'auto' : 0, opacity: active ? 1 : 0, marginTop: active ? 4 : 0 }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="text-xs text-slate-500 leading-relaxed overflow-hidden"
                            >
                                {MODULES[i].title}
                            </motion.p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

export default function ModuleShowcase() {
    const listRef = useRef(null);
    const rowRefs = useRef([]);
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const updateEdges = useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        setAtTop(el.scrollTop <= 4);
        setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);

        let closest = 0;
        let closestDist = Infinity;
        rowRefs.current.forEach((row, i) => {
            if (!row) return;
            const dist = Math.abs(row.offsetTop - el.scrollTop);
            if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        setActiveIndex(closest);
    }, []);

    const scrollByRow = (direction) => {
        const el = listRef.current;
        if (!el) return;
        const row = el.querySelector('[data-row]');
        const amount = (row?.offsetHeight ?? 140) + 1;
        el.scrollBy({ top: direction * amount, behavior: 'smooth' });
    };

    const scrollToIndex = (i) => {
        const el = listRef.current;
        const row = rowRefs.current[i];
        if (!el || !row) return;
        el.scrollTo({ top: row.offsetTop, behavior: 'smooth' });
        setActiveIndex(i);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-start">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="lg:sticky lg:top-28 rounded-3xl border border-slate-200/70 bg-white p-6 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-24px_rgba(15,23,42,0.15)]"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px w-10 bg-brand-400" />
                    <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">Features</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                    Every module, explained.
                </h2>
                <p className="text-slate-500 text-lg mt-3 mb-6">
                    What each part actually does, and how it fits with the rest.
                </p>

                <ModuleStepper activeIndex={activeIndex} onSelect={scrollToIndex} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 sm:p-7"
            >
                <div className="flex justify-end gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => scrollByRow(-1)}
                        disabled={atTop}
                        aria-label="Previous module"
                        className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollByRow(1)}
                        disabled={atBottom}
                        aria-label="Next module"
                        className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div
                    ref={listRef}
                    onScroll={updateEdges}
                    className="flex flex-col divide-y divide-slate-100 max-h-[480px] overflow-y-auto snap-y snap-mandatory scroll-smooth pr-1"
                >
                    {MODULES.map(({ tag, badge, title, copy, image, alt, icon: Icon }, i) => (
                        <div
                            key={tag}
                            data-row
                            ref={(el) => (rowRefs.current[i] = el)}
                            className="flex gap-5 py-5 first:pt-0 last:pb-0 snap-start"
                        >
                            {image ? (
                                <img
                                    src={image}
                                    alt={alt}
                                    loading="lazy"
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 border border-slate-100"
                                />
                            ) : (
                                <div
                                    role="img"
                                    aria-label={alt}
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl shrink-0 border border-slate-100 bg-brand-50 flex items-center justify-center"
                                >
                                    <Icon className="w-8 h-8 text-brand-600" strokeWidth={1.5} />
                                </div>
                            )}
                            <div className="min-w-0">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-600 bg-brand-50 rounded-full px-2.5 py-0.5 mb-1.5">
                                    {tag}
                                    {badge && <span className="text-brand-500">· {badge}</span>}
                                </span>
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{title}</h3>
                                <p
                                    className="text-sm text-slate-500 leading-relaxed mt-1.5"
                                    style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {copy}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
