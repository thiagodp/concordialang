import { Import } from '../ast/Import';
import { NodeLexer } from '../lexer/NodeLexer';
import { FeatureLexer } from '../lexer/FeatureLexer';
import { ImportLexer } from '../lexer/ImportLexer';
import { Keywords } from '../Keywords';
import { ScenarioLexer } from '../lexer/ScenarioLexer';
import { DocumentProcessor } from '../DocumentProcessor';
import { KeywordDictionary } from '../KeywordDictionary';
import { LocatedException } from '../LocatedException';
import { Document } from "../ast/Document";
import { Feature } from "../ast/Feature";
import { Scenario } from "../ast/Scenario";
import { SyntaticException } from "../SyntaticException";

/**
 * Parsing context
 * 
 * @author Thiago Delgado Pinto
 */
interface ParsingContext {
    inFeature: boolean;
    inScenario: boolean;
    currentScenario?: Scenario;
}

/**
 * Document parser
 * 
 * @author Thiago Delgado Pinto
 */
export class DocumentParser implements DocumentProcessor {

    private _context: ParsingContext;
    private _document: Document;
    private _errors: Array< Error >;
    // Parsers
    private _importParser: ImportLexer;
    private _featureParser: FeatureLexer;
    private _scenarioParser: ScenarioLexer;


    constructor( private _dictionary: KeywordDictionary ) {
        this.reset();
        // Parsers
        this._importParser = new ImportLexer( _dictionary.import );
        this._featureParser = new FeatureLexer( _dictionary.feature );
        this._scenarioParser = new ScenarioLexer( _dictionary.scenario );
    }

    private reset(): void {
        this._context = { inFeature: false, inScenario: false };
        this._document = {};
        this._errors = [];
    }

    /** @inheritDoc */
    public onStart( name?: string ): void {
        this.reset();
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
        return this._document;
    }

    private parseImport( line: string, lineNumber: number ): void {
        let current: Import;
        try {
            current = this._importParser.analyze( line, lineNumber );
            if ( ! current ) {
                return;
            }            
        } catch ( e ) {
            this._errors.push( e );
            return;
        }

        if ( ! this._document.imports ) {
            this._document.imports = [];
        }
        this._document.imports.push( current );
    }

    private parseFeature( line: string, lineNumber: number ): void {
        let current: Feature;
        try {
            current = this._featureParser.analyze( line, lineNumber );
            if ( ! current ) {
                return;
            }            
        } catch ( e ) {
            this._errors.push( e );
            return;
        }

        this._context.inFeature = true;
        this._context.inScenario = false;

        if ( ! this._document.features ) {
            this._document.features = [];
        }
        this._document.features.push( current );
    }

    private parseScenario( line: string, lineNumber: number ): void {
        let current: Scenario;
        try {
            current = this._scenarioParser.analyze( line, lineNumber );
            if ( ! current ) {
                return;
            }            
        } catch ( e ) {
            this._errors.push( e );
            return;
        }
        this._context.inFeature = false;
        this._context.inScenario = true;
        this._context.currentScenario = current;

        // Document does not have any features
        if ( ! this._document.features || 0 === this._document.features.length ) {
            let e = new SyntaticException( 'A scenario must be declared after a feature.',
                current.location );
            this._errors.push( e );
            return;
        }

        // Add the scenario in the last feature (considered the current)
        let currentFeature = this._document.features[ this._document.features.length - 1 ];
        if ( ! currentFeature.scenarios ) {
            currentFeature.scenarios = [];
        }
        currentFeature.scenarios.push( current );
    }    
}