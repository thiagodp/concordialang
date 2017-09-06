import { EnglishKeywordDictionary } from '../req/dict/EnglishKeywordDictionary';
import { Document } from '../req/ast/Document';
import { Node } from '../req/ast/Node';
import { LexerProcessor } from '../req/lexer/LexerProcessor';
import { FileProcessor } from '../req/FileProcessor';
import { DocumentProcessor } from '../req/DocumentProcessor';
import { KeywordDictionaryLoader } from "../req/dict/KeywordDictionaryLoader";
import { JsonKeywordDictionaryLoader } from "../req/dict/JsonKeywordDictionaryLoader";
import { Lexer } from "../req/lexer/Lexer";
import { Parser } from "../req/parser/Parser";

/**
 * Requirement file processor.
 * 
 * @author  Thiago Delgado Pinto
 */
export class RequirementFileProcessor {

    private _dictMap = { 'en': new EnglishKeywordDictionary() };
    private _loader: KeywordDictionaryLoader =
        new JsonKeywordDictionaryLoader( './data', this._dictMap );
    private _lexer: Lexer = new Lexer( 'en', this._loader );
    private _parser: Parser = new Parser();
    private _docProcessor: DocumentProcessor = new LexerProcessor( this._lexer );
    private _fileProcessor = new FileProcessor();

    constructor( private _write: Function ) {
    }

    public process( files: string[] ) {

        let nodes: Node[];
        let doc: Document;
        let errors: Error[];
        for ( let file of files ) {
            this._fileProcessor.process( file, this._docProcessor );
            nodes = this._lexer.nodes();
            this._parser.analyze( nodes );
            errors = this._parser.errors();
            this.printErrors( errors );
        }
    }

    private printErrors( errors: Error[] ) {
        for ( let error of errors ) {
            this._write( error );
        }
    }

}