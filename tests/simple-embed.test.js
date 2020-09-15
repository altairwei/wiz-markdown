const wizmarkdown = require("../index");

function wrapEncodedTextInHtml5(text) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8" ></head><body>${text}</body></html>`;
}

test("Encode different spaces", () => {
    expect(wizmarkdown.embed(
        "# Hello World"
    )).toBe(
        wrapEncodedTextInHtml5(
            "#&nbsp;Hello&nbsp;World"
        )
    );

    expect(wizmarkdown.embed(
        "#   Hello   World"
    )).toBe(
        wrapEncodedTextInHtml5(
            "#&nbsp;&nbsp;&nbsp;Hello&nbsp;&nbsp;&nbsp;World"
        )
    );
    
    // \u00a0 
    expect(wizmarkdown.embed(
        "#\u00a0Hello\u00a0World"
    )).toBe(
        wrapEncodedTextInHtml5(
            "#\u00a0Hello\u00a0World"
        )
    );

    expect(wizmarkdown.embed(
        "#\u3000Hello\u3000World"
    )).toBe(
        wrapEncodedTextInHtml5(
            "#\u3000Hello\u3000World"
        )
    );
});


test("Encode other character", () => {
    expect(wizmarkdown.embed(
        "This is &nbsp;"
    )).toBe(
        wrapEncodedTextInHtml5(
            "This&nbsp;is&nbsp;&amp;nbsp;"
        )
    );

    expect(wizmarkdown.embed(
        "This is <br/>"
    )).toBe(
        wrapEncodedTextInHtml5(
            "This&nbsp;is&nbsp;&lt;br/&gt;"
        )
    );

    expect(wizmarkdown.embed(
        "This is “”"
    )).toBe(
        wrapEncodedTextInHtml5(
            "This&nbsp;is&nbsp;“”"
        )
    );

    expect(wizmarkdown.embed(
        "This is \"\""
    )).toBe(
        wrapEncodedTextInHtml5(
            "This&nbsp;is&nbsp;&quot;&quot;"
        )
    );

    expect(wizmarkdown.embed(
        "This is ''"
    )).toBe(
        wrapEncodedTextInHtml5(
            "This&nbsp;is&nbsp;&apos;&apos;"
        )
    );

    expect(wizmarkdown.embed(
        "This is `code`"
    )).toBe(
        wrapEncodedTextInHtml5(
            "This&nbsp;is&nbsp;&grave;code&grave;"
        )
    );
});


test("Test wrapWithPreTag option", () => {
    expect(wizmarkdown.embed(
        "# Hello World",
        {wrapWithPreTag: true}
    )).toBe(
        wrapEncodedTextInHtml5(
            "<pre># Hello World</pre>"
        )
    );

    expect(wizmarkdown.embed(
        "This is a tag `<br/>`, this is a entity `&nbsp;`",
        {wrapWithPreTag: true}
    )).toBe(
        wrapEncodedTextInHtml5(
            "<pre>This is a tag `&lt;br/&gt;`, this is a entity `&amp;nbsp;`</pre>"
        )
    );

    // A series of whitespaces were preserved
    expect(wizmarkdown.embed(
        "    # Hello     World   ",
        {wrapWithPreTag: true}
    )).toBe(
        wrapEncodedTextInHtml5(
            "<pre>    # Hello     World   </pre>"
        )
    );

    // Line breaks were preserved
    expect(wizmarkdown.embed(
        "# Hello World \n # Whitespace \r\n",
        {wrapWithPreTag: true}
    )).toBe(
        wrapEncodedTextInHtml5(
            "<pre># Hello World \n # Whitespace \r\n</pre>"
        )
    );
});