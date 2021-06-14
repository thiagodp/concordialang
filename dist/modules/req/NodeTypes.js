import { Keywords } from "./Keywords";
/**
 * Node types
 *
 * @author Thiago Delgado Pinto
 */
export class NodeTypes extends Keywords {
}
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
