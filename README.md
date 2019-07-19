# postcss-zombiebox-multires-assets

[PostCSS](https://github.com/postcss/postcss) plugin to support multi resolution assets in [ZombieBox](https://zombiebox.tv) application.

## Usage

Instantiate the plugin passing `resolutions` option, e.g.:

```javascript
const postcss = require('postcss');
const multiresAssets = require('postcss-zombiebox-multires-assets');

postcss([multiresAssets({
	resolutions: ['hd', 'full-hd']
})]);
```

So with the config above this:

```css
.w-button .w-button__icon {
	background-image: url(img/icon.png);
}
``` 

will be transformed to this:

```css
.w-button .w-button__icon {
	background-image: url(img/icon.png);
}

.zb-hd .w-button .w-button__icon {
	background-image: url(img/hd/icon.png);
}

.zb-full-hd .w-button .w-button__icon {
	background-image: url(img/full-hd/icon.png);
}
``` 
