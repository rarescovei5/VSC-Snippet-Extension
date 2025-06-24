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

export type RemoteSnippet = { kind: 'remote' } & Omit<Snippet, 'tags' | 'stars'>;
export type LocalSnippet = { kind: 'local' } & Omit<Snippet, 'id' | 'tags' | 'stars'>;

export type Prettify<T> = { [K in keyof T]: T[K] } & {};
