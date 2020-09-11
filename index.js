const { JSDOM } = require("jsdom");

function extractMarkdownFromHtml(html) {
    const dom = new JSDOM(html)
    return dom.window.document.body.textContent
}

module.exports = {
    extractMarkdownFromHtml
}