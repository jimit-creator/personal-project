export interface Stats {
  totalQuestions: number;
  totalCategories: number;
  totalViews: number;
}

export type TabType = 'public' | 'admin';
export type AdminTabType = 'questions' | 'categories' | 'settings';

export interface CategoryColors {
  [key: string]: {
    bg: string;
    text: string;
  };
}

export const categoryColors: CategoryColors = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
  green: { bg: 'bg-green-100', text: 'text-green-800' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-800' },
  red: { bg: 'bg-red-100', text: 'text-red-800' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-800' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

export const iconOptions = [
  { value: 'calculator', label: 'Calculator', icon: '🧮' },
  { value: 'microscope', label: 'Microscope', icon: '🔬' },
  { value: 'monument', label: 'Monument', icon: '🏛️' },
  { value: 'book', label: 'Book', icon: '📚' },
  { value: 'folder', label: 'Folder', icon: '📁' },
  { value: 'globe', label: 'Globe', icon: '🌍' },
  { value: 'atom', label: 'Atom', icon: '⚛️' },
  { value: 'palette', label: 'Palette', icon: '🎨' },
];
