import { Options } from "../modules/app/Options";
import { LanguageContentLoader, JsonLanguageContentLoader } from "../modules/dict/LanguageContentLoader";
import { LexerBuilder } from "../modules/lexer/LexerBuilder";
import { Lexer } from "../modules/lexer/Lexer";
import { Parser } from "../modules/parser/Parser";
import { Document } from '../modules/ast/Document';
import { NLPTrainer } from "../modules/nlp/NLPTrainer";
import { NLPBasedSentenceRecognizer } from "../modules/nlp/NLPBasedSentenceRecognizer";
import { SingleDocumentProcessor } from "../modules/app/SingleDocumentProcessor";
import { Spec } from "../modules/ast/Spec";
import { resolve } from 'path';


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

    addToSpec( spec: Spec, lines: string[] ): Document {
        lines.forEach( ( val, index ) => this.lexer.addNodeFromLine( val, index + 1 ) );
        let doc: Document = {} as Document;
        this.singleDocProcessor.analyzeNodes( doc, this.lexer, this.parser, this.nlpRec, this.language );
        spec.docs.push( doc );
        return doc;
    }

}