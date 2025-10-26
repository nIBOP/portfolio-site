import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './App.css'
import './App.home.css'
import PdfViewer from './components/PdfViewer'
import Timeline from './components/Timeline'
import Skills from './components/Skills'
import { mainSpecializations, getMainSpecializationById, type MainSpecialization } from './config/mainSpecializations'

// Константа для ключа localStorage
const STORAGE_KEY = 'selectedSpec';

// SVG иконка для кнопки блога
const BlogIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinejoin="round"
      d="M42,57H22A15,15,0,0,1,7,42V22A15,15,0,0,1,22,7H35A15,15,0,0,1,50,22v.5A2.5,2.5,0,0,0,52.5,25,4.5,4.5,0,0,1,57,29.5V42A15,15,0,0,1,42,57ZM22,9A13,13,0,0,0,9,22V42A13,13,0,0,0,22,55H42A13,13,0,0,0,55,42V29.5A2.5,2.5,0,0,0,52.5,27,4.5,4.5,0,0,1,48,22.5V22A13,13,0,0,0,35,9Z"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M35.5,27h-11a4.5,4.5,0,0,1,0-9h11a4.5,4.5,0,0,1,0,9Zm-11-7a2.5,2.5,0,0,0,0,5h11a2.5,2.5,0,0,0,0-5Z"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M41.5,45h-17a4.5,4.5,0,0,1,0-9h17a4.5,4.5,0,0,1,0,9Zm-17-7a2.5,2.5,0,0,0,0,5h17a2.5,2.5,0,0,0,0-5З"
    />
  </svg>
);

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSpec, setSelectedSpec] = useState<MainSpecialization | null>(null);
  const [pdfModalUrl, setPdfModalUrl] = useState<string | null>(null);

  const availableSpecIds = useMemo(() => 
    mainSpecializations.map(spec => spec.id), 
    []
  );

  // Инициализация специализации из URL или localStorage
  useEffect(() => {
    const specFromUrl = searchParams.get('spec');
    const specFromStorage = localStorage.getItem(STORAGE_KEY);
    
    const loadSpec = (specId: string) => {
      const spec = getMainSpecializationById(specId);
      if (spec) {
        setSelectedSpec(spec);
        localStorage.setItem(STORAGE_KEY, spec.id);
        return true;
      }
      return false;
    };

    if (specFromUrl && availableSpecIds.includes(specFromUrl)) {
      loadSpec(specFromUrl);
    } else if (specFromStorage && availableSpecIds.includes(specFromStorage)) {
      if (loadSpec(specFromStorage)) {
        setSearchParams({ spec: specFromStorage });
      }
    } else {
      // По умолчанию первая специализация
      const firstSpec = mainSpecializations[0];
      if (firstSpec && loadSpec(firstSpec.id)) {
        setSearchParams({ spec: firstSpec.id });
      }
    }
  }, [searchParams, setSearchParams, availableSpecIds]);

  // Обработчик изменения специализации
  const handleSpecChange = (specId: string | null) => {
    if (specId) {
      const spec = getMainSpecializationById(specId);
      if (spec) {
        setSelectedSpec(spec);
        setSearchParams({ spec: spec.id });
        localStorage.setItem(STORAGE_KEY, spec.id);
      }
    } else {
      setSelectedSpec(null);
      setSearchParams({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Блокировка прокрутки при открытой модалке
  useEffect(() => {
    if (!pdfModalUrl) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [pdfModalUrl]);

  const resumeUrl = selectedSpec?.resumeUrl || null;
  const currentBlogCards = selectedSpec?.projects || [];
  const hasSkills = selectedSpec?.skills && selectedSpec.skills.length > 0;

  return (
    <div className="page home-page">
      <div className="top-actions">
        <div className="top-actions__row">
          <Link to="/blog" aria-label="Перейти в блог" className="hero__blog-btn">
            <BlogIcon />
          </Link>
        </div>
      </div>

      {/* Блок 1: Hero */}
      <section className="section hero">
        <div className="hero__avatar">
          <img src="/img/avatar.jpg" alt="Василий Дубровин" className="avatar" />
        </div>
        <div className="hero__content">
          <h1>Василий Дубровин</h1>
          <h3>Аналитик данных / Менеджер проектов</h3>
          <p>
            Имею опыт работы в различных сферах и большой бэкграунд в
            оптимизации и автоматизации процессов.
          </p>
        </div>
      </section>

      {/* Блок 2: Двухколоночная структура */}
      <div className="two-column-layout">
        <div className="left-column">
          {/* Выбор специализации */}
          <section className="section specializations">
            <h2>Специализация</h2>
            <div className="spec-buttons">
              {mainSpecializations.map((spec) => (
                <button
                  key={spec.id}
                  className={`spec-button ${selectedSpec?.id === spec.id ? "active" : ""}`}
                  onClick={() => handleSpecChange(selectedSpec?.id === spec.id ? null : spec.id)}
                >
                  {spec.displayName}
                </button>
              ))}
            </div>
          </section>

          {/* Навыки и технологии */}
          {hasSkills && (
            <section className="section skills-section">
              <h2>Инструментарий</h2>
              <Skills skills={selectedSpec!.skills!} />
            </section>
          )}

          {/* Скачать резюме */}
          {selectedSpec && (
            <section className="section resume">
              <a
                className="primary-button"
                href={resumeUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
              >
                Скачать резюме (PDF)
              </a>
            </section>
          )}
        </div>

        <div className="right-column">
          <section className="section timeline-section">
            <Timeline />
          </section>
        </div>
      </div>

      {/* Блок 3: Проекты */}
      {selectedSpec && (
        <section className="section blog">
          <h2>Проекты</h2>
          <div className="blog__grid">
            {currentBlogCards.map((card) => (
              <article key={card.title} className="card card--wide">
                {card.image && (
                  <div className="card__media">
                    <img src={card.image} alt={card.title} />
                  </div>
                )}
                <div className="card__content">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className="card__actions">
                    <Link
                      className="link"
                      to={
                        card.blogSlug
                          ? `/blog/${card.blogSlug}?spec=${selectedSpec.id}`
                          : `/blog?from=home&spec=${selectedSpec.id}`
                      }
                    >
                      Подробнее
                    </Link>
                    {card.pdfUrl && (
                      <button
                        className="secondary-button"
                        onClick={() => setPdfModalUrl(card.pdfUrl!)}
                      >
                        Открыть PDF
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* PDF Modal */}
      {pdfModalUrl && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__backdrop" onClick={() => setPdfModalUrl(null)} />
          <div className="modal__dialog">
            <div className="modal__header">
              <h3>Просмотр PDF</h3>
              <button
                className="icon-button"
                aria-label="Закрыть"
                onClick={() => setPdfModalUrl(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <PdfViewer url={pdfModalUrl} />
            </div>
          </div>
        </div>
      )}

      {/* Блок 4: Контакты */}
      <section className="section contacts">
        <h2>Свяжитесь со мной</h2>
        <div className="contacts__buttons">
          <a
            href="mailto:offers@nibop.ru"
            className="contact-button contact-button--email"
            aria-label="Написать email"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m2 7 10 7 10-7" />
            </svg>
            <span>Написать на почту</span>
          </a>
          <a
            href="https://t.me/nIBOP"
            target="_blank"
            rel="noreferrer"
            className="contact-button contact-button--telegram"
            aria-label="Написать в Telegram"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <span>Написать в Telegram</span>
          </a>
        </div>
      </section>
    </div>
  );
}

export default App;
