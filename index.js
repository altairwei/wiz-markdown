const htmlparser2 = require("htmlparser2");
const he = require("he");

const nonbreaking_inline  = [
    "a", "abbr", "acronym", "b", "bdo", "big", "cite",
    "code", "dfn", "em", "font", "i", "img", "kbd", "nobr",
    "s", "small", "span", "strike", "strong", "sub", "sup", "tt"];
const block_level = [
    "address", "article", "aside", "blockquote", "details",
    "dialog", "dd", "div", "dl", "dt", "fieldset", "figcaption",
    "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6",
    "header", "hgroup", "hr", "li", "main", "nav", "ol", "p", "pre",
    "section", "table", "ul"
];
const empty_tags = [
    "area", "base", "basefont", "bgsound", "br", "command",
    "col", "embed", "event-source", "frame", "hr", "image",
    "img", "input", "keygen", "link", "menuitem", "meta",
    "param", "source", "spacer", "track", "wbr"];
const preserve_whitespace = ["pre", "textarea", "script", "style"];
const special_handling = ["html", "body"];
const no_entity_sub = ["script", "style"];

function extract(html) {
    let markdown_lines = [];
    let in_body_tag = false;
    let pause = false;
    const parser = new htmlparser2.Parser({
        onopentag(tagname, attribs) {
            if (tagname === "script" || tagname === "style") {
                // Stop extract script or style
                pause = true;
            } else if (tagname == "body") {
                in_body_tag = true;
            }
        },
        ontext(text) {
            if (in_body_tag && !pause) {
                text = text.replace(/&nbsp;/g, "\u0020");
                text = he.decode(text);
                markdown_lines.push(text);
            }
        },
        onclosetag(tagname) {
            if (tagname === "script" || tagname === "style") {
                // Continue to extract after script or style
                pause = false;
            } else if (tagname === "body") {
                in_body_tag = false;
            } else if (block_level.includes(tagname)) {
                markdown_lines.push("\n");
            } else if (tagname === "br") {
                // <br/> should add one more line break
                markdown_lines.push("\n\n");
            }
        },
    }, {
        decodeEntities: false,
        recognizeSelfClosing: true,
        lowerCaseTags: true
    });
    parser.write(html);
    parser.end();
    return markdown_lines.join("");
}

function embed(text) {

}

module.exports = {
    extract,
    embed
};