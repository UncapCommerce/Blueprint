// Flat catalog of every discovery question, used by the RFP/document
// pre-fill (handleAdminDiscoveryPrefill) to tell Claude which answer slots
// exist and to build the structured-output schema that keeps chip answers
// valid.
//
// KEEP IN SYNC with public/discovery/discovery-data.js — when a question is
// added, removed, or its options change there, mirror it here (and add its
// example answer to DEMO_ANSWERS in worker/index.js, per the existing rule).
//
// type: 'text' | 'textarea' (free string), 'chips' (one of options),
// 'chips-multi' (array of options).

export const QUESTION_CATALOG = [
  // 1 · Client
  { id: 'q-name', step: 'Company', label: 'Company name', type: 'text' },
  { id: 'q-what', step: 'Company', label: 'What do you make or distribute?', type: 'textarea' },
  { id: 'q-rev', step: 'Company', label: 'Annual revenue', type: 'chips', options: ['<$10M', '$10–50M', '$50–250M', '$250M+'] },
  { id: 'q-stake', step: 'Company', label: 'Who are the key stakeholders?', type: 'textarea' },
  { id: 'q-owner', step: 'Company', label: 'Who owns the ecommerce P&L?', type: 'text' },
  { id: 'q-why', step: 'Company', label: 'Why now, what triggered this project?', type: 'textarea' },
  { id: 'q-success', step: 'Company', label: 'What does success look like in 12 months?', type: 'textarea' },
  { id: 'q-channels', step: 'Company', label: 'How do you sell today?', type: 'chips-multi', options: ['Sales reps', 'Phone / email', 'Legacy site', 'Marketplaces', 'EDI'] },
  // 2 · Architecture
  // Rendered as a cascading vendor/edition dropdown in the UI, like q-erp.
  { id: 'q-platform', step: 'Architecture', label: 'Current commerce platform. Prefer the format "Vendor · Edition", e.g. "Adobe Commerce (Magento) · Magento Open Source" or "BigCommerce · Enterprise"; write "No Ecommerce Platform" when the document says they have none', type: 'text' },
  { id: 'q-breaking', step: 'Architecture', label: 'What is breaking today?', type: 'textarea' },
  // Rendered as a cascading vendor/edition dropdown in the UI; prefill stays
  // free text and the frontend maps it onto the dropdowns (or Other).
  { id: 'q-erp', step: 'Architecture', label: 'Which ERP do you run? Prefer the format "Vendor · Edition", e.g. "Sage · X3" or "Oracle · NetSuite"; write "No ERP" when the document says they run none', type: 'text' },
  // Rendered as a dropdown in the UI; prefer a product name (e.g. "Akeneo",
  // "Salsify") or "No PIM" when product data lives in spreadsheets or the ERP.
  { id: 'q-pim', step: 'Architecture', label: 'Their PIM platform, e.g. "Akeneo" or "Salsify"; write "No PIM" when product data lives in spreadsheets or the ERP', type: 'text' },
  { id: 'q-pim-skus', step: 'Architecture', label: 'Number of SKUs (digits as written, e.g. "48,000")', type: 'text' },
  { id: 'q-pim-products', step: 'Architecture', label: 'Number of products', type: 'text' },
  { id: 'q-pim-categories', step: 'Architecture', label: 'Number of product categories', type: 'text' },
  { id: 'q-pim-filters', step: 'Architecture', label: 'Number of filter groups / facets', type: 'text' },
  { id: 'q-pim-attributes', step: 'Architecture', label: 'Number of product attributes', type: 'text' },
  { id: 'q-wms', step: 'Architecture', label: 'Warehouse management system (WMS)', type: 'text' },
  { id: 'q-ims', step: 'Architecture', label: 'Inventory management system (IMS)', type: 'text' },
  { id: 'q-oms', step: 'Architecture', label: 'Order management system (OMS)', type: 'text' },
  { id: 'q-fulfilsys', step: 'Architecture', label: 'Fulfillment Management System (shipping software, 3PL)', type: 'text' },
  { id: 'q-locations', step: 'Architecture', label: 'Number of fulfillment locations', type: 'text' },
  { id: 'q-integrations', step: 'Architecture', label: 'Existing integrations or middleware?', type: 'textarea' },
  { id: 'q-edi', step: 'Architecture', label: 'EDI requirements?', type: 'chips', options: ['Yes', 'No', 'Not sure'] },
  { id: 'q-punchout', step: 'Architecture', label: 'PunchOut (Ariba, Coupa)?', type: 'chips', options: ['Yes', 'No', 'Not sure'] },
  { id: 'q-paygateway', step: 'Architecture', label: 'Payment gateway / processor', type: 'text' },
  { id: 'q-payoptions', step: 'Architecture', label: 'Do you offer (payment options)', type: 'chips-multi', options: ['Credit Cards', 'ACH', 'Net Terms', 'PO Orders', 'Subscriptions'] },
  // Rendered as a dropdown in the UI; prefer a product name, "No CRM" when none.
  { id: 'q-crm', step: 'Architecture', label: 'Their CRM platform, e.g. "Salesforce" or "HubSpot"; write "No CRM" when the document says they have none', type: 'text' },
  { id: 'q-crm-quotes', step: 'Architecture', label: 'How do you manage quotes?', type: 'textarea' },
  { id: 'q-maintains', step: 'Architecture', label: 'Who maintains integrations today?', type: 'text' },
  // 3 · Experience
  { id: 'q-5sec', step: 'Experience', label: 'What should a buyer understand in 5 seconds?', type: 'textarea' },
  { id: 'q-brand', step: 'Experience', label: 'Brand assets ready?', type: 'chips', options: ['Full brand kit', 'Logo only', 'Needs work'] },
  { id: 'q-lookup', step: 'Experience', label: 'How do buyers look for products?', type: 'textarea' },
  { id: 'q-skus', step: 'Experience', label: 'SKU count', type: 'chips', options: ['<1K', '1–10K', '10–100K', '100K+'] },
  { id: 'q-topcats', step: 'Experience', label: 'Top categories to feature', type: 'text' },
  { id: 'q-convince', step: 'Experience', label: 'What convinces a new account to buy?', type: 'textarea' },
  { id: 'q-guest', step: 'Experience', label: 'Pricing visible to guests?', type: 'chips', options: ['Yes, list price', 'Login to see', 'Partial'] },
  { id: 'q-custpricing', step: 'Experience', label: 'Customer-specific pricing?', type: 'chips', options: ['Yes', 'No', 'Phase 2'] },
  // 4 · Discovery
  { id: 'q-attrs', step: 'Discovery', label: 'Which attributes do buyers filter by?', type: 'textarea' },
  { id: 'q-dataq', step: 'Discovery', label: 'Attribute data quality', type: 'chips', options: ['Clean', 'Messy', 'Nonexistent'] },
  { id: 'q-card', step: 'Discovery', label: 'What must a product card show?', type: 'textarea' },
  { id: 'q-stock', step: 'Discovery', label: 'Stock visibility', type: 'chips', options: ['Exact qty', 'In / out', 'By location'] },
  { id: 'q-partsearch', step: 'Discovery', label: 'Part-number search', type: 'chips', options: ['Critical', 'Nice to have', 'Not needed'] },
  { id: 'q-crossref', step: 'Discovery', label: 'Cross-reference / alternates?', type: 'chips', options: ['Yes', 'No', 'Not sure'] },
  { id: 'q-ordersize', step: 'Discovery', label: 'Typical lines per order', type: 'chips', options: ['1–5', '5–20', '20+'] },
  { id: 'q-compare', step: 'Discovery', label: 'Product compare needed?', type: 'chips', options: ['Yes', 'No'] },
  // 5 · Conversion
  { id: 'q-pricing', step: 'Conversion', label: 'How is pricing structured?', type: 'textarea' },
  { id: 'q-qtybreaks', step: 'Conversion', label: 'Show quantity-break pricing?', type: 'chips', options: ['Yes', 'No'] },
  { id: 'q-uom', step: 'Conversion', label: 'Units of measure', type: 'chips', options: ['Single', 'Each / case', 'Complex'] },
  { id: 'q-techcontent', step: 'Conversion', label: 'What technical content closes the sale?', type: 'textarea' },
  { id: 'q-assets', step: 'Conversion', label: 'Where do spec sheets / CAD live today?', type: 'text' },
  { id: 'q-leadtime', step: 'Conversion', label: 'Can you promise lead times?', type: 'chips', options: ['Yes', 'Varies', 'No'] },
  { id: 'q-quote', step: 'Conversion', label: 'Quote instead of buy for some items?', type: 'chips', options: ['Yes', 'No'] },
  { id: 'q-rep', step: 'Conversion', label: 'Show the rep on the product page?', type: 'chips', options: ['Yes', 'No'] },
  // 6 · Revenue
  { id: 'q-aov', step: 'Revenue', label: 'Typical order value', type: 'chips', options: ['<$500', '$500–5K', '$5–50K', '$50K+'] },
  { id: 'q-friction', step: 'Revenue', label: 'What kills orders at checkout today?', type: 'textarea' },
  { id: 'q-paymethods', step: 'Revenue', label: 'Payment methods needed', type: 'chips-multi', options: ['Credit card', 'PO / net terms', 'ACH', 'Credit line'] },
  { id: 'q-terms', step: 'Revenue', label: 'How are net terms approved?', type: 'textarea' },
  { id: 'q-freight', step: 'Revenue', label: 'Shipping complexity?', type: 'textarea' },
  { id: 'q-split', step: 'Revenue', label: 'Split shipments?', type: 'chips', options: ['Yes', 'No'] },
  { id: 'q-freightquote', step: 'Revenue', label: 'Real-time freight quotes?', type: 'chips', options: ['Yes', 'No', 'Not sure'] },
  { id: 'q-taxexempt', step: 'Revenue', label: 'Tax-exempt customers?', type: 'chips', options: ['Yes', 'No', 'Not sure'] },
  // 7 · Unified
  { id: 'q-roles', step: 'Unified', label: 'Do buyer accounts need roles or approvals?', type: 'textarea' },
  { id: 'q-accounts', step: 'Unified', label: 'Active customer accounts', type: 'chips', options: ['<100', '100–1K', '1–10K', '10K+'] },
  { id: 'q-quoteflow', step: 'Unified', label: 'How does quote-to-order work today?', type: 'textarea' },
  { id: 'q-repsorder', step: 'Unified', label: 'Do reps place orders for customers?', type: 'chips', options: ['Yes', 'Sometimes', 'No'] },
  { id: 'q-calls', step: 'Unified', label: 'What do customers call for that they should self-serve?', type: 'textarea' },
  { id: 'q-payinvoice', step: 'Unified', label: 'Pay invoices online?', type: 'chips', options: ['Yes', 'No'] },
  { id: 'q-repeat', step: 'Unified', label: 'Scheduled / repeat orders?', type: 'chips', options: ['Yes', 'No'] },
  // 8 · Project
  { id: 'q-launch', step: 'Project', label: 'Target launch date, and what is driving it?', type: 'text' },
  { id: 'q-deadlines', step: 'Project', label: 'Hard deadlines we should know about?', type: 'textarea' },
  { id: 'q-phased', step: 'Project', label: 'Rollout approach', type: 'chips', options: ['Phased', 'All at once', 'You tell us'] },
  { id: 'q-budget', step: 'Project', label: 'Budget range', type: 'chips', options: ['<$75K', '$75–150K', '$150–300K', '$300K+', 'Not set'] },
  { id: 'q-signoff', step: 'Project', label: 'Who signs off on this spend?', type: 'text' },
  { id: 'q-internal', step: 'Project', label: 'Your internal team, who owns what?', type: 'textarea' },
  { id: 'q-capacity', step: 'Project', label: 'In-house dev / IT capacity', type: 'chips', options: ['Strong', 'Some', 'None'] },
  { id: 'q-procurement', step: 'Project', label: 'Decision process from here?', type: 'textarea' },
  // 9 · Growth
  { id: 'q-support', step: 'Growth', label: 'Post-launch support level', type: 'chips', options: ['Growth retainer', 'On-call', 'Full handoff'] },
  { id: 'q-dayto', step: 'Growth', label: 'Who runs the site day-to-day after launch?', type: 'text' },
  { id: 'q-metrics', step: 'Growth', label: 'Which metrics will you watch monthly?', type: 'textarea' },
  { id: 'q-analytics', step: 'Growth', label: 'Current analytics stack', type: 'text' },
  { id: 'q-testing', step: 'Growth', label: 'A/B testing appetite', type: 'chips', options: ['Yes', 'Later', 'No'] },
  { id: 'q-phase2', step: 'Growth', label: 'What belongs in phase 2?', type: 'textarea' },
  { id: 'q-newchannels', step: 'Growth', label: 'New channels ahead', type: 'chips-multi', options: ['Marketplaces', 'International', 'D2C', 'None yet'] },
  { id: 'q-marketing', step: 'Growth', label: 'Marketing support needed', type: 'chips-multi', options: ['SEO', 'Email / SMS', 'Paid', 'None'] },
  // 10 · Enclosing
  { id: 'q-missed', step: 'Enclosing', label: 'What have we not asked that we should have?', type: 'textarea' },
  { id: 'q-risk', step: 'Enclosing', label: 'Biggest risk to this project?', type: 'textarea' },
  { id: 'q-agencies', step: 'Enclosing', label: 'Past agency experiences, good and bad?', type: 'textarea' },
  { id: 'q-comms', step: 'Enclosing', label: 'How do you want to work together?', type: 'text' },
  { id: 'q-proposal', step: 'Enclosing', label: 'When do you want the proposal?', type: 'text' },
  { id: 'q-audience', step: 'Enclosing', label: 'Who else needs to see it?', type: 'text' },
  { id: 'q-confidential', step: 'Enclosing', label: 'Anything confidential we should know?', type: 'textarea' },
  { id: 'q-homerun', step: 'Enclosing', label: 'What would make this a home run?', type: 'textarea' },
];
