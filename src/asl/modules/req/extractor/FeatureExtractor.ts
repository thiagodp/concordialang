import { Feature } from '../ast/Feature';
import { LocatedException } from '../parser/LocatedException';
import { ASTNodeExtractor } from './ASTNodeExtractor';
import { DictionaryBasedNodeExtractor } from './DictionaryBasedNodeExtractor';
import { Symbols } from './Symbols';
import { TokenTypes } from './TokenTypes';

export class FeatureExtractor extends DictionaryBasedNodeExtractor< Feature > {

    constructor( words: Array< string > ) {
        super( { words: words, separator: Symbols.TITLE_SEPARATOR } );
    }

    /** @inheritDoc */
    public extract( line: string, lineNumber: number ): Feature {

        let pos = this.wordPositionInTheLine( line );
        if ( pos < 0 ) { return null; }

        let sep = this.options().separator;
        let separatorPos = line.indexOf( sep );
        if ( separatorPos < pos ) {
            throw new LocatedException(
                'The symbol "' + sep + '" is expected after the feature.',
                { line: lineNumber, column: pos }
                );
        }

        let title = this._lineChecker.textAfterSeparator( sep, line ).trim();

        return {
            keyword: TokenTypes.FEATURE,
            name: title,
            location: { line: lineNumber, column: pos + 1 }
        };
    }

}