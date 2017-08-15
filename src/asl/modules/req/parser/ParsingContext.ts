import { Document } from '../ast/Document';
import { Feature } from "../ast/Feature";
import { Scenario } from "../ast/Scenario";

export interface ParsingContext {

    doc: Document;

    inFeature: boolean;
    inScenario: boolean;

    currentScenario: Scenario | null;
}