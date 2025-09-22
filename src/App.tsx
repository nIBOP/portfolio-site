import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './App.css'
import PdfViewer from './components/PdfViewer'

type Specialization = 'bi' | 'ba' | 'pm' | null

// Ссылки на резюме по специализациям (замените на реальные URL)
const resumeLinks: Record<'bi' | 'ba' | 'pm', string> = {
  bi: 'https://github.com/your-username/your-repo/releases/latest/download/resume-bi.pdf',
  ba: 'https://github.com/your-username/your-repo/releases/latest/download/resume-ba.pdf',
  pm: 'https://github.com/your-username/your-repo/releases/latest/download/resume-pm.pdf',
}

// Карточки проектов по специализациям (замените данными ваших проектов)
type BlogCard = { title: string; description: string; href: string; image?: string; pdfUrl?: string }

const blogs: Record<'bi' | 'ba' | 'pm', Array<BlogCard>> = {
  bi: [
    { title: 'BI Дашборд по продажам', description: 'Подробный интерактивный дашборд в Power BI с несколькими страницами: обзор ключевых метрик (выручка, маржа, средний чек), анализ динамики, когортный анализ, география продаж с тепловыми картами и фильтрами по каналам и сегментам клиентов. Реализованы drill-through, tooltips и параметрические сценарии. Подключение к DWH (Snowflake), инкрементальные обновления и role-level security.', href: '#', pdfUrl: '/public/pdfs/ARB.pdf' },
    { title: 'ETL-пайплайн', description: 'Оркестрация пайплайна в Apache Airflow: инкрементальная загрузка из источников (PostgreSQL, Google Sheets), проверка качества данных с Great Expectations, моделирование слоёв staging/transform в dbt, контроль SLA и уведомления. Канареечные деплои и backfills.', href: '#', image: 'https://placehold.co/960x540/png?text=Airflow+%2B+dbt' },
    { title: 'KPI-отчёт', description: 'Автоматизация формирования KPI-отчёта с доставкой в Slack и Email. План-факт анализ, сезонность, настраиваемые пороги сигналов. Хранение в S3, версионирование и быстрый ретро-анализ.', href: '#', image: 'https://placehold.co/960x540/png?text=KPI+Report' },
  ],
  ba: [
    { title: 'BRD для CRM', description: 'Бизнесс-требования к внедрению CRM: цели, scope, ограничения, заинтересованные стороны, AS-IS/TO-BE, use cases, NFR (производительность, безопасность, доступность). Приоритеты MoSCoW, критерии приёмки, зависимые инициативы, риски и допущения.', href: '#', image: 'https://placehold.co/960x540/png?text=BRD+CRM' },
    { title: 'Юзер-истории и BDD', description: 'Структура бэклога в Jira: эпики, фичи, юзер-истории с критериями приёмки в формате Gherkin (Given-When-Then). Трассировка требований, оценка по story points, DoR/DoD, примеры спецификации сценариев.', href: '#', image: 'https://placehold.co/960x540/png?text=User+Stories+%26+BDD' },
    { title: 'Процессная модель', description: 'Моделирование процессов в BPMN 2.0: диаграммы AS-IS и TO-BE, идентификация узких мест, матрица RACI, операционные KPI, рекомендации по оптимизации и цифровизации.', href: '#', image: 'https://placehold.co/960x540/png?text=BPMN+Model' },
  ],
  pm: [
    { title: 'План проекта', description: 'Детализированный WBS с декомпозицией работ до уровня пакетов, оценка длительности и стоимости, ресурсный план, календарный план в MS Project, критический путь, риск-реестр с оценкой вероятности/влияния и стратегиями ответа.', href: '#', image: 'https://placehold.co/960x540/png?text=Project+Plan' },
    { title: 'Коммуникационный план', description: 'Карта стейкхолдеров, матрица влияния/интереса, каналы и частота коммуникаций, форматы отчётности, шаблоны созвонов и рассылок, эскалации и управление ожиданиями.', href: '#', image: 'https://placehold.co/960x540/png?text=Comms+Plan' },
    { title: 'Релиз-менеджмент', description: 'Процесс релизов: релизные ветки, чек-листы готовности, артефакты, контроль качества, go/no-go митинги, обратимость изменений (rollback) и пострелизный мониторинг.', href: '#', image: 'https://placehold.co/960x540/png?text=Release+Mgmt' },
  ],
}

