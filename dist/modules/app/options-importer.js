import * as enumUtil from 'enum-util';
import { isAbsolute, resolve } from 'path';
import { isNumber, isString } from '../util/TypeChecking';
import { CombinationOptions, VariantSelectionOptions, InvalidSpecialOptions } from './combination-options';
/**
 * Copy options
 *
 * @param from Object whose keys are on the available options.
 * @param to Object that follows the keys and types of the available options.
 */
export function copyOptions(from, to) {
    const PARAM_SEPARATOR = ',';
    const errors = [];
    // HELPER FUNCTIONS
    const isStringNotEmpty = text => isString(text) && text.trim() != '';
    const resolvePath = p => isAbsolute(p) ? p : resolve(to.processPath, p);
    // Copy all attributes that exists in the target object,
    // considering differences in the types when possible.
    const pathKeys = [
        'directory',
        'dirScript',
        'dirResult',
        'config',
    ];
    const lowerCased = [
        'plugin',
        'language',
        'encoding',
        'pluginAbout',
        'pluginInstall',
        'pluginUninstall',
        'pluginServe',
        'dbInstall',
        'dbUninstall',
    ];
    const notTrimmed = [
        'tcIndenter'
    ];
    // Currently all the numbers must be zero or positive integers
    const unsignedInt = [
        'instances',
        'randomMinStringSize',
        'randomMaxStringSize',
        'randomTriesToInvalidValue',
        'importance',
    ];
    // Keys that should be undefined, false, or true
    const assertBooleans = [
        'spec',
        'testCase',
        'script',
        'run',
        'result'
    ];
    const addDashes = (key) => (1 === key.length ? '-' : '--') + key;
    for (let [k, v] of Object.entries(from)) {
        // Avoid copying undefined values
        if (undefined === v) {
            continue;
        }
        // Remove '=' from the beginning of the value, since `getopts`
        // keeps it for short options (e.g. `-F=1` gives `=1`...)
        if ('string' === typeof v) {
            if (assertBooleans.indexOf(k) >= 0) {
                const dashedK = addDashes(k);
                errors.push(`Option '${dashedK}' does not expect a value.`);
                continue;
            }
            if (v.startsWith('=')) {
                v = v.substr(1);
            }
        }
        if (Array.isArray(to[k])) {
            if ('string' === typeof v) {
                // Not trimmed
                if (notTrimmed.indexOf(k) >= 0) {
                    to[k] = v.split(PARAM_SEPARATOR);
                }
                else {
                    to[k] = v.trim().split(PARAM_SEPARATOR);
                }
            }
            else if (Array.isArray(v)) { // Both arrays
                to[k] = [...v];
            }
            else {
                to[k] = v;
            }
            continue;
        }
        if (undefined === to[k]) {
            to[k] = v;
            continue;
        }
        if ('string' === typeof v) {
            // Not trimmed
            if (notTrimmed.indexOf(k) >= 0) {
                to[k] = v;
            }
            else {
                to[k] = v.trim();
            }
            // key in pathKeys
            if (pathKeys.indexOf(k) >= 0) {
                to[k] = resolvePath(to[k]);
                continue;
            }
            // key in lowerCased
            if (lowerCased.indexOf(k) >= 0) {
                to[k] = to[k].toLowerCase();
                continue;
            }
            continue;
        }
        to[k] = v;
        // key in unsignedInt
        if (unsignedInt.indexOf(k) >= 0) {
            const dashedK = addDashes(k);
            if (typeof to[k] !== 'number' && !/^[0-9]+$/.test(to[k])) {
                errors.push(`Option '${dashedK}' expects a number.`);
                continue;
            }
            to[k] = Math.trunc(Number(to[k]));
            if (to[k] < 0) {
                errors.push(`Option '${dashedK}' expects a number greater than or equal to zero.`);
                continue;
            }
        }
    }
    // DIRECTORIES
    // to.recursive = true === from.recursive;
    // if ( isStringNotEmpty( from.directory ) ) {
    // 	to.directory = resolvePath( from.directory );
    // }
    // if ( isStringNotEmpty( from.dirScript ) ) { // singular
    // 	to.dirScript = resolvePath( from.dirScript );
    // }
    // if ( isStringNotEmpty( from.dirResult ) ) { // singular
    // 	to.dirResult = resolvePath( from.dirResult );
    // }
    // // FILES
    // if ( isStringNotEmpty( from.config ) ) {
    // 	to.config = resolvePath( from.config );
    // }
    // if ( isStringNotEmpty( from.file ) ) {
    // 	to.file = from.file.toString().trim().split( PARAM_SEPARATOR );
    // } else if ( Array.isArray( from.file ) ) {
    // 	to.file = [ ... from.file ];
    // }
    // if ( isStringNotEmpty( from.ignore ) ) {
    // 	to.ignore = from.ignore.toString().trim().split( PARAM_SEPARATOR );
    // } else if ( Array.isArray( from.ignore ) ) {
    // 	to.ignore = [ ... from.ignore ];
    // }
    // if ( isStringNotEmpty( from.scriptFile ) ) {
    // 	to.scriptFile = from.scriptFile.toString().trim().split( PARAM_SEPARATOR );
    // } else if ( Array.isArray( from.scriptFile ) ) {
    // 	to.scriptFile = [ ... from.scriptFile ];
    // }
    // if ( isStringNotEmpty( from.scriptGrep ) ) {
    // 	to.scriptGrep = from.scriptGrep.trim();
    // }
    // if ( true === from.headless ) {
    // 	to.headless = true; // only defined if needed
    // }
    // if ( ! isNaN( from.instances ) && from.instances > 1 ) {
    // 	to.instances = from.instances;
    // } else if ( isDefined( from.instances ) ) {
    // 	errors.push( "'--instances' expects a number." );
    // }
    // if ( ! isNumber( to.instances ) ) {
    // 	errors.push( "'--instances' expects a number." );
    // } else {
    // 	to.instances = Number( to.instances );
    // 	if ( to.instances < 1 ) {
    // 		errors.push( "'--instances' expects a number greater than or equal to 1." );
    // 	}
    // }
    // EXTENSIONS, ENCODING, SEPARATORS, ETC.
    // if ( isStringNotEmpty( from.extensionFeature ) ) {
    // 	to.extensionFeature = from.extensionFeature;
    // }
    // if ( isStringNotEmpty( from.extensionTestCase ) ) {
    // 	to.extensionTestCase = from.extensionTestCase;
    // }
    // if ( isString( from.lineBreaker ) ) {
    // 	to.lineBreaker = from.lineBreaker;
    // }
    // if ( isStringNotEmpty( from.encoding ) ) {
    // 	to.encoding = from.encoding.trim().toLowerCase();
    // }
    // if ( isStringNotEmpty( to.encoding ) ) {
    // 	to.encoding = to.encoding.toLowerCase();
    // }
    // LANGUAGE
    // if ( isStringNotEmpty( from.language )  ) {
    // 	to.language = from.language.trim().toLowerCase();
    // }
    // to.languageList = true === from.languageList;
    // PLUG-IN
    // console.log( obj );
    // if ( isStringNotEmpty( from.plugin ) ) {
    // 	to.plugin = from.plugin.trim().toLowerCase();
    // }
    // to.pluginList = true === from.pluginList;
    // if ( isStringNotEmpty( from.pluginAbout ) ) {
    // 	to.plugin = from.pluginAbout.trim().toLowerCase();
    // } else if ( isStringNotEmpty( from.pluginInstall ) ) {
    // 	to.plugin = from.pluginInstall.trim().toLowerCase();
    // } else if ( isStringNotEmpty( from.pluginUninstall ) ) {
    // 	to.plugin = from.pluginUninstall.trim().toLowerCase();
    // } else if ( isStringNotEmpty( from.pluginServe ) ) {
    // 	to.plugin = from.pluginServe.trim().toLowerCase();
    // }
    if (!to.plugin) {
        if (isStringNotEmpty(to.pluginAbout)) {
            to.plugin = to.pluginAbout;
        }
        else if (isStringNotEmpty(to.pluginInstall)) {
            to.plugin = to.pluginInstall;
        }
        else if (isStringNotEmpty(to.pluginUninstall)) {
            to.plugin = to.pluginUninstall;
        }
        else if (isStringNotEmpty(to.pluginServe)) {
            to.plugin = to.pluginServe;
        }
    }
    // if ( isStringNotEmpty( from.target ) ) {
    // 	to.target = from.target;
    // }
    // DATABASE
    // to.dbList = true === from.dbList;
    // if ( isStringNotEmpty( from.dbInstall ) ) {
    // 	to.dbInstall = from.dbInstall.trim().toLowerCase();
    // } else if ( isStringNotEmpty( from.dbUninstall ) ) {
    // 	to.dbUninstall = from.dbUninstall.trim().toLowerCase();
    // }
    // LOCALE
    // to.localeList = true === from.localeList;
    // PROCESSING
    // to.init = true === from.init;
    // to.saveConfig = true === from.saveConfig;
    // const ast = isStringNotEmpty( from.ast )
    // 	? from.ast
    // 	: ( isDefined( from.ast ) ? DEFAULT_AST_FILE : undefined );
    // to.ast = ast;
    // to.verbose = true === from.verbose;
    // to.stopOnTheFirstError = true === from.stopOnTheFirstError;
    const justSpec = true === from.justSpec;
    const justTestCase = true === from.justTestCase;
    const justScript = true === from.justScript;
    const justRun = true === from.justRun;
    const justResult = true === from.justResult;
    if ([justSpec, justTestCase, justScript, justRun, justResult]
        .filter(b => true === b).length > 1) {
        errors.push("Only one option with '--just' is allowed.");
    }
    // no-xxx should use `false` explicitly
    const noTestCase = false === from.testCase;
    const noGenScript = false === from.script;
    const noRunScript = false == from.run || true === from.x;
    // const noResult: boolean = false === from.result;
    // Adjust flags
    to.testCase = (!noTestCase || justTestCase) &&
        (!justSpec && !justScript && !justRun && !justResult);
    to.script = (!noGenScript || justScript) &&
        (!justSpec && !justTestCase && !justRun && !justResult);
    to.run = (!noRunScript || justRun) &&
        (!justSpec && !justTestCase && !justScript && !justResult);
    // to.result = ( ! noResult || justResult ) &&
    // 	( ! justSpec && ! justTestCase && ! justScript && ! justRun );
    to.result = justResult;
    to.spec = (justSpec || to.testCase || to.script);
    // CONTENT GENERATION
    // if ( isString( from.caseUi ) ) {
    // 	to.caseUi = from.caseUi;
    // }
    // to.tcSuppressHeader = isDefined( from.tcSuppressHeader );
    // if ( isString( from.tcIndenter ) ) {
    // 	to.tcIndenter = from.tcIndenter;
    // }
    // RANDOMIC GENERATION
    // if ( isStringNotEmpty( from.seed ) ) {
    // 	to.seed = from.seed;
    // }
    // if ( isNumber( from.randomMinStringSize ) ) {
    // 	to.randomMinStringSize = from.randomMinStringSize;
    // }
    // if ( isNumber( from.randomMaxStringSize ) ) {
    // 	to.randomMaxStringSize = from.randomMaxStringSize;
    // }
    // if ( isNumber( from.randomTriesToInvalidValue ) ) {
    // 	to.randomTriesToInvalidValue = from.randomTriesToInvalidValue;
    // }
    // SPECIFICATION SELECTION
    // if ( isNumber( from.importance ) ) {
    // 	to.importance = from.importance;
    // }
    // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
    if (isString(from.combVariant)) {
        if (enumUtil.isValue(VariantSelectionOptions, from.combVariant)) {
            to.combVariant = from.combVariant;
        }
        else {
            errors.push("Option '--comb-variant' expects another value. See '--help'.");
        }
    }
    if (isString(from.combState)) {
        if (enumUtil.isValue(CombinationOptions, from.combState)) {
            to.combState = from.combState;
        }
        else {
            errors.push("Option '--comb-state' expects another value. See '--help'.");
        }
    }
    // SELECTION AND COMBINATION STRATEGIES FOR DATA TEST CASES
    if (isNumber(from.combInvalid)) {
        const n = Number(from.combInvalid);
        if (n >= 0 && n <= 1) {
            to.combInvalid = from.combInvalid;
        }
        else {
            errors.push("Option '--comb-invalid' expects only 0 or 1 as numbers. See '--help'.");
        }
    }
    else if (isString(from.combInvalid)) {
        if (enumUtil.isValue(InvalidSpecialOptions, from.combInvalid)) {
            to.combInvalid = from.combInvalid;
        }
        else {
            errors.push("Option '--comb-invalid' expects another value. See '--help'.");
        }
    }
    if (isString(from.combData)) {
        if (enumUtil.isValue(CombinationOptions, from.combData)) {
            to.combData = from.combData;
        }
        else {
            errors.push("Option '--comb-data' expects another value. See '--help'.");
        }
    }
    // INFO
    // to.help = true === from.help;
    // to.about = true === from.about;
    // to.version = true === from.version;
    // to.newer = true === from.newer;
    // to.debug = true === from.debug;
    fixInconsistences(to);
    return errors;
}
/**
 * Fix inconsistences
 */
function fixInconsistences(to) {
    // LANGUAGE
    to.languageList = to.languageList && !to.help; // Help flag takes precedence over other flags
    // PLUG-IN
    to.pluginList = to.pluginList && !to.help; // Help flag takes precedence over other flags
    to.pluginAbout = to.pluginAbout && !to.pluginList;
    to.pluginInstall = to.pluginInstall && !to.pluginAbout && !to.pluginList;
    to.pluginUninstall = to.pluginUninstall && !to.pluginAbout && !to.pluginList;
    to.pluginServe = to.pluginServe && !to.pluginAbout && !to.pluginList;
    // INFO
    // - Help flag takes precedence over other flags
    to.about = to.about && !to.help;
    to.version = to.version && !to.help;
    to.newer = to.newer && !to.help;
}
