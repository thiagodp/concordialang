import { LineChecker } from './LineChecker';
import { TokenDetector } from './TokenDetector';

/**
 * Detects tokens based on a dictionary.
 */
export class DictionaryBasedTokenDetector implements TokenDetector {

    protected _lineChecker: LineChecker = new LineChecker();

    /**
     * 
     * @param _tokenType Token type.
     * @param _words Array of words.
     */
    constructor( private _tokenType: string, private _words: Array< string > ) {
    }

    /** @inheritDoc */
    isInTheLine( line: string ): boolean {
        for ( let i in this._words ) {
            if ( this._lineChecker.startsWith( this._words[ i ], line ) ) {
                return true;
            }
        }
        return false;
    }

    /** @inheritDoc */
    tokenType(): string {
        return this._tokenType;
    }

}