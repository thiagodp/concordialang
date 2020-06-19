"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexerProcessor = void 0;
/**
 * Lexer processor
 *
 * @author Thiago Delgado Pinto
 */
class LexerProcessor {
    constructor(_lexer) {
        this._lexer = _lexer;
    }
    /** @inheritDoc */
    onStart(name) {
        this._lexer.reset();
    }
    /** @inheritDoc */
    onError(message) {
        this._lexer.addErrorMessage(message);
    }
    /** @inheritDoc */
    onLineRead(line, lineNumber) {
        this._lexer.addNodeFromLine(line, lineNumber);
    }
    /** @inheritDoc */
    onFinish() {
        // ?
    }
}
exports.LexerProcessor = LexerProcessor;
