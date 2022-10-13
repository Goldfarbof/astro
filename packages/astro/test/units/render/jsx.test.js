import { expect } from 'chai';

import { createComponent, render, renderSlot } from '../../../dist/runtime/server/index.js';
import { jsx } from '../../../dist/jsx-runtime/index.js';
import {
	createBasicEnvironment,
	createRenderContext,
	renderPage,
	loadRenderer,
} from '../../../dist/core/render/index.js';
import { createAstroJSXComponent, renderer as jsxRenderer } from '../../../dist/jsx/index.js';
import { defaultLogging as logging } from '../../test-utils.js';

const createAstroModule = (AstroComponent) => ({ default: AstroComponent });
const loadJSXRenderer = () => loadRenderer(jsxRenderer, (s) => import(s));

describe('core/render', () => {
	describe('Astro JSX components', () => {
		let env;
		before(async () => {
			env = createBasicEnvironment({
				logging,
				renderers: [await loadJSXRenderer()],
			});
		});

		it('Can render slots', async () => {
			const Wrapper = createComponent((result, _props, slots = {}) => {
				return render`<div>${renderSlot(result, slots['myslot'])}</div>`;
			});

			const Page = createAstroJSXComponent(() => {
				return jsx(Wrapper, {
					children: [
						jsx('p', {
							slot: 'myslot',
							className: 'n',
							children: 'works',
						}),
					],
				});
			});

			const ctx = createRenderContext({ request: new Request('http://example.com/') });
			const response = await renderPage(createAstroModule(Page), ctx, env);

			expect(response.status).to.equal(200);

			const html = await response.text();
			expect(html).to.include('<div><p class="n">works</p></div>');
		});
	});
});
