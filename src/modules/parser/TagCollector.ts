import { NodeIterator } from './NodeIterator';
import { Tag } from "../ast/Tag";
import { Keywords } from "../req/Keywords";

/**
 * Tag collector
 * 
 * @author Thiago Delgado Pinto
 */
export class TagCollector {

    public addBackwardTags( it: NodeIterator, targetTags: Tag[] ) {
        let itClone: NodeIterator = it.clone();
        while ( itClone.hasPrior() && itClone.spyPrior().keyword === Keywords.TAG ) {
            let tag = itClone.prior() as Tag;
            targetTags.unshift( tag ); // Inserts in the beginning
        }        
    }
}