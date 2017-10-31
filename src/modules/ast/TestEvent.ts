import { Node } from './Node';
import { Block, BlockItem } from './Block';

export interface TestEventBlock extends Node, Block< TestEventItem > {}

export interface TestEventItem extends BlockItem {}


export interface BeforeAll extends TestEventItem {}
export interface AfterAll extends TestEventItem {}

export interface BeforeFeature extends TestEventItem {}
export interface AfterFeature extends TestEventItem {}

export interface BeforeScenario extends TestEventItem {}
export interface AfterScenario extends TestEventItem {}