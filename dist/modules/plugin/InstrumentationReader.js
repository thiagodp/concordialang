"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default specification instrumentator that works with double-slashed line comments.
 *
 * Keywords used:
 * - spec: references a specification file, e.g. "// spec: path/to/file.feature"
 * - line: references a specification line number, e.g., "// line: 10"
 *
 * @author Thiago Delgado Pinto
 */
class DefaultInstrumentationReader {
    /**
     * Retrieves a path from the pattern "// source: path/to/file.ext".
     *
     * Returns `null` if the line does not match the pattern.
     *
     * @param line
     */
    retrieveSpecFile(line) {
        const regex = /^\/\/(?: )*source(?: )*:(.+)/ui;
        const r = regex.exec(line);
        return (r && r[1]) ? r[1].trim() : null;
    }
    /**
     * Retrieves a line number from the pattern like
     * "anything // (10,2) anything" where 10 is the line number and 2 is
     * the column number.
     *
     * Returns `null` if the line does not match the pattern.
     *
     * @param line
     */
    retrieveSpecLineNumber(line) {
        const regex = /(?:.*)(\/\/(?: )*(?:\()([0-9]+)(?:,[0-9]+\))(?:.*))$/ui;
        const r = regex.exec(line);
        return (r && r[2]) ? parseInt(r[2]) : null;
    }
}
exports.DefaultInstrumentationReader = DefaultInstrumentationReader;
//# sourceMappingURL=InstrumentationReader.js.map