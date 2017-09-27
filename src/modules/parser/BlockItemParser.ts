import { NodeTypes } from '../req/NodeTypes';
import { BlockItem } from '../ast/Block';
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';
import { SyntaticException } from "../req/SyntaticException";

/**
 * Block item parser
 * 
 * @author Thiago Delgado Pinto
 */
export class BlockItemParser implements NodeParser< BlockItem > {
    
    /** @inheritDoc */
    public analyze( node: BlockItem, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // IMPORTANT: Since there is no difference between a Constant and a Regex in some cases,
        // a Regex can be recognized as a constant or vice-versa.

        if ( ! context.inConstantBlock && ! context.inRegexBlock ) {
            let e = new SyntaticException( 'An item must be declared in a constant block or in a regex block.', node.location );
            errors.push( e );            
            return false;
        }

        let block = context.inConstantBlock ? context.doc.constantBlock : context.doc.regexBlock;
        if ( ! block ) {
            let blockName = context.inConstantBlock ? 'constant' : 'regex';
            let e = new SyntaticException( 'A ' + blockName + ' block must be declared before its item.', node.location );
            errors.push( e );
            return false;            
        }        

        // Check structure
        if ( ! block.items ) {
            block.items = [];
        }

        // Adjust the node type according to the current block
        if ( block.nodeType === NodeTypes.CONSTANT_BLOCK ) {
            node.nodeType = NodeTypes.CONSTANT;
        } else {
            node.nodeType = NodeTypes.REGEX;
        }

        // Add the node
        block.items.push( node );

        return true;
    }
    
}