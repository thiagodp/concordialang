import { Options } from "../app/Options";
import { LanguageContentLoader, JsonLanguageContentLoader } from "../dict/LanguageContentLoader";
import { LexerBuilder } from "../lexer/LexerBuilder";
import { Lexer } from "../lexer/Lexer";
import { Parser } from "../parser/Parser";
import { Document } from '../ast/Document';
import { NLPTrainer } from "../nlp/NLPTrainer";
import { NLPBasedSentenceRecognizer } from "../nlp/NLPBasedSentenceRecognizer";
import { SingleDocumentProcessor } from "../app/SingleDocumentProcessor";
import { Spec } from "../ast/Spec";
import { resolve } from 'path';
import { FileInfo } from "../ast/FileInfo";

/**
 * Useful for testing purposes.
 */
export class SimpleCompiler {

    constructor( public language = 'pt' ) {
    }

    options: Options = new Options( resolve( process.cwd(), 'dist/' ) );

    langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( this.options.languageDir, {}, this.options.encoding );

    lexer: Lexer = ( new LexerBuilder( this.langLoader ) ).build( this.options, this.language );

    parser = new Parser();

    nlpTrainer = new NLPTrainer( this.langLoader );
    nlpRec: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( this.nlpTrainer );

    singleDocProcessor: SingleDocumentProcessor = new SingleDocumentProcessor();

    addToSpec( spec: Spec, lines: string[], fileInfo?: FileInfo ): Document {
        lines.forEach( ( val, index ) => this.lexer.addNodeFromLine( val, index + 1 ) );
        let doc: Document = {} as Document;
        doc.fileInfo = fileInfo;
        this.singleDocProcessor.analyzeNodes( doc, this.lexer, this.parser, this.nlpRec, this.language );
        spec.docs.push( doc );
        return doc;
    }

}