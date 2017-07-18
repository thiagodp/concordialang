import { TokenTypes } from './TokenTypes';
import { LineChecker } from "./LineChecker";
import { TokenDetector } from "./TokenDetector";

/**
 * Empty token detector.
 */
export class EmptyTokenDetector implements TokenDetector {

    protected _lineChecker: LineChecker = new LineChecker();

    /** @inheritDoc */
    isInTheLine( line: string ): boolean {
        return this._lineChecker.isEmpty( line );
    }

    /** @inheritDoc */
    tokenType(): string {
        return TokenTypes.EMPTY;
    }

}