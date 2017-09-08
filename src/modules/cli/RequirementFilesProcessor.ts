import { SemanticAnalysisContext } from '../sa/SemanticAnalysisContext';
import { NodeBasedSemanticAnalyzer } from '../sa/node/NodeBasedSemanticAnalyzer';
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
    private _nodeBasedSemanticAnalyzer: NodeBasedSemanticAnalyzer = new NodeBasedSemanticAnalyzer();


    constructor( private _write: Function ) {
    }

    public process( files: string[], charset: string = 'utf8', observer?: ProcessingObserver ) {

        let fileProcessor: FileProcessor = new SyncFileProcessor( charset );

        let saContext: SemanticAnalysisContext = {
            docs: []
        };

        // Make documents for each file
        for ( let file of files ) {
            
            let doc: Document = {
                fileErrors: []
            };

            let hadErrors = false;

            let fileInfo: FileInfo = {
                path: file,
                hash: this._inputFileExtractor.hashOfFile( file, charset ) // Compute file hash
            };

            // Adds the file info to the document
            doc.fileInfo = fileInfo;            

            // Notify about the start
            if ( observer ) {
                observer.onStarted( fileInfo );
            }        

            // LEXER
            // Process the file with the lexer processor
            fileProcessor.process( file, this._docProcessor );
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
            this._nodeBasedSemanticAnalyzer.analyze( doc, doc.fileErrors );
    
            //this._write( doc ); // <<< TEMPORARY

            // Temporary
            if ( observer && doc.fileErrors.length > 0 ) {
                observer.onError( fileInfo, doc.fileErrors );
            }

            // Notify about the finish
            if ( observer ) {
                observer.onFinished( fileInfo, ! hadErrors );
            }
            
            // Adds the document to the semantic analysis context
            saContext.docs.push( doc );
        }

        // SEMANTIC ANALYSIS
        // to-do

    }


    private addErrorsToDoc( errors: Error[], doc: Document ) {
        if ( ! doc.fileErrors ) {
            doc.fileErrors = [];
        }
        doc.fileErrors.push.apply( doc.fileErrors, errors );        
    }

}