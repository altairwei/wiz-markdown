const htmlparser2 = require("htmlparser2");

const nonbreaking_inline  = [
    "a", "abbr", "acronym", "b", "bdo", "big", "cite",
    "code", "dfn", "em", "font", "i", "img", "kbd", "nobr",
    "s", "small", "span", "strike", "strong", "sub", "sup", "tt"];
const block_level = [
    "address", "article", "aside", "blockquote", "details",
    "dialog", "dd", "div", "dl", "dt", "fieldset", "figcaption",
    "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6",
    "header", "hgroup", "hr", "li", "main", "nav", "ol", "p",
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

const default_extract_options = {
    convertImgTag: false,
    verbose: false,
    skipNonBodyTag: false
};

function extract(html, options = default_extract_options) {
    const { convertImgTag, verbose, skipNonBodyTag } = options;

    let markdown_lines = [];
    let in_body_tag = false;
    let in_script_tag = false;
    let in_style_tag = false;
    let in_pre_tag = false;

    const parser = new htmlparser2.Parser({
        onopentag(tagname, attribs) {
            if (tagname === "script") {
                // Stop extract script or style
                in_script_tag = true;
            } else if (tagname === "style") {
                in_style_tag = true;
            } else if (tagname === "body") {
                in_body_tag = true;
            } else if (tagname === "pre" && in_body_tag) {
                in_pre_tag = true;
            } else if (tagname === "img" && convertImgTag) {
                const alt = attribs.alt ? attribs.alt : "";
                const src = attribs.src ? attribs.src : "";
                markdown_lines.push(`![${alt}](${src})`);
            }
        },
        onclosetag(tagname) {
            if (tagname === "script") {
                // Continue to extract after script or style
                in_script_tag = false;
            } else if (tagname === "style") {
                in_style_tag = false;
            } else if (tagname === "body") {
                in_body_tag = false;
            } else if (tagname === "pre" && in_body_tag) {
                in_pre_tag = false;
            } else if (block_level.includes(tagname)) {
                markdown_lines.push("\n");
            } else if (tagname === "br") {
                // <br/> should add one more line break
                markdown_lines.push("\n");
            }
        },
        ontext(text) {
            if (in_script_tag || in_style_tag) {
                // Skip script and style content
                return;
            }

            if (skipNonBodyTag && !in_body_tag) {
                return;
            }

            text = text.replace(/&apos;/g, "'")
                .replace(/&quot;/g, "\"")
                .replace(/&grave;/g, "`")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&Tab;/g, "\t");
            text = text.replace(/&nbsp;/g, "\u0020");
            // &amp; should be decoded after all other entities.
            text = text.replace(/&amp;/g, "&");
            markdown_lines.push(text);
        },
        onerror(error) {
            if (verbose) {
                console.error(error);
            }
        }
    },
    {
        decodeEntities: false,
        recognizeSelfClosing: true,
        lowerCaseTags: true,
        lowerCaseAttributeNames: true
    });
    parser.write(html);
    parser.end();
    return markdown_lines.join("");
}

const default_embed_options = {
    escapeTabWithEntity: false
};

function embed(text, options = default_embed_options) {
    const { escapeTabWithEntity } = options;
    const char_array = Array.from(text);
    const encoded = char_array.map(function(char) {
        switch(char) {
        // Unsafe symbols
        case "'":
            return "&apos;";
        case "\"":
            return "&quot;";
        case "`":
            return "&grave;";
        case "&":
            return "&amp;";
        case "<":
            return "&lt;";
        case ">":
            return "&gt;";
        // Space and line break
        case "\t":
            return escapeTabWithEntity ? "&Tab;" : "&nbsp;".repeat(4);
        case "\n":
        case "\r":
        case "\r\n":
        case "\u0085":
        case "\u2028":
        case "\u2029":
            return "<br>";
        case "\u0020":
            return "&nbsp;";
        default:
            return char;
        }
    });

    const encoded_text = encoded.join("");
    return `<!DOCTYPE html><html><head></head><body><pre>${encoded_text}</pre></body></html>`;
}

module.exports = {
    extract,
    embed
};