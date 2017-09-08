import { Document } from '../ast/Document';
import { Feature } from "../ast/Feature";
import { Scenario } from "../ast/Scenario";
import { TestCase } from "../ast/TestCase";

/**
 * Parsing context.
 * 
 * @author Thiago Delgado Pinto
 */
export interface ParsingContext {

    doc: Document;

    inFeature: boolean;
    inScenario: boolean;
    inTestCase: boolean;

    currentScenario: Scenario | null;
    currentTestCase: TestCase | null;
}