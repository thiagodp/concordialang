"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeTypes = void 0;
const Keywords_1 = require("./Keywords");
/**
 * Node types
 *
 * @author Thiago Delgado Pinto
 */
class NodeTypes extends Keywords_1.Keywords {
}
exports.NodeTypes = NodeTypes;
// Not available in Gherkin
NodeTypes.REGEX = 'regex';
NodeTypes.CONSTANT = 'constant';
NodeTypes.UI_PROPERTY = 'uiProperty';
NodeTypes.DATABASE_PROPERTY = 'databaseProperty';
// Also available in Gherkin
NodeTypes.TAG = 'tag';
NodeTypes.TABLE_ROW = 'tableRow';
NodeTypes.LONG_STRING = 'longString'; // a.k.a. py string
NodeTypes.TEXT = 'text'; // not empty content
