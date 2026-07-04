export interface Project {
  name: string;
  slug: string;
  description: string | null;
  url: string;
  homepage: string | null;
  updatedAt: string; // ISO8601
  topics: string[];
}
