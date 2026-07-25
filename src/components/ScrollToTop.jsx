import { useLayoutEffect } from 'react';
import {
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const scrollPositions = new Map();
let restoreBehaviorFrame;

function scrollImmediately({ x = 0, y = 0 }) {
  const root = document.documentElement;
  const body = document.body;
  const previousRootBehavior = root.style.scrollBehavior;
  const previousBodyBehavior = body.style.scrollBehavior;

  window.cancelAnimationFrame(restoreBehaviorFrame);
  root.style.scrollBehavior = 'auto';
  body.style.scrollBehavior = 'auto';

  // Flush the temporary override before scrolling. Otherwise the global
  // `html { scroll-behavior: smooth }` rule can animate a new route from the
  // previous page's scroll position instead of showing it at the top.
  void root.offsetHeight;

  window.scrollTo({
    top: y,
    left: x,
    behavior: 'auto',
  });

  restoreBehaviorFrame = window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previousRootBehavior;
    body.style.scrollBehavior = previousBodyBehavior;
  });
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
