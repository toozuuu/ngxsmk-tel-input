/**
 * Schema for component schematic
 */

export interface Schema {
  name: string;
  path?: string;
  project?: string;
  theme?: 'default' | 'material' | 'primeng';
  useReactiveForms?: boolean;
}

