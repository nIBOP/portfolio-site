import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Расширяем глобальный объект Window для TypeScript
declare global {
  interface Window {
    ym?: (id: number, method: string, ...params: any[]) => void;
  }
}

const METRIKA_ID = 104955279;

export default function YandexMetrika() {
  const location = useLocation();

  useEffect(() => {
    // Отслеживаем переходы между страницами
    if (window.ym) {
      window.ym(METRIKA_ID, 'hit', window.location.href);
    }
  }, [location]);

  return null;
}
