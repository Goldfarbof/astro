import sharp from 'sharp';
import { ColorDefinition, isAspectRatioString, isOutputFormat } from '../loaders/index.js';
import type { OutputFormat, SSRImageService, TransformOptions } from './index.js';

class SharpService implements SSRImageService {
	async getImageAttributes(transform: TransformOptions) {
		// strip off the known attributes
		const { width, height, src, format, quality, aspectRatio, fit, position, background, ...rest } =
			transform;

		return {
			...rest,
			width: width,
			height: height,
		};
	}

	serializeTransform(transform: TransformOptions) {
		const searchParams = new URLSearchParams();

		if (transform.quality) {
			searchParams.append('q', transform.quality.toString());
		}

		if (transform.format) {
			searchParams.append('f', transform.format);
		}

		if (transform.width) {
			searchParams.append('w', transform.width.toString());
		}

		if (transform.height) {
			searchParams.append('h', transform.height.toString());
		}

		if (transform.aspectRatio) {
			searchParams.append('ar', transform.aspectRatio.toString());
		}

		if (transform.fit) {
			searchParams.append('fit', transform.fit);
		}

		if (transform.background) {
			searchParams.append('bg', transform.background);
		}

		if (transform.position) {
			searchParams.append('p', encodeURI(transform.position));
		}

		return { searchParams };
	}

	parseTransform(searchParams: URLSearchParams) {
		let transform: TransformOptions = { src: searchParams.get('href')! };

		if (searchParams.has('q')) {
			transform.quality = parseInt(searchParams.get('q')!);
		}

		if (searchParams.has('f')) {
			const format = searchParams.get('f')!;
			if (isOutputFormat(format)) {
				transform.format = format;
			}
		}

		if (searchParams.has('w')) {
			transform.width = parseInt(searchParams.get('w')!);
		}

		if (searchParams.has('h')) {
			transform.height = parseInt(searchParams.get('h')!);
		}

		if (searchParams.has('ar')) {
			const ratio = searchParams.get('ar')!;

			if (isAspectRatioString(ratio)) {
				transform.aspectRatio = ratio;
			} else {
				transform.aspectRatio = parseFloat(ratio);
			}
		}

		if (searchParams.has('fit')) {
			transform.fit = searchParams.get('fit') as typeof transform.fit;
		}

		if (searchParams.has('p')) {
			transform.position = decodeURI(searchParams.get('p')!) as typeof transform.position;
		}

		if (searchParams.has('bg')) {
			transform.background = searchParams.get('bg') as ColorDefinition | undefined;
		}

		return transform;
	}

	async transform(inputBuffer: Buffer, transform: TransformOptions) {
		const sharpImage = sharp(inputBuffer, { failOnError: false, pages: -1 });

		// always call rotate to adjust for EXIF data orientation
		sharpImage.rotate();

		if (transform.width || transform.height) {
			const width = transform.width && Math.round(transform.width);
			const height = transform.height && Math.round(transform.height);

			sharpImage.resize({
				width,
				height,
				fit: transform.fit,
				position: transform.position,
				background: transform.background,
			});
		}

		// remove alpha channel and replace with background color if requested
		if (transform.background) {
			sharpImage.flatten({ background: transform.background });
		}

		if (transform.format) {
			sharpImage.toFormat(transform.format, { quality: transform.quality });
		}

		const { data, info } = await sharpImage.toBuffer({ resolveWithObject: true });

		return {
			data,
			format: info.format as OutputFormat,
		};
	}
}

const service: SSRImageService = new SharpService();

export default service;
