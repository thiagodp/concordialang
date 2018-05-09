"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LexicalException_1 = require("../req/LexicalException");
const NodeTypes_1 = require("../req/NodeTypes");
const Symbols_1 = require("../req/Symbols");
const LineChecker_1 = require("../req/LineChecker");
const XRegExp = require('xregexp');
/**
 * Detects a Tag.
 *
 * @author Thiago Delgado Pinto
 */
class TagLexer {
    constructor() {
        this._lineChecker = new LineChecker_1.LineChecker();
    }
    /** @inheritDoc */
    nodeType() {
        return NodeTypes_1.NodeTypes.TAG;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TAG, NodeTypes_1.NodeTypes.VARIANT, NodeTypes_1.NodeTypes.FEATURE, NodeTypes_1.NodeTypes.SCENARIO];
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let trimmedLine = line.trim();
        if (!trimmedLine.startsWith(Symbols_1.Symbols.TAG_PREFIX)) {
            return null;
        }
        // Ignores a comment
        let commentPos = line.indexOf(Symbols_1.Symbols.COMMENT_PREFIX);
        if (commentPos >= 0) {
            trimmedLine = line.substring(0, commentPos).trim();
        }
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
            nodes.push(node);
        }
        return { nodes: nodes, errors: errors };
    }
}
exports.TagLexer = TagLexer;
//# sourceMappingURL=TagLexer.js.map