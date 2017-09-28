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
        new JsonKeywordDictionaryLoader( './data/keywords/', this._dictMap );
    private _lexer: Lexer = new Lexer( 'en', this._dictLoader );
    private _parser: Parser = new Parser();
    private _docProcessor: DocumentProcessor = new LexerProcessor( this._lexer );
    private _inputFileExtractor: InputFileExtractor = new InputFileExtractor();
    private _singleDocAnalyzer: SingleDocumentAnalyzer = new SingleDocumentAnalyzer();
    private _specAnalyzer: SpecAnalyzer = new SpecAnalyzer();


    constructor( private _write: Function ) {
    }

    public process(
        files: string[],
        language: string,
        encoding: string,
        observer?: ProcessingObserver
    ) {
        // Updates the doc processor according to the new language
        if ( this._lexer.defaultLanguage() != language ) {
            this._lexer = new Lexer( language, this._dictLoader );
            this._docProcessor = new LexerProcessor( this._lexer );
        }

        let fileProcessor: FileProcessor = new SyncFileProcessor( encoding );

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
                hash: this._inputFileExtractor.hashOfFile( normalizedFilePath, encoding ) // Compute file hash
            };

            // Adds the file info to the document
            doc.fileInfo = fileInfo;            

            // Notify about the start
            /*
            if ( observer ) {
                observer.onStarted( fileInfo );
            } 
            */       

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
            /*
            if ( observer && doc.fileErrors.length > 0 ) {
                observer.onError( fileInfo, doc.fileErrors );
            }
            */

            // Notify about the finish
            /*
            if ( observer ) {
                observer.onFinished( fileInfo, ! hadErrors );
            }
            */
            
            // Adds the document to the semantic analysis context
            spec.docs.push( doc );
        }

        // SEMANTIC ANALYSIS
        let semanticErrors: LocatedException[] = [];
        this._specAnalyzer.analyze( spec, semanticErrors );

        // Output
        if ( observer ) {
            for ( let doc of spec.docs ) {
                observer.onFileStarted( doc.fileInfo );
                let hadErrors = doc.fileErrors.length > 0;
                if ( hadErrors ) {
                    let sortedErrors: LocatedException[] = this.sortErrorsByLocation( doc.fileErrors );
                    observer.onFileError( doc.fileInfo, sortedErrors );
                }
                observer.onFileFinished( doc.fileInfo, ! hadErrors ); 
            }
        }       

    }

    private addErrorsToDoc( errors: Error[], doc: Document ) {
        if ( ! doc.fileErrors ) {
            doc.fileErrors = [];
        }
        doc.fileErrors.push.apply( doc.fileErrors, errors );        
    }

    private sortErrorsByLocation( errors: LocatedException[] ): LocatedException[] {
        return Array.sort( errors, ( a: LocatedException, b: LocatedException ) => {
            // Compare the line
            let lineDiff: number = a.location.line - b.location.line;
            if ( 0 === lineDiff ) { // Same line, so let's compare the column
                return a.location.column - b.location.column;
            }
            return lineDiff;
        } );
    }

}