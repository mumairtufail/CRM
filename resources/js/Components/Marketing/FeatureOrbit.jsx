import { useState } from 'react';
import { Sparkles, Users, Kanban, Mail, Eye, MessageSquare, Bot, Inbox, CheckCircle2 } from 'lucide-react';
import FlowTree from '@/Components/Marketing/FlowTree';

const STEPS = [
    { id: 1, icon: Sparkles,      category: 'AI Prospecting',        title: 'Find leads',        content: 'Describe your ideal customer in plain English. We search Apollo.io and People Data Labs at once and hand you verified people with an email, phone number, and LinkedIn profile.', nextId: 2 },
    { id: 2, icon: Users,         category: 'Batches & Groups',       title: 'Sort them',         content: 'Every import lands in its own batch automatically. Build your own groups too, by campaign, region, or deal size.', nextId: 3 },
    { id: 3, icon: Kanban,        category: 'Sales Pipeline',         title: 'Work the pipeline', content: 'A Kanban board for every deal. Drag a card to change its stage and see every call, email, and note on it.', nextId: 4 },
    { id: 4, icon: Mail,          category: 'Email Campaigns',        title: 'Send & follow up',  content: 'Write the email once and set a follow up timeline. Anyone who has not opened it gets a reminder automatically.', nextId: 5 },
    { id: 5, icon: Eye,           category: 'Open & Click Tracking',  title: 'See who is warm',   content: 'Track who opened your email and who clicked through, down to the form they filled out afterward.', nextId: 6 },
    { id: 6, icon: MessageSquare, category: 'WhatsApp Campaigns (Soon)', title: 'Run it on WhatsApp', content: 'Send the same campaigns and automatic follow ups on WhatsApp, from the same lead list, once this launches.', nextId: 7 },
    { id: 7, icon: Bot,           category: 'AI Configuration',       title: 'Let AI answer',      content: 'Connect OpenAI, Kimi, or Claude and give it your own knowledge base. It replies to leads and moves them into your pipeline the moment they show interest.', nextId: 8 },
    { id: 8, icon: Inbox,         category: 'Inbox',                  title: 'One inbox',          content: 'Read replies, check what already went out, or draft a new message, all from one inbox.', nextId: null },
];

const HIGHLIGHTS = [
    'Every step logged on the lead automatically',
    'Calls and emails on one shared timeline',
    'AI keeps replying and qualifying after hours',
];

export default function FeatureOrbit() {
    const [activeId, setActiveId] = useState(null);

    return (
        <div className="relative rounded-3xl border border-slate-100 bg-white px-4 py-10 sm:px-10 sm:py-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgb(var(--brand-200)) 1.5px, transparent 1.5px)',
                        backgroundSize: '22px 22px',
                        maskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, black 35%, transparent 85%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, black 35%, transparent 85%)',
                    }}
                />
            </div>

            <div className="relative">
                <div className="max-w-lg mx-auto text-center mb-8">
                    <div className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">One connected flow</div>
                    <h3 className="text-slate-900 text-xl sm:text-2xl font-black leading-snug mb-3">
                        Eight tools, working off the same lead record.
                    </h3>
                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                        Hover any step to see how it hands off to the next one. Nothing here lives in a separate app.
                    </p>
                </div>

                <FlowTree steps={STEPS} activeId={activeId} onSelect={setActiveId} />

                <p className="text-center text-slate-400 text-xs mt-6 sm:hidden">Tap a step to see how it fits.</p>

                <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap justify-center gap-x-8 gap-y-3">
                    {HIGHLIGHTS.map((line) => (
                        <div key={line} className="flex items-center gap-2 text-slate-600 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                            {line}
                        </div>
                    ))}
                </div>
            </div>

            {/* Full copy kept in the DOM for search engines and screen readers,
                since the tooltip only renders a step's description on hover or tap. */}
            <div className="sr-only">
                <ol>
                    {STEPS.map((step) => (
                        <li key={step.id}>
                            <h3>{step.category}: {step.title}</h3>
                            <p>{step.content}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
