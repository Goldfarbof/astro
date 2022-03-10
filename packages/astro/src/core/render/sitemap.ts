const STATUS_CODE_PAGE_REGEXP = /\/[0-9]{3}\/?$/;

/** Construct sitemap.xml given a set of URLs */
export function generateSitemap(pages: string[], filter?: (page: string) => boolean): string {
	// TODO: find way to respect <link rel="canonical"> URLs here

	// copy just in case original copy is needed
	// make sure that 404 page is excluded
	// also works for other error pages
	let urls = [...pages].filter((url) => !STATUS_CODE_PAGE_REGEXP.test(url));

	if (filter) {
		urls = urls.filter((url) => filter(url));
	}

	urls.sort((a, b) => a.localeCompare(b, 'en', { numeric: true })); // sort alphabetically so sitemap is same each time
	let sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
	for (const url of urls) {
		sitemap += `<url><loc>${url}</loc></url>`;
	}
	sitemap += `</urlset>\n`;
	return sitemap;
}
