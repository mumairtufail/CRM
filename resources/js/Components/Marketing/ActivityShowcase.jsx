import { Sparkles, Mail, CheckCircle2, Users, Clock, MessageSquare, Kanban, FileText, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import DisplayCards from '@/Components/ui/display-cards';

// Written out as complete literal class names (not template-interpolated) so
// Tailwind's static scanner can actually find and generate them.
const FAN_OFFSETS = [
    'translate-x-0 translate-y-0',
    'translate-x-8 translate-y-4',
    'translate-x-16 translate-y-8',
    'translate-x-24 translate-y-12',
    'translate-x-32 translate-y-16',
    'translate-x-40 translate-y-20',
    'translate-x-48 translate-y-24',
    'translate-x-56 translate-y-28',
    'translate-x-64 translate-y-32',
];

const fanClass = (i) =>
    `[grid-area:stack] ${FAN_OFFSETS[i]} hover:-translate-y-2 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0`;

const RAW_CARDS = [
    { icon: Sparkles,      title: 'Lead found',      description: 'AI matched a new prospect',            date: 'Just now' },
    { icon: Users,         title: 'Batch created',   description: '42 leads sorted automatically',        date: '5 min ago' },
    { icon: MessageSquare, title: 'WhatsApp reply',  description: 'AI answered a pricing question',        date: '10 min ago' },
    { icon: Bot,           title: 'AI qualified',    description: 'Conversation flagged high intent',      date: '30 min ago' },
    { icon: Mail,          title: 'Email opened',    description: 'Clicked the pricing link',              date: '2 hours ago' },
    { icon: Kanban,        title: 'Stage changed',   description: 'Moved to Proposal after a call',        date: '3 hours ago' },
    { icon: FileText,      title: 'Form submitted',  description: 'New lead captured from the site',       date: '1 hour ago' },
    { icon: Clock,         title: 'Follow up sent',  description: 'No reply in 48 hours, reminder went out', date: 'Yesterday' },
    { icon: CheckCircle2,  title: 'Deal won',        description: 'Invoice sent and paid',                 date: 'Today' },
];

const CARDS = RAW_CARDS.map(({ icon: Icon, title, description, date }, i) => ({
    icon: <Icon className="size-4 text-white" />,
    title,
    description,
    date,
    iconClassName: 'text-white',
    titleClassName: 'text-brand-700',
    className: fanClass(i),
}));

const STATS = [
    { value: '9+', sub: 'event types logged' },
    { value: '0s', sub: 'lag to the timeline' },
    { value: '0',  sub: 'manual entry needed' },
];

export default function ActivityShowcase() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-px w-10 bg-brand-500" />
                    <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">Live on the lead's timeline</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-5">
                    Every action becomes a timeline entry, automatically.
                </h3>
                <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md">
                    A lead gets emailed, replies on WhatsApp, moves stages, gets invoiced.
                    Every one of those lands on the same timeline the moment it happens, nobody has to type it in.
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                    {STATS.map(({ value, sub }) => (
                        <div key={sub} className="rounded-2xl border border-slate-100 bg-white p-4 text-center">
                            <div className="text-2xl font-black text-brand-600 mb-1">{value}</div>
                            <div className="text-[11px] text-slate-500 leading-snug">{sub}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="hidden lg:flex justify-center">
                <DisplayCards cards={CARDS} />
            </div>
        </motion.div>
    );
}
