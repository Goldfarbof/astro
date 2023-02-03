import type { AstroBuildPluginContainer, AstroBuildPlugin } from '../plugin';
import type { PageBuildData, StaticBuildOptions } from '../types';
import { pluginAnalyzer } from './plugin-analyzer.js';
import { pluginInternals } from './plugin-internals.js';
import { pluginPages } from './plugin-pages.js';
import { pluginCSS } from './plugin-css.js';
import { pluginPrerender } from './plugin-prerender.js';
import { astroConfigBuildPlugin } from '../../../content/vite-plugin-content-assets.js';
import { pluginSSR } from './plugin-ssr.js';
import { pluginAliasResolve } from './plugin-alias-resolve.js';
import { pluginHoistedScripts } from './plugin-hoisted-scripts.js';

export function registerAllPlugins({ internals, options, register }: AstroBuildPluginContainer) {
	register(pluginAliasResolve(internals));
	register(pluginAnalyzer(internals));
	register(pluginInternals(internals));
	register(pluginPages(options, internals));
	register(pluginCSS(options, internals));
	register(pluginPrerender(options, internals));
	register(astroConfigBuildPlugin(internals));
	register(pluginHoistedScripts(options, internals));
	register(pluginSSR(options, internals));
}
