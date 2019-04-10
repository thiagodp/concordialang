import { Import } from 'concordialang-types';
import { QuotedNodeLexer } from './QuotedNodeLexer';
import { NodeTypes } from "../req/NodeTypes";

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

}