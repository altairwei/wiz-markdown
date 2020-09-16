const wizmarkdown = require("../index");

function wrapTextInHtml5(text) {
    return `<!DOCTYPE html><html><head></head><body>${text}</body></html>`;
}

test("Wrong nested tag", () => {
    expect(
        wizmarkdown.extract(
            wrapTextInHtml5("<div>Hello <p></div>World</p>")
        )
    ).toBe("Hello \n\nWorld\n");
});