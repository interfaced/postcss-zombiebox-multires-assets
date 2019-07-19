const postcss = require('postcss');

const RESOLUTIONS = ['pal', 'qhd', 'hd', 'full-hd'];
const URL_REGEX = /url\((.*)\)/;

module.exports = postcss.plugin('postcss-zombiebox-multires-assets', ({resolutions = [], ignoreSelectors = []} = {}) =>
	(root, options) => {
		const unrecognizedResolutions = resolutions.filter((resolution) => !RESOLUTIONS.includes(resolution));
		if (unrecognizedResolutions.length) {
			unrecognizedResolutions.forEach((resolution) => {
				options.warn(`Resolution "${resolution}" is not recognized`);
				resolutions.splice(resolutions.indexOf(resolution), 1);
			});
		}

		if (!resolutions.length) {
			return;
		}

		root.walkDecls((decl) => {
			if (isAssetDecl(decl)) {
				const url = decl.value.match(URL_REGEX)[1];

				// Skip a non local url
				if (!isLocalUrl(url)) {
					return;
				}

				resolutions.forEach((resolution) => {
					const {parent} = decl;

					// Skip invalid rules
					if (!parent || !parent.selector) {
						return;
					}

					// Skip rules that are resolution-specific already
					if (RESOLUTIONS.some((supportedResolution) =>
						parent.selector.startsWith(`.zb-${supportedResolution}`)
					)) {
						return;
					}

					// Ignore some rules by given selectors
					if (ignoreSelectors.some((selector) => parent.selector.startsWith(selector))) {
						return;
					}

					root.append(parent.clone({
						selector: `.zb-${resolution} ${parent.selector}`,
						nodes: [decl.clone({
							value: decl.value.replace(URL_REGEX, `url(${modifyUrl(url, resolution)})`)
						})]
					}));
				});
			}
		});
	});

function isAssetDecl(decl) {
	return (
		['background', 'background-image'].includes(decl.prop) &&
		decl.value &&
		decl.value.startsWith('url(')
	);
}

function isLocalUrl(url) {
	return !url.startsWith('data:') && !/(^[a-z]+:)+\/\//.test(url);
}

function modifyUrl(url, resolution) {
	const urlChunks = url.split('/');

	urlChunks.splice(urlChunks.length - 1, 0, resolution);

	return urlChunks.join('/');
}
