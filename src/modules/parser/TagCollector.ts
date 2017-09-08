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
        let itClone = it.clone();
        while ( it.hasPrior() && it.spyPrior().keyword === Keywords.TAG ) {
            let tag = it.prior() as Tag;
            targetTags.unshift( tag ); // Inserts in the beginning
        }        
    }
}