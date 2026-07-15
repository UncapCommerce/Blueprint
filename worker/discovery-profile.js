// Per-discovery wireframe profile.
//
// The discovery experience's rich scenes (3-6 storefront frames + the step-7
// B2B portal) ship as static HTML written around a fictional MRO brand,
// "Harlow Supply". When an admin creates a discovery we build a *profile*
// for it: a flat list of [from, to] text swaps the frontend applies to the
// scene HTML so every wireframe reads as the client's own store - their
// company name in the masthead, and categories/products/copy that match
// what their website actually sells.
//
// Content comes from two places, best first:
//   1. The client's website, fetched once at creation time: meta
//      description (their own voice for the hero), nav links (categories),
//      and JSON-LD Product blocks (product names).
//   2. An industry preset, picked by keyword-scoring the fetched page (or
//      just the domain + company name when the fetch fails). Presets carry
//      full dummy content for the vertical so a thin site still yields a
//      believable store.
//
// The profile is stored on the discovery record at creation and served to
// the experience via /api/discovery/meta and /api/discovery/answers.
// Discoveries created before this shipped (and the /discovery/uncap/ demo)
// have no profile and keep the stock Harlow scenes.

// ── Industry presets ──────────────────────────────────────────────────────
// Every preset supplies the full slot set; DEFAULTS fills what a preset
// omits. Slot names line up with TOKEN_SLOTS below.

const DEFAULTS = {
  label: 'WHOLESALE SUPPLY',
  heroH: 'Everything your customers reorder, in one place.',
  heroS: 'Net-30 terms. Same-day shipping. A rep who actually answers.',
  search: 'Search 48,000 SKUs, a part #, or a keyword…',
  nav1: 'My Lists',
  fitT: 'Find the right product', fitS: 'Narrow it down fast', fitC: 'Find products →',
  fitF1: 'Category', fitF2: 'Type', fitF3: 'Spec',
  bestSub: 'Reordered most by customers like yours',
  footer: 'Wholesale supply for teams that reorder weekly. Net-30 terms, same-day shipping, a rep who answers.',
  attr: 'Spec',
  pdpVar: 'standard spec',
  opts: ['Standard · Stock', 'Plus · Upgraded', 'Pro · Heavy duty'],
  buyer: 'Crestview Partners',
};

