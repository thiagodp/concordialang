import { State } from "../ast/VariantLike";
import { TestScenario } from "./TestScenario";
import { ImmutablePair } from 'ts-pair';

// A "row" of all states and their test scenarios
export type TestScenariosToCombine = ImmutablePair< State, TestScenario >[];