"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Abstract test script (ATS).
 *
 * @author Thiago Delgado Pinto
 */
class AbstractTestScript {
    constructor() {
        this.schemaVersion = '1.1.0';
        this.scenarios = [];
        this.testcases = [];
    }
}
exports.AbstractTestScript = AbstractTestScript;
/**
 * ATS element.
 *
 * @author Thiago Delgado Pinto
 */
class ATSElement {
    constructor(location) {
        this.location = location;
    }
}
exports.ATSElement = ATSElement;
/**
 * Named ATS element.
 *
 * @author Thiago Delgado Pinto
 */
class NamedATSElement extends ATSElement {
    constructor(location, name) {
        super(location);
        this.location = location;
        this.name = name;
    }
}
exports.NamedATSElement = NamedATSElement;
/**
 * ATS test case.
 *
 * @author Thiago Delgado Pinto
 */
class ATSTestCase extends NamedATSElement {
    constructor() {
        super(...arguments);
        this.invalid = false; // when true, it is expected that the test case will fail
        this.commands = [];
    }
}
exports.ATSTestCase = ATSTestCase;
/**
 * ATS command
 *
 * @author Thiago Delgado Pinto
 */
class ATSCommand extends ATSElement {
}
exports.ATSCommand = ATSCommand;
/**
 * ATS target.
 *
 * @author Thiago Delgado Pinto
 */
class ATSTarget {
}
exports.ATSTarget = ATSTarget;
/**
 * ATS event
 */
class ATSEvent {
    constructor() {
        this.commands = [];
    }
}
exports.ATSEvent = ATSEvent;
/**
 * ATS database command
 *
 * Examples:
 * ```
 * { action: "run", options: [ "script" ], values: [ "DELETE FROM foo" ], db: { ... } }
 * ```
 */
class ATSDatabaseCommand extends ATSCommand {
}
exports.ATSDatabaseCommand = ATSDatabaseCommand;
class ATSConsoleCommand extends ATSCommand {
}
exports.ATSConsoleCommand = ATSConsoleCommand;
