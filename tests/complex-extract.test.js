const fs = require('fs');
const path = require('path')
const wizmarkdown = require("../index")

function wrapTextInHtml5(text) {
    return `<!DOCTYPE html><html><head></head><body>${text}</body></html>`
}

test('Extract from a standalone markdown in html', () => {
    test_dir = path.dirname(__filename);
    html = fs.readFileSync(path.join(test_dir, 'samples', 'document-sample-01.html'), 'utf8');
    markdown = fs.readFileSync(path.join(test_dir, 'samples', 'document-sample-01.md'), 'utf8');
    expect(wizmarkdown.extract(
        html
    )).toBe(
        markdown
    );
});