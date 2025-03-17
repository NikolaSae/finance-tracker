// types/viewTypes.ts
export interface ViewData {
  [key: string]: string | number;
}

export interface ViewConfig {
  name: string;
  title: string;
  columns: string[];
}