import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Расширяем глобальный объект Window для TypeScript
declare global {
  interface Window {
    ym?: (id: number, method: string, url?: string, options?: any) => void;
  }
}

const METRIKA_ID = 104955279;

export default function YandexMetrika() {
  const location = useLocation();

  useEffect(() => {
    // Отслеживаем переходы между страницами
    if (window.ym) {
      const url = location.pathname + location.search + location.hash;
      window.ym(METRIKA_ID, 'hit', url, {
        title: document.title
      });
    }
  }, [location]);

  return null;
}
