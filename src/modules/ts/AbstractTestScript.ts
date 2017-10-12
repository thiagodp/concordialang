import { Location } from '../ast/Location';

/**
 * Abstract test script (ATS).
 * 
 * @author Thiago Delgado Pinto
 */
export class AbstractTestScript {

    schemaVersion: string;
    sourceFile: string;

    feature: NamedATSElement;
    scenarios: NamedATSElement[] = [];
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
    invalid: boolean | undefined = undefined; // when true, it is expected that the test case will fail
    feature: string | undefined;
    scenario: string | undefined;
    commands: ATSCommand[] = [];
}

/**
 * ATS command
 * 
 * @author Thiago Delgado Pinto
 */
export class ATSCommand extends ATSElement {
    invalid: boolean | undefined = undefined; // when true, it is expected that the command will make the test to fail    
    action: string;
    modifier?: string | undefined = undefined; // modifies the action (e.g. "not")
    options: string[] = []; // options for the action (e.g. [ "left" ])
    targets: ATSTarget[] = [];
    targetType: string | undefined = undefined; // optional for some targets
    values: string[] | number[] = []; // optional for some actions
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