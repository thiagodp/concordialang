/**
 * Database parser
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseParser {
    analyze(node, context, it, errors) {
        // Adjusts the context
        context.resetInValues();
        context.currentDatabase = node;
        // Checks the structure
        if (!context.doc.databases) {
            context.doc.databases = [];
        }
        // Adds the node
        context.doc.databases.push(node);
        return true;
    }
}
