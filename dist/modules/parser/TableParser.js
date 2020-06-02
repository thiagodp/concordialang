"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableParser = void 0;
const CaseType_1 = require("../util/CaseType");
const CaseConversor_1 = require("../util/CaseConversor");
/**
 * Table parser
 *
 * @author Thiago Delgado Pinto
 */
class TableParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks the structure
        if (!context.doc.tables) {
            context.doc.tables = [];
        }
        // Generates the internal name
        node.internalName = CaseConversor_1.convertCase(node.name, CaseType_1.CaseType.SNAKE);
        // Adjusts the content
        context.resetInValues();
        context.inTable = true;
        context.currentTable = node;
        // Adds the node
        context.doc.tables.push(node);
        return true;
    }
}
exports.TableParser = TableParser;
