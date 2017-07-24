import { ASTNodeExtractor, TokenDetection } from '../extractor/ASTNodeExtractor';
import { FeatureExtractor } from '../extractor/FeatureExtractor';
import { ScenarioExtractor } from '../extractor/ScenarioExtractor';
import { Keywords } from '../extractor/Keywords';
import { ASTContext } from './ASTContext';
import { KeywordDictionary } from './KeywordDictionary';
import { DocumentProcessor } from './DocumentProcessor';
import { LocatedException } from './LocatedException';
import { Document } from "../ast/Document";


export class DocumentParser implements DocumentProcessor {

    private _context: ASTContext;
    private _errors: Array< Error >;

    private _featureExtractor: FeatureExtractor;
    private _scenarioExtractor: ScenarioExtractor;

    constructor( private _dictionary: KeywordDictionary ) {
        this.reset();
        this._featureExtractor = new FeatureExtractor( _dictionary.feature );
        this._scenarioExtractor = new ScenarioExtractor( _dictionary.scenario );
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

        let detection: TokenDetection;

        // Feature
        let feature;
        try {
            feature = this._featureExtractor.extract( line, lineNumber );
        } catch ( e ) {
            this._errors.push( e );
        }

        if ( feature ) {

            // Just one feature per file
            if ( this._context.document.feature ) {
                let err =  new LocatedException( 'Each file must have just one feature.',
                    { column: detection.position, line: lineNumber } );
                this._errors.push( err );
                return;
            }

            this._context.inFeature = true;
            this._context.inScenario = false;

            this._context.document.feature = feature;
            this._context.document.feature.scenarios = [];
        }

        // Scenario
        let scenario;
        try {
            scenario = this._scenarioExtractor.extract( line, lineNumber );
        } catch ( e ) {
            this._errors.push( e );
        }        
        if ( scenario ) {

            // Do not have a feature
            if ( ! this._context.document.feature ) {
                let err =  new LocatedException( 'A scenario must be declared after a feature.',
                    { column: detection.position, line: lineNumber } );
                this._errors.push( err );
                return;
            }

            this._context.inFeature = false;
            this._context.inScenario = true;

            this._context.currentScenario = scenario;
            this._context.document.feature.scenarios.push( scenario );
        }

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
}