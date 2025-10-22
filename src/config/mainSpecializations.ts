export interface MainSpecialization {
  id: string;
  name: string;
  displayName: string;
  resumeUrl: string;
  projects: Array<{
    title: string;
    description: string;
    href: string;
    image?: string;
    pdfUrl?: string;
    blogSlug?: string;
  }>;
}

export const mainSpecializations: MainSpecialization[] = [
  {
    id: 'bi',
    name: 'BI-аналитик',
    displayName: 'BI-аналитик',
    resumeUrl: 'https://github.com/your-username/your-repo/releases/latest/download/resume-bi.pdf',
    projects: [
      {
        title: 'Автоматизированный отчет',
        description: 'Подробный интерактивный отчет-презентация в Power BI с несколькими страницами: обзор ключевых метрик, анализ динамики. Реализованы drill-through, подключение к DWH (ClickHouse), инкрементальные обновления.',
        href: '#/bi-dashboard',
        image: '/img/PBI dash.png',
        pdfUrl: '/public/pdfs/ARB.pdf',
        blogSlug: 'bi-dashboard',
      },
      {
        title: 'ETL-пайплайн',
        description: 'Оркестрация пайплайна в Apache Airflow: инкрементальная загрузка из источников (PostgreSQL, Google Sheets), проверка качества данных с Great Expectations, моделирование слоёв staging/transform в dbt, контроль SLA и уведомления. Канареечные деплои и backfills.',
        href: '#',
        image: 'https://placehold.co/960x540/png?text=Airflow+%2B+dbt',
        blogSlug: 'etl-pipeline',
      },
      {
        title: 'Мониторинг загрузки транспортной инфраструктуры Краснодарского края',
        description: 'Длинная работа с данными, анализ загрузки транспортной инфраструктуры Краснодарского края. Использование Excel, Python, PostgreSQL, Apache Superset.',
        href: '#/monitoring',
        image: '/img/excel-krim-pivot.png',
        blogSlug: 'monitoring',
      },
    ]
  },
  {
    id: 'ba',
    name: 'Бизнес-аналитик',
    displayName: 'Бизнес-аналитик',
    resumeUrl: 'https://github.com/your-username/your-repo/releases/latest/download/resume-ba.pdf',
    projects: [
      // Пока пустой массив, можно добавить проекты позже
    ]
  },
  {
    id: 'pm',
    name: 'Менеджер проектов',
    displayName: 'Менеджер проектов',
    resumeUrl: 'https://raw.githubusercontent.com/nIBOP/random-assets/refs/heads/main/cv-pm-25.pdf',
    projects: [
      // Пока пустой массив, можно добавить проекты позже
    ]
  }
];

export const getMainSpecializationById = (id: string): MainSpecialization | undefined => {
  return mainSpecializations.find(spec => spec.id === id);
};