function App() {
  const [selectedSpec, setSelectedSpec] = useState<Specialization>(null)
  const [pdfModalUrl, setPdfModalUrl] = useState<string | null>(null)

  // Блокируем прокрутку фона, когда открыта модалка PDF
  useEffect(() => {
    if (!pdfModalUrl) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [pdfModalUrl])

  const specTitle = useMemo(() => {
    if (selectedSpec === 'bi') return 'BI-аналитик'
    if (selectedSpec === 'ba') return 'Бизнес-аналитик'
    if (selectedSpec === 'pm') return 'Менеджер проектов'
    return null
  }, [selectedSpec])

  const resumeUrl = useMemo(() => {
    if (!selectedSpec) return null
    return resumeLinks[selectedSpec]
  }, [selectedSpec])

  const currentBlogCards = useMemo(() => {
    if (!selectedSpec) return []
    return blogs[selectedSpec]
  }, [selectedSpec])

  return (
    <div className="page">
      {/* Блок 1: аватар слева, описание справа */}
      <section className="section hero">
        <div className="hero__avatar">
          {/* Замените src на вашу фотографию */}
          <div className="avatar" aria-label="Аватар" />
        </div>
        <div className="hero__content" style={{ position: 'relative' }}>
          <h1>Василий Дубровин</h1>
          <h3>Аналитик данных / Менеджер проектов</h3>
          <p>
            Имею опыт работы в различных сферах и большой бэкграунд в оптимизации и автоматизации процессов.
          </p>
          <Link to="/blog" className="primary-button" style={{ position: 'absolute', top: 0, right: 0 }}>Перейти в блог</Link>
        </div>
      </section>

      {/* Блок 2: выбор специализации */}
      <section className="section specializations">
        <h2>Выберите специализацию</h2>
        <div className="spec-buttons">
          <button
            className={`spec-button ${selectedSpec === 'bi' ? 'active' : ''}`}
            onClick={() => setSelectedSpec(selectedSpec === 'bi' ? null : 'bi')}
          >
            BI-аналитик
          </button>
          <button
            className={`spec-button ${selectedSpec === 'ba' ? 'active' : ''}`}
            onClick={() => setSelectedSpec(selectedSpec === 'ba' ? null : 'ba')}
          >
            Бизнес-аналитик
          </button>
          <button
            className={`spec-button ${selectedSpec === 'pm' ? 'active' : ''}`}
            onClick={() => setSelectedSpec(selectedSpec === 'pm' ? null : 'pm')}
          >
            Менеджер проектов
          </button>
        </div>
      </section>

      {/* Блоки 3–4: появляются только при выборе специализации */}
      {selectedSpec && (
        <>
          {/* Блок 3: Скачать резюме */}
          <section className="section resume">
            <h2>Резюме — {specTitle}</h2>
            <p>Скачайте актуальную версию резюме для выбранной специализации.</p>
            <div>
              <a
                className="primary-button"
                href={resumeUrl ?? '#'}
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
                      <Link className="link" to="/blog?from=home">Подробнее</Link>
                      {card.pdfUrl && (
                        <button className="secondary-button" onClick={() => setPdfModalUrl(card.pdfUrl!)}>
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
              <div className="modal__backdrop" onClick={() => setPdfModalUrl(null)} />
              <div className="modal__dialog">
                <div className="modal__header">
                  <h3>Просмотр PDF</h3>
                  <button className="icon-button" aria-label="Закрыть" onClick={() => setPdfModalUrl(null)}>✕</button>
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
  )
}

export default App
