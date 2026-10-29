export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'date'
  | 'select'
  | 'radio';

export interface FieldDef {
  id: string;
  type: FieldType;
  key: string;
  label: string;
  required: boolean;
  description?: string;
  options?: string[];
}

export interface FormDef {
  id: string;
  name: string;
  fields: FieldDef[];
  updatedAt: number;
}

export interface RecordItem {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export const PALETTE: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text', label: 'Texte court', icon: 'Aa' },
  { type: 'textarea', label: 'Texte long', icon: '¶' },
  { type: 'email', label: 'Email', icon: '@' },
  { type: 'number', label: 'Nombre décimal', icon: '1.5' },
  { type: 'integer', label: 'Nombre entier', icon: '42' },
  { type: 'boolean', label: 'Case à cocher', icon: '☑' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'select', label: 'Liste déroulante', icon: '▾' },
  { type: 'radio', label: 'Choix unique', icon: '◉' },
];

export const uid = () => Math.random().toString(36).slice(2, 10);
