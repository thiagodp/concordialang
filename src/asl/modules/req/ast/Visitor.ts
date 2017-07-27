import { Scenario } from './Scenario';
import { Feature } from './Feature';

/**
 * Visitor design pattern.
 */
export interface Visitor {

    visitFeature( feature: Feature ): void;
    visitScenario( scenario: Scenario ): void;

}