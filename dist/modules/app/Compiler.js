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
const AugmentedSpec_1 = require("../ast/AugmentedSpec");
const SpecFilter_1 = require("../selection/SpecFilter");
const ProcessingInfo_1 = require("./ProcessingInfo");
/**
 * Compiler
 *
 * @author Thiago Delgado Pinto
 */
class Compiler {
    constructor(_mfp, _specificationAnalyzer) {
        this._mfp = _mfp;
        this._specificationAnalyzer = _specificationAnalyzer;
        this.compile = (options, listener) => __awaiter(this, void 0, void 0, function* () {
            listener.compilerStarted(options);
            // const startTime: number = Date.now();
            const r = yield this._mfp.process(options);
            const compiledFilesCount = r.compiledFiles.length;
            // Create the specification
            let spec = new AugmentedSpec_1.AugmentedSpec(options.directory);
            // Add the documents
            for (let file of r.compiledFiles) {
                let doc = file.content;
                spec.docs.push(doc);
            }
            // Then filter the specification
            const specFilter = new SpecFilter_1.SpecFilter(spec);
            // if ( options.hasAnySpecificationFilter() ) {
            //     specFilter.on( )
            //     if ( options.hasFeatureFilter() ) {
            //         // ...
            //     }
            //     if ( options.hasScenarioFilter() ) {
            //         // ...
            //     }
            //     if ( options.hasTagFilter() ) {
            //         // ...
            //     }
            // }
            let graph = specFilter.graph();
            if (compiledFilesCount > 0) {
                listener.semanticAnalysisStarted();
                // Perform semantic analysis
                const semanticAnalysisStartTime = Date.now();
                let semanticErrors = [];
                yield this._specificationAnalyzer.analyze(graph, spec, semanticErrors);
                const durationMs = Date.now() - semanticAnalysisStartTime;
                listener.semanticAnalysisFinished(new ProcessingInfo_1.ProcessingInfo(durationMs, semanticErrors, []));
            }
            // Perform logic analysis
            // TO-DO
            // Announce it finished
            // const durationMs = Date.now() - startTime;
            // listener.compilerFinished( durationMs );
            return [spec, graph];
        });
    }
}
exports.Compiler = Compiler;
