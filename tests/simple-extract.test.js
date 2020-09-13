const wizmarkdown = require("../index");

function wrapTextInHtml5(text) {
    return `<!DOCTYPE html><html><head></head><body>${text}</body></html>`;
}

test("Block element in markdown code", () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5("Hello <br/> World")
    )).toBe(
        "Hello \n World"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>Hello World</p>")
    )).toBe(
        "Hello World\n"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>Hello World</p><p>Hello Papa</p><p>Hello Afjs</p>")
    )).toBe(
        "Hello World\nHello Papa\nHello Afjs\n"
    );
});


test("htmlparser2 do not normalize whitespace", () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>Hello World</p>\n")
    )).toBe(
        "Hello World\n\n"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<font>   this is the text <font></font>  </font>")
    )).toBe(
        "   this is the text   "
    );
});


test("Decode html entities", () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>&nbsp;&nbsp;Hello&nbsp;World&nbsp;</p>")
    )).toBe(
        "  Hello World \n"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>Show \"\"</p>")
    )).toBe(
        "Show \"\"\n"
    );
});


test("Html entities from user input", () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>Show `&amp;nbsp;` and `&amp;gt;`</p>")
    )).toBe(
        "Show `&nbsp;` and `&gt;`\n"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>Show `&lt;br/&gt;`</p>")
    )).toBe(
        "Show `<br/>`\n"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("&nbsp;&nbspHello&nbsp&nbsp;")
    )).toBe(
        "  Hello  "
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("&quot;&quot&quot&quot;&quot&quot;")
    )).toBe(
        "\"\"\"\"\"\""
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("&lt&lt;&lt&lt&lt;&lt;&gt&gt;&gt&gt&gt;&gt")
    )).toBe(
        "<<<<<<>>>>>>"
    );
});


test("Markdown in <pre> tag", () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5("<pre>  # Hello World </pre>")
    )).toBe(
        "  # Hello World "
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<pre>  # Hello World </pre>")
    )).toBe(
        "  # Hello World "
    );

    // pre tag should not be nested.
    expect(wizmarkdown.extract(
        wrapTextInHtml5("<pre>  # Hello World <pre>hehehe</pre> hahaha</pre>")
    )).toBe(
        "  # Hello World hehehe hahaha"
    );

    // Naked html content
    expect(wizmarkdown.extract(
        "<pre># Show image <br/><p>**No** image.</p></pre>"
    )).toBe(
        "# Show image \n**No** image.\n"
    );
});


test("Skip non-body tag", () => {
    expect(wizmarkdown.extract(
        "<!DOCTYPE html><html><head>Skip me</head><body><pre># Hello World </pre></body></html>",
        {skipNonBodyTag: true}
    )).toBe(
        "# Hello World "
    );

    expect(wizmarkdown.extract(
        "<!DOCTYPE html><html><head></head><body><pre># Hello World </pre></body>Skip me</html>",
        {skipNonBodyTag: true}
    )).toBe(
        "# Hello World "
    );

    expect(wizmarkdown.extract(
        "<!DOCTYPE html><html><head></head><body>Include me <pre># Hello World </pre></body></html>",
        {skipNonBodyTag: true}
    )).toBe(
        "Include me # Hello World "
    );
});


test("Skip script and style tag", () => {
    expect(wizmarkdown.extract(
        "<!DOCTYPE html><html><head><script>var a = 1;</script></head><body><pre># Hello World </pre></body></html>"
    )).toBe(
        "# Hello World "
    );

    expect(wizmarkdown.extract(
        "<!DOCTYPE html><html><head></head><body><script>var a = 1;</script><pre># Hello World </pre></body></html>"
    )).toBe(
        "# Hello World "
    );

    expect(wizmarkdown.extract(
        "<!DOCTYPE html><html><head></head><body><pre># Hello World </pre><script>var a = 1;</script></body></html>"
    )).toBe(
        "# Hello World "
    );

    expect(wizmarkdown.extract(
        "<!DOCTYPE html><html><head><style>h1 {padding: 0;}</style></head><body><pre># Hello World </pre></body></html>"
    )).toBe(
        "# Hello World "
    );

    expect(wizmarkdown.extract(
        "<!DOCTYPE html><html><head></head><body><style>h1 {padding: 0;}</style><pre># Hello World </pre></body></html>"
    )).toBe(
        "# Hello World "
    );

    expect(wizmarkdown.extract(
        "<!DOCTYPE html><html><head></head><body><pre># Hello World </pre><style>h1 {padding: 0;}</style></body></html>"
    )).toBe(
        "# Hello World "
    );
});


test("Convert img tag to markdown syntax", () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5("<img src='index_files/IMG_01.jpg' />"),
        {convertImgTag: true}
    )).toBe(
        "![](index_files/IMG_01.jpg)"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<img alt='This is img' src='index_files/IMG_01.jpg' />"),
        {convertImgTag: true}
    )).toBe(
        "![This is img](index_files/IMG_01.jpg)"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("# Show image <br/><img alt='Apple' src='index_files/IMG_01.jpg' />"),
        {convertImgTag: true}
    )).toBe(
        "# Show image \n![Apple](index_files/IMG_01.jpg)"
    );
});


test("Incomplete html structure", () => {
    // Naked html content
    expect(wizmarkdown.extract(
        "# Show image <br/><p>**No** image.</p>"
    )).toBe(
        "# Show image \n**No** image.\n"
    );

    expect(wizmarkdown.extract(
        "<p>## Wrong text out of body.</p><body></body>"
    )).toBe(
        "## Wrong text out of body.\n"
    );

    // <doctype> in wrong location 
    expect(wizmarkdown.extract(
        "<script type='text/javascript'>console.log('Hello World')</script>"
        + "<style type='text/css'>h1 {color:red;} p {color:blue;}</style>"
        + "<!DOCTYPE html>" + "<p>## Wrong doctype location</p>"
    )).toBe(
        "## Wrong doctype location\n"
    );
});


test("Formated html string with line breaks", () => {
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
});


test("Non-named html entities", () => {
    // Decimal
    expect(wizmarkdown.extract(
        "&#160;&#9;&#60;&#62;&#38;&#34;&#39;&#96;"
    )).toBe(
        "&#160;&#9;&#60;&#62;&#38;&#34;&#39;&#96;"
        // Actual "\u00ao\t<>&\"'`"
    );
});