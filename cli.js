#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const wizmarkdown = require("./index.js");

let args = process.argv.slice(2);

if (args.includes("-x")) {
    args[args.indexOf("-x")] = "--extract";
}

if (args.includes("-e")) {
    args[args.indexOf("-e")] = "--embed";
}

if (args.includes("-h")) {
    args[args.indexOf("-h")] = "--help";
}

if (args.includes("-v")) {
    args[args.indexOf("-v")] = "--version";
}

const program = {
    dirname: __dirname,
    filename: __filename,
    nodeBin: process.argv[0],
    flags: args.filter(arg => arg[0] === "-"),
    files: args.filter(arg => arg[0] !== "-" && arg[1] !== "-"),
};

if (program.flags.includes("--extract")) {
    if (program.files.length != 2) {
        console.error("Error: source file and dest file both needed.");
    }
    filename = path.resolve(program.files[0]);
    dest_filename = path.resolve(program.files[1]);
    if (fs.existsSync(filename) && fs.statSync(filename).isFile()) {
        html = fs.readFileSync(filename, "utf8");
        markdown = wizmarkdown.extract(html);
        fs.writeFileSync(dest_filename, markdown, "utf-8");
    } else {
        console.error(`Error: Cannot find file '${filename}'.`);
    }
} else if (program.flags.includes("--embed")) {

} else if (program.flags.includes("--help")) {
    console.log(`
    Usage: wizmd [option] SOURCE_FILE DEST_FILE
    Options:
      -h, --help                            show help information.
      -v, --version                         show wizmd version.
      -x, --extract SOURCE_FILE DEST_FILE   extract from stdin, a file, or a list of files
      -e, --embed   SOURCE_FILE DEST_FILE   read markdown text from stdin, a file, or a 
                                            list of files, and embed markdown into html.

    Examples:
    $ wizmd -x mynotes.html notes.md  extract markdown from \`mynotes.html\` into \`notes.md\`.
    $ wizmd -e notes.md mynotes.html  embed markdown fron \`notes.md\` in to \`mynotes.html\`.
  `);
} else if (program.flags.includes("--version")
    && program.flags.length === 1 && program.files.length === 0) {
    const package = require("./package.json");
    console.log(package.name, package.version);
}