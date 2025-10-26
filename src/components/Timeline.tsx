import './Timeline.css';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    date: '2020',
    title: 'РТУ МИРЭА',
    description: 'Руководитель тьтюторов кафедры Разработки программных продуктов и информационных систем.',
  },
  {
    date: '2021',
    title: 'ДТ Альтаир',
    description: 'Преподаватель курсов для абитуриентов по разработке сайтов на Angular, а также Яндекс Лицея по программированию на Python и C++.'
  },
  {
    date: '2023',
    title: 'Фриланс',
    description: 'Поиски себя, работа в стартапах и фрилансе. Разрабатываю сайты на заказ, пробую себя в разных ролях и разных сферах.'
  },
  {
    date: '2024',
    title: 'АНО Единая транспортная дирекция',
    description: 'Автоматизация процессов, постройка пайплайнов обработки данных, создание отчетов и дашбордов, проектное управление.'
  },
];

export default function Timeline() {
  return (
    <div className="timeline-container">
      <h2>Путь развития</h2>
      <ul className="timeline">
        {timelineEvents.map((event, index) => (
          <li key={index} className="event" data-date={event.date}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
