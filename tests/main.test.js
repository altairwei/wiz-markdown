const { extractMarkdownFromHtml } = require("../index")

function wrapTextInHtml5(text) {
    return `<!DOCTYPE html><html><head></head><body>${text}</body></html>`
}

test('Simple markdown in html', () => {
    expect(extractMarkdownFromHtml(
        wrapTextInHtml5("Hello <br/> World")
    )).toBe(
        "Hello \n World"
    );
});