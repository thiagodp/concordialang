import { Keywords } from "../req/Keywords";
import { NamedNodeLexer } from "./NamedNodeLexer";
import { TestCase } from "../ast/TestCase";

/**
 * Detects a TestCase.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestCaseLexer extends NamedNodeLexer< TestCase > {
    
    constructor( words: string[] ) {
        super( words, Keywords.TEST_CASE );
    }
}