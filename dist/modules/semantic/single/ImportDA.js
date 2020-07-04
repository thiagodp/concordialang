"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportDA = void 0;
const fs = require("fs");
const path_1 = require("path");
const DuplicationChecker_1 = require("../../util/DuplicationChecker");
const SemanticException_1 = require("../SemanticException");
/**
 * Import analyzer for a single document.
 *
 * Checkings:
 *  - Duplicated imports
 *  - Self references
 *  - Files existence
 *
 * @author Thiago Delgado Pinto
 */
class ImportDA {
    constructor(_fs = fs) {
        this._fs = _fs;
    }
    /** @inheritDoc */
    analyze(doc, errors) {
        // Checking the document
        if (!doc.imports) {
            doc.imports = [];
            return;
        }
        // Check duplicated imports
        let duplicated = (new DuplicationChecker_1.DuplicationChecker())
            .withDuplicatedProperty(doc.imports, 'content');
        for (let dup of duplicated) {
            let msg = 'Duplicated imported to file "' + dup.value + '".';
            let err = new SemanticException_1.SemanticException(msg, dup.location);
            errors.push(err);
        }
        for (let imp of doc.imports) {
            let importPath = imp.value;
            let resolvedPath = path_1.join(path_1.dirname(doc.fileInfo.path), importPath);
            // Add the resolved path to the import
            imp.resolvedPath = resolvedPath;
            // Check for a self reference
            if (doc.fileInfo.path === resolvedPath) {
                let msg = 'Imported file is a self reference: "' + importPath + '".';
                let err = new SemanticException_1.SemanticException(msg, imp.location);
                errors.push(err);
            }
            // Check if the imported file exist
            const exists = this._fs.existsSync(resolvedPath);
            if (!exists) {
                let msg = 'Imported file not found: "' + importPath + '".';
                let err = new SemanticException_1.SemanticException(msg, imp.location);
                errors.push(err);
            }
        }
    }
}
exports.ImportDA = ImportDA;
