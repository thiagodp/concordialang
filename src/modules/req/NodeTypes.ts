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

    // Also available in Gherkin

    static TAG: string = 'tag';

    static TEXT: string = 'text'; // not empty content

}