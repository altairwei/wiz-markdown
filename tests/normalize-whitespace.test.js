const wizmarkdown = require("../index");


test("Test white spaces", () => {
    expect(wizmarkdown.normalize_whitespace(
        "                          "
    )).toBe(
        " "
    );

    expect(wizmarkdown.normalize_whitespace(
        "\t\t\t\t\t\t"
    )).toBe(
        " "
    );

    expect(wizmarkdown.normalize_whitespace(
        "\n\n\n\n\n\n\n\n"
    )).toBe(
        " "
    );

    expect(wizmarkdown.normalize_whitespace(
        "\n"
    )).toBe(
        "\n"
    );

    expect(wizmarkdown.normalize_whitespace(
        "\n\r\t Hello   \n  \t  Hello"
    )).toBe(
        " Hello Hello"
    );

    expect(wizmarkdown.normalize_whitespace(
        " \u00a0 \ufeff \u200b Hello"
    )).toBe(
        " \u00a0 \ufeff \u200b Hello"
    );
});