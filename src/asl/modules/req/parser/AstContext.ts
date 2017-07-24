import { Feature } from '../ast/Feature';
import { Scenario } from '../ast/Scenario';

export interface AstContext {

    inFeature: boolean;
    inScenario: boolean;

    currentFeature?: Feature;
    currentScenario?: Scenario;

}