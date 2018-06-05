"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypeChecking_1 = require("../util/TypeChecking");
const AbstractTestScript_1 = require("./AbstractTestScript");
const Actions_1 = require("../util/Actions");
const Symbols_1 = require("../req/Symbols");
const DatabaseToAbstractDatabase_1 = require("../db/DatabaseToAbstractDatabase");
/**
 * Generates Abstract Test Script
 */
class AbstractTestScriptGenerator {
    /**
     * Generate an abstract test script with the test cases of a document.
     *
     * @param doc Document
     * @param spec Specification
     */
    generateFromDocument(doc, spec) {
        // console.log( 'DOC is', doc.fileInfo.path );
        // console.log( 'Test cases', doc.testCases );
        if (!doc.testCases || doc.testCases.length < 1) {
            return null;
        }
        const hasNoSentences = function hasSentences(target) {
            return (!target || !target.sentences || target.sentences.length < 1);
        };
        let beforeAll = doc.beforeAll;
        let afterAll = doc.afterAll;
        let beforeFeature = doc.beforeFeature;
        let afterFeature = doc.afterFeature;
        let beforeEachScenario = doc.beforeEachScenario;
        let afterEachScenario = doc.afterEachScenario;
        // Get from the document
        let feature = !doc.feature ? null : doc.feature;
        if (!feature) {
            const docsWithFeature = spec.importedDocumentsOf(doc)
                .filter(impDoc => TypeChecking_1.isDefined(impDoc.feature));
            // Not found -> get the first feature of a imported document
            if (docsWithFeature.length > 0) {
                const firstDoc = docsWithFeature[0];
                feature = firstDoc.feature;
                if (!beforeAll && TypeChecking_1.isDefined(firstDoc.beforeAll)) {
                    beforeAll = firstDoc.beforeAll;
                }
                if (!afterAll && TypeChecking_1.isDefined(firstDoc.afterAll)) {
                    afterAll = firstDoc.afterAll;
                }
                if (!beforeFeature && TypeChecking_1.isDefined(firstDoc.beforeFeature)) {
                    beforeFeature = firstDoc.beforeFeature;
                }
                if (!afterFeature && TypeChecking_1.isDefined(firstDoc.afterFeature)) {
                    afterFeature = firstDoc.afterFeature;
                }
                if (!beforeEachScenario && TypeChecking_1.isDefined(firstDoc.beforeEachScenario)) {
                    beforeEachScenario = firstDoc.beforeEachScenario;
                }
                if (!afterEachScenario && TypeChecking_1.isDefined(firstDoc.afterEachScenario)) {
                    afterEachScenario = firstDoc.afterEachScenario;
                }
            }
        }
        // console.log( 'Feature', feature.name );
        // Not found -> assumes a name and location
        const location = !feature
            ? { column: 1, line: 1, filePath: doc.fileInfo.path }
            : feature.location;
        const featureName = !feature ? 'Unknown feature' : feature.name;
        // ASTRACT TEST SCRIPT
        let ats = new AbstractTestScript_1.AbstractTestScript();
        // feature, location, sourceFile
        ats.sourceFile = doc.fileInfo.path;
        ats.feature = new AbstractTestScript_1.NamedATSElement(location, featureName);
        // scenarios
        let scenarioNames = [];
        if (TypeChecking_1.isDefined(feature)) {
            for (let s of feature.scenarios || []) {
                ats.scenarios.push(new AbstractTestScript_1.NamedATSElement(s.location, s.name));
                scenarioNames.push(s.name);
            }
        }
        // testCases
        for (let tc of doc.testCases || []) {
            let absTC = new AbstractTestScript_1.ATSTestCase(tc.location, tc.name);
            absTC.scenario = scenarioNames[(tc.declaredScenarioIndex || 1) - 1] || 'Unknown scenario';
            absTC.invalid = tc.shoudFail;
            for (let sentence of tc.sentences) {
                let cmd = this.sentenceToCommand(sentence);
                absTC.commands.push(cmd);
            }
            // console.log( absTC );
            ats.testcases.push(absTC);
        }
        // test events
        let allTestEvents = {
            beforeAll: beforeAll,
            afterAll: afterAll,
            beforeFeature: beforeFeature,
            afterFeature: afterFeature,
            beforeEachScenario: beforeEachScenario,
            afterEachScenario: afterEachScenario
        };
        for (let e in allTestEvents) {
            let event = allTestEvents[e];
            if (!TypeChecking_1.isDefined(event) || !TypeChecking_1.isDefined(event.sentences) ||
                event.sentences.length < 1) {
                continue;
            }
            ats[e] = new AbstractTestScript_1.ATSEvent();
            ats[e].commands = this.convertTestEventSentencesToCommands(event, spec);
        }
        // console.log( ats );
        return ats;
    }
    sentenceToCommand(sentence, obj = new AbstractTestScript_1.ATSCommand(), valuesOverwrite) {
        let cmd = obj;
        cmd.location = sentence.location;
        cmd.action = sentence.action;
        cmd.modifier = sentence.actionModifier;
        cmd.options = sentence.actionOptions;
        cmd.targets = sentence.targets;
        cmd.targetTypes = sentence.targetTypes;
        cmd.values = (!valuesOverwrite) ? sentence.values : valuesOverwrite;
        cmd.invalid = sentence.isInvalidValue;
        cmd.comment = sentence.comment;
        return cmd;
    }
    convertTestEventSentencesToCommands(event, spec) {
        const dbConversor = new DatabaseToAbstractDatabase_1.DatabaseToAbstractDatabase();
        const SCRIPT_OPTION = 'script';
        const COMMAND_OPTION = 'command';
        const dbNames = spec.databaseNames();
        const dbVarNames = dbNames.map(name => Symbols_1.Symbols.CONSTANT_PREFIX + name.toLowerCase() + Symbols_1.Symbols.CONSTANT_SUFFIX);
        let commands = [];
        for (let s of event.sentences || []) {
            // action is not run ?
            if (Actions_1.Actions.RUN !== (s.action || '')) {
                commands.push(this.sentenceToCommand(s));
                continue;
            }
            // Doesn't it have one value ?
            if ((s.values || []).length !== 1) {
                continue;
            }
            // run + command
            if ((s.actionOptions || []).indexOf(COMMAND_OPTION) >= 0) {
                let cmd = this.sentenceToCommand(s, new AbstractTestScript_1.ATSConsoleCommand());
                commands.push(cmd);
            }
            // run + script + value
            else if ((s.actionOptions || []).indexOf(SCRIPT_OPTION) >= 0) {
                let absDB = undefined;
                let newScript = s.values[0];
                // Find database names inside que command
                for (let i in dbVarNames) {
                    let dbVar = dbVarNames[i];
                    if (s.content.toLowerCase().indexOf(dbVar) < 0) {
                        continue;
                    }
                    // Found
                    let dbName = dbNames[i];
                    let db = spec.databaseWithName(dbName);
                    if (!db) {
                        continue;
                    }
                    // Remove database name
                    newScript = s.values[0].toString().replace(Symbols_1.Symbols.CONSTANT_PREFIX + dbName + Symbols_1.Symbols.CONSTANT_SUFFIX + '.', '');
                    // Convert to an abstract db
                    absDB = dbConversor.convertFromNode(db, spec.basePath);
                    break;
                }
                let cmd;
                if (TypeChecking_1.isDefined(absDB)) {
                    cmd = this.sentenceToCommand(s, new AbstractTestScript_1.ATSDatabaseCommand(), [newScript]);
                    cmd.db = absDB;
                }
                else {
                    cmd = this.sentenceToCommand(s);
                }
                commands.push(cmd);
            }
        }
        return commands;
    }
}
exports.AbstractTestScriptGenerator = AbstractTestScriptGenerator;
