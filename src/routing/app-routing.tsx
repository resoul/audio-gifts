import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useLoadingBar } from 'react-top-loading-bar';
import { AppRoutingSetup } from './app-routing-setup';

export function AppRouting() {
  const { start, complete } = useLoadingBar({
    color: 'var(--color-primary)',
    shadow: false,
    waitingTime: 400,
    transitionTime: 200,
    height: 2,
  });

  const location = useLocation();

  useEffect(() => {
    start('static');

    const timer = setTimeout(() => {
      complete();
    }, 150);

    return () => clearTimeout(timer);
  }, [complete, location.pathname, start]);

  return <AppRoutingSetup />;
}