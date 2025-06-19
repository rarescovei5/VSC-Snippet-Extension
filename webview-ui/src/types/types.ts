export type Uuid = string;

export interface Snippet {
  id: Uuid;
  code: string | null;
  title: string | null;
  description: string | null;
  stars: number;
  tags: Array<string>;
}
