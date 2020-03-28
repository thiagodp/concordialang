"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const SemanticException_1 = require("./SemanticException");
const SpecificationAnalyzer_1 = require("./SpecificationAnalyzer");
/**
 * Executes semantic analysis of Imports in a specification.
 *
 * Checkings:
 * - cyclic references
 *
 * @author Thiago Delgado Pinto
 */
class ImportSSA extends SpecificationAnalyzer_1.SpecificationAnalyzer {
    /** @inheritDoc */
    analyze(graph, spec, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            this.findCyclicReferences(graph, spec, errors);
        });
    }
    findCyclicReferences(graph, spec, errors) {
        // Let's find cyclic references and report them as errors
        for (let it = graph.cycles(), kv; !(kv = it.next()).done;) {
            let cycle = kv.value;
            let filePath = cycle[0]; // first file
            let fullCycle = cycle.join('" => "') + '" => "' + filePath;
            let doc = graph.vertexValue(filePath); // cycle is a key (that is the file path)
            let loc = { line: 1, column: 1 };
            if (doc) {
                // The second file is the imported one, so let's find its location.
                loc = this.locationOfTheImport(doc, cycle[1]);
            }
            // Prepare the error
            let msg = 'Cyclic reference: "' + fullCycle + '".';
            let err = new SemanticException_1.SemanticException(msg, loc);
            // Add the error to the detected errors
            errors.push(err);
            // Let's add the error to the document
            if (doc) {
                if (!doc.fileErrors) {
                    doc.fileErrors = [];
                }
                doc.fileErrors.push(err);
            }
            else {
                // This should not happen, since all the imported files are checked before,
                // by the "import single document analyzer" (class ImportSDA).
                // So let's represent this as an error, instead of just ignoring it.
                let docError = new SemanticException_1.SemanticException('Imported file "' + filePath + '" should have a document.', { line: 1, column: 1 });
                errors.push(docError);
            }
        }
    }
    locationOfTheImport(doc, importFile) {
        if (doc.imports) {
            let fileName = path_1.basename(importFile); // name without dir
            for (let imp of doc.imports) {
                let currentFileName = path_1.basename(imp.value); // filename without dir
                if (fileName == currentFileName) {
                    return imp.location;
                }
            }
        }
        return { line: 1, column: 1 }; // import not found, so let's return the first position in the file
    }
}
exports.ImportSSA = ImportSSA;
