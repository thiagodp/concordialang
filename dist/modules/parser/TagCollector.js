"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Tag collector
 *
 * @author Thiago Delgado Pinto
 */
class TagCollector {
    addBackwardTags(it, targetTags) {
        let itClone = it.clone();
        while (itClone.hasPrior() && itClone.spyPrior().nodeType === NodeTypes_1.NodeTypes.TAG) {
            let tag = itClone.prior();
            targetTags.unshift(tag); // Inserts in the beginning
        }
    }
}
exports.TagCollector = TagCollector;
//# sourceMappingURL=TagCollector.js.map