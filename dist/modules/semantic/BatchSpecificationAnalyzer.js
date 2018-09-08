"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AfterAllSSA_1 = require("./AfterAllSSA");
const BeforeAllSSA_1 = require("./BeforeAllSSA");
const ConstantSSA_1 = require("./ConstantSSA");
const DatabaseSSA_1 = require("./DatabaseSSA");
const FeatureSSA_1 = require("./FeatureSSA");
const ImportSSA_1 = require("./ImportSSA");
const SpecificationAnalyzer_1 = require("./SpecificationAnalyzer");
const TableSSA_1 = require("./TableSSA");
const TestCaseSSA_1 = require("./TestCaseSSA");
const UIElementSSA_1 = require("./UIElementSSA");
/**
 * Executes many semantic analyzers to a specification in batch.
 *
 * @author Thiago Delgado Pinto
 */
class BatchSpecificationAnalyzer extends SpecificationAnalyzer_1.SpecificationAnalyzer {
    constructor() {
        super();
        // Order is relevant!
        this._analyzers = [
            new ImportSSA_1.ImportSSA(),
            new UIElementSSA_1.UIElementSSA(),
            new FeatureSSA_1.FeatureSSA(),
            new ConstantSSA_1.ConstantSSA(),
            new DatabaseSSA_1.DatabaseSSA(),
            new TableSSA_1.TableSSA(),
            new TestCaseSSA_1.TestCaseSSA(),
            new BeforeAllSSA_1.BeforeAllSSA(),
            new AfterAllSSA_1.AfterAllSSA()
        ];
    }
    analyze(graph, spec, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            // Important to guarantee that all documents are mapped
            spec.clearCache();
            spec.mapAllDocuments();
            for (let analyzer of this._analyzers) {
                yield analyzer.analyze(graph, spec, errors);
            }
        });
    }
}
exports.BatchSpecificationAnalyzer = BatchSpecificationAnalyzer;
