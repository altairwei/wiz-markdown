const wizmarkdown = require("../index");

function wrapEncodedTextInHtml5(text) {
    return `<!DOCTYPE html><html><head></head><body><pre>${text}</pre></body></html>`;
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