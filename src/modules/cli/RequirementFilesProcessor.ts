import { FileInfo } from '../req/ast/FileInfo';
import { InputFileExtractor } from '../util/InputFileExtractor';
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
    private _dictLoader: KeywordDictionaryLoader =
        new JsonKeywordDictionaryLoader( './data/', this._dictMap );
    private _lexer: Lexer = new Lexer( 'en', this._dictLoader );
    private _parser: Parser = new Parser();
    private _docProcessor: DocumentProcessor = new LexerProcessor( this._lexer );
    private _inputFileExtractor: InputFileExtractor = new InputFileExtractor();

    constructor( private _write: Function ) {
    }

    public process( files: string[], charset: string = 'utf8', observer?: ProcessingObserver ) {

        let fileProcessor: FileProcessor = new SyncFileProcessor( charset );

        for ( let file of files ) {
            
            let hadErrors = false;

            let fileInfo: FileInfo = {
                path: file,
                hash: this._inputFileExtractor.hashOfFile( file, charset ) // Compute file hash
            };

            // Notify about the start
            if ( observer ) {
                observer.onStarted( fileInfo );
            }        

            // LEXER
            // Process the file with the lexer processor
            fileProcessor.process( file, this._docProcessor );
            // Get the lexed nodes
            let nodes: Node[] = this._lexer.nodes();
            // Notify about lexing errors
            if ( observer && this._lexer.hasErrors() ) {
                hadErrors = true;
                observer.onError( fileInfo, this._lexer.errors() );
            }
            // Resets the lexer state (important!)
            this._lexer.reset();
    
            // PARSER
            // Parses the nodes
            let doc: Document = {};
            doc.fileInfo = fileInfo;
            this._parser.analyze( nodes, doc );            
            // Notify about parsing errors
            if ( observer && this._parser.hasErrors() ) {
                hadErrors = true;
                observer.onError( fileInfo, this._parser.errors() );
            }            
    
            //this._write( doc ); // <<< TEMPORARY

            // Notify about the finish
            if ( observer ) {
                observer.onFinished( fileInfo, ! hadErrors );
            }            
        }
    }

}