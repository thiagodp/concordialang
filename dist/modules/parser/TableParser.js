import { CaseType } from "../util/CaseType";
import { convertCase, removeDiacritics } from "../util/CaseConversor";
/**
 * Table parser
 *
 * @author Thiago Delgado Pinto
 */
export class TableParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks the structure
        if (!context.doc.tables) {
            context.doc.tables = [];
        }
        // Generates the internal name
        node.internalName = removeDiacritics(convertCase(node.name, CaseType.SNAKE));
        // Adjusts the content
        context.resetInValues();
        context.inTable = true;
        context.currentTable = node;
        // Adds the node
        context.doc.tables.push(node);
        return true;
    }
}
