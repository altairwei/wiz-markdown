Extract markdown source code from html:

```javascript
const wizmarkdown = require("@altairwei/wiz-markdown");
const markdown = wizmarkdown.extract(html, {
    convertImgTag: true,
    verbose: true,
    skipNonBodyTag: false
});
console.log(markdown);
```

Embed markdown into html:

```javascript
const wizmarkdown = require("@altairwei/wiz-markdown");
const html = wizmarkdown.embed(text, {
    escapeTabWithEntity: false, // default to replace `\t` with 4 `&nbsp;`
    wrapWithPreTag: true // Wrap markdown text within <pre> tag and perform only minimal character escaping
});
console.log(html);
```