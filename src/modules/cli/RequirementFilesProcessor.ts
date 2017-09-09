import { LocatedException } from '../req/LocatedException';
import { SpecAnalyzer } from '../sa/SpecAnalyzer';
import { SingleDocumentAnalyzer } from '../sa/single/SingleDocumentAnalyzer';
import { FileInfo } from '../ast/FileInfo';
import { InputFileExtractor } from '../util/InputFileExtractor';
import { ProcessingObserver } from './ProcessingObserver';
import { EnglishKeywordDictionary } from '../dict/EnglishKeywordDictionary';
import { Document } from '../ast/Document';
import { Node } from '../ast/Node';
import { LexerProcessor } from '../lexer/LexerProcessor';
import { FileProcessor } from '../req/FileProcessor';
import { DocumentProcessor } from '../req/DocumentProcessor';
import { KeywordDictionaryLoader } from "../dict/KeywordDictionaryLoader";
import { JsonKeywordDictionaryLoader } from "../dict/JsonKeywordDictionaryLoader";
import { Lexer } from "../lexer/Lexer";
import { Parser } from "../parser/Parser";
import { SyncFileProcessor } from "../req/SyncFileProcessor";
import { Spec } from "../ast/Spec";

const path = require( 'path' );

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
    private _singleDocAnalyzer: SingleDocumentAnalyzer = new SingleDocumentAnalyzer();
    private _specAnalyzer: SpecAnalyzer = new SpecAnalyzer();


    constructor( private _write: Function ) {
    }

    public process( files: string[], charset: string = 'utf8', observer?: ProcessingObserver ) {

        let fileProcessor: FileProcessor = new SyncFileProcessor( charset );

        let spec: Spec = {
            docs: []
        };

        // Make documents for each file
        for ( let file of files ) {

            let normalizedFilePath = path.join( file, '' ); // @see https://nodejs.org/api/path.html#path_path_join_paths
            
            let doc: Document = {
                fileErrors: []
            };

            let hadErrors = false;

            let fileInfo: FileInfo = {
                path: normalizedFilePath,
                hash: this._inputFileExtractor.hashOfFile( normalizedFilePath, charset ) // Compute file hash
            };

            // Adds the file info to the document
            doc.fileInfo = fileInfo;            

            // Notify about the start
            if ( observer ) {
                observer.onStarted( fileInfo );
            }        

            // LEXER
            // Process the file with the lexer processor
            fileProcessor.process( normalizedFilePath, this._docProcessor );
            // Get the lexed nodes
            let nodes: Node[] = this._lexer.nodes();
            // Add errors found
            hadErrors = this._lexer.hasErrors();            
            this.addErrorsToDoc( this._lexer.errors(), doc );
            // Resets the lexer state (important!)
            this._lexer.reset();
    
            // PARSER
            // Parses the nodes
            this._parser.analyze( nodes, doc );
            // Add errors found
            hadErrors = hadErrors || this._parser.hasErrors();            
            this.addErrorsToDoc( this._parser.errors(), doc );

            // NODE-BASED SEMANTIC ANALYSIS
            this._singleDocAnalyzer.analyze( doc, doc.fileErrors );
    
            //this._write( doc ); // <<< TEMPORARY

            // TEMPORARY <<< TO-DO: present file errors once
            if ( observer && doc.fileErrors.length > 0 ) {
                observer.onError( fileInfo, doc.fileErrors );
            }

            // Notify about the finish
            if ( observer ) {
                observer.onFinished( fileInfo, ! hadErrors );
            }
            
            // Adds the document to the semantic analysis context
            spec.docs.push( doc );
        }

        // SEMANTIC ANALYSIS
        let semanticErrors: LocatedException[] = [];
        this._specAnalyzer.analyze( spec, semanticErrors );

        // Temporary
        if ( observer && semanticErrors.length > 0 ) {
            observer.onError( { path: '???', hash: '???' }, semanticErrors );
        }        

    }


    private addErrorsToDoc( errors: Error[], doc: Document ) {
        if ( ! doc.fileErrors ) {
            doc.fileErrors = [];
        }
        doc.fileErrors.push.apply( doc.fileErrors, errors );        
    }

}