import { Tag } from "../ast/Tag";
import { NodeTypes } from "../req/NodeTypes";
import { NodeIterator } from './NodeIterator';

/**
 * Tag collector
 *
 * @author Thiago Delgado Pinto
 */
export class TagCollector {

    public addBackwardTags( it: NodeIterator, targetTags: Tag[] ) {
        let itClone: NodeIterator = it.clone();
        while ( itClone.hasPrior() && itClone.spyPrior().nodeType === NodeTypes.TAG ) {
            let tag = itClone.prior() as Tag;
            targetTags.unshift( tag ); // Inserts in the beginning
        }
    }
}