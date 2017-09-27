import { Keywords } from "./Keywords";

/**
 * Token types
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class TokenTypes extends Keywords {

    // Not available in Gherkin

    static REGEX: string = 'regex';

    // Also available in Gherkin

    static TAG: string = 'tag';

    static TEXT: string = 'text'; // not empty content

}