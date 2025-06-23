export type Uuid = string;

export interface Snippet {
  id: Uuid;
  code: string | null;
  title: string;
  description: string | null;
  language: string;
  stars: number;
  tags: Array<string>;
}

export type Prettify<T> = { [K in keyof T]: T[K] } & {};
