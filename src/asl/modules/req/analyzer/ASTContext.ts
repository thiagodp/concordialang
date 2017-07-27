import { Document } from '../ast/Document';
import { Feature } from '../ast/Feature';
import { Scenario } from '../ast/Scenario';

export interface ASTContext {

    inFeature: boolean;
    inScenario: boolean;

    currentScenario?: Scenario;

    document?: Document;

}