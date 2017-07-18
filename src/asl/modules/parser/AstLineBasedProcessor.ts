
import { LineBasedProcessor } from "./LineBasedProcessor";
import { AstContext } from "./AstContext";
import { TokenTypes } from "../extractor/TokenTypes";
import { EmptyTokenDetector } from "../extractor/EmptyTokenDetector";
import { DictionaryBasedTokenDetector } from "../extractor/DictionaryBasedTokenDetector";
import { TokenDetector } from "../extractor/TokenDetector";

export class AstLineBasedProcessor implements LineBasedProcessor {

    private _detectors: {}; // not resettable
    private _extractors: {}; // not resettable

    private _context: AstContext;
    private _errors: Array< Error >;
    private _document: Document = null;

    constructor( private _dictionary ) {
        this.reset();
        this.createDetectors( _dictionary );
    }

    private reset(): void {
        this._context = { inFeature: false, inScenario: false };
        this._errors = [];
        this._document = null;
    }
    
    private createDetectors( dictionary ): void {
        this._detectors[ TokenTypes.EMPTY ] = new EmptyTokenDetector();
        // Create dictionary-based token detectors
        let available = TokenTypes.variableTypes();
        for ( let i in available ) {
            let tokenType = available[ i ];
            this._detectors[ tokenType ] = 
                new DictionaryBasedTokenDetector( tokenType, dictionary[ tokenType ] );
        }        
    }

    private detectorForTokenType( tokenType: string ): TokenDetector {
        let obj = this._detectors[ tokenType ];
        return obj || new EmptyTokenDetector();
    }

    private extractorForTokenType( tokenType: string ): NodeExtractor {
        let obj = this._extractors[ tokenType ];
        return obj || new Node();
    }      

    /** @inheritDoc */
    public onRead( line: string, lineNumber: number ): void {

        // Ignore empty tokens (lines)
        if ( this.detectorForTokenType( TokenTypes.EMPTY ).isInTheLine( line ) ) {
            return;
        }

        if ( this.detectorForTokenType( TokenTypes.FEATURE ).isInTheLine( line ) ) {
            this._context.inFeature = true;
            this._context.inScenario = false;

            this._context.currentFeature = this.extractorForTokenType( TokenTypes.FEATURE )
                .extract( line );
        }
    }

    /** @inheritDoc */
    public onError( message: string ): void {
        this._errors.push( new Error( message ) );
    }

    /** @inheritDoc */
    public onFinish(): void {
        throw new Error("Method not implemented.");
    }

    /** @inheritDoc */
    public errors(): Array< Error > {
        return this._errors;
    }

    /** @inheritDoc */
    public result(): Document {
        return this._document;
    }
}