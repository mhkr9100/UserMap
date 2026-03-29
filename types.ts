export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type UserMapNodeType = 'root' | 'category' | 'cluster' | 'fact';
export type UserMapImportance = 'high' | 'medium' | 'low';

export interface PageNode {
  id: string;
  label: string;
  value?: string;
  source?: string;
  sourceDate?: string;
  nodeType?: UserMapNodeType;
  importance?: UserMapImportance;
  confidence?: number;
  children: PageNode[];
}
