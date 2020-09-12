Extract markdown source code from html:

```javascript
const wizmarkdown = require("@altairwei/wiz-markdown");
const markdown = wizmarkdown.extract(html);
console.log(markdown);
```

Embed markdown into html:

```javascript
const wizmarkdown = require("@altairwei/wiz-markdown");
const html = wizmarkdown.embed(text);
console.log(html);
```