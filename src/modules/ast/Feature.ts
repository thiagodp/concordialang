import { Scenario } from './Scenario';
import { TestCase } from './TestCase';
import { Rule } from "./Rule";
import { NamedNode } from './Node';
import { MayHaveTags } from './Tag';

/**
 * Feature node.
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface Feature extends NamedNode, MayHaveTags {

    description?: string;

    scenarios?: Array< Scenario >;

    testcases?: Array< TestCase >;

    rules?: Array< Rule >;
}