const wizmarkdown = require("../index");

test("Encode different spaces", () => {
    expect(
        wizmarkdown.extract(
            wizmarkdown.embed(
                "# Hello World."
            )
        )
    ).toBe("# Hello World.");

    expect(
        wizmarkdown.extract(
            wizmarkdown.embed(
                "#   Hello   World."
            )
        )
    ).toBe("#   Hello   World.");

    expect(
        wizmarkdown.extract(
            wizmarkdown.embed(
                "#\u00a0\u00a0Hello\u00a0\u00a0World."
            )
        )
    ).toBe("#\u00a0\u00a0Hello\u00a0\u00a0World.");
});


test("Encode different entities", () => {
    expect(
        wizmarkdown.extract(
            wizmarkdown.embed(
                "Here is an Html entities `&nbsp;`"
            )
        )
    ).toBe("Here is an Html entities `&nbsp;`");

    expect(
        wizmarkdown.extract(
            wizmarkdown.embed(
                "Here is an html tag `<br/>`"
            )
        )
    ).toBe("Here is an html tag `<br/>`");
});