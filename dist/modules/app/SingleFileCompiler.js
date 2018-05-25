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
const SingleFileProcessor_1 = require("./SingleFileProcessor");
const SingleDocumentProcessor_1 = require("./SingleDocumentProcessor");
class SingleFileCompiler {
    constructor(_lexer, _parser, _nlpRec, _defaultLanguage, _ignoreSemanticAnalysis = false) {
        this._lexer = _lexer;
        this._parser = _parser;
        this._nlpRec = _nlpRec;
        this._defaultLanguage = _defaultLanguage;
        this._ignoreSemanticAnalysis = _ignoreSemanticAnalysis;
    }
    /**
     * MUST NEVER THROW
     *
     * @param data
     * @param lineBreaker Characters used to separate lines. Defaults to `\n`.
     */
    process(data, lineBreaker = "\n") {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                /*
                const startTime = Date.now();
                let errors: Error[] = [];
                let warnings: Error[] = [];
    
                // simulate with a timer
                let time = Math.random() * 10000;
    
                setTimeout( ( ) => {
                    const durationMs = Date.now() - startTime;
                    resolve( new ProcessedFileData( data.meta, {}, durationMs, errors, warnings ) );
                }, time );
                */
                const startTime = Date.now();
                const lines = data.content.split(lineBreaker);
                lines.map((line, index) => this._lexer.addNodeFromLine(line, index + 1));
                let doc = {
                    fileErrors: [],
                    fileWarnings: [],
                    fileInfo: { hash: data.meta.hash, path: data.meta.fullPath }
                    //, meta: data.meta
                };
                // console.log( 'NEW', doc.fileInfo.path );
                let sdp = new SingleDocumentProcessor_1.SingleDocumentProcessor();
                sdp.analyzeNodes(doc, this._lexer, this._parser, this._nlpRec, this._defaultLanguage, this._ignoreSemanticAnalysis);
                const durationMs = Date.now() - startTime;
                let processedData = new SingleFileProcessor_1.ProcessedFileData(data.meta, doc, durationMs, doc.fileErrors, doc.fileWarnings);
                resolve(processedData);
            });
        });
    }
}
exports.SingleFileCompiler = SingleFileCompiler;
