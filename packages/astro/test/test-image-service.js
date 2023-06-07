import { fileURLToPath } from 'node:url';
import { baseService } from '../dist/assets/services/service.js';

/**
 * stub image service that returns images as-is without optimization
 * @param {{ foo?: string }} [config]
 */
export function testImageService(config = {}) {
	return {
		entrypoint: fileURLToPath(import.meta.url),
		config,
	};
}

/** @type {import("../dist/@types/astro").LocalImageService} */
export default {
	...baseService,
	getHTMLAttributes(options, serviceConfig) {
		options['data-service'] = 'my-custom-service';
		if (serviceConfig.foo) {
			options['data-service-config'] = serviceConfig.foo;
		}
		return baseService.getHTMLAttributes(options);
	},
	async transform(buffer, transform) {
		return {
			data: buffer,
			format: transform.format,
		};
	},
};
