
import { Import } from '../ast/Import';
import { NodeParser } from '../parser/NodeParser';
import { FeatureParser } from '../parser/FeatureParser';
import { ImportParser } from '../parser/ImportParser';
import { Keywords } from '../parser/Keywords';
import { ScenarioParser } from '../parser/ScenarioParser';
import { ASTContext } from '../analyzer/ASTContext';
import { DocumentProcessor } from './DocumentProcessor';
import { KeywordDictionary } from './KeywordDictionary';
import { LocatedException } from '../LocatedException';
import { Document } from "../ast/Document";
import { Feature } from "../ast/Feature";
import { Scenario } from "../ast/Scenario";
import { SemanticException } from "../analyzer/SemanticException";


export class DocumentCompiler implements DocumentProcessor {

    private _context: ASTContext;
    private _errors: Array< Error >;

    private _importParser: ImportParser;
    private _featureParser: FeatureParser;
    private _scenarioParser: ScenarioParser;    

    constructor( private _dictionary: KeywordDictionary ) {
        this.reset();
        this._importParser = new ImportParser( _dictionary.import );
        this._featureParser = new FeatureParser( _dictionary.feature );
        this._scenarioParser = new ScenarioParser( _dictionary.scenario );
    }

    private reset(): void {
        this._context = { inFeature: false, inScenario: false };
        this._errors = [];
    }

    /** @inheritDoc */
    public onStart(): void {
        // ?
    }

    /** @inheritDoc */
    public onError( message: string ): void {
        this._errors.push( new Error( message ) );
    }

    /** @inheritDoc */
    public onLineRead( line: string, lineNumber: number ): void {

        if ( 0 === line.trim().length ) { // Ignore empty lines
            return;
        }

        if ( ! this._context.document ) {
            this._context.document = {};
        }

        this.parseImport( line, lineNumber );
        this.parseFeature( line, lineNumber );
        this.parseScenario( line, lineNumber );
    }

    /** @inheritDoc */
    public onFinish(): void {
        // ?
    }

    /** @inheritDoc */
    public errors(): Array< Error > {
        return this._errors;
    }

    /** @inheritDoc */
    public result(): Document {
        return this._context.document;
    }

    private parseImport( line: string, lineNumber: number ): void {
        let imp: Import;
        try {
            imp = this._importParser.parse( line, lineNumber );
            if ( ! imp ) {
                return;
            }            
        } catch ( e ) {
            this._errors.push( e );
            return;
        }

        if ( ! this._context.document.imports ) {
            this._context.document.imports = [];
        }

        // Detect repeated imports
        if ( this._context.document.imports.includes( imp.content ) ) {
            let err =  new SemanticException( 'Repeated import for file "' + imp.content + '".',
                { column: imp.location.column, line: lineNumber } );
            this._errors.push( err );
            return;
        }

        this._context.document.imports.push( imp.content );
    }

    private parseFeature( line: string, lineNumber: number ): void {
        let feature: Feature;
        try {
            feature = this._featureParser.parse( line, lineNumber );
            if ( ! feature ) {
                return;
            }            
        } catch ( e ) {
            this._errors.push( e );
            return;
        }

        // Just one feature per file
        if ( this._context.document.feature ) {
            let err =  new SemanticException( 'Each file must have just one feature.',
                { column: feature.location.column, line: lineNumber } );
            this._errors.push( err );
            return;
        }

        this._context.inFeature = true;
        this._context.inScenario = false;

        this._context.document.feature = feature;
        this._context.document.feature.scenarios = [];
    }

    private parseScenario( line: string, lineNumber: number ): void {
        let scenario: Scenario;
        try {
            scenario = this._scenarioParser.parse( line, lineNumber );
            if ( ! scenario ) {
                return;
            }            
        } catch ( e ) {
            this._errors.push( e );
            return;
        }

        // Do not have a feature
        if ( ! this._context.document.feature ) {
            let err =  new SemanticException( 'A scenario must be declared after a feature.',
                { column: scenario.location.column, line: lineNumber } );
            this._errors.push( err );
            return;
        }

        this._context.inFeature = false;
        this._context.inScenario = true;

        this._context.currentScenario = scenario;
        this._context.document.feature.scenarios.push( scenario );
    }    
}