const PRESETS = {
  industrial: {
    kw: ['industrial', 'mro', 'abrasives', 'fasteners', 'welding', 'machining', 'bearings', 'valves', 'pumps', 'safety supplies', 'cutting tools', 'maintenance', 'fabrication', 'metalworking', 'hydraulic', 'pneumatic'],
    label: 'MRO SUPPLY',
    heroH: 'The parts your floor runs on. Without the runaround.',
    search: 'Search 48,000 SKUs, a part #, or a cross-reference…',
    nav1: 'My Garage',
    fitT: 'Find parts that fit', fitS: 'Select your equipment', fitC: 'Find parts →',
    fitF1: 'Year', fitF2: 'Make', fitF3: 'Model',
    bestSub: 'Reordered most by shops like yours',
    footer: 'MRO and industrial supply for plants and fab shops. Net-30 terms, same-day shipping, a rep who answers.',
    cats: ['Abrasives', 'Fasteners', 'Safety & PPE', 'Power Tools', 'Cutting Tools', 'Material Handling', 'Fluid Power', 'Electrical'],
    brands: ['Norseman', 'Walter', 'Pferd', 'Milwaukee', '3M'],
    attr: 'Grit',
    plpSub: 'Grinding wheels',
    plpDesc: 'Type-27 and type-1 wheels for angle grinders and bench grinders, in aluminum oxide, zirconia, and ceramic, in every common diameter and arbor. Filter by spec on the left, or paste a part number.',
    pdpVar: 'A24R, Type 27',
    opts: ['A24R · Coarse', 'A36S · Medium', 'A60T · Fine'],
    products: {
      p1: 'Norseman 4½" grinding wheel', p2: 'Walter flap disc, 60 grit zirconia', p3: 'Grade 8 hex bolt, ⅜"-16 × 2"',
      p4: 'Cut-resistant gloves, ANSI A4', p5: 'M18 cordless angle grinder', p6: 'Cobalt jobber drill set, 29 pc',
      p7: 'Ceramic fibre disc, 36 grit', p8: 'Structural washer, ½" hot-dip', p9: 'Cut-off wheel, 3" × .035", 25 pk',
      a1: 'Backing pad, 4½" fiber-reinforced', a2: 'Face shield, anti-fog polycarbonate',
      r1: 'Grinding wheels A24R', r2: 'Nitrile gloves, L', r3: 'Cutting fluid, 5 gal',
      q1: 'Grinding wheels × 400', q2: 'Safety restock, Q3', q3: 'Cut-off wheels, bulk', q4: 'Flap discs × 200',
    },
    buyer: 'Maplewood Fabrication',
  },

  packaging: {
    kw: ['packaging', 'corrugated', 'carton', 'cartons', 'mailer', 'mailers', 'shipping supplies', 'boxes', 'poly bag', 'stretch wrap', 'bubble', 'void fill', 'tape', 'pallet wrap', 'janitorial'],
    label: 'PACKAGING SUPPLY',
    heroH: 'Every box, bag, and roll your shipping line runs on.',
    search: 'Search 48,000 SKUs, a size, or a case quantity…',
    fitT: 'Find the right box', fitS: 'Size it to your product', fitC: 'Find boxes →',
    fitF1: 'Length', fitF2: 'Width', fitF3: 'Depth',
    bestSub: 'Reordered most by shippers like yours',
    footer: 'Packaging and shipping supplies for operations that ship every day. Net-30 terms, same-day shipping, a rep who answers.',
    cats: ['Boxes', 'Mailers', 'Tape & Adhesives', 'Protective Packaging', 'Poly Bags', 'Stretch Wrap', 'Labels & Marking', 'Janitorial'],
    brands: ['Sealed Air', 'Intertape', 'Pregis', 'Scotch', '3M'],
    attr: 'Strength',
    plpSub: 'Mailer boxes',
    plpDesc: 'Kraft and white corrugated mailers in every common footprint, from literature mailers to heavy-duty shippers. Filter by size on the left, or paste a part number.',
    pdpVar: '32 ECT kraft',
    opts: ['32 ECT · Standard', '44 ECT · Heavy duty', '51 ECT · Double wall'],
    products: {
      p1: 'Kraft mailer box, 12 × 9 × 4', p2: 'Clear poly bag, 2 mil, 9 × 12', p3: 'Carton sealing tape, 2" acrylic',
      p4: 'Bubble cushioning roll, 3/16"', p5: 'Stretch wrap, 80 gauge, 18"', p6: 'Kraft void fill paper, 30 lb',
      p7: 'Shipping labels, 4 × 6, 500 rl', p8: 'Corner protectors, 3" kraft', p9: 'Edge protectors, 48", 25 pk',
      a1: 'Box stapler, 5/8" crown', a2: 'Tape dispenser, 2" pistol grip',
      r1: 'Kraft mailers, 12 × 9', r2: 'Poly bags, 2 mil', r3: 'Sealing tape, acrylic',
      q1: 'Mailer boxes × 400', q2: 'Warehouse restock, Q3', q3: 'Stretch wrap, bulk', q4: 'Poly bags × 200',
    },
    buyer: 'Summit Fulfillment',
  },

  medical: {
    kw: ['medical', 'dental', 'clinic', 'clinical', 'surgical', 'hospital', 'patient', 'exam', 'diagnostic', 'healthcare', 'nursing', 'veterinary', 'oral care', 'anatomy'],
    label: 'MEDICAL SUPPLY',
    heroH: 'Clinical supplies your team can count on.',
    search: 'Search 48,000 SKUs, a part #, or an NDC…',
    fitT: 'Find the right fit', fitS: 'Select your specialty', fitC: 'Find supplies →',
    fitF1: 'Specialty', fitF2: 'Category', fitF3: 'Brand',
    bestSub: 'Reordered most by clinics like yours',
    footer: 'Medical and clinical supplies for practices that run on schedule. Net-30 terms, same-day shipping, a rep who answers.',
    cats: ['Exam Room', 'Diagnostics', 'Wound Care', 'Infection Control', 'Instruments', 'Mobility', 'Respiratory', 'Lab Supplies'],
    brands: ['Medline', 'McKesson', 'Dynarex', 'Welch Allyn', '3M'],
    attr: 'Size',
    plpSub: 'Exam gloves',
    plpDesc: 'Nitrile, latex, and vinyl exam gloves in every size and mil thickness, with powder-free and chemo-rated options. Filter by spec on the left, or paste a part number.',
    pdpVar: 'nitrile, powder-free',
    opts: ['3 mil · Exam', '5 mil · Extended cuff', '8 mil · Chemo-rated'],
    products: {
      p1: 'Nitrile exam gloves, 4 mil, L', p2: 'No-touch digital thermometer', p3: 'Gauze pads, 4 × 4, sterile',
      p4: 'Isolation gowns, level 2', p5: 'Fingertip pulse oximeter', p6: 'Suture removal kit, sterile',
      p7: 'Alcohol prep pads, 200 bx', p8: 'Exam table paper, 21" crepe', p9: 'Face masks, ASTM L3, 50 bx',
      a1: 'Glove box holder, wire', a2: 'Sharps container, 5 qt',
      r1: 'Exam gloves, 4 mil', r2: 'Gauze pads, sterile', r3: 'Prep pads, 200 ct',
      q1: 'Exam gloves × 400', q2: 'Clinic restock, Q3', q3: 'Gowns, bulk', q4: 'Thermometers × 200',
    },
    buyer: 'Lakeside Clinic Group',
  },

  automotive: {
    kw: ['automotive', 'auto parts', 'vehicle', 'truck', 'engine', 'alternator', 'brake', 'oem', 'fitment', 'transmission', 'powersports', 'atv', 'scooter', 'motorcycle', 'gps'],
    label: 'AUTO PARTS',
    heroH: 'The parts your bays turn wrenches on. In stock.',
    search: 'Search 48,000 SKUs, a part #, or a VIN…',
    nav1: 'My Garage',
    fitT: 'Find parts that fit', fitS: 'Select your vehicle', fitC: 'Find parts →',
    fitF1: 'Year', fitF2: 'Make', fitF3: 'Model',
    bestSub: 'Reordered most by shops like yours',
    footer: 'Auto and fleet parts with real fitment data. Net-30 terms, same-day shipping, a rep who answers.',
    cats: ['Engine', 'Brakes', 'Electrical', 'Suspension', 'Cooling', 'Filters', 'Lighting', 'Tools & Shop'],
    brands: ['Bosch', 'ACDelco', 'Denso', 'Moog', 'Gates'],
    attr: 'Fitment',
    plpSub: 'Brake rotors',
    plpDesc: 'OE-quality rotors in vented, slotted, and drilled patterns for daily drivers and fleet duty. Filter by vehicle on the left, or paste a part number.',
    pdpVar: 'vented, OE spec',
    opts: ['OE · Standard', 'HD · Fleet duty', 'Sport · Slotted'],
    products: {
      p1: 'Front brake rotor, vented, 12.6"', p2: 'Ceramic brake pads, front set', p3: 'Alternator, 160A reman',
      p4: 'Cabin air filter, carbon', p5: 'LED headlight pair, 9005', p6: 'Serpentine belt, 6-rib, 84"',
      p7: 'Oil filter, spin-on, 10 pk', p8: 'Wheel bearing hub assembly', p9: 'Brake cleaner, 14 oz, 12 pk',
      a1: 'Brake grease, synthetic, 8 oz', a2: 'Anti-seize compound, 4 oz',
      r1: 'Brake rotors, front', r2: 'Ceramic pads, front', r3: 'Oil filters, 10 pk',
      q1: 'Brake rotors × 400', q2: 'Shop restock, Q3', q3: 'Alternators, bulk', q4: 'Filters × 200',
    },
    buyer: 'Ridgeline Fleet Service',
  },

  electronics: {
    kw: ['electronics', 'audio', 'video', 'camera', 'cable', 'network', 'computer', 'wireless', 'hdmi', 'av', 'led', 'monitor', 'projector', 'server'],
    label: 'ELECTRONICS SUPPLY',
    heroH: 'The gear your installs depend on. Tested and in stock.',
    search: 'Search 48,000 SKUs, a part #, or a spec…',
    nav1: 'My Projects',
    fitT: 'Find compatible gear', fitS: 'Match it to your setup', fitC: 'Find gear →',
    fitF1: 'Device', fitF2: 'Standard', fitF3: 'Length',
    bestSub: 'Reordered most by integrators like yours',
    footer: 'Pro AV and IT hardware for installers and IT teams. Net-30 terms, same-day shipping, a rep who answers.',
    cats: ['Cables & Adapters', 'Networking', 'Audio', 'Video & Displays', 'Power', 'Mounts & Racks', 'Smart Devices', 'Accessories'],
    brands: ['Belkin', 'Anker', 'Ubiquiti', 'Samsung', 'Logitech'],
    attr: 'Spec',
    plpSub: 'HDMI cables',
    plpDesc: 'Certified HDMI 2.1 leads in every common length, with braided and plenum-rated options. Filter by spec on the left, or paste a part number.',
    pdpVar: 'HDMI 2.1, braided',
    opts: ['4K · Standard', '8K · Certified', 'Plenum · In-wall'],
    products: {
      p1: 'HDMI 2.1 cable, braided, 6 ft', p2: 'Cat6A patch cable, 10 ft', p3: 'USB-C wall charger, 65W GaN',
      p4: 'Wireless mouse, ergonomic', p5: '27" IPS monitor, 1440p', p6: 'Rack shelf, 1U vented',
      p7: 'Surge protector, 8 outlet', p8: 'Velcro cable ties, 100 pk', p9: 'HDMI couplers, 25 pk',
      a1: 'Cable tester, RJ45 and coax', a2: 'Label maker tape, 12 mm',
      r1: 'HDMI cables, 6 ft', r2: 'Patch cables, 10 ft', r3: 'Cable ties, 100 pk',
      q1: 'HDMI cables × 400', q2: 'AV refresh, Q3', q3: 'Patch cables, bulk', q4: 'Chargers × 200',
    },
    buyer: 'Beacon AV Integrators',
  },

  apparel: {
    kw: ['apparel', 'clothing', 'shirt', 'uniform', 'footwear', 'workwear', 'jacket', 'scrubs', 'embroidery', 'fashion', 'boots', 'jeans', 'western'],
    label: 'APPAREL & UNIFORMS',
    heroH: 'Gear your crews actually want to wear.',
    search: 'Search 48,000 SKUs, a style #, or a size…',
    nav1: 'My Sizes',
    fitT: 'Find the right fit', fitS: 'Dial in the size', fitC: 'Find sizes →',
    fitF1: 'Style', fitF2: 'Size', fitF3: 'Color',
    bestSub: 'Reordered most by crews like yours',
    footer: 'Workwear and uniforms for crews that work outside. Net-30 terms, same-day shipping, a rep who answers.',
    cats: ['Tees & Polos', 'Outerwear', 'Hi-Vis & Safety', 'Workwear', 'Footwear', 'Headwear', 'Scrubs', 'Accessories'],
    brands: ['Carhartt', 'Dickies', 'Gildan', 'Red Kap', 'Timberland PRO'],
    attr: 'Size',
    plpSub: 'Work jackets',
    plpDesc: 'Insulated and shell jackets built for jobsite wear, with embroidery-ready panels and hi-vis options. Filter by size on the left, or paste a style number.',
    pdpVar: 'insulated duck canvas',
    opts: ['M · Regular', 'L · Regular', 'XL · Tall'],
    products: {
      p1: 'Insulated duck jacket, brown', p2: 'Hi-vis safety vest, class 2', p3: 'Heavyweight tee, 3 pack',
      p4: 'Leather work gloves, L', p5: 'Comp-toe work boots, 10.5', p6: 'Canvas work pants, 34 × 32',
      p7: 'Knit beanie, embroidered', p8: 'Leather belt, size 38', p9: 'Crew socks, wool blend, 6 pk',
      a1: 'Boot insoles, gel', a2: 'Jacket liner, quilted',
      r1: 'Duck jackets, brown', r2: 'Hi-vis vests, cl 2', r3: 'Tees, 3 pack',
      q1: 'Duck jackets × 400', q2: 'Crew uniforms, Q3', q3: 'Hi-vis vests, bulk', q4: 'Tees × 200',
    },
    buyer: 'Northline Contracting',
  },

  food: {
    kw: ['food', 'beverage', 'coffee', 'snack', 'gourmet', 'organic', 'chocolate', 'candy', 'sauce', 'bakery', 'tea', 'foodservice', 'restaurant', 'grocery'],
    label: 'FOOD & BEVERAGE',
    heroH: 'Everything behind the counter, one order away.',
    search: 'Search 48,000 SKUs, an item #, or a brand…',
    nav1: 'My Pars',
    fitT: 'Build your par list', fitS: 'Match it to your menu', fitC: 'Build list →',
    fitF1: 'Menu', fitF2: 'Category', fitF3: 'Pack',
    bestSub: 'Reordered most by cafes like yours',
    footer: 'Foodservice supply for kitchens and cafes that never close. Net-30 terms, same-day shipping, a rep who answers.',
    cats: ['Coffee & Tea', 'Snacks', 'Pantry', 'Beverages', 'Baking', 'Candy & Chocolate', 'Condiments', 'Equipment'],
    brands: ['Ghirardelli', 'Torani', 'Lavazza', 'Monin', 'Callebaut'],
    attr: 'Pack size',
    plpSub: 'Whole bean coffee',
    plpDesc: 'Single-origin and blended whole bean coffee in foodservice pack sizes, from light roast to espresso. Filter by roast on the left, or paste an item number.',
    pdpVar: 'medium roast, 5 lb',
    opts: ['Light · Breakfast', 'Medium · House', 'Dark · Espresso'],
    products: {
      p1: 'House blend coffee, 5 lb bag', p2: 'Vanilla syrup, 750 ml', p3: 'Chocolate chips, 25 lb bulk',
      p4: 'Compostable cups, 12 oz, 1000', p5: 'Sparkling water, 24 pk', p6: 'Raw sugar packets, 1200 ct',
      p7: 'Oat milk, barista, 12 ct', p8: 'Cocoa powder, Dutch, 5 lb', p9: 'Cup lids, 12 oz, 1000 ct',
      a1: 'Portafilter basket, 58 mm', a2: 'Milk pitcher, 20 oz',
      r1: 'House blend, 5 lb', r2: 'Vanilla syrup', r3: 'Oat milk, 12 ct',
      q1: 'House blend × 400', q2: 'Cafe restock, Q3', q3: 'Cups, bulk', q4: 'Syrups × 200',
    },
    buyer: 'Harvest Cafe Group',
  },

  home: {
    kw: ['furniture', 'home decor', 'garden', 'decor', 'lighting', 'kitchen', 'patio', 'rug', 'outdoor living', 'planter', 'bedding', 'bath', 'mattress'],
    label: 'HOME & GARDEN',
    heroH: 'Rooms your customers want to live in.',
    search: 'Search 48,000 SKUs, a style, or a collection…',
    nav1: 'My Boards',
    fitT: 'Find the right piece', fitS: 'Match it to the room', fitC: 'Find pieces →',
    fitF1: 'Room', fitF2: 'Style', fitF3: 'Finish',
    bestSub: 'Reordered most by designers like yours',
    footer: 'Furniture and decor for homes and trade projects. Net-30 terms, fast freight, a rep who answers.',
    cats: ['Furniture', 'Lighting', 'Rugs & Decor', 'Kitchen & Dining', 'Bedding & Bath', 'Outdoor & Patio', 'Storage', 'Garden'],
    brands: ['Safavieh', 'Ashley', 'Kichler', 'Loloi', 'Keter'],
    attr: 'Finish',
    plpSub: 'Accent chairs',
    plpDesc: 'Upholstered and wood-frame accent chairs across every style, with quick-ship fabrics and trade pricing. Filter by finish on the left, or paste a SKU.',
    pdpVar: 'boucle, oak legs',
    opts: ['Oak · Natural', 'Walnut · Dark', 'Black · Painted'],
    products: {
      p1: 'Boucle accent chair, cream', p2: 'Jute area rug, 8 × 10', p3: 'Ceramic table lamp, 24"',
      p4: 'Linen throw pillows, 2 pk', p5: 'Solid oak side table', p6: 'Arched wall mirror, 36"',
      p7: 'Stoneware vase, 10"', p8: 'Woven storage baskets, 3 pk', p9: 'Fluted planters, 12", 2 pk',
      a1: 'Furniture pads, felt, 24 pk', a2: 'Rug pad, 8 × 10',
      r1: 'Accent chairs, cream', r2: 'Jute rugs, 8 × 10', r3: 'Throw pillows, 2 pk',
      q1: 'Accent chairs × 40', q2: 'Showroom refresh, Q3', q3: 'Area rugs, bulk', q4: 'Table lamps × 200',
    },
    buyer: 'Grove Street Staging',
  },

  outdoors: {
    kw: ['outdoor', 'hunting', 'fishing', 'camping', 'marine', 'boat', 'kayak', 'tackle', 'archery', 'trail', 'hiking', 'rv'],
    label: 'OUTDOOR GEAR',
    heroH: 'Gear that comes back from the field.',
    search: 'Search 48,000 SKUs, a model #, or a brand…',
    nav1: 'My Gear',
    fitT: 'Find gear that fits', fitS: 'Match it to your rig', fitC: 'Find gear →',
    fitF1: 'Activity', fitF2: 'Series', fitF3: 'Model',
    bestSub: 'Reordered most by outfitters like yours',
    footer: 'Outdoor gear for guides, fleets, and serious hobbyists. Net-30 terms, same-day shipping, a rep who answers.',
    cats: ['Camping', 'Fishing', 'Hunting', 'Marine', 'Optics', 'Apparel', 'GPS & Electronics', 'Racks & Storage'],
    brands: ['Garmin', 'YETI', 'Shimano', 'Coleman', 'Plano'],
    attr: 'Series',
    plpSub: 'Handheld GPS',
    plpDesc: 'Trail, marine, and off-road GPS units with preloaded mapping and satellite messaging options. Filter by series on the left, or paste a model number.',
    pdpVar: 'preloaded topo maps',
    opts: ['Base · TopoActive', 'Plus · inReach', 'Pro · Multi-band'],
    products: {
      p1: 'Handheld GPS, 3" display', p2: 'Spinning reel, 3000 series', p3: 'Hard cooler, 45 qt, tan',
      p4: 'Trail camera, no-glow IR', p5: 'Kayak paddle, carbon, 230 cm', p6: 'Camp stove, 2 burner propane',
      p7: 'Tackle box, 3700 trays', p8: 'Dry bag, 20L roll-top', p9: 'Marine battery box, 27 series',
      a1: 'GPS mount, RAM ball', a2: 'Floating lanyard',
      r1: 'Handheld GPS units', r2: 'Trail cameras, IR', r3: 'Dry bags, 20L',
      q1: 'GPS units × 400', q2: 'Season restock, Q3', q3: 'Coolers, bulk', q4: 'Reels × 200',
    },
    buyer: 'Backcountry Outfitters',
  },

  crafts: {
    kw: ['craft', 'crafts', 'hobby', 'sewing', 'stitch', 'cross-stitch', 'needlework', 'yarn', 'fabric', 'beads', 'quilt', 'embroidery', 'needlepoint', 'scrapbook'],
    label: 'CRAFT SUPPLY',
    heroH: 'Every skein, count, and kit your stitchers ask for.',
    search: 'Search 48,000 SKUs, an item #, or a color…',
    nav1: 'My Stash',
    fitT: 'Find the right count', fitS: 'Match fabric to pattern', fitC: 'Find fabric →',
    fitF1: 'Fabric', fitF2: 'Count', fitF3: 'Color',
    bestSub: 'Reordered most by shops like yours',
    footer: 'Needlework and craft supply for independent shops. Net-30 terms, same-day shipping, a rep who answers.',
    cats: ['Fabric', 'Threads & Floss', 'Needles & Hoops', 'Kits', 'Yarn', 'Beads & Findings', 'Patterns', 'Storage'],
    brands: ['DMC', 'Zweigart', 'Madeira', 'Clover', 'Olfa'],
    attr: 'Count',
    plpSub: 'Cross-stitch fabric',
    plpDesc: 'Aida, linen, and evenweave in every count and color, cut to size or by the bolt. Filter by count on the left, or paste an item number.',
    pdpVar: '32 ct Belfast linen',
    opts: ['14 ct · Aida', '28 ct · Linen', '32 ct · Belfast'],
    products: {
      p1: 'Belfast linen, 32 ct, white', p2: 'Cotton floss, 8.7 yd skein', p3: 'Tapestry needles, sz 26, 6 pk',
      p4: 'Beechwood hoop, 8"', p5: 'Beginner sampler kit', p6: 'Rotary cutter, 45 mm',
      p7: 'Aida cloth, 14 ct, white', p8: 'Floss organizer, 50 bobbin', p9: 'Pattern sleeves, 25 pk',
      a1: 'Needle minder, magnetic', a2: 'Thread conditioner',
      r1: 'Belfast linen, 32 ct', r2: 'Cotton floss skeins', r3: 'Aida cloth, 14 ct',
      q1: 'Floss skeins × 400', q2: 'Shop restock, Q3', q3: 'Aida cloth, bulk', q4: 'Hoops × 200',
    },
    buyer: 'Stitch House Retail',
  },

  general: {
    kw: [],
    cats: ['Best Sellers', 'New Arrivals', 'Equipment', 'Consumables', 'Parts & Components', 'Safety', 'Storage', 'Clearance'],
    brands: ['ProSeries', 'Titan', 'Apex', 'CoreLine', 'Summit'],
    plpSub: 'Best sellers',
    plpDesc: 'The products your customers reorder most, with live inventory and negotiated pricing built in. Filter by spec on the left, or paste a part number.',
    products: {
      p1: 'House brand starter kit', p2: 'Refill cartridges, 24 pk', p3: 'Annual service kit',
      p4: 'Padded carrying case', p5: 'Pro model, latest gen', p6: 'Mounting hardware kit',
      p7: 'Replacement filters, 6 pk', p8: 'Universal extension set', p9: 'Bulk consumables, 25 pk',
      a1: 'Quick-start accessory', a2: 'Protective cover',
      r1: 'Starter kits', r2: 'Refills, 24 pk', r3: 'Filters, 6 pk',
      q1: 'Starter kits × 400', q2: 'Warehouse restock, Q3', q3: 'Refills, bulk', q4: 'Cases × 200',
    },
  },
};

