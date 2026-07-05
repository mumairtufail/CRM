import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MODULES = [
    {
        tag: 'AI Prospecting',
        title: 'Stop guessing who to reach out to.',
        copy: "Type who you're looking for the way you'd describe it to a colleague, industry, title, company size, location. Lumenia searches Apollo.io and People Data Labs at the same time, ranks results by fit, and imports verified people straight into your workspace.",
        image: '/images/marketing/prospecting-data.jpg',
        alt: 'Analytics dashboard on a laptop screen showing lead data charts',
    },
    {
        tag: 'Sales Pipeline',
        title: 'See your whole pipeline without asking for a status update.',
        copy: 'Every lead lives on a Kanban board your team can actually use. Drag a card to move a deal forward, open it to see every call, email, and note, and filter by stage, owner, or tag in seconds.',
        image: '/images/marketing/pipeline-team.jpg',
        alt: 'A sales team reviewing deals together around a computer',
    },
    {
        tag: 'Email Campaigns',
        title: 'Send once. Let the follow up handle itself.',
        copy: "Write a campaign, set a follow up timeline, and walk away. Anyone who hasn't opened your email gets a reminder automatically, on the schedule you choose, and you can see exactly who opened, who clicked, and which form they filled out after.",
        image: '/images/marketing/email-campaigns.jpg',
        alt: 'A glowing email envelope icon representing a sent campaign',
    },
    {
        tag: 'WhatsApp Campaigns',
        title: 'The same playbook, on the channel people actually reply to.',
        copy: "Run campaigns and automatic follow ups over WhatsApp using the same lead list and the same rules as email. Every message lands on the lead's timeline, right next to their emails and calls.",
        image: '/images/marketing/whatsapp-chat.jpg',
        alt: 'A hand holding a phone open to WhatsApp',
    },
    {
        tag: 'AI Configuration',
        title: "Let AI have the conversation while you're busy.",
        copy: 'Connect OpenAI, Kimi, or Claude and teach it from a knowledge base you write yourself, pricing, hours, what makes you different. When a lead replies on email or WhatsApp, the AI answers from what you taught it and moves them into your pipeline the moment they show real interest.',
        image: '/images/marketing/ai-chatbot.jpg',
        alt: 'A phone showing a conversational AI chat interface',
    },
    {
        tag: 'Invoicing & Clients',
        title: 'From a won deal to a paid invoice, without leaving the tab.',
        copy: "Turn a lead into a client in one click, then create a project and send an invoice without re-entering a single detail. Track what's paid and what's outstanding right alongside the rest of the relationship.",
        image: '/images/marketing/invoicing-finance.jpg',
        alt: 'A person reviewing an invoice next to a laptop',
    },
];

export default function ModuleShowcase() {
    const listRef = useRef(null);
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);

    const updateEdges = useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        setAtTop(el.scrollTop <= 4);
        setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
    }, []);

    const scrollByRow = (direction) => {
        const el = listRef.current;
        if (!el) return;
        const row = el.querySelector('[data-row]');
        const amount = (row?.offsetHeight ?? 140) + 1;
        el.scrollBy({ top: direction * amount, behavior: 'smooth' });
    };

    return (
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
                    className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-700 transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div
                ref={listRef}
                onScroll={updateEdges}
                className="flex flex-col divide-y divide-slate-100 max-h-[480px] overflow-y-auto snap-y snap-mandatory scroll-smooth pr-1"
            >
                {MODULES.map(({ tag, title, copy, image, alt }) => (
                    <div key={tag} data-row className="flex gap-5 py-5 first:pt-0 last:pb-0 snap-start">
                        <img
                            src={image}
                            alt={alt}
                            loading="lazy"
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 border border-slate-100"
                        />
                        <div className="min-w-0">
                            <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-violet-600 bg-violet-50 rounded-full px-2.5 py-0.5 mb-1.5">
                                {tag}
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
    );
}
