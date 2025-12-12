/**
 * Component schematic for ngxsmk-tel-input
 */

import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  url,
  template,
  move,
  mergeWith,
  chain
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { Schema } from './schema';

export default function componentSchematic(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...options,
        theme: options.theme || 'default',
        useReactiveForms: options.useReactiveForms !== false
      }),
      move(normalize(`projects/${options.project || 'app'}/src/app/${options.path || ''}`))
    ]);

    return chain([
      mergeWith(templateSource)
    ]);
  };
}

function normalize(path: string): string {
  return path.replace(/\\/g, '/');
}

