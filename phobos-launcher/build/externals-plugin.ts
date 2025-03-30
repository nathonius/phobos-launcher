/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { dirname } from 'node:path';
import { Walker, DepType } from 'flora-colossus';
import type { ForgeConfig } from '@electron-forge/shared-types';

interface ForgeExternalsPluginOptions {
  externals: string[];
  includeDeps?: boolean;
}

const defaultOpts: ForgeExternalsPluginOptions = {
  externals: [],
  includeDeps: true,
};

class ForgeExternalsPlugin {
  public name = 'forge-externals';
  __isElectronForgePlugin = true;
  private readonly _externals: string[];
  private readonly _includeDeps: boolean;
  private _dir: string;

  constructor(opts: ForgeExternalsPluginOptions) {
    const options = { ...defaultOpts, ...(opts || {}) };
    this._externals = options.externals;
    this._includeDeps = options.includeDeps;
  }

  init = (dir: string) => {
    this._dir = dir;
  };

  getHook(hookName: string) {
    switch (hookName) {
      case 'resolveForgeConfig':
        return this.resolveForgeConfig;
    }
  }

  getHooks() {
    return {
      resolveForgeConfig: this.resolveForgeConfig,
    };
  }

  resolveForgeConfig = async (forgeConfig: ForgeConfig) => {
    const foundModules = new Set(this._externals);

    if (this._includeDeps) {
      for (const external of this._externals) {
        const moduleRoot = dirname(
          require.resolve(`${external}/package.json`, { paths: [this._dir] })
        );

        const walker = new Walker(moduleRoot);
        // These are private so it's quite nasty!
        (walker as any).modules = [];
        await (walker as any).walkDependenciesForModule(
          moduleRoot,
          DepType.PROD
        );
        (walker as any).modules
          .filter(
            (dep: { nativeModuleType: DepType }) =>
              dep.nativeModuleType === DepType.PROD
          )
          .map((dep: { name: any }) => dep.name)
          .forEach((name: string) => foundModules.add(name));
      }
    }

    // The webpack plugin already sets the ignore function.
    const existingIgnoreFn = forgeConfig.packagerConfig.ignore;

    // We override it and ensure we include external modules too
    forgeConfig.packagerConfig.ignore = (file) => {
      const existingResult = (existingIgnoreFn as any)(file);

      if (existingResult == false) {
        return false;
      }

      if (file === '/node_modules') {
        return false;
      }

      for (const module of foundModules) {
        if (
          file.startsWith(`/node_modules/${module}`) ||
          file.startsWith(`/node_modules/${module.split('/')[0]}`)
        ) {
          return false;
        }
      }

      return true;
    };

    return forgeConfig;
  };
}

export default ForgeExternalsPlugin;
