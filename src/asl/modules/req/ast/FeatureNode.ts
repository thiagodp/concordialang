import { TokenTypes } from '../alt-lexer/TokenTypes';
import { AbstractNode } from './AbstractNode';

/**
 * Feature node
 * 
 * @author Thiago Delgado Pinto
 */
export class FeatureNode extends AbstractNode {

    /** @inheritDoc */
    public tokenType(): string {
        return TokenTypes.FEATURE
    }

}