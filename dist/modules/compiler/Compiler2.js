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
const ProcessingInfo_1 = require("../app/ProcessingInfo");
const SpecFilter_1 = require("../selection/SpecFilter");
/**
 * Compiler
 *
 * @author Thiago Delgado Pinto
 */
class Compiler {
    constructor(_fileSearcher, _mfp, _specificationAnalyzer) {
        this._fileSearcher = _fileSearcher;
        this._mfp = _mfp;
        this._specificationAnalyzer = _specificationAnalyzer;
    }
    compile(options, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield this._fileSearcher.searchFrom(options);
            listener.compilerStarted(options);
            const spec = yield this._mfp.process(files, options.directory);
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
            if (spec.docs.length > 0) {
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
