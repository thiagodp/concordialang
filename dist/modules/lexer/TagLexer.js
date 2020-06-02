"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagSubLexer = exports.TagLexer = void 0;
const XRegExp = require('xregexp');
const NodeTypes_1 = require("../req/NodeTypes");
const Symbols_1 = require("../req/Symbols");
const CommentHandler_1 = require("./CommentHandler");
const LexicalException_1 = require("./LexicalException");
/**
 * Detects a Tag.
 *
 * @author Thiago Delgado Pinto
 */
class TagLexer {
    constructor(_subLexers = []) {
        this._subLexers = _subLexers;
    }
    /** @inheritDoc */
    nodeType() {
        return NodeTypes_1.NodeTypes.TAG;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [
            NodeTypes_1.NodeTypes.TAG,
            NodeTypes_1.NodeTypes.VARIANT,
            NodeTypes_1.NodeTypes.FEATURE,
            NodeTypes_1.NodeTypes.SCENARIO,
            NodeTypes_1.NodeTypes.UI_ELEMENT,
            NodeTypes_1.NodeTypes.UI_PROPERTY
        ];
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let trimmedLine = line.trim();
        if (!trimmedLine.startsWith(Symbols_1.Symbols.TAG_PREFIX)) {
            return null;
        }
        trimmedLine = (new CommentHandler_1.CommentHandler()).removeComment(trimmedLine);
        // Detects all the tags in the line and trims their content
        const SPACE = ' ';
        let tags = (SPACE + trimmedLine).split(SPACE + Symbols_1.Symbols.TAG_PREFIX)
            .map((val) => val.trim())
            .filter((val) => val.length > 0); // only the non empty ones
        return this.analyzeEachTag(tags, line, lineNumber || 0);
    }
    /**
     * Analyzes each tag that was found and returns the analysis result.
     *
     * @param tags Tags to be analyzed.
     * @param line Line where the tags were detected.
     * @param lineNumber Line number.
     */
    analyzeEachTag(tags, line, lineNumber) {
        let regex = XRegExp('^([\\p{L}][\\p{L}0-9_-]*)(\((.*)\))?$', 'ui');
        let errors = [];
        let nodes = [];
        let lastIndex = -1;
        let location;
        for (let tag of tags) {
            lastIndex = line.indexOf(tag);
            location = { line: lineNumber, column: lastIndex };
            let result = regex.exec(tag);
            if (!result || result.length < 4) {
                errors.push(new LexicalException_1.LexicalException('Invalid tag declaration: ' + tag, location));
                continue; // go to the next tag
            }
            let content = result[3];
            if (content) {
                content = content
                    .substr(1, content.length - 2) // remove "(" and ")"
                    .split(Symbols_1.Symbols.TAG_VALUE_SEPARATOR) // separate values by comma
                    .map((s) => s.trim()); // trim values
            }
            let node = {
                nodeType: NodeTypes_1.NodeTypes.TAG,
                location: location,
                name: result[1],
                content: content
            };
            // Try to decide what subtype the tag has.
            // An undefined subtype is valid and it means that the tag is not a reserved tag.
            for (let subLexer of this._subLexers) {
                if (subLexer.containsName(node.name)) {
                    node.subType = subLexer.affectedKeyword();
                }
            }
            nodes.push(node);
        }
        return { nodes: nodes, errors: errors };
    }
}
exports.TagLexer = TagLexer;
/**
 * Allows to compare a tag name against a set of words in order to detect its subtype.
 *
 * @author Thiago Delgado Pinto
 */
class TagSubLexer {
    constructor(_affectedKeyword, _words) {
        this._affectedKeyword = _affectedKeyword;
        this._words = _words;
    }
    /** @inheritDoc */
    affectedKeyword() {
        return this._affectedKeyword;
    }
    /** @inheritDoc */
    updateWords(words) {
        this._words = words.map(w => w.toLowerCase());
    }
    /**
     * Compares if the tag's name is in the set of words.
     *
     * @param name Name to compare
     */
    containsName(name) {
        return this._words.indexOf(name.toLowerCase()) >= 0;
    }
}
exports.TagSubLexer = TagSubLexer;
