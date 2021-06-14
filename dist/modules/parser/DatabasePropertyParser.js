import { NodeTypes } from "../req/NodeTypes";
import { SyntacticException } from "./SyntacticException";
/**
 * Database property parser.
 *
 * @author Thiago Delgado Pinto
 */
export class DatabasePropertyParser {
    /** @inheritDoc */
    isAccepted(node, it) {
        const allowedPriorNodes = [
            NodeTypes.DATABASE,
            NodeTypes.DATABASE_PROPERTY
        ];
        return allowedPriorNodes.indexOf(it.spyPrior().nodeType) >= 0;
    }
    /** @inheritDoc */
    handle(node, context, it, errors) {
        // Adjusts the node type
        node.nodeType = NodeTypes.DATABASE_PROPERTY;
        // Checks the context
        if (!context.currentDatabase) {
            let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared for a Database.', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        // Checks the structure
        if (!context.currentDatabase.items) {
            context.currentDatabase.items = [];
        }
        // Adds the node
        context.currentDatabase.items.push(node);
        return true;
    }
}
