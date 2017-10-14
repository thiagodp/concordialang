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
export interface ATSElement {
    location?: Location;
}

/**
 * Named ATS element.
 * 
 * @author Thiago Delgado Pinto
 */
export interface NamedATSElement extends ATSElement {
    name: string;
}

/**
 * ATS test case.
 * 
 * @author Thiago Delgado Pinto
 */
export interface ATSTestCase extends NamedATSElement {
    invalid: boolean | undefined; // when true, it is expected that the test case will fail
    feature: string | undefined;
    scenario: string | undefined;
    commands: ATSCommand[];
}

/**
 * ATS command
 * 
 * @author Thiago Delgado Pinto
 */
export interface ATSCommand extends ATSElement {
    invalid?: boolean; // when true, it is expected that the command will make the test to fail    
    action: string;
    modifier?: string; // modifies the action (e.g. "not")
    options?: string[]; // options for the action (e.g. [ "left" ])
    targets: ATSTarget[] | string[];
    targetType?: string; // optional for some targets
    values?: string[] | number[]; // optional for some actions
}

/**
 * ATS target.
 * 
 * @author Thiago Delgado Pinto
 */
export interface ATSTarget {
    type: 'web' | 'android' | 'ios' | 'windows' | 'linux';
    name: string;
}