// ── Website scrape ────────────────────────────────────────────────────────

function normalizeSiteUrl(website) {
  let w = String(website || '').trim();
  if (!w) return '';
  if (!/^https?:\/\//i.test(w)) w = 'https://' + w;
  try { return new URL(w).toString(); } catch { return ''; }
}

async function fetchSiteHtml(website) {
  const first = normalizeSiteUrl(website);
  if (!first) return '';
  const candidates = [first];
  try {
    const u = new URL(first);
    if (!/^www\./i.test(u.hostname)) candidates.push(`${u.protocol}//www.${u.hostname}${u.pathname}`);
  } catch {}
  for (const target of candidates) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const resp = await fetch(target, {
        signal: ctrl.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UncapDiscovery/1.0; +https://uncap.com)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timer);
      if (!resp.ok) continue;
      const ct = resp.headers.get('content-type') || '';
      if (ct && !ct.includes('html')) continue;
      const text = await resp.text();
      if (text) return text.slice(0, 600_000);
    } catch { /* next candidate */ }
  }
  return '';
}

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(+n); } catch { return ' '; } });
}

function extractMetaDescription(html) {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]*>/i)
    || html.match(/<meta[^>]+property=["']og:description["'][^>]*>/i);
  if (!m) return '';
  const c = m[0].match(/content=["']([^"']{10,400})["']/i);
  return c ? decodeEntities(c[1]).replace(/\s+/g, ' ').trim() : '';
}

const NAV_NOISE = /^(home|about|about us|contact|contact us|log ?in|sign ?in|sign ?up|register|cart|checkout|search|blog|news|faq|faqs|help|support|shipping|returns?|privacy|terms|careers|track(ing)?( order)?|store locator|locations?|gift cards?|wish ?list|compare|account|my account|rewards?|new arrivals?|sale|deals?|clearance|brands?|all products?|shop( all)?|catalog|quote|resources?|reviews?|events?|videos?|gallery|sitemap|espa.ol|fran.ais)$/i;

function extractNavCategories(html) {
  const out = [];
  const seen = new Set();
  const re = /<a\b[^>]*>([\s\S]{1,200}?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) && out.length < 8) {
    let t = decodeEntities(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (!t || t.length < 3 || t.length > 26) continue;
    if (t.split(' ').length > 3) continue;
    if (/[<>{}|@#]|https?:|\d{4,}/.test(t)) continue;
    if (!/[a-z]/i.test(t)) continue;
    if (NAV_NOISE.test(t)) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t[0].toUpperCase() + t.slice(1));
  }
  return out;
}

function extractJsonLdProducts(html) {
  const out = [];
  const re = /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  const walk = (node) => {
    if (!node || typeof node !== 'object' || out.length >= 8) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    const type = node['@type'];
    const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'));
    if (isProduct && typeof node.name === 'string') {
      const name = decodeEntities(node.name).replace(/\s+/g, ' ').trim();
      if (name.length >= 4 && name.length <= 60 && !out.includes(name)) out.push(name);
    }
    for (const k of Object.keys(node)) {
      if (k === '@context') continue;
      walk(node[k]);
    }
  };
  while ((m = re.exec(html)) && out.length < 8) {
    try { walk(JSON.parse(m[1])); } catch { /* malformed block */ }
  }
  return out.map((n) => (n.length > 38 ? n.slice(0, 38).replace(/\s+\S*$/, '') : n));
}

// ── Industry classification ───────────────────────────────────────────────

function classifyIndustry(corpus) {
  const text = corpus.toLowerCase();
  let best = 'general';
  let bestScore = 0;
  for (const [key, preset] of Object.entries(PRESETS)) {
    if (!preset.kw || !preset.kw.length) continue;
    let score = 0;
    for (const kw of preset.kw) {
      let idx = 0, hits = 0;
      while (hits < 8 && (idx = text.indexOf(kw, idx)) !== -1) { hits++; idx += kw.length; }
      score += hits;
    }
    if (score > bestScore) { bestScore = score; best = key; }
  }
  return bestScore >= 2 ? best : 'general';
}

// ── Profile assembly ──────────────────────────────────────────────────────

function parseCity(address) {
  // '6840 Meadow Lane, Alpharetta, GA 30005' → { city: 'Alpharetta', cityState: 'Alpharetta, GA' }
  const parts = String(address || '').split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return { city: '', cityState: '' };
  const city = parts[parts.length - 2].replace(/\d+/g, '').trim();
  if (!city || /\d/.test(parts[parts.length - 2].slice(0, 1))) return { city: '', cityState: '' };
  const st = (parts[parts.length - 1].match(/^[A-Za-z]{2}\b/) || [''])[0].toUpperCase();
  return { city, cityState: st ? `${city}, ${st}` : city };
}

function skuPrefixFor(company) {
  const words = String(company || '').toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
  let p = words.length >= 2 ? words.slice(0, 3).map((w) => w[0]).join('') : (words[0] || 'CO').slice(0, 3);
  if (p.length < 2) p = (p + 'CO').slice(0, 2);
  return p;
}

async function collectSite(website, htmlOverride) {
  const html = typeof htmlOverride === 'string' ? htmlOverride : await fetchSiteHtml(website);
  const pageText = html
    ? html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    : '';
  return {
    html,
    pageText,
    metaDesc: html ? extractMetaDescription(html) : '',
    siteCats: html ? extractNavCategories(html) : [],
    siteProds: html ? extractJsonLdProducts(html) : [],
  };
}

// The deterministic content pack: industry preset merged with whatever the
// site scrape yielded. Both the plain and the AI-upgraded profile builds
// start from this; the AI pass overwrites its fields with generated copy.
function deterministicParts({ website, company }, site) {
  const corpus = `${site.pageText.slice(0, 200_000)} ${website || ''} ${company || ''}`;
  const industry = classifyIndustry(corpus);
  const P = { ...DEFAULTS, ...(PRESETS[industry] || PRESETS.general) };
  const prod = { ...PRESETS.general.products, ...(P.products || {}) };

  // The wireframe layout is fixed by design: categories stay a curated
  // 8-slot product taxonomy from the industry preset (or the AI rewrite),
  // never the site's own navigation links. Scraped nav text is only an
  // input hint for classification and the AI prompt. Real product names
  // from the site's structured data DO replace the card slots directly.
  const cats = (P.cats || PRESETS.general.cats).slice(0, 8);
  const pSlots = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
  site.siteProds.forEach((name, i) => { if (i < pSlots.length) prod[pSlots[i]] = name; });

  const heroS = site.metaDesc && site.metaDesc.length >= 34
    ? (site.metaDesc.length > 170 ? site.metaDesc.slice(0, 170).replace(/\s+\S*$/, '') + '.' : site.metaDesc)
    : P.heroS;

  const pdpTitle = site.siteProds.length ? prod.p1 : `${prod.p1}, ${P.pdpVar}`;
  return { industry, P, prod, cats, heroS, pdpTitle };
}

export async function buildDiscoveryProfile({ website, company, address }, opts = {}) {
  const site = await collectSite(website, opts.html);
  const parts = deterministicParts({ website, company }, site);
  return assembleProfile({ company, address }, site, parts);
}

function assembleProfile({ company, address }, site, parts) {
  const { industry, P, prod, cats, heroS, pdpTitle } = parts;
  const { city, cityState } = parseCity(address);
  const cityUpper = city ? city.toUpperCase() : '';
  const year = new Date().getUTCFullYear();
  const brand = String(company || '').trim() || 'Your Company';

  // [from token in the stock scenes] → [replacement]. The frontend applies
  // these in a single alternation pass, longest token first, so nested
  // tokens (product name variants, sentences containing category names)
  // resolve cleanly and replacements are never re-matched.
  const swaps = [
    // Brand + shell
    ['HARLOW SUPPLY', brand.toUpperCase()],
    ['Harlow Supply Co.', brand],
    ['MRO SUPPLY · CHICAGO · EST. 1962', cityUpper ? `${P.label} · ${cityUpper}` : P.label],
    ['MRO and industrial supply since 1962. Net-30 terms, same-day shipping, a rep who answers.', P.footer],
    ['© 1962–2025 Harlow Supply Co. · Chicago, IL · Net-30 terms available for qualified accounts',
      `© ${year} ${brand}${cityState ? ' · ' + cityState : ''} · Net-30 terms available for qualified accounts`],
    ['Search 48,000 SKUs, a part #, or a cross-reference…', P.search],
    ['The parts your floor runs on. Without the runaround.', P.heroH],
    ['Net-30 terms. Same-day shipping. A rep who actually answers.', heroS],
    ['My Garage', P.nav1],
    ['Real humans, based in Chicago', city ? `Real humans, based in ${city}` : 'Real humans, on your account'],
    ['In stock — 340 EA, ships today from Chicago', `In stock, 340 EA, ships today${city ? ' from ' + city : ''}`],
    ['Reordered most by shops like yours', P.bestSub],
    // Equipment finder block
    ['Find parts that fit', P.fitT],
    ['Select your equipment', P.fitS],
    ['Find parts →', P.fitC],
    ['Year', P.fitF1],
    ['Make', P.fitF2],
    ['Model', P.fitF3],
    // Categories (nav + grid sentence-case variants)
    ['Abrasives', cats[0]], ['Fasteners', cats[1]], ['Safety & PPE', cats[2]],
    ['Power Tools', cats[3]], ['Power tools', cats[3]],
    ['Cutting Tools', cats[4]], ['Cutting tools', cats[4]],
    ['Material Handling', cats[5]], ['Material handling', cats[5]],
    ['Fluid Power', cats[6]], ['Fluid power', cats[6]],
    ['Electrical', cats[7]],
    // Brand filter values
    ['Norseman', P.brands[0]], ['Walter', P.brands[1]], ['Pferd', P.brands[2]],
    ['Milwaukee', P.brands[3]], ['3M', P.brands[4]],
    ['Grit', P.attr],
    // Category page
    ['HOME / ABRASIVES / GRINDING WHEELS', `HOME / ${cats[0].toUpperCase()} / ${P.plpSub.toUpperCase()}`],
    ['Grinding wheels', P.plpSub],
    ['Type-27 and type-1 wheels for angle grinders and bench grinders — aluminum oxide, zirconia, and ceramic, in every common diameter and arbor. Filter by spec on the left, or paste a part number.', P.plpDesc],
    // Product page
    ['Norseman 4½" grinding wheel — A24R, Type 27', pdpTitle],
    ['A24R · Coarse', P.opts[0]], ['A36S · Medium', P.opts[1]], ['A60T · Fine', P.opts[2]],
    // Products (card, cart, and short forms)
    ['Norseman 4½" grinding wheel — A24R', prod.p1],
    ['Norseman 4½" grinding wheel, A24R', prod.p1],
    ['Norseman 4½" grinding wheel', prod.p1],
    ['Walter flap disc, 60 grit zirconia', prod.p2],
    ['Walter flap disc, 60 grit', prod.p2],
    ['Grade 8 hex bolt, ⅜"-16 × 2"', prod.p3],
    ['3M cut-resistant gloves, ANSI A4', prod.p4],
    ['3M cut-resistant gloves A4', prod.p4],
    ['Milwaukee M18 angle grinder', prod.p5],
    ['Cobalt jobber drill set, 29 pc', prod.p6],
    ['3M Cubitron II fibre disc, 36+', prod.p7],
    ['Structural washer, ½" hot-dip', prod.p8],
    ['Cut-off wheel, 3" × .035", 25 pk', prod.p9],
    ['Backing pad, 4½" fiber-reinforced', prod.a1],
    ['Face shield, anti-fog polycarbonate', prod.a2],
    ['HS-', `${skuPrefixFor(brand)}-`],
    // Step 7 B2B portal
    ['Maplewood Fabrication', P.buyer],
    ['Grinding wheels × 400', prod.q1],
    ['Safety restock — Q3', prod.q2],
    ['Cut-off wheels, bulk', prod.q3],
    ['Flap discs × 200', prod.q4],
    ['Grinding wheels A24R', prod.r1],
    ['Nitrile gloves, L', prod.r2],
    ['Cutting fluid, 5 gal', prod.r3],
  ];

  // The PDP spec table is written around the stock abrasives product; for
  // any other vertical, neutralize its most industrial rows so the sheet
  // reads as generic technical filler instead of grinding-wheel data.
  if (industry !== 'industrial') {
    swaps.push(
      ['Abrasive material', 'Material'],
      ['Aluminum oxide, A24R', P.pdpVar],
      ['Type 27, depressed center', 'Standard profile'],
      ['Resinoid, fiberglass reinforced', 'Commercial grade'],
      ['Steel, stainless, weld grinding', 'Everyday commercial use'],
      ['ANSI B7.1, oSa certified', 'Industry standard compliant'],
    );
  }

  const cleaned = swaps.filter((s) => s[0] !== s[1] && typeof s[1] === 'string' && s[1]);

  cleaned.sort((a, b) => b[0].length - a[0].length);

  return {
    v: 1,
    industry,
    initial: (brand.match(/[A-Za-z0-9]/) || ['H'])[0].toUpperCase(),
    src: { fetched: !!site.html, desc: !!site.metaDesc, cats: site.siteCats.length, prods: site.siteProds.length, ai: !!parts.ai },
    swaps: cleaned,
  };
}

// ── AI-personalized profile (Claude API) ──────────────────────────────────
// Rewrites the whole content pack in the client's own voice, grounded in
// the scraped site text. Runs in the background after discovery creation
// (ctx.waitUntil), replacing the deterministic profile when it lands. Any
// failure (no key, timeout, refusal, invalid JSON) leaves the deterministic
// profile in place, so this is purely an upgrade path.

const AI_MODEL = 'claude-opus-4-8';

const AI_FIELDS = [
  // [key, max chars, description for the model]
  ['vertical', 24, 'Market label for the masthead spec line, ALL CAPS, e.g. "PACKAGING SUPPLY"'],
  ['heroH', 64, 'Homepage hero headline. Two short sentences max, confident, concrete, in their voice'],
  ['heroS', 110, 'Hero subline. Their strongest buyer promises as short sentences'],
  ['search', 52, 'Search box placeholder. Must start with "Search "'],
  ['nav1', 12, 'Account-nav label for a saved-items feature, e.g. "My Lists"'],
  ['fitT', 22, 'Product-finder widget title, e.g. "Find the right box"'],
  ['fitS', 26, 'Product-finder subtitle'],
  ['fitC', 14, 'Product-finder button label, no arrow, e.g. "Find boxes"'],
  ['fitF1', 10, 'First finder dropdown label'],
  ['fitF2', 10, 'Second finder dropdown label'],
  ['fitF3', 10, 'Third finder dropdown label'],
  ['bestSub', 44, 'Best-sellers section subtitle: "Reordered most by <their buyers> like yours"'],
  ['footer', 130, 'Footer blurb: one sentence on what they sell and for whom, then "Net-30 terms, same-day shipping, a rep who answers."'],
  ['attr', 10, 'The key spec attribute buyers filter by, e.g. "Grit", "Size", "Count"'],
  ['plpSub', 22, 'A flagship subcategory used as the demo category page, e.g. "Mailer boxes"'],
  ['plpDesc', 200, 'Two-sentence intro for that category page ending "Filter by spec on the left, or paste a part number."'],
  ['pdpVar', 22, 'Variant descriptor of the flagship product, e.g. "32 ECT kraft"'],
  ['buyer', 24, 'Plausible fictional B2B customer company name for their vertical'],
];

const AI_PRODUCT_SLOTS = [
  ['p1', 32, 'Flagship product, also used as the demo product page'],
  ['p2', 32, 'Best seller 2'], ['p3', 32, 'Best seller 3'], ['p4', 32, 'Best seller 4'],
  ['p5', 32, 'Best seller 5'], ['p6', 32, 'Best seller 6'], ['p7', 32, 'Best seller 7'],
  ['p8', 32, 'Best seller 8'], ['p9', 32, 'A bulk/case-pack item shown in the cart'],
  ['a1', 33, 'A small add-on accessory for the flagship product'],
  ['a2', 35, 'A second add-on accessory'],
  ['r1', 20, 'Quick-reorder shorthand for the flagship product'],
  ['r2', 18, 'Quick-reorder item 2'], ['r3', 20, 'Quick-reorder item 3'],
  ['q1', 22, 'B2B quote line, format "<Product> × 400"'],
  ['q2', 22, 'B2B quote line, a seasonal restock, e.g. "Warehouse restock, Q3"'],
  ['q3', 22, 'B2B quote line, format "<Product>, bulk"'],
  ['q4', 22, 'B2B quote line, format "<Product> × 200"'],
];

function aiSchema() {
  const str = { type: 'string' };
  const props = {};
  AI_FIELDS.forEach(([k]) => { props[k] = str; });
  props.opts = { type: 'array', items: str };
  props.brands = { type: 'array', items: str };
  props.cats = { type: 'array', items: str };
  const pProps = {};
  AI_PRODUCT_SLOTS.forEach(([k]) => { pProps[k] = str; });
  props.products = { type: 'object', properties: pProps, required: Object.keys(pProps), additionalProperties: false };
  return { type: 'object', properties: props, required: Object.keys(props), additionalProperties: false };
}

function aiPrompt({ website, company, address }, site, parts) {
  const fieldGuide = AI_FIELDS.map(([k, max, d]) => `- ${k} (max ${max} chars): ${d}`).join('\n')
    + '\n- opts: array of exactly 3 variant options of the flagship product, each max 22 chars, format "<Variant> · <Label>", e.g. "32 ECT · Standard"'
    + '\n- brands: array of exactly 5 brand names (max 14 chars each) this store would plausibly carry'
    + '\n- cats: array of exactly 8 top-level PRODUCT categories (max 20 chars each), most important first. A shop-by-category taxonomy of what they SELL. Never copy their site menu or sitemap: no About, Resources, Blog, Support, Contact, or company pages'
    + '\n- products (each with its own max):\n' + AI_PRODUCT_SLOTS.map(([k, max, d]) => `  - ${k} (max ${max} chars): ${d}`).join('\n');

  return [
    `Company: ${company}`,
    `Website: ${website || 'unknown'}`,
    address ? `Address: ${address}` : '',
    `Industry guess: ${parts.industry}`,
    site.metaDesc ? `Site meta description: ${site.metaDesc}` : '',
    site.siteCats.length ? `Site nav links (hints about what they sell only, never copy into any field): ${site.siteCats.join(' | ')}` : '',
    site.siteProds.length ? `Site product names: ${site.siteProds.join(' | ')}` : '',
    site.pageText ? `Website text (excerpt):\n${site.pageText.slice(0, 6000)}` : 'Website text: unavailable',
    '',
    'Fill every field:',
    fieldGuide,
  ].filter(Boolean).join('\n');
}

const AI_SYSTEM = 'You write placeholder content for a B2B ecommerce wireframe mockup (storefront home, category page, product page, cart, and a buyer portal) shown to a prospective client during a discovery call. The mockup must read as THEIR future store. The wireframe layout, navigation structure, and section design are fixed and never change: you only supply the words that fill the existing slots. Ground everything in the provided website content: their real products, product categories, vocabulary, and tone. Never reproduce their current website navigation, menu structure, or sitemap; categories describe what they sell, not the pages their site has. Where the site gives too little, invent plausible content for their exact industry. Product names must read like real catalog lines with a size, spec, or pack quantity. Hard rules: never use em dashes or en dashes; respect every character limit; return only JSON matching the schema.';

async function generateAiSlots(env, info, site, parts) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    // No thinking pass: this is constrained copywriting with all source
    // material supplied, and the call must fit the ~30s ctx.waitUntil
    // window that remains after the creation response is sent.
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 16000,
        system: AI_SYSTEM,
        output_config: { format: { type: 'json_schema', schema: aiSchema() } },
        messages: [{ role: 'user', content: aiPrompt(info, site, parts) }],
      }),
    });
    if (!resp.ok) throw new Error(`claude api ${resp.status}`);
    const data = await resp.json();
    if (data.stop_reason === 'refusal') throw new Error('claude api refusal');
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

