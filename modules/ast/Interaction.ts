import { MayHaveTags } from './Tag';
import { Scenario } from "./Scenario";

/**
 * Interaction node
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface Interaction extends Scenario, MayHaveTags {
}

/**
 * Interaction template node
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface InteractionTemplate extends Interaction {
}