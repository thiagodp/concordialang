import * as fs from 'fs';
import { resolve } from 'path';
import { Options } from "../app/Options";
import { SingleDocumentProcessor } from "../app/SingleDocumentProcessor";
import { Document, FileInfo } from "../ast";
import { JsonLanguageContentLoader, LanguageContentLoader } from "../dict";
import { EnglishKeywordDictionary } from "../dict/EnglishKeywordDictionary";
import { Lexer } from "../lexer/Lexer";
import { NLPBasedSentenceRecognizer } from "../nlp/NLPBasedSentenceRecognizer";
import { NLPTrainer } from "../nlp/NLPTrainer";
import { Parser } from "../parser/Parser";
import { AugmentedSpec } from "../req/AugmentedSpec";
import { FSFileHandler } from "./file/FSFileHandler";

/**
 * Useful for testing purposes.
 */
export class SimpleCompiler {

    constructor( public language = 'pt' ) {
    }

    options: Options = new Options( resolve( process.cwd(), 'dist/' ) );

    fileHandler = new FSFileHandler( fs, this.options.encoding );

    langLoader: LanguageContentLoader = new JsonLanguageContentLoader(
        this.options.languageDir,
        {},
        this.fileHandler,
        this.fileHandler
        );

    lexer: Lexer = new Lexer( this.language, this.langLoader );

    parser = new Parser();

    nlpTrainer = new NLPTrainer( this.langLoader );
    nlpRec: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( this.nlpTrainer );

    singleDocProcessor: SingleDocumentProcessor = new SingleDocumentProcessor();

    addToSpec( spec: AugmentedSpec, lines: string[], fileInfo?: FileInfo ): Document {
        lines.forEach( ( val, index ) => this.lexer.addNodeFromLine( val, index + 1 ) );
        let doc: Document = {} as Document;
        doc.fileInfo = fileInfo || ( {} as FileInfo );

        let language = this.language;
        if ( doc.language ) {
            language = doc.language.value;
        }

        this.singleDocProcessor.analyzeNodes( doc, this.lexer, this.parser, this.nlpRec, language );
        spec.addDocument( doc );
        return doc;
    }

}