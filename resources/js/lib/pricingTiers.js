/**
 * @typedef {Object} Tier
 * @property {'Starter'|'Pro'|'Agency'} name
 * @property {string} slug - matches the `plan_slug` custom_data set on the Paddle product/prices
 * @property {string} description
 * @property {string[]} features
 * @property {{ month: string, year: string }} priceId - Paddle price IDs
 */

/** @type {Tier[]} */
export const TIERS = [
    {
        name: 'Starter',
        slug: 'starter',
        description: 'For a solo rep getting their pipeline off spreadsheets.',
        features: [
            'Core CRM — leads, pipeline, invoicing',
            'AI-powered lead search',
            'CSV & Google Sheets import',
            'Email support',
        ],
        priceId: {
            month: 'pri_01kyn9cxkb91f15nsm0y4e0rkq',
            year: 'pri_01kyn9cyh49t1wh335g2gjxn9s',
        },
    },
    {
        name: 'Pro',
        slug: 'pro',
        description: 'For a growing team that needs campaigns and a dialer.',
        features: [
            'Everything in Starter',
            'Email campaigns with automated follow-ups',
            'Dialer — bring your own Twilio, call logs on every lead',
            'Advanced reports',
        ],
        priceId: {
            month: 'pri_01kyn9czn8jjyncrk9jazajyv4',
            year: 'pri_01kyn9d06at8m7j6kpdsa9b4rs',
        },
    },
    {
        name: 'Agency',
        slug: 'agency',
        description: 'For agencies running multiple clients out of one workspace.',
        features: [
            'Everything in Pro',
            'Unlimited leads & pipelines',
            'Priority support',
            'WhatsApp campaigns & bot — coming soon',
        ],
        priceId: {
            month: 'pri_01kyn9d18q849sdykaq6s70tmj',
            year: 'pri_01kyn9d1t7yasxf5n9cs9bykkv',
        },
    },
];
