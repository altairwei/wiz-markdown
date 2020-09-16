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


function normalize_whitespace(text) {
    // Trim left and right whitespace
    text = text.replace(/(^[\f\n\r\t\v\u0020]{1,}|[\f\n\r\t\v\u0020]{1,}$)/ug, "");
    if (!text) {
        return "";
    }
    // Normalize whitespace within content
    text = text.replace(/[\f\n\r\t\v\u{0020}]{2,}/ug, "\u0020");
    return text;
}


function isWithinPreTag(stack) {
    const index = stack.slice().reverse().findIndex(tag_obj => {
        return tag_obj.tagname === "pre";
    });

    return index === -1 ? false : true;
}


function extract(html, {
    convertImgTag = false,
    verbose = false,
    skipNonBodyTag = false,
    normalizeWhitespace = false
} = {}) {

    let markdown_lines = [];
    let tag_stack = [];
    let in_body_tag = false;
    let in_script_tag = false;
    let in_style_tag = false;
    let num_of_pre_text_node = 0;

    const parser = new htmlparser2.Parser({
        onopentag(tagname, attribs) {
            tag_stack.push({tagname, attribs});

            if (tagname === "script") {
                // Stop extract script or style
                in_script_tag = true;
            } else if (tagname === "style") {
                in_style_tag = true;
            } else if (tagname === "pre") {
                num_of_pre_text_node = 0;
            } else if (tagname === "body") {
                in_body_tag = true;
            } else if (tagname === "img" && convertImgTag) {
                const alt = attribs.alt ? attribs.alt : "";
                const src = attribs.src ? attribs.src : "";
                markdown_lines.push(`![${alt}](${src})`);
            }
        },
        onclosetag(tagname) {
            tag_obj = tag_stack.pop();
            if (tag_obj.tagname !== tagname) {
                const stack_string = tag_stack.map(tag_obj => tag_obj.tagname).join(", ");
                throw new Error(`<${tag_obj.tagname}> doesn't match </${tagname}>. Stack trace: ${stack_string}`);
            }

            if (tagname === "script") {
                // Continue to extract after script or style
                in_script_tag = false;
            } else if (tagname === "style") {
                in_style_tag = false;
            } else if (tagname === "pre") {
                num_of_pre_text_node = 0;
            } else if (tagname === "body") {
                in_body_tag = false;
            } else if (block_level.includes(tagname)) {
                markdown_lines.push("\n");
            } else if (tagname === "br") {
                // <br/> should add one more line break
                markdown_lines.push("\n");
            }
        },
        ontext(text) {
            // Get current tag from top of stack
            const {tagname, attribs} = tag_stack[tag_stack.length - 1] || {};

            if (normalizeWhitespace) {
                // See https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace
                //  Whitespace in between words is treated as a single character,
                //  and whitespace at the start and end of elements and outside
                //  elements is ignored.
                let shouldPreserve = (tagname && preserve_whitespace.includes(tagname)) || isWithinPreTag(tag_stack);
                if (!shouldPreserve) {
                    text = normalize_whitespace(text);
                }
                // Process a leading newline character
                //  immediately following the <pre> element start tag
                if (tagname && tagname === "pre") {
                    num_of_pre_text_node += 1;
                    if (num_of_pre_text_node === 1
                        && text[0] === "\n") {
                        text = text.substring(1);
                    }
                }
            }

            if (text === "") {
                return;
            }

            if (in_script_tag || in_style_tag) {
                // Skip script and style content
                return;
            }

            if (skipNonBodyTag && !in_body_tag) {
                return;
            }
            // https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references
            // It is intentional, for legacy compatibility, that many code
            // points have multiple character reference names. For example,
            // some appear both with and without the trailing semicolon, or
            //  with different capitalizations.
            text = text.replace(/&apos;/g, "'")
                .replace(/&quot;/g, "\"")
                .replace(/&quot/g, "\"")
                .replace(/&grave;/g, "`")
                .replace(/&lt;/g, "<")
                .replace(/&lt/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&gt/g, ">")
                .replace(/&Tab;/g, "\t")
                .replace(/&nbsp;/g, "\u0020")
                .replace(/&nbsp/g, "\u0020");
            // &amp; should be decoded after all other entities.
            text = text.replace(/&amp;/g, "&");
            markdown_lines.push(text);
        },
        onerror(error) {
            throw error;
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


function embed(text, {
    escapeTabWithEntity = false,
    wrapWithPreTag = false
} = {}) {

    const char_array = Array.from(text);
    const encoded = char_array.map(function(char) {
        // We only need to escape 3 unsafe chars in <pre></pre>.
        //  Whitespace inside this element is displayed as written.
        switch(char) {
        case "&":
            return "&amp;";
        case "<":
            return "&lt;";
        case ">":
            return "&gt;";
        }

        if (!wrapWithPreTag) {
            switch(char) {
            // Unsafe symbols
            case "'":
                return "&apos;";
            case "\"":
                return "&quot;";
            case "`":
                return "&grave;";
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
            }
        }

        // default to return original char.
        return char;

    });

    const encoded_text = encoded.join("");
    const final_text = wrapWithPreTag ? `<pre>${encoded_text}</pre>` : encoded_text;
    return `<!DOCTYPE html><html><head><meta charset="utf-8" ></head><body>${final_text}</body></html>`;
}

module.exports = {
    extract,
    embed,
    normalize_whitespace
};