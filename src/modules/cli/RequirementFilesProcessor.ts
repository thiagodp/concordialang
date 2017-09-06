import { ProcessingObserver } from './ProcessingObserver';
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

    public process( files: string[], observer?: ProcessingObserver ) {

        let nodes: Node[] = [];
        let errors: Error[]= [];
        let doc: Document = {};
        let hadErrors: boolean;

        for ( let file of files ) {
            
            hadErrors = false;
            if ( observer ) {
                observer.onStarted( file );
            }

            // Process the file with the lexer processor
            this._fileProcessor.process( file, this._docProcessor );
            // Get the lexed nodes
            nodes = this._lexer.nodes();
            errors = this._lexer.errors();
            if ( observer && errors.length > 0 ) {
                hadErrors = true;
                observer.onError( file, errors );
            }
            this._lexer.reset(); // important
    
            // Parses the nodes
            doc = this._parser.analyze( nodes ) || {};
            doc.file = file; // adds the current file
            errors = this._parser.errors();
            if ( observer && errors.length > 0 ) {
                hadErrors = true;
                observer.onError( file, errors );
            }            
    
            //this._write( doc ); // <<< TEMPORARY

            if ( observer ) {
                observer.onFinished( file, ! hadErrors );
            }            
        }
    }

}