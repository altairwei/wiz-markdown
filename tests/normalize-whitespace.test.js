const wizmarkdown = require("../index");

function wrapTextInHtml5(text) {
    return `<!DOCTYPE html><html><head></head><body>${text}</body></html>`;
}

test("Test white spaces", () => {
    expect(wizmarkdown.normalize_whitespace(
        "                          "
    )).toBe(
        ""
    );

    expect(wizmarkdown.normalize_whitespace(
        "\t\t\t\t\t\t"
    )).toBe(
        ""
    );

    expect(wizmarkdown.normalize_whitespace(
        "\n\n\n\n\n\n\n\n"
    )).toBe(
        ""
    );

    expect(wizmarkdown.normalize_whitespace(
        "\n"
    )).toBe(
        ""
    );

    expect(wizmarkdown.normalize_whitespace(
        "\n\r\t Hello   \n  \t  Hello"
    )).toBe(
        "Hello Hello"
    );

    expect(wizmarkdown.normalize_whitespace(
        "\u00a0 \ufeff \u200b Hello"
    )).toBe(
        "\u00a0 \ufeff \u200b Hello"
    );
});


test("Formated html string with line breaks", () => {
    // Do not normalize whitespace
    expect(wizmarkdown.extract(
`<!DOCTYPE html>
<html>
  <head>
    <title>Href Attribute Example</title>
  </head>
  <body>
    <h1>Href Attribute Example</h1>
    <p>Hello</p>
  </body>
</html>`
    )).toBe(
        "\n\n  \n    Href Attribute Example\n  \n" // head
        + "  \n    Href Attribute Example\n\n    Hello\n\n  \n" // body
    );


    expect(wizmarkdown.extract(
`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" >
  </head>
  <body>
    <h1># Hello World</h1>
  </body>
</html>`, {normalizeWhitespace: true}
    )).toBe(
        "# Hello World\n"
    );

    expect(wizmarkdown.extract(
`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" >
  </head>
  <body>
    <pre>
# Hello World

This is an article.
</pre>
  </body>
</html>`, {normalizeWhitespace: true}
    )).toBe(
        "# Hello World\n\nThis is an article.\n"
    );

    expect(wizmarkdown.extract(
`<!DOCTYPE html>

<h1>       Hello      World!     </h1>`,
        {normalizeWhitespace: true}
    )).toBe(
        "Hello World!\n"
    );

    // do not normalize whitespace within pre tag
    expect(wizmarkdown.extract(
        wrapTextInHtml5("<pre>                </pre>"),
        {normalizeWhitespace: true}
    )).toBe(
        "                "
    );
});


test("A leading newline character immediately following the <pre> element start tag is stripped", () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5(`<pre>
    console.log('Hello World');
    var a = 1024;
    var b = 1024 * 1024;
</pre>`),
        {normalizeWhitespace: true}
    )).toBe(
        "    console.log('Hello World');\n    var a = 1024;\n    var b = 1024 * 1024;\n"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5(`<pre>\n
    console.log('Hello World');
    var a = 1024;
    var b = 1024 * 1024;
</pre>`),
        {normalizeWhitespace: true}
    )).toBe(
        "\n    console.log('Hello World');\n    var a = 1024;\n    var b = 1024 * 1024;\n"
    );

    // Only immediately following newline character is stripped
    expect(wizmarkdown.extract(
        wrapTextInHtml5(`<pre>
# Hello Start
<code>
    console.log('Hello World');
    var a = 1024;
    var b = 1024 * 1024;
</code>
# Hello End
</pre>`),
        {normalizeWhitespace: true}
    )).toBe(
        "# Hello Start\n"
        + "\n    console.log('Hello World');\n    var a = 1024;\n    var b = 1024 * 1024;\n\n"
        + "# Hello End\n"
    );

});


test("Other tag within <pre> tag", () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5(
`<pre><code>function Panel(element, canClose, closeHandler) {
  this.element = element;
  this.canClose = canClose;
  this.closeHandler = function () { if (closeHandler) closeHandler() };
}</code></pre>`),
        {normalizeWhitespace: true}
    )).toBe(
`function Panel(element, canClose, closeHandler) {
  this.element = element;
  this.canClose = canClose;
  this.closeHandler = function () { if (closeHandler) closeHandler() };
}`
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5(
`<pre><samp>You are in an open field west of a big white house with a boarded
front door.
There is a small mailbox here.

></samp> <kbd>open mailbox</kbd>

<samp>Opening the mailbox reveals:
A leaflet.

></samp></pre>`),
        {normalizeWhitespace: true}
    )).toBe(
`You are in an open field west of a big white house with a boarded
front door.
There is a small mailbox here.

> open mailbox

Opening the mailbox reveals:
A leaflet.

>`
    );
});


test("Whitespace in inline formatting context.", () => {
    /*
    expect(wizmarkdown.extract(
        wrapTextInHtml5(
            "<p>This is the <code>Panel</code> constructor:</p>"
        ),
        {normalizeWhitespace: true}
    )).toBe(
        "This is the Panel constructor:\n"
    );

    expect(wizmarkdown.extract(
`<h1>   Hello 
\t\t\t\t<span> World!</span>\t  </h1>`,
        {normalizeWhitespace: true}
    )).toBe(
        "Hello World!\n"
    );
    */
});


test("Whitespace in block formatting contexts.", () => {

});