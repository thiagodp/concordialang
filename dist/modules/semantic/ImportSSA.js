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
exports.ImportSSA = void 0;
const path_1 = require("path");
const error_1 = require("../error");
const SpecificationAnalyzer_1 = require("./SpecificationAnalyzer");
/**
 * Executes semantic analysis of Imports in a specification.
 *
 * It checks for:
 * - cyclic references
 *
 * @author Thiago Delgado Pinto
 */
class ImportSSA extends SpecificationAnalyzer_1.SpecificationAnalyzer {
    /** @inheritDoc */
    analyze(problems, spec, graph) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findCyclicReferences(problems, graph);
        });
    }
    findCyclicReferences(problems, graph) {
        let hasError = false;
        // Let's find cyclic references and report them as errors
        for (let it = graph.cycles(), kv; !(kv = it.next()).done;) {
            hasError = true;
            const cycle = kv.value;
            const filePath = cycle[0]; // first file
            const fullCycle = cycle.join('" => "') + '" => "' + filePath;
            const doc = graph.vertexValue(filePath); // cycle is a key (that is the file path)
            let loc = { line: 1, column: 1 };
            if (doc) {
                // The second file is the imported one, so let's find its location.
                loc = this.locationOfTheImport(doc, cycle[1]);
            }
            const msg = 'Cyclic reference: "' + fullCycle + '".';
            const err = new error_1.SemanticException(msg, loc);
            problems.addError(filePath, err);
        }
        return hasError;
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
