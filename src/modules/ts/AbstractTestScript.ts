// WARNING: WIP !!!

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
    invalid: boolean | undefined = undefined; // if true, it is expected that the test case will fail
}

/**
 * ATS target.
 * 
 * @author Thiago Delgado Pinto
 */
export class ATSTarget {
    type: 'web' | 'android' | 'ios' | 'windows' | 'linux';
    name: string;
}

/**
 * ATS command
 * 
 * @author Thiago Delgado Pinto
 */
export class ATSCommand extends ATSElement {
    action: string;
    targets: object[] = [];
    targetType: string | undefined = undefined; // optional for some targets
    value: string | number | undefined = undefined; // optional for some actions
    invalid: boolean | undefined = undefined; // if true, it is expected that the test case will fail because of this value
}