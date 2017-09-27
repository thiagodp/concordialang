import { NodeIterator } from './NodeIterator';
import { Tag } from "../ast/Tag";
import { TokenTypes } from "../req/TokenTypes";

/**
 * Tag collector
 * 
 * @author Thiago Delgado Pinto
 */
export class TagCollector {

    public addBackwardTags( it: NodeIterator, targetTags: Tag[] ) {
        let itClone: NodeIterator = it.clone();
        while ( itClone.hasPrior() && itClone.spyPrior().keyword === TokenTypes.TAG ) {
            let tag = itClone.prior() as Tag;
            targetTags.unshift( tag ); // Inserts in the beginning
        }        
    }
}