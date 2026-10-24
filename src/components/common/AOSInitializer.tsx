import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

export const refreshAOS = () => {
  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      AOS.refresh();
    });
  }
};

export const hardRefreshAOS = () => {
  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      AOS.refreshHard();
    });
  }
};

export const AOSInitializer: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 30,
      delay: 0,
      disableMutationObserver: false,
    });
  }, []);

  useEffect(() => {
    // Re-trigger and calculate positions whenever route changes
    const timer = setTimeout(() => {
      AOS.refreshHard();
    }, 120);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
};
