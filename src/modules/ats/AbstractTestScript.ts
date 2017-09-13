import { Location } from '../ast/Location';

/**
 * Abstract test script (ATS)
 * 
 * @author Thiago Delgado Pinto
 */
export class AbstractTestScript {

    sourceFile: string;

    feature: NamedATSElement;
    scenarios: NamedATSElement[] = [];
    interactions: NamedATSElement[] = [];
    testcases: ATSTestCase[] = [];

}

/**
 * ATS element.
 * 
 * @author Thiago Delgado Pinto
 */
export class ATSElement {
    location: Location;
}

/**
 * Named ATS element.
 * 
 * @author Thiago Delgado Pinto
 */
export class NamedATSElement extends ATSElement {
    name: string;
}

/**
 * ATS test case.
 * 
 * @author Thiago Delgado Pinto
 */
export class ATSTestCase extends NamedATSElement {
    feature: string | undefined;
    scenario: string | undefined;
    interaction: string  | undefined;
    commands: ATSCommand[] = [];
}

/**
 * ATS command
 * 
 * @author Thiago Delgado Pinto
 */
export class ATSCommand extends ATSElement {
    id: string; // hash used as a unique identification
    action: string;
    target: string;
    targetType: string | undefined; // optional for some targets
    value: string | number | undefined; // optional
    valueConsideredValid: boolean; // if value is not undefined
}