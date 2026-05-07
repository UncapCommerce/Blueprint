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
