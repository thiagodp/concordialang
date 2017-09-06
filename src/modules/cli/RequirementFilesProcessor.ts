import { Finishable } from '../req/Finishable';
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
import { SyncFileProcessor } from "../req/SyncFileProcessor";

/**
 * Requirement files processor.
 * 
 * @author  Thiago Delgado Pinto
 */
export class RequirementFilesProcessor {

    private _dictMap = { 'en': new EnglishKeywordDictionary() };
    private _loader: KeywordDictionaryLoader =
        new JsonKeywordDictionaryLoader( './data/', this._dictMap );
    private _lexer: Lexer = new Lexer( 'en', this._loader );
    private _parser: Parser = new Parser();
    private _docProcessor: DocumentProcessor = new LexerProcessor( this._lexer );
    private _fileProcessor: FileProcessor;

    constructor( private _write: Function, private _encoding = 'utf8' ) {
        this._fileProcessor = new SyncFileProcessor( _encoding );
    }

    public process( files: string[] ) {

        let nodes: Node[] = [];
        let doc: Document = {};

        for ( let file of files ) {

            // Process the file with the lexer processor
            this._fileProcessor.process( file, this._docProcessor );
            // Get the lexed nodes
            nodes = this._lexer.nodes();
            this.printErrors( this._lexer.errors() );
            this._lexer.reset(); // important
    
            // Parses the nodes
            doc = this._parser.analyze( nodes ) || {};
            doc.file = file; // adds the current file

            this.printErrors( this._parser.errors() );
    
            this._write( doc ); // <<< TEMPORARY
        }
    }

    private printErrors( errors: Error[] ) {
        for ( let error of errors ) {
            this._write( error.message );
        }
    }

}