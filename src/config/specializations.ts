export interface Specialization {
  id: string;
  name: string;
  displayName: string;
}

export const specializations: Specialization[] = [
  {
    id: 'data-analytics',
    name: 'Аналитика данных',
    displayName: 'Аналитика данных'
  },
  {
    id: 'business-analytics',
    name: 'Бизнес-аналитика',
    displayName: 'Бизнес-аналитика'
  },
  {
    id: 'management',
    name: 'Менеджмент',
    displayName: 'Менеджмент'
  },
  {
    id: 'development',
    name: 'Разработка',
    displayName: 'Разработка'
  }
];

export const getSpecializationById = (id: string): Specialization | undefined => {
  return specializations.find(spec => spec.id === id);
};

export const getSpecializationDisplayName = (id: string): string => {
  const spec = getSpecializationById(id);
  return spec ? spec.displayName : id;
};
