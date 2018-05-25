"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Symbols_1 = require("../req/Symbols");
/**
 * Command handler
 *
 * @author Thiago Delgado Pinto
 */
class CommentHandler {
    removeComment(content, ignoreTrim = false) {
        let commentPos = content.lastIndexOf(Symbols_1.Symbols.COMMENT_PREFIX);
        if (commentPos >= 0) {
            // If the preceding character is `<`, it is not a comment
            if (commentPos > 1) {
                const ignorePredecessors = [Symbols_1.Symbols.UI_LITERAL_PREFIX];
                let predecessor = content.substr(commentPos - 1, 1);
                if (ignorePredecessors.indexOf(predecessor) >= 0) {
                    return !ignoreTrim ? content.trim() : content;
                }
            }
            // If the last character is `"` or `>`, assumes that it is not a comment
            const lastOnes = [Symbols_1.Symbols.UI_LITERAL_SUFFIX, Symbols_1.Symbols.VALUE_WRAPPER];
            const trimmedContent = content.trim();
            const lastChar = trimmedContent.substr(trimmedContent.length - 1);
            if (lastOnes.indexOf(lastChar) >= 0) {
                return !ignoreTrim ? content.trim() : content;
            }
            // Well, it is a comment
            return content.substring(0, commentPos).trim();
        }
        return !ignoreTrim ? content.trim() : content;
    }
}
exports.CommentHandler = CommentHandler;
