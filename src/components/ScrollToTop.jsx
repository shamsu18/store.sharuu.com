import { useLayoutEffect } from 'react';
import {
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const scrollPositions = new Map();

function scrollImmediately({ x = 0, y = 0 }) {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = 'auto';
  window.scrollTo(x, y);
  root.style.scrollBehavior = previousBehavior;
}

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    const previousRestoration =
      window.history.scrollRestoration;

    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration =
        previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const savedPosition =
      scrollPositions.get(location.key);

    if (navigationType === 'POP' && savedPosition) {
      scrollImmediately(savedPosition);
    } else if (navigationType !== 'POP') {
      scrollImmediately({ x: 0, y: 0 });
    }

    const savePosition = () => {
      scrollPositions.set(location.key, {
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('scroll', savePosition, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        'scroll',
        savePosition,
      );
      savePosition();
    };
  }, [
    location.key,
    navigationType,
  ]);

  return null;
}
