import * as isValidPath from 'is-valid-path';

import { Import } from 'concordialang-types';
import { NodeTypes } from "../req/NodeTypes";
import { QuotedNodeLexer } from './QuotedNodeLexer';

/**
 * Detects an Import.
 *
 * @author Thiago Delgado Pinto
 */
export class ImportLexer extends QuotedNodeLexer< Import > {

    constructor( words: Array< string > ) {
        super( words, NodeTypes.IMPORT );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.FEATURE, NodeTypes.VARIANT ];
    }

    /** @inheritdoc */
    public isValidName( name: string ): boolean {
        return isValidPath( name );
    }

}