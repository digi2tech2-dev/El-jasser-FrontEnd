import { useEffect, useRef, useState } from 'react';

const INITIAL_STATE = Object.freeze({ isHidden: false, isScrolled: false });

const useHideOnScroll = ({ enabled = true, hideAfter = 15, minimumDelta = 5 } = {}) => {
  const [state, setState] = useState(INITIAL_STATE);
  const stateRef = useRef(INITIAL_STATE);
  const lastHandledYRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const commit = (next) => {
      if (stateRef.current.isHidden === next.isHidden && stateRef.current.isScrolled === next.isScrolled) return;
      stateRef.current = next;
      setState(next);
    };
    if (!enabled || typeof window === 'undefined') {
      lastHandledYRef.current = 0;
      commit(INITIAL_STATE);
      return undefined;
    }
    const scrollY = () => Math.max(0, window.scrollY || window.pageYOffset || 0);
    lastHandledYRef.current = scrollY();
    commit({ isHidden: false, isScrolled: lastHandledYRef.current > 0 });
    const update = () => {
      frameRef.current = 0;
      const currentY = scrollY();
      const delta = currentY - lastHandledYRef.current;
      if (currentY <= 0) {
        lastHandledYRef.current = 0;
        commit(INITIAL_STATE);
        return;
      }
      if (Math.abs(delta) < minimumDelta) {
        if (!stateRef.current.isScrolled) commit({ ...stateRef.current, isScrolled: true });
        return;
      }
      lastHandledYRef.current = currentY;
      if (delta < 0) commit({ isHidden: false, isScrolled: true });
      if (delta > 0 && currentY > hideAfter) commit({ isHidden: true, isScrolled: true });
    };
    const onScroll = () => {
      if (!frameRef.current) frameRef.current = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [enabled, hideAfter, minimumDelta]);

  return state;
};

export default useHideOnScroll;
