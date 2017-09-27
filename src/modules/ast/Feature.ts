import { NamedNode } from './Node';
import { MayHaveTags } from './Tag';
import { Text } from '../ast/Text';
import { Scenario } from './Scenario';
import { TestCase } from './TestCase';

/**
 * Feature node.
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface Feature extends NamedNode, MayHaveTags {

    description?: string;
    sentences?: Text[];    
    scenarios?: Scenario[];
    testcases?: TestCase[];

    //rules?: Array< Rule >; // TO-DO: remove the Rule class and related ones
}