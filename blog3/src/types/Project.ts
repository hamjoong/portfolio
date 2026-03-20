export interface Project {
  title: string;
  period: string;
  description: string;
  stack: string[];
  problem: string;
  solution: string;
  links?: { demo?: string; github?: string };
}
