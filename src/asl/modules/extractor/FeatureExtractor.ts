import { Feature } from '../ast/Feature';
import { LocatedException } from '../parser/LocatedException';
import { ASTNodeExtractor } from './ASTNodeExtractor';
import { DictionaryBasedNodeExtractor } from './DictionaryBasedNodeExtractor';
import { Symbols } from './Symbols';
import { TokenTypes } from './TokenTypes';

export class FeatureExtractor extends DictionaryBasedNodeExtractor< Feature > {

    constructor( words: Array< string > ) {
        super( words );
    }

    /** @inheritDoc */
    public extract( line: string, lineNumber: number ): Feature {

        let pos = this.positionInTheLine( line );
        if ( pos < 0 ) { return null; }

        let separatorPos = this._lineChecker.positionOf( Symbols.TITLE_SEPARATOR, line );
        if ( separatorPos < 0 ) {
            throw new LocatedException(
                'The symbol "' + Symbols.TITLE_SEPARATOR + '" is expected after the feature.',
                { line: lineNumber, column: pos }
                );
        }

        let title = this._lineChecker.textAfterSeparator( Symbols.TITLE_SEPARATOR, line ).trim();

        return {
            keyword: TokenTypes.FEATURE,
            name: title,
            location: { line: lineNumber, column: pos + 1 }
        };
    }

}