"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundParser = void 0;
const TypeChecking_1 = require("../util/TypeChecking");
const SyntacticException_1 = require("./SyntacticException");
/**
 * Background parser
 *
 * @author Thiago Delgado Pinto
 */
class BackgroundParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks if a feature has been declared before it
        if (!context.doc.feature) {
            let e = new SyntacticException_1.SyntacticException('A background must be declared after a feature.', node.location);
            errors.push(e);
            return false;
        }
        let feature = context.doc.feature;
        if (feature.background) {
            let e = new SyntacticException_1.SyntacticException('A feature cannot have more than one background.', node.location);
            errors.push(e);
            return false;
        }
        if (TypeChecking_1.isDefined(feature.scenarios) && feature.scenarios.length > 0) {
            let e = new SyntacticException_1.SyntacticException('A background must be declared before a scenario.', node.location);
            errors.push(e);
            return false;
        }
        // Sets the node
        feature.background = node;
        // Adjust the context
        context.resetInValues();
        context.inBackground = true;
        context.currentBackground = node;
        return true;
    }
}
exports.BackgroundParser = BackgroundParser;
