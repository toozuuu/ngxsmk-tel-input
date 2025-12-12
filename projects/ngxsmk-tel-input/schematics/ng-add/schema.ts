/**
 * Schema for ng-add schematic
 */

export interface Schema {
  project?: string;
  skipPackageJson?: boolean;
  theme?: 'default' | 'material' | 'primeng';
  addStyles?: boolean;
  addAssets?: boolean;
}

