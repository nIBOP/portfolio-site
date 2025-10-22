import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './App.css'
import PdfViewer from './components/PdfViewer'
import { mainSpecializations, getMainSpecializationById, type MainSpecialization } from './config/mainSpecializations'

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSpec, setSelectedSpec] = useState<MainSpecialization | null>(null);
  const [pdfModalUrl, setPdfModalUrl] = useState<string | null>(null);

  // Получаем список ID всех доступных специализаций
  const availableSpecIds = mainSpecializations.map(spec => spec.id);

  // Инициализация специализации из URL или localStorage
  useEffect(() => {
    const specFromUrl = searchParams.get('spec');
    const specFromStorage = localStorage.getItem('selectedSpec');
    
    if (specFromUrl && availableSpecIds.includes(specFromUrl)) {
      const spec = getMainSpecializationById(specFromUrl);
      if (spec) {
        setSelectedSpec(spec);
        localStorage.setItem('selectedSpec', spec.id);
      }
    } else if (specFromStorage && availableSpecIds.includes(specFromStorage)) {
      const spec = getMainSpecializationById(specFromStorage);
      if (spec) {
        setSelectedSpec(spec);
        // Обновляем URL с сохранённой специализацией
        setSearchParams({ spec: spec.id });
      }
    }
  }, [searchParams, setSearchParams, availableSpecIds]);

  // Синхронизация выбранной специализации с URL и localStorage
  const handleSpecChange = (specId: string | null) => {
    if (specId) {
      const spec = getMainSpecializationById(specId);
      if (spec) {
        setSelectedSpec(spec);
        setSearchParams({ spec: spec.id });
        localStorage.setItem('selectedSpec', spec.id);
      }
    } else {
      setSelectedSpec(null);
      setSearchParams({});
      localStorage.removeItem('selectedSpec');
    }
  };

  // Блокируем прокрутку фона, когда открыта модалка PDF
  useEffect(() => {
    if (!pdfModalUrl) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [pdfModalUrl]);

  const specTitle = useMemo(() => {
    return selectedSpec?.displayName || null;
  }, [selectedSpec]);

  const resumeUrl = useMemo(() => {
    return selectedSpec?.resumeUrl || null;
  }, [selectedSpec]);

  const currentBlogCards = useMemo(() => {
    return selectedSpec?.projects || [];
  }, [selectedSpec]);

  return (
    <div className="page">
      <div className="top-actions">
        <div className="top-actions__row">
          <Link
            to="/blog"
            aria-label="Перейти в блог"
            className="hero__blog-btn"
          >
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
          </Link>
        </div>
      </div>
      {/* Блок 1: аватар слева, описание справа */}
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

      {/* Блок 2: выбор специализации */}
      <section className="section specializations">
        <h2>Выберите специализацию</h2>
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

      {/* Блоки 3–4: появляются только при выборе специализации */}
      {selectedSpec && (
        <>
          {/* Блок 3: Скачать резюме */}
          <section className="section resume">
            <h2>Резюме — {specTitle}</h2>
            <p>
              Скачайте актуальную версию резюме для выбранной специализации.
            </p>
            <div>
              <a
                className="primary-button"
                href={resumeUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
              >
                Скачать резюме (PDF)
              </a>
            </div>
          </section>

          {/* Блок 4: Блог/проекты по специализации */}
          <section className="section blog">
            <h2>Проекты — {specTitle}</h2>
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

          {pdfModalUrl && (
            <div className="modal" role="dialog" aria-modal="true">
              <div
                className="modal__backdrop"
                onClick={() => setPdfModalUrl(null)}
              />
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
                  <PdfViewer url={pdfModalUrl!} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Блок 5 (пока позже) */}
      <section className="section contacts">
        <h2>Связаться со мной</h2>
        <p>Форма обратной связи будет добавлена позднее.</p>
      </section>
    </div>
  );
}

export default App;
