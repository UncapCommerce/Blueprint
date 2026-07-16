// Uncap Discovery — step, hotspot, and question definitions
// Coordinates are px on a 1440×900 artboard.

window.DISCOVERY_STEPS = [
  {
    id: 'client', label: 'Company', tagline: 'Who we\'re building for',
    hotspots: [
      { id: 'c-company', x: 80, y: 560, w: 400, h: 260, label: 'The company', info: 'Before platforms and integrations — who are you? What you make, who buys it, and how big the operation is shapes every decision after this one.' },
      { id: 'c-people', x: 520, y: 560, w: 400, h: 260, label: 'The people', info: 'Projects don\'t fail on tech. They fail on ownership. We map who decides, who builds, and who lives with the result.' },
      { id: 'c-goal', x: 960, y: 560, w: 400, h: 260, label: 'The goal', info: 'Something triggered this call. Naming it — lost accounts, a competitor, an ERP deadline — tells us what "done" actually means.' }
    ],
    groups: [
      { id: 'g-company', hotspotId: 'c-company', title: 'The company', questions: [
        { id: 'q-name', type: 'text', label: 'Company name', placeholder: 'Legal or trade name' },
        { id: 'q-what', type: 'textarea', label: 'What do you make or distribute?', placeholder: 'Products, lines, who buys them…' },
        { id: 'q-rev', type: 'chips', label: 'Annual revenue', options: ['<$10M', '$10–50M', '$50–250M', '$250M+'] }
      ]},
      { id: 'g-people', hotspotId: 'c-people', title: 'The people', questions: [
        { id: 'q-stake', type: 'textarea', label: 'Who are the key stakeholders?', placeholder: 'Names, roles, who\'s on this call…' },
        { id: 'q-owner', type: 'text', label: 'Who owns the ecommerce P&L?', placeholder: 'Name and title' }
      ]},
      { id: 'g-goal', hotspotId: 'c-goal', title: 'The goal', questions: [
        { id: 'q-why', type: 'textarea', label: 'Why now — what triggered this project?', placeholder: 'The moment this became a priority…' },
        { id: 'q-success', type: 'textarea', label: 'What does success look like in 12 months?', placeholder: 'Numbers if you have them…' },
        { id: 'q-channels', type: 'chips-multi', label: 'How do you sell today?', options: ['Sales reps', 'Phone / email', 'Legacy site', 'Marketplaces', 'EDI'] }
      ]}
    ]
  },
  {
    id: 'architecture', label: 'Architecture', tagline: 'The systems behind the sale',
    hotspots: [
      { id: 'a-core', x: 540, y: 330, w: 360, h: 240, label: 'Commerce core', info: 'The platform in the middle. Whatever\'s here today — or isn\'t — this is what everything else has to talk to.' },
      { id: 'a-record', x: 80, y: 170, w: 380, h: 500, label: 'Systems of record', info: 'ERP, product data, inventory. These systems already run your business. We don\'t replace them — we connect them.' },
      { id: 'a-connect', x: 980, y: 170, w: 380, h: 500, label: 'The connections', info: 'EDI, payments, customer comms. The duct tape usually lives here. We want to know every hop an order makes.' }
    ],
    groups: [
      { id: 'g-core', hotspotId: 'a-core', title: 'Commerce core', questions: [
        { id: 'q-platform', type: 'platform', label: 'Current commerce platform' },
        { id: 'q-breaking', type: 'textarea', label: 'What\'s breaking today?', placeholder: 'The duct tape. Be honest…' }
      ]},
      { id: 'g-record', hotspotId: 'a-record', title: 'Systems of record', questions: [
        { id: 'q-erp', type: 'erp', label: 'Which ERP do you run?' },
        { id: 'q-pim', type: 'textarea', label: 'Where does product data live today?', placeholder: 'PIM, spreadsheets, the ERP, someone\'s head…' },
        { id: 'q-locations', type: 'chips', label: 'Inventory locations', options: ['1', '2–5', '6–20', '20+'] }
      ]},
      { id: 'g-connect', hotspotId: 'a-connect', title: 'The connections', questions: [
        { id: 'q-integrations', type: 'textarea', label: 'Existing integrations or middleware?', placeholder: 'What connects to what, and how…' },
        { id: 'q-edi', type: 'chips', label: 'EDI requirements?', options: ['Yes', 'No', 'Not sure'] },
        { id: 'q-maintains', type: 'text', label: 'Who maintains integrations today?', placeholder: 'Internal IT, a vendor, nobody…' }
      ]}
    ]
  },
  {
    id: 'experience', label: 'Experience', tagline: 'The first five seconds',
    hotspots: [
      { id: 'e-nav', x: 0, y: 0, w: 1020, h: 72, label: 'Navigation & search', info: 'B2B buyers don\'t browse — they hunt. Part numbers, categories, applications. The header is where 80% of sessions start.' },
      { id: 'e-account', x: 1020, y: 0, w: 420, h: 72, label: 'Accounts & pricing', info: 'The B2B question: what do guests see, and what unlocks when a customer signs in? Contract pricing changes everything downstream.' },
      { id: 'e-hero', x: 0, y: 72, w: 1440, h: 420, label: 'First impression', info: 'A new buyer lands here and decides in seconds whether you\'re credible. This space has one job: make the next click obvious.' },
      { id: 'e-merch', x: 40, y: 520, w: 1360, h: 350, label: 'Merchandising', info: 'Featured categories and the proof — terms, shipping, a real rep. This is where a visitor becomes an account.' }
    ],
    groups: [
      { id: 'g-hero', hotspotId: 'e-hero', title: 'First impression', questions: [
        { id: 'q-5sec', type: 'textarea', label: 'What should a buyer understand in 5 seconds?', placeholder: 'The one thing the homepage must say…' },
        { id: 'q-brand', type: 'chips', label: 'Brand assets ready?', options: ['Full brand kit', 'Logo only', 'Needs work'] }
      ]},
      { id: 'g-nav', hotspotId: 'e-nav', title: 'Navigation & search', questions: [
        { id: 'q-lookup', type: 'textarea', label: 'How do buyers look for products?', placeholder: 'Part numbers, categories, brand, application…' },
        { id: 'q-skus', type: 'chips', label: 'SKU count', options: ['<1K', '1–10K', '10–100K', '100K+'] }
      ]},
      { id: 'g-merch', hotspotId: 'e-merch', title: 'Merchandising', questions: [
        { id: 'q-topcats', type: 'text', label: 'Top categories to feature', placeholder: 'The 3–4 that drive revenue' },
        { id: 'q-convince', type: 'textarea', label: 'What convinces a new account to buy?', placeholder: 'Terms, speed, expertise, price…' }
      ]},
      { id: 'g-account', hotspotId: 'e-account', title: 'Accounts & pricing', questions: [
        { id: 'q-guest', type: 'chips', label: 'Pricing visible to guests?', options: ['Yes, list price', 'Login to see', 'Partial'] },
        { id: 'q-custpricing', type: 'chips', label: 'Customer-specific pricing?', options: ['Yes', 'No', 'Phase 2'] }
      ]}
    ]
  },
  {
    id: 'discovery', label: 'Discovery', tagline: 'How buyers find the part',
    hotspots: [
      { id: 'd-facets', x: 30, y: 160, w: 280, h: 700, label: 'Filters', info: 'Faceted filtering is only as good as the attribute data behind it. Grit, diameter, material — if it\'s not structured, it can\'t be filtered.' },
      { id: 'd-toolbar', x: 330, y: 160, w: 1080, h: 66, label: 'Search & sort', info: 'Search-within-results and part-number matching. For contractors mid-job, this bar is the whole site.' },
      { id: 'd-grid', x: 330, y: 246, w: 1080, h: 620, label: 'The grid', info: 'Every card is a micro-decision: part number, price, stock. What a buyer needs to see before clicking decides your bounce rate.' }
    ],
    groups: [
      { id: 'g-facets', hotspotId: 'd-facets', title: 'Filters', questions: [
        { id: 'q-attrs', type: 'textarea', label: 'Which attributes do buyers filter by?', placeholder: 'Size, material, brand, spec…' },
        { id: 'q-dataq', type: 'chips', label: 'Attribute data quality', options: ['Clean', 'Messy', 'Nonexistent'] }
      ]},
      { id: 'g-grid', hotspotId: 'd-grid', title: 'The grid', questions: [
        { id: 'q-card', type: 'textarea', label: 'What must a product card show?', placeholder: 'Part #, price, stock, brand…' },
        { id: 'q-stock', type: 'chips', label: 'Stock visibility', options: ['Exact qty', 'In / out', 'By location'] }
      ]},
      { id: 'g-toolbar', hotspotId: 'd-toolbar', title: 'Search & sort', questions: [
        { id: 'q-partsearch', type: 'chips', label: 'Part-number search', options: ['Critical', 'Nice to have', 'Not needed'] },
        { id: 'q-crossref', type: 'chips', label: 'Cross-reference / alternates?', options: ['Yes', 'No', 'Not sure'] },
        { id: 'q-ordersize', type: 'chips', label: 'Typical lines per order', options: ['1–5', '5–20', '20+'] },
        { id: 'q-compare', type: 'chips', label: 'Product compare needed?', options: ['Yes', 'No'] }
      ]}
    ]
  },
  {
    id: 'conversion', label: 'Conversion', tagline: 'Where the order happens',
    hotspots: [
      { id: 'v-buybox', x: 620, y: 130, w: 780, h: 480, label: 'The buy box', info: 'Price, quantity breaks, unit of measure, stock, add to cart. Every B2B pricing rule you have surfaces right here.' },
      { id: 'v-specs', x: 40, y: 690, w: 880, h: 190, label: 'Specs & documents', info: 'Engineers buy on specs, not adjectives. Datasheets, CAD files, compatibility — the technical content that closes the sale.' },
      { id: 'v-trust', x: 940, y: 690, w: 440, h: 190, label: 'Trust & support', info: 'A real rep, a lead-time promise, a quote option for big runs. The human backstop that makes self-serve safe.' }
    ],
    groups: [
      { id: 'g-buybox', hotspotId: 'v-buybox', title: 'The buy box', questions: [
        { id: 'q-pricing', type: 'textarea', label: 'How is pricing structured?', placeholder: 'List, tiers, contract, negotiated…' },
        { id: 'q-qtybreaks', type: 'chips', label: 'Show quantity-break pricing?', options: ['Yes', 'No'] },
        { id: 'q-uom', type: 'chips', label: 'Units of measure', options: ['Single', 'Each / case', 'Complex'] }
      ]},
      { id: 'g-specs', hotspotId: 'v-specs', title: 'Specs & documents', questions: [
        { id: 'q-techcontent', type: 'textarea', label: 'What technical content closes the sale?', placeholder: 'Spec tables, datasheets, CAD, videos…' },
        { id: 'q-assets', type: 'text', label: 'Where do spec sheets / CAD live today?', placeholder: 'Shared drive, vendor portals, PDFs…' }
      ]},
      { id: 'g-trust', hotspotId: 'v-trust', title: 'Trust & support', questions: [
        { id: 'q-leadtime', type: 'chips', label: 'Can you promise lead times?', options: ['Yes', 'Varies', 'No'] },
        { id: 'q-quote', type: 'chips', label: 'Quote instead of buy for some items?', options: ['Yes', 'No'] },
        { id: 'q-rep', type: 'chips', label: 'Show the rep on the product page?', options: ['Yes', 'No'] }
      ]}
    ]
  },
  {
    id: 'revenue', label: 'Revenue', tagline: 'Closing without friction',
    hotspots: [
      { id: 'r-items', x: 920, y: 70, w: 500, h: 360, label: 'The cart', info: 'B2B carts are big and rebuilt often. Line-item editing, saved carts, convert-to-quote — this is where order size is won or lost.' },
      { id: 'r-payment', x: 920, y: 450, w: 500, h: 190, label: 'Payment', info: 'Cards are the easy part. PO numbers, net terms, ACH, credit lines — matching how your customers actually pay is what unlocks volume.' },
      { id: 'r-shipping', x: 920, y: 660, w: 500, h: 220, label: 'Shipping & checkout', info: 'Parcel vs. LTL freight, split shipments, tax exemption. The last 10% of checkout is 90% of B2B complexity.' }
    ],
    groups: [
      { id: 'g-cart', hotspotId: 'r-items', title: 'The cart', questions: [
        { id: 'q-aov', type: 'chips', label: 'Typical order value', options: ['<$500', '$500–5K', '$5–50K', '$50K+'] },
        { id: 'q-friction', type: 'textarea', label: 'What kills orders at checkout today?', placeholder: 'Where buyers give up and call instead…' }
      ]},
      { id: 'g-payment', hotspotId: 'r-payment', title: 'Payment', questions: [
        { id: 'q-paymethods', type: 'chips-multi', label: 'Payment methods needed', options: ['Credit card', 'PO / net terms', 'ACH', 'Credit line'] },
        { id: 'q-terms', type: 'textarea', label: 'How are net terms approved?', placeholder: 'Credit application, who reviews it, how long…' }
      ]},
      { id: 'g-shipping', hotspotId: 'r-shipping', title: 'Shipping & checkout', questions: [
        { id: 'q-freight', type: 'textarea', label: 'Shipping complexity?', placeholder: 'Parcel, LTL, hazmat, will-call…' },
        { id: 'q-split', type: 'chips', label: 'Split shipments?', options: ['Yes', 'No'] },
        { id: 'q-freightquote', type: 'chips', label: 'Real-time freight quotes?', options: ['Yes', 'No', 'Not sure'] },
        { id: 'q-taxexempt', type: 'chips', label: 'Tax-exempt customers?', options: ['Yes', 'No', 'Not sure'] }
      ]}
    ]
  },
  {
    id: 'unified', label: 'Unified', tagline: 'Self-serve for real accounts',
    hotspots: [
      { id: 'u-quotes', x: 260, y: 238, w: 760, h: 350, label: 'Quotes & orders', info: 'The quote-to-order loop is the heart of B2B. Today it probably lives in email. Here it becomes a workflow both sides can see.' },
      { id: 'u-selfserve', x: 260, y: 600, w: 760, h: 270, label: 'Invoices & reorder', info: 'Every "can you resend that invoice?" call costs you money. Pay-online and one-click reorder turn service calls into self-serve.' },
      { id: 'u-roles', x: 1012, y: 600, w: 408, h: 270, label: 'Users & roles', info: 'One account, many buyers. Purchasing agents, approvers, plant managers — with limits and approval chains that match your customer\'s org.' }
    ],
    groups: [
      { id: 'g-roles', hotspotId: 'u-roles', title: 'Accounts & roles', questions: [
        { id: 'q-roles', type: 'textarea', label: 'Do buyer accounts need roles or approvals?', placeholder: 'Who orders, who approves, spending limits…' },
        { id: 'q-accounts', type: 'chips', label: 'Active customer accounts', options: ['<100', '100–1K', '1–10K', '10K+'] }
      ]},
      { id: 'g-quotes', hotspotId: 'u-quotes', title: 'Quotes & orders', questions: [
        { id: 'q-quoteflow', type: 'textarea', label: 'How does quote-to-order work today?', placeholder: 'Email, PDFs, phone, ERP…' },
        { id: 'q-repsorder', type: 'chips', label: 'Do reps place orders for customers?', options: ['Yes', 'Sometimes', 'No'] }
      ]},
      { id: 'g-selfserve', hotspotId: 'u-selfserve', title: 'Self-serve', questions: [
        { id: 'q-calls', type: 'textarea', label: 'What do customers call for that they should self-serve?', placeholder: 'Invoices, order status, tracking, returns…' },
        { id: 'q-payinvoice', type: 'chips', label: 'Pay invoices online?', options: ['Yes', 'No'] },
        { id: 'q-repeat', type: 'chips', label: 'Scheduled / repeat orders?', options: ['Yes', 'No'] },
        { id: 'q-punchout', type: 'chips', label: 'Punchout (Ariba, Coupa)?', options: ['Yes', 'No', 'Not sure'] }
      ]}
    ]
  },
  {
    id: 'project', label: 'Project', tagline: 'Scope, money, and people',
    hotspots: [
      { id: 'p-timeline', x: 60, y: 180, w: 1320, h: 290, label: 'Timeline', info: 'Discover, blueprint, build, launch. We work backwards from your real deadline — not forwards from an optimistic one.' },
      { id: 'p-budget', x: 60, y: 520, w: 660, h: 310, label: 'Budget', info: 'Clear scope, fixed price. A real range now saves everyone three weeks of proposal theater later.' },
      { id: 'p-team', x: 740, y: 520, w: 640, h: 310, label: 'The team', info: 'Your side and ours. Projects move at the speed of the least-available person — so we name them now.' }
    ],
    groups: [
      { id: 'g-timeline', hotspotId: 'p-timeline', title: 'Timeline', questions: [
        { id: 'q-launch', type: 'text', label: 'Target launch date — and what\'s driving it?', placeholder: 'e.g. Q2, before trade-show season' },
        { id: 'q-deadlines', type: 'textarea', label: 'Hard deadlines we should know about?', placeholder: 'Contract expirations, ERP cutover, events…' },
        { id: 'q-phased', type: 'chips', label: 'Rollout approach', options: ['Phased', 'All at once', 'You tell us'] }
      ]},
      { id: 'g-budget', hotspotId: 'p-budget', title: 'Budget', questions: [
        { id: 'q-budget', type: 'chips', label: 'Budget range', options: ['<$75K', '$75–150K', '$150–300K', '$300K+', 'Not set'] },
        { id: 'q-signoff', type: 'text', label: 'Who signs off on this spend?', placeholder: 'Name and title' }
      ]},
      { id: 'g-team', hotspotId: 'p-team', title: 'The team', questions: [
        { id: 'q-internal', type: 'textarea', label: 'Your internal team — who owns what?', placeholder: 'Project owner, IT, product data, marketing…' },
        { id: 'q-capacity', type: 'chips', label: 'In-house dev / IT capacity', options: ['Strong', 'Some', 'None'] },
        { id: 'q-procurement', type: 'textarea', label: 'Decision process from here?', placeholder: 'Proposal review, legal, procurement steps…' }
      ]}
    ]
  },
  {
    id: 'growth', label: 'Growth', tagline: 'After the launch',
    hotspots: [
      { id: 'w-tiers', x: 920, y: 160, w: 460, h: 460, label: 'Support model', info: 'Launch day is the starting line. Retainer, on-call, or full handoff — the right answer depends on who runs the site on day 31.' },
      { id: 'w-chart', x: 60, y: 160, w: 860, h: 460, label: 'Optimization', info: 'The first 12 months decide whether the site compounds or plateaus. What we measure monthly determines what we improve.' },
      { id: 'w-roadmap', x: 60, y: 630, w: 1320, h: 200, label: 'The roadmap', info: 'Everything we cut to hit launch goes here — ranked, scoped, and waiting. Phase 2 should be a plan, not a maybe.' }
    ],
    groups: [
      { id: 'g-support', hotspotId: 'w-tiers', title: 'Support model', questions: [
        { id: 'q-support', type: 'chips', label: 'Post-launch support level', options: ['Growth retainer', 'On-call', 'Full handoff'] },
        { id: 'q-dayto', type: 'text', label: 'Who runs the site day-to-day after launch?', placeholder: 'Name, role, or "that\'s the problem"' }
      ]},
      { id: 'g-optimize', hotspotId: 'w-chart', title: 'Optimization', questions: [
        { id: 'q-metrics', type: 'textarea', label: 'Which metrics will you watch monthly?', placeholder: 'Online revenue %, new accounts, reorder rate…' },
        { id: 'q-analytics', type: 'text', label: 'Current analytics stack', placeholder: 'GA4, ERP reports, gut feel…' },
        { id: 'q-testing', type: 'chips', label: 'A/B testing appetite', options: ['Yes', 'Later', 'No'] }
      ]},
      { id: 'g-roadmap', hotspotId: 'w-roadmap', title: 'The roadmap', questions: [
        { id: 'q-phase2', type: 'textarea', label: 'What belongs in phase 2?', placeholder: 'The things we\'ll cut to hit launch…' },
        { id: 'q-newchannels', type: 'chips-multi', label: 'New channels ahead', options: ['Marketplaces', 'International', 'D2C', 'None yet'] },
        { id: 'q-marketing', type: 'chips-multi', label: 'Marketing support needed', options: ['SEO', 'Email / SMS', 'Paid', 'None'] }
      ]}
    ]
  },
  {
    id: 'enclosing', label: 'Enclosing', tagline: 'What we might have missed',
    hotspots: [
      { id: 'n-summary', x: 60, y: 190, w: 900, h: 640, label: 'The gaps', info: 'Everything we captured today, step by step. Now the most valuable question: what did we not ask?' },
      { id: 'n-relationship', x: 960, y: 190, w: 420, h: 300, label: 'The relationship', info: 'You\'ve worked with agencies before. What they got wrong — and right — tells us how to work with you.' },
      { id: 'n-next', x: 960, y: 510, w: 420, h: 320, label: 'Next steps', info: 'No pitch deck. No slick spin. A proposal date, the people who need to see it, and what a home run looks like.' }
    ],
    groups: [
      { id: 'g-gaps', hotspotId: 'n-summary', title: 'The gaps', questions: [
        { id: 'q-missed', type: 'textarea', label: 'What haven\'t we asked that we should have?', placeholder: 'The thing on your mind we didn\'t cover…' },
        { id: 'q-risk', type: 'textarea', label: 'Biggest risk to this project?', placeholder: 'Internal or external…' }
      ]},
      { id: 'g-relationship', hotspotId: 'n-relationship', title: 'The relationship', questions: [
        { id: 'q-agencies', type: 'textarea', label: 'Past agency experiences — good and bad?', placeholder: 'What worked, what burned you…' },
        { id: 'q-comms', type: 'text', label: 'How do you want to work together?', placeholder: 'Cadence, tools, meeting style…' }
      ]},
      { id: 'g-next', hotspotId: 'n-next', title: 'Next steps', questions: [
        { id: 'q-proposal', type: 'text', label: 'When do you want the proposal?', placeholder: 'A real date' },
        { id: 'q-audience', type: 'text', label: 'Who else needs to see it?', placeholder: 'Names and roles' },
        { id: 'q-confidential', type: 'textarea', label: 'Anything confidential we should know?', placeholder: 'Stays in the room…' },
        { id: 'q-homerun', type: 'textarea', label: 'What would make this a home run?', placeholder: 'Beyond the obvious…' }
      ]}
    ]
  }
];
