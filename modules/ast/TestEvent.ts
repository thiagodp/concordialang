import { Node } from './Node';
import { Step } from './Step';

/**
 * Test event
 */
export interface TestEvent extends Node {

    /**
     * Normal Given-When-Then sentences. Events about Feature and Scenario usually
     * can interact with the application through its user interface, while
     * the others can't.
     */
    sentences: Step[];
}

/**
 * Executed before all the tests. Should be declared once in all the specification.
 */
export interface BeforeAll extends TestEvent {}

/**
 * Executed after all the tests. Should be declared once in all the specification.
 */
export interface AfterAll extends TestEvent {}

/**
 * Executed before the current feature.
 */
export interface BeforeFeature extends TestEvent {}

/**
 * Executed after the current feature.
 */
export interface AfterFeature extends TestEvent {}

/**
 * Executed before each scenario.
 */
export interface BeforeEachScenario extends TestEvent {}

/**
 * Executed after each scenario.
 */
export interface AfterEachScenario extends TestEvent {}
