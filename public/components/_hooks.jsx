// Shared hooks. Loaded BEFORE other components on each page.
// JS-driven viewport branching is more reliable than CSS attribute selectors
// when component styles are inline (React's serialization can vary).
function useIsMobile() {
  const get = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(max-width: 640px)').matches;
  const [isMobile, setIsMobile] = React.useState(get);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);
  return isMobile;
}
window.useIsMobile = useIsMobile;

// Live URL hash, including the leading "#" (or "" when none). Used by CTAs
// and the build header so deep-link context like /#netsuite-magento survives
// when the user navigates between landing and the quiz.
function useHash() {
  const get = () => (typeof window !== 'undefined' ? window.location.hash || '' : '');
  const [hash, setHash] = React.useState(get);
  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return hash;
}
window.useHash = useHash;

// Hash → display-name maps. Shared between every landing-page component that
// adapts copy based on the URL hash (Hero H1 + chip, Offer item, etc).
window.HERO_PLATFORM_BY_HASH = {
  magento:        'Magento',
  bigcommerce:    'BigCommerce',
  woocommerce:    'WooCommerce',
  netsuite:       'NetSuite',
  optimizely:     'Optimizely',
  salesforce:     'Salesforce',
  sap:            'SAP',
  commercetools:  'commercetools',
  vtex:           'VTEX',
  custom:         'a custom platform',
};
window.HERO_ERP_BY_HASH = {
  netsuite:   'NetSuite',
  msdyn:      'Microsoft Dynamics',
  acumatica:  'Acumatica',
  epicor:     'Epicor',
  sage:       'Sage',
  sap:        'SAP',
  infor:      'Infor',
  odoo:       'Odoo',
};
// Splits "#erp<sep>platform" / "#erp" / "#platform" into display names. Any
// of `-`, `+`, or `_` works as the separator so deep links read cleanly no
// matter which convention is in use (eg /#netsuite-magento, /#netsuite+magento,
// /#netsuite_magento). ERP wins for ambiguous bare slugs (netsuite, sap)
// since the chip is the higher-impact targeting signal.
window.parseHeroHash = function(raw){
  const slug = (raw || '').replace(/^#/, '').toLowerCase();
  if (!slug) return { erp: '', platform: '' };
  const match = slug.match(/^([a-z0-9]+)[-+_]([a-z0-9]+)$/);
  if (match) {
    return {
      erp:      window.HERO_ERP_BY_HASH[match[1]] || '',
      platform: window.HERO_PLATFORM_BY_HASH[match[2]] || '',
    };
  }
  if (window.HERO_ERP_BY_HASH[slug])      return { erp: window.HERO_ERP_BY_HASH[slug], platform: '' };
  if (window.HERO_PLATFORM_BY_HASH[slug]) return { erp: '', platform: window.HERO_PLATFORM_BY_HASH[slug] };
  return { erp: '', platform: '' };
};
