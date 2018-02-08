import { Keywords } from "./Keywords";

/**
 * Node types
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class NodeTypes extends Keywords {

    // Not available in Gherkin

    static REGEX: string = 'regex';
    static CONSTANT: string = 'constant';
    static UI_PROPERTY: string = 'uiProperty';
    static DATABASE_PROPERTY: string = 'databaseProperty';
    static TEST_EVENT_ITEM: string = 'testEventItem';

    // Also available in Gherkin

    static TAG: string = 'tag';
    static TABLE_ROW: string = 'tableRow';
    static LONG_STRING: string = 'longString'; // a.k.a. py string
    static TEXT: string = 'text'; // not empty content

}