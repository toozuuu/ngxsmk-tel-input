/**
 * Angular CLI schematic for ngxsmk-tel-input
 */

import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  mergeWith,
  apply,
  url,
  template,
  move,
  noop,
  filter
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  getWorkspace,
  updateWorkspace
} from '@schematics/angular/utility/workspace';
import { normalize } from '@angular-devkit/core';
import { Schema } from './schema';

/**
 * Main schematic function
 */
export default function ngAdd(options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const projectName = options.project || workspace.extensions['defaultProject'] as string;
    const theme = options.theme ?? 'default';
    
    if (!projectName) {
      throw new Error('No project specified. Use --project flag.');
    }

    const project = getProjectByName(workspace, projectName);
    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';

    return chain([
      // Add dependencies
      options.skipPackageJson ? noop() : addDependencies(),
      
      // Update angular.json
      options.addStyles ? updateAngularJsonStyles(projectName) : noop(),
      options.addAssets ? updateAngularJsonAssets(projectName) : noop(),
      
      // Add theme files if needed
      theme === 'default' ? noop() : addThemeFiles(theme, projectName),
      
      // Create example component
      createExampleComponent(projectName, projectType, theme),
      
      // Install dependencies
      options.skipPackageJson ? noop() : installDependencies(context)
    ]);
  };
}

/**
 * Add package dependencies
 */
function addDependencies(): Rule {
  return (tree: Tree) => {
    const packageJson = tree.read('package.json');
    if (!packageJson) {
      throw new Error('package.json not found');
    }

    const packageJsonContent = JSON.parse(packageJson.toString());
    
    if (!packageJsonContent.dependencies) {
      packageJsonContent.dependencies = {};
    }

    // Add required dependencies
    packageJsonContent.dependencies['ngxsmk-tel-input'] = '^1.6.10';
    packageJsonContent.dependencies['intl-tel-input'] = '^25.3.2';
    packageJsonContent.dependencies['libphonenumber-js'] = '^1.12.11';

    tree.overwrite('package.json', JSON.stringify(packageJsonContent, null, 2));
    return tree;
  };
}

function getProjectByName(workspace: any, projectName: string): any {
  const project = workspace.projects.get(projectName);
  if (!project) {
    throw new Error(`Project "${projectName}" not found in workspace.`);
  }
  return project;
}

function getBuildTargetOptions(project: any): Record<string, unknown> {
  const buildTarget = project.targets.get('build');
  if (!buildTarget) {
    throw new Error(`Project does not have a build target.`);
  }
  if (!buildTarget.options) {
    buildTarget.options = {};
  }
  return buildTarget.options as Record<string, unknown>;
}

/**
 * Update angular.json to include styles
 */
function updateAngularJsonStyles(projectName: string): Rule {
  return updateWorkspace((workspace) => {
    const project = getProjectByName(workspace, projectName);
    const targetOptions = getBuildTargetOptions(project);

    if (!targetOptions['styles']) {
      targetOptions['styles'] = [];
    }

    const styles = targetOptions['styles'] as string[];
    const intlTelInputCss = 'node_modules/intl-tel-input/build/css/intlTelInput.css';

    if (!styles.includes(intlTelInputCss)) {
      styles.push(intlTelInputCss);
    }

    // Component styles are self-contained; only intl-tel-input base css is required here.
  });
}

/**
 * Update angular.json to include assets
 */
function updateAngularJsonAssets(projectName: string): Rule {
  return updateWorkspace((workspace) => {
    const project = getProjectByName(workspace, projectName);
    const targetOptions = getBuildTargetOptions(project);

    if (!targetOptions['assets']) {
      targetOptions['assets'] = [];
    }

    const assets = targetOptions['assets'] as any[];
    const flagAssets = {
      glob: '**/*',
      input: 'node_modules/intl-tel-input/build/img',
      output: 'assets/intl-tel-input/img'
    };

    const hasFlagAssets = assets.some(
      (asset: any) => 
        typeof asset === 'object' && 
        asset.input === flagAssets.input &&
        asset.output === flagAssets.output
    );

    if (!hasFlagAssets) {
      assets.push(flagAssets);
    }
  });
}

/**
 * Add theme files
 */
function addThemeFiles(theme: string, projectName: string): Rule {
  return mergeWith(
    apply(url(`./files/${theme}`), [
      template({}),
      move(normalize(`projects/${projectName}/src/styles`))
    ])
  );
}

/**
 * Create example component
 */
function createExampleComponent(projectName: string, projectType: string, theme: string): Rule {
  return mergeWith(
    apply(url('./files/example'), [
      template({
        projectName,
        theme,
        isApp: projectType === 'app'
      }),
      filter((path) => {
        // Only create example if it's an app project
        return projectType === 'app';
      }),
      move(normalize(`projects/${projectName}/src/app`))
    ])
  );
}

/**
 * Install dependencies
 */
function installDependencies(context: SchematicContext): Rule {
  return (tree: Tree) => {
    context.addTask(new NodePackageInstallTask());
    return tree;
  };
}

