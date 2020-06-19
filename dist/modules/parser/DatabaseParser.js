"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseParser = void 0;
/**
 * Database parser
 *
 * @author Thiago Delgado Pinto
 */
class DatabaseParser {
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
exports.DatabaseParser = DatabaseParser;
