import { Document } from "../ast/Document";
import { Lexer } from "../lexer/Lexer";
import { Parser } from "../parser/Parser";
import { NLPBasedSentenceRecognizer } from "../nlp/NLPBasedSentenceRecognizer";
import { SingleFileProcessor, FileData, ProcessedFileData } from "./SingleFileProcessor";
import { SingleDocumentProcessor } from "./SingleDocumentProcessor";

export class SingleFileCompiler implements SingleFileProcessor {

    constructor(
        private _lexer: Lexer,
        private _parser: Parser,
        private _nlpRec: NLPBasedSentenceRecognizer,
        private _defaultLanguage: string,
        private _ignoreSemanticAnalysis: boolean = false
    ) {
    }

    /**
     * MUST NEVER THROW
     *
     * @param data
     * @param lineBreaker Characters used to separate lines. Defaults to `\n`.
     */
    public async process(
        data: FileData,
        lineBreaker: string = "\n"
    ): Promise< ProcessedFileData > {

        return new Promise< ProcessedFileData >( ( resolve, reject ) => {

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

            const lines: string[] = data.content.split( lineBreaker );
            lines.forEach( ( line, index ) => this._lexer.addNodeFromLine( line, index + 1 ) );

            let doc: Document = {
                fileErrors: [],
                fileWarnings: [],
                fileInfo: { hash: data.meta.hash, path: data.meta.fullPath }
                //, meta: data.meta
            };
            // console.log( 'NEW', doc.fileInfo.path );

            let sdp = new SingleDocumentProcessor();
            sdp.analyzeNodes(
                doc,
                this._lexer,
                this._parser,
                this._nlpRec,
                this._defaultLanguage,
                this._ignoreSemanticAnalysis
            );

            const durationMs = Date.now() - startTime;

            let processedData = new ProcessedFileData(
                data.meta,
                doc,
                durationMs,
                doc.fileErrors,
                doc.fileWarnings
            );

            resolve( processedData );
        } );

    }

}