const wizmarkdown = require("../index")

function wrapTextInHtml5(text) {
    return `<!DOCTYPE html><html><head></head><body>${text}</body></html>`
}

test('Block element in markdown code', () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5("Hello <br/> World")
    )).toBe(
        "Hello \n\n World"
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


test('htmlparser2 do not normalize whitespace', () => {
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


test('Decode html entities', () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>&nbsp;&nbsp;Hello&nbsp;World&nbsp;</p>")
    )).toBe(
        "  Hello World \n"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>Show `&amp;nbsp;`</p>")
    )).toBe(
        "Show `&nbsp;`\n"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>Show `&lt;br/&gt;`</p>")
    )).toBe(
        "Show `<br/>`\n"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<p>Show \"\"</p>")
    )).toBe(
        "Show \"\"\n"
    );
})


test('Markdown in <pre> tag', () => {
    expect(wizmarkdown.extract(
        wrapTextInHtml5("<pre>  # Hello World </pre>")
    )).toBe(
        "  # Hello World \n"
    );

    expect(wizmarkdown.extract(
        wrapTextInHtml5("<pre>  # Hello World </pre>")
    )).toBe(
        "  # Hello World \n"
    );
})