// Sanitize one generated string: kill banned dashes, collapse whitespace,
// clip at a word boundary. Returns undefined when unusable so the caller
// keeps the deterministic value for that slot.
function aiClean(value, max) {
  if (typeof value !== 'string') return undefined;
  let s = value.replace(/\s+[—–]\s+/g, ', ').replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim();
  if (s.length > max) s = s.slice(0, max).replace(/\s+\S*$/, '').replace(/[،,;:\s]+$/, '');
  return s.length >= 2 ? s : undefined;
}

function applyAiSlots(parts, ai) {
  if (!ai || typeof ai !== 'object') return parts;
  const P = { ...parts.P };
  const prod = { ...parts.prod };
  let heroS = parts.heroS;

  for (const [key, max] of AI_FIELDS) {
    const v = aiClean(ai[key], max);
    if (!v) continue;
    if (key === 'vertical') P.label = v.toUpperCase();
    else if (key === 'heroS') heroS = v;
    else if (key === 'fitC') P.fitC = v.replace(/\s*→$/, '') + ' →';
    else P[key] = v;
  }
  if (P.search && !/^Search /.test(P.search)) P.search = 'Search ' + P.search;

  const fixedList = (arr, max, fallback) => {
    const out = Array.isArray(arr) ? arr.map((x) => aiClean(x, max)).filter(Boolean) : [];
    return out.length >= fallback.length ? out.slice(0, fallback.length) : fallback;
  };
  P.opts = fixedList(ai.opts, 22, P.opts);
  P.brands = fixedList(ai.brands, 14, P.brands);
  // Categories must stay a product taxonomy: drop anything that reads like
  // a site-menu page before validating, falling back to the preset set.
  const catInput = Array.isArray(ai.cats) ? ai.cats.filter((c) => !NAV_NOISE.test(String(c).trim())) : [];
  const cats = fixedList(catInput, 20, parts.cats);

  for (const [key, max] of AI_PRODUCT_SLOTS) {
    const v = aiClean(ai.products && ai.products[key], max);
    if (v) prod[key] = v;
  }

  return {
    ...parts,
    P, prod, cats, heroS,
    // Skip the variant suffix when the generated name already carries any
    // of its tokens (e.g. name "... 32 ECT" + variant "32 ECT kraft").
    pdpTitle: P.pdpVar.toLowerCase().split(/[^a-z0-9]+/).some((w) => w.length >= 2 && prod.p1.toLowerCase().includes(w))
      ? prod.p1 : `${prod.p1}, ${P.pdpVar}`,
    ai: true,
  };
}

export async function buildDiscoveryProfileWithAI(env, { website, company, address }, opts = {}) {
  if (!env || !env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');
  const site = await collectSite(website, opts.html);
  let parts = deterministicParts({ website, company }, site);
  const ai = opts.ai || await generateAiSlots(env, { website, company, address }, site, parts);
  parts = applyAiSlots(parts, ai);
  return assembleProfile({ company, address }, site, parts);
}
