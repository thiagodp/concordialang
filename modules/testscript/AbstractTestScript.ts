import { Location } from '../ast/Location';

/**
 * Abstract test script (ATS).
 *
 * @author Thiago Delgado Pinto
 */
export class AbstractTestScript {

    schemaVersion: string = '1.0.0';
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
    constructor( public location?: Location ) {
    }
}

/**
 * Named ATS element.
 *
 * @author Thiago Delgado Pinto
 */
export class NamedATSElement extends ATSElement {
    constructor(
        public location?: Location,
        public name?: string
    ) {
        super( location );
    }
}

/**
 * ATS test case.
 *
 * @author Thiago Delgado Pinto
 */
export class ATSTestCase extends NamedATSElement {
    invalid?: boolean = false; // when true, it is expected that the test case will fail
    scenario?: string;
    commands: ATSCommand[] = [];
}

/**
 * ATS command
 *
 * @author Thiago Delgado Pinto
 */
export class ATSCommand extends ATSElement {
    invalid?: boolean; // when true, it is expected that the command will make the test to fail
    action: string;
    modifier?: string; // modifies the action (e.g. "not")
    options?: string[]; // options for the action (e.g. [ "left" ])
    targets: ATSTarget[] | string[] = [];
    targetTypes?: string[]; // optional for some targets
    values?: string[] | number[] // optional for some actions
}

/**
 * ATS target.
 *
 * @author Thiago Delgado Pinto
 */
export class ATSTarget {
    web?: string;
    android?: string;
    ios?: string;
    windows?: string;
    linux?: string;
}