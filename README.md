# Портфолио — React + TypeScript + Vite

Небольшой сайт-портфолио. После клонирования репозитория запускается одной командой.

## Требования

- Node.js 20+ (рекомендуется 20 LTS или 22 LTS)
- npm 10+ (или pnpm/yarn по желанию)

Проверить версии:
```bash
node -v
npm -v
```

## Установка и запуск (локально)

```bash
npm install
npm run dev
```

Vite выведет локальный адрес (обычно `http://localhost:5173`). Откройте его в браузере.

## Сборка и предпросмотр продакшена

```bash
npm run build
npm run preview
```

`preview` запускает статический сервер Vite со SPA‑роутингом (поддержка прямых переходов на `/blog/...`).

## Структура и контент

- Статьи находятся в `src/content/*.md` и рендерятся из Markdown.
- Фронтматтер в начале файла определяет метаданные:
```markdown
---
slug: bi-dashboard
title: BI Дашборд по продажам
summary: Краткое описание
date: 2024-08-03
specialization: data-engineering | business-intelligence | analytics
---

# Заголовок H1
Текст статьи...
```
- Список статей доступен на `/blog`. Фильтр по специализации: `/blog?spec=data-engineering` (или `business-intelligence`, `analytics`).

## Замечания по роутингу

Проект использует `createBrowserRouter` (History API). Для статики на внешнем хостинге нужны правила SPA‑fallback (все пути -> `index.html`). Локально проблем нет: `npm run preview` и `npm run dev` уже настроены.

## Частые проблемы

- Ошибка 404 на прямом переходе по `/blog/...` на продакшене: настройте SPA‑fallback на хостинге или используйте `npm run preview` для локального теста.
- Отсутствует PDF по пути из карточек на главной: проверьте, что файл существует в `public/pdfs` или скорректируйте ссылку в `src/App.tsx`.
