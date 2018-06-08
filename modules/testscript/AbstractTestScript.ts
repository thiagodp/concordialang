import { Location } from '../ast/Location';
import { AbstractDatabase } from '../ast/AbstractDatabase';

/**
 * Abstract test script (ATS).
 *
 * @author Thiago Delgado Pinto
 */
export class AbstractTestScript {

    schemaVersion: string = '1.1.0';
    sourceFile: string;

    feature: NamedATSElement;
    scenarios: NamedATSElement[] = [];
    testcases: ATSTestCase[] = [];

    beforeAll?: ATSEvent;
    afterAll?: ATSEvent;
    beforeFeature?: ATSEvent;
    afterFeature?: ATSEvent;
    beforeEachScenario?: ATSEvent;
    afterEachScenario?: ATSEvent;
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
    targets?: ATSTarget[] | string[];
    targetTypes?: string[]; // optional for some targets
    values?: any[]; // optional for some actions
    comment?: string;
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


/**
 * ATS event
 */
export class ATSEvent {
    commands: ATSCommand[] = [];
}

/**
 * ATS database command
 *
 * Examples:
 * ```
 * { action: "run", options: [ "script" ], values: [ "DELETE FROM foo" ], db: { ... } }
 * ```
 */
export class ATSDatabaseCommand extends ATSCommand {
    db: AbstractDatabase; // reference to a database connection used by the command
}


export class ATSConsoleCommand extends ATSCommand {
    console: true;
}