import { NodeTypes } from "../req/NodeTypes";
/**
 * Tag collector
 *
 * @author Thiago Delgado Pinto
 */
export class TagCollector {
    addBackwardTags(it, targetTags) {
        let itClone = it.clone();
        while (itClone.hasPrior() && itClone.spyPrior().nodeType === NodeTypes.TAG) {
            let tag = itClone.prior();
            targetTags.unshift(tag); // Inserts in the beginning
        }
    }
}
