"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const NLPResult_1 = require("../nlp/NLPResult");
const Entities_1 = require("../nlp/Entities");
const Random_1 = require("../testdata/random/Random");
const RandomString_1 = require("../testdata/random/RandomString");
const RandomLong_1 = require("../testdata/random/RandomLong");
const UIElementPropertyExtractor_1 = require("../util/UIElementPropertyExtractor");
const DataTestCaseAnalyzer_1 = require("../testdata/DataTestCaseAnalyzer");
const DataGenerator_1 = require("../testdata/DataGenerator");
const DataGeneratorBuilder_1 = require("../testdata/DataGeneratorBuilder");
const CaseConversor_1 = require("../util/CaseConversor");
const Symbols_1 = require("../req/Symbols");
const NodeTypes_1 = require("../req/NodeTypes");
const RuntimeException_1 = require("../req/RuntimeException");
const TestPlan_1 = require("../testcase/TestPlan");
const UIElementValueGenerator_1 = require("../testdata/UIElementValueGenerator");
const TypeChecking_1 = require("../util/TypeChecking");
const EnglishKeywordDictionary_1 = require("../dict/EnglishKeywordDictionary");
const ReferenceReplacer_1 = require("../util/ReferenceReplacer");
const CaseType_1 = require("../app/CaseType");
const PreTestCase_1 = require("./PreTestCase");
const js_joda_1 = require("js-joda");
const ActionMap_1 = require("../util/ActionMap");
const Actions_1 = require("../util/Actions");
const ActionTargets_1 = require("../util/ActionTargets");
const UIElementNameHandler_1 = require("../util/UIElementNameHandler");
const LineChecker_1 = require("../req/LineChecker");
const path_1 = require("path");
const arrayDiff = require("arr-diff");
const deepcopy = require("deepcopy");
class GenContext {
    constructor(spec, doc, errors, warnings) {
        this.spec = spec;
        this.doc = doc;
        this.errors = errors;
        this.warnings = warnings;
    }
}
exports.GenContext = GenContext;
/**
 * Generates `PreTestCase`s.
 *
 * @author Thiago Delgado Pinto
 */
class PreTestCaseGenerator {
    constructor(_variantSentenceRec, langContentLoader, defaultLanguage, seed, uiLiteralCaseOption = CaseType_1.CaseType.CAMEL, minRandomStringSize = 0, maxRandomStringSize = 100, randomTriesToInvalidValues = 5) {
        this._variantSentenceRec = _variantSentenceRec;
        this.langContentLoader = langContentLoader;
        this.defaultLanguage = defaultLanguage;
        this.seed = seed;
        this.uiLiteralCaseOption = uiLiteralCaseOption;
        this.minRandomStringSize = minRandomStringSize;
        this.maxRandomStringSize = maxRandomStringSize;
        this.randomTriesToInvalidValues = randomTriesToInvalidValues;
        this._nlpUtil = new NLPResult_1.NLPUtil();
        this._uiePropExtractor = new UIElementPropertyExtractor_1.UIElementPropertyExtractor();
        this._lineChecker = new LineChecker_1.LineChecker();
        const random = new Random_1.Random(seed);
        this._randomString = new RandomString_1.RandomString(random);
        this._randomLong = new RandomLong_1.RandomLong(random);
        this._dtcAnalyzer = new DataTestCaseAnalyzer_1.DataTestCaseAnalyzer(seed);
        this._uieValueGen = new UIElementValueGenerator_1.UIElementValueGenerator(new DataGenerator_1.DataGenerator(new DataGeneratorBuilder_1.DataGeneratorBuilder(seed, randomTriesToInvalidValues, maxRandomStringSize)));
    }
    /**
     * Change steps and produce oracles, according to the given test plans.
     *
     * The process is the following:
     *
     * 1.   Replace CONSTANTs with their values.
     *
     * 2.   Whether a Step has a 'fill' action with UI Literals or UI Elements,
     *      it will be break into steps, so that each step has only a single
     *      UI Literal or UI Element.
     *
     * 3.   Every UI Literal with a 'fill' action will receive random values.
     *
     * 4.   Every UI Element WITHOUT a 'fill' action will be replaced by a UI Literal.
     *
     * 5.   Every UI Element with a 'fill' action will be replaced by a UI Literal and
     *      it will receive a value, according to the DataTestCase and its business
     *      rules (constraints).
     *
     * 6.   Oracles related to each UI Element will be extracted.
     *
     * 7.   Oracle steps will be submitted to steps 1..4 from process above.
     *
     *
     *
     * @param steps             Steps to use as basis, e.g., the steps of a TestScenario.
     *
     * @param ctx               Context
     *
     * @param testPlanMakers    Plan makers to apply. Each of them holds a `DataTestCaseMix`
     *                          and a `CombinationStrategy` to be applied to the steps.
     */
    generate(steps, ctx, testPlanMakers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!steps || steps.length < 1) {
                return [];
            }
            // Determine the language to use
            const language = this.docLanguage(ctx.doc);
            const langContent = this.langContentLoader.load(language);
            let clonedSteps = this.cloneSteps(steps);
            // # Replace CONSTANTS with VALUES
            this.replaceConstantsWithTheirValues(clonedSteps, language, ctx);
            // # Replace UI LITERALS without VALUES with VALUES
            let newSteps = this.fillUILiteralsWithoutValueInSteps(clonedSteps, language, langContent.keywords, ctx);
            // # Extract UI Elements to generate value
            //
            //  The extraction is from all UI Elements involved with the document.
            //  However, since the given steps may not include some UI Elements, we
            //  can only generate plans with INVALID values for those directly involved.
            //  That is, UI Elements not directly involved, i.e., not included in the steps,
            //  should always receive values, in order to make the VALUE GENERATION of other
            //  UI Elements to work properly.
            //
            //  Thus, the group of UI Elements not involved in the steps must always
            //  receive VALID values, while the involved ones may vary according to the
            //  desired mix strategy.
            //
            const stepUIElements = this.extractUIElementsFromSteps(newSteps, ctx);
            // NO UI ELEMENTS --> No values to generate and no oracles to add
            if (stepUIElements.length < 1) {
                let preTC = new PreTestCase_1.PreTestCase(new TestPlan_1.TestPlan(), newSteps, []);
                return [preTC];
            }
            const stepUIEVariables = stepUIElements.map(uie => uie.info ? uie.info.fullVariableName : uie.name);
            const allAvailableUIElements = ctx.spec.extractUIElementsFromDocumentAndImports(ctx.doc);
            const allAvailableVariables = allAvailableUIElements.map(uie => uie.info ? uie.info.fullVariableName : uie.name);
            const alwaysValidUIEVariables = arrayDiff(allAvailableVariables, stepUIEVariables); // order matters
            // # Analyze DataTestCases for every UI Element
            //   Non-editable UI Elements are not included
            //   { Full variable name => { DTC => { Result, Otherwise steps }} }
            let uieVariableToDTCMap = new Map();
            for (let uie of allAvailableUIElements) {
                let map = this._dtcAnalyzer.analyzeUIElement(uie, ctx.errors);
                uieVariableToDTCMap.set(uie.info.fullVariableName, map);
            }
            // console.log( 'doc', ctx.doc.fileInfo.path );
            // console.log( 'UIE', stepUIElements.map( uie => uie.name ) );
            // console.log( 'alwaysValid', alwaysValidUIEVariables );
            // console.log( uieVariableToDTCMap );
            // # Generate DataTestCases for the UI Elements, according to the goal and the combination strategy.
            //   Both are embedded in a TestPlanMaker.
            let allTestPlans = [];
            for (let maker of testPlanMakers) {
                let testPlans = maker.make(uieVariableToDTCMap, alwaysValidUIEVariables);
                // console.log( 'maker did these plans', testPlans );
                allTestPlans.push.apply(allTestPlans, testPlans);
            }
            // console.log( 'allTestPlans length', allTestPlans.length );
            // console.log( 'allTestPlans', allTestPlans );
            // # Generate values for all the UI Elements, according to the DataTestCase
            let all = [];
            for (let plan of allTestPlans) { // Each plan maps string => UIETestPlan
                // console.log( 'CURRENT plan', plan );
                let uieVariableToValueMap = new Map();
                let context = new UIElementValueGenerator_1.ValueGenContext(plan.dataTestCases, uieVariableToValueMap);
                for (let [uieVar, uieTestPlan] of plan.dataTestCases) {
                    // console.log( 'uieVar', uieVar, '\nuieTestPlan', uieTestPlan, "\n" );
                    let generatedValue;
                    try {
                        generatedValue = yield this._uieValueGen.generate(uieVar, context, ctx.doc, ctx.spec, ctx.errors);
                    }
                    catch (e) {
                        ctx.doc.fileErrors.push(e);
                        continue;
                    }
                    // console.log( 'GENERATED', generatedValue, '<'.repeat( 10 ) );
                    uieVariableToValueMap.set(uieVar, generatedValue);
                }
                // console.log( 'uieVariableToValueMap', uieVariableToValueMap );
                // Steps & Oracles
                let completeSteps = [], stepOracles = [];
                for (let step of newSteps) {
                    // Resulting oracles are also processed
                    let [resultingSteps, resultingOracles] = this.fillUIElementWithValueAndReplaceByUILiteralInStep(step, langContent, plan.dataTestCases, uieVariableToValueMap, language, ctx);
                    // console.log( 'ORACLES', '>'.repeat(10), resultingOracles );
                    completeSteps.push.apply(completeSteps, resultingSteps);
                    if (resultingOracles.length > 0) {
                        stepOracles.push.apply(stepOracles, resultingOracles);
                    }
                }
                this.normalizeOracleSentences(stepOracles, langContent.keywords);
                all.push(new PreTestCase_1.PreTestCase(plan, completeSteps, stepOracles));
            }
            // console.log( all.map( ptc => ptc.steps.map( s => s.content ) ) );
            return all;
        });
    }
    docLanguage(doc) {
        return !doc.language ? this.defaultLanguage : doc.language.value;
    }
    cloneSteps(steps) {
        // return deepcopy( steps );
        let newSteps = [];
        for (let step of steps) {
            newSteps.push(deepcopy(step));
        }
        return newSteps;
    }
    //
    // CONSTANTS
    //
    replaceConstantsWithTheirValues(steps, language, ctx) {
        const refReplacer = new ReferenceReplacer_1.ReferenceReplacer();
        // # Replace CONSTANTS with VALUES
        for (let step of steps) {
            if (!step.nlpResult) {
                // console.log( 'step without NLPResult', step.content );
                // Update NLP !
                this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
                // console.log( 'after', step.nlpResult );
            }
            let before = step.content;
            let [newContent, comment] = refReplacer.replaceConstantsWithTheirValues(step.content, step.nlpResult, ctx.spec);
            // Replace content
            step.content = newContent;
            // Add comment if non empty
            if (comment.length > 0) {
                step.comment = (step.comment || '') + ' ' + comment;
            }
            if (before != newContent) {
                // Update NLP !
                this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
            }
        }
    }
    //
    // UI LITERALS
    //
    fillUILiteralsWithoutValueInSteps(steps, language, keywords, ctx) {
        let newSteps = [];
        for (let step of steps || []) {
            // # Fill UI Literals with random values
            let resultingSteps = this.fillUILiteralsWithoutValueInSingleStep(step, keywords);
            if (resultingSteps.length > 1 || resultingSteps[0].content != step.content) {
                // Update NLP !
                this._variantSentenceRec.recognizeSentences(language, resultingSteps, ctx.errors, ctx.warnings);
            }
            // Add all resulting steps
            newSteps.push.apply(newSteps, resultingSteps);
        }
        return newSteps;
    }
    /**
     * Fill UI Literals without value with a random value. It generates one step for every UI Literal
     * or UI Element found. Only UI Literals receive value.
     *
     * @param step Step to analyze
     * @param keywords Keywords dictionary
     */
    fillUILiteralsWithoutValueInSingleStep(step, keywords) {
        const fillEntity = this.extractDataInputActionEntity(step);
        if (null === fillEntity || this.hasValue(step) || this.hasNumber(step)) {
            return [step];
        }
        let uiLiterals = this._nlpUtil.entitiesNamed(Entities_1.Entities.UI_LITERAL, step.nlpResult);
        const uiLiteralsCount = uiLiterals.length;
        if (uiLiteralsCount < 1) {
            return [step]; // nothing to do
        }
        let uiElements = this._nlpUtil.entitiesNamed(Entities_1.Entities.UI_ELEMENT, step.nlpResult);
        // Create a step with 'fill' step for every UI_LITERAL
        // console.log( step.nodeType, '<'.repeat( 20 ) );
        let nodeType = step.nodeType;
        let prefix = this.stepPrefixNodeType(nodeType, keywords);
        const prefixAnd = CaseConversor_1.upperFirst(!keywords.stepAnd ? 'And' : (keywords.stepAnd[0] || 'And'));
        const keywordI = !keywords.i ? 'I' : (keywords.i[0] || 'I');
        const keywordWith = !keywords.with ? 'with' : (keywords.with[0] || 'with');
        const keywordValid = !keywords.valid ? 'valid' : (keywords.valid[0] || 'valid');
        const keywordRandom = !keywords.random ? 'random' : (keywords.random[0] || 'random');
        let steps = [];
        let line = step.location.line, count = 0;
        let entities = [];
        if (uiElements.length > 0) {
            entities.push.apply(entities, uiLiterals);
            entities.push.apply(entities, uiElements);
            entities.sort((a, b) => a.position - b.position); // sort by position
        }
        else {
            entities = uiLiterals;
        }
        // Create a Step for every entity
        for (let entity of entities) {
            // Change to "AND" when more than one UI Literal is available
            if (count > 0) {
                nodeType = NodeTypes_1.NodeTypes.STEP_AND;
                prefix = prefixAnd;
            }
            let sentence = prefix + ' ' + keywordI + ' ' + fillEntity.string + ' ';
            let comment = null;
            if (Entities_1.Entities.UI_LITERAL === entity.entity) {
                sentence += Symbols_1.Symbols.UI_LITERAL_PREFIX + entity.value + Symbols_1.Symbols.UI_LITERAL_SUFFIX +
                    ' ' + keywordWith + ' ' +
                    Symbols_1.Symbols.VALUE_WRAPPER + this.randomString() + Symbols_1.Symbols.VALUE_WRAPPER;
                comment = ' ' + keywordValid + Symbols_1.Symbols.TITLE_SEPARATOR + ' ' + keywordRandom;
            }
            else {
                sentence += entity.string; // UI Element currently doesn't need prefix/sufix
            }
            let newStep = {
                nodeType: nodeType,
                content: sentence,
                comment: comment,
                location: {
                    // column: step.location.column,
                    column: this._lineChecker.countLeftSpacesAndTabs(sentence),
                    line: line++,
                    filePath: step.location.filePath
                },
                isInvalidValue: false
            };
            steps.push(newStep);
            ++count;
        }
        return steps;
    }
    //
    // UI ELEMENTS
    //
    extractUIElementsFromSteps(steps, ctx) {
        let all = [];
        const uieNames = this.extractUIElementNamesFromSteps(steps);
        let namesNotFound = [];
        for (let name of uieNames) {
            let uie = ctx.spec.uiElementByVariable(name, ctx.doc);
            if (!uie) {
                namesNotFound.push(name);
                continue;
            }
            all.push(uie);
        }
        if (namesNotFound.length > 0) {
            const msg = 'Referenced UI Elements not found: ' + namesNotFound.join(', ');
            const err = new RuntimeException_1.RuntimeException(msg);
            ctx.errors.push(err);
        }
        return all;
    }
    extractUIElementNamesFromSteps(steps) {
        let uniqueNames = new Set();
        for (let step of steps) {
            let entities = this._nlpUtil.entitiesNamed(Entities_1.Entities.UI_ELEMENT, step.nlpResult);
            for (let e of entities) {
                uniqueNames.add(e.value);
            }
        }
        return Array.from(uniqueNames);
    }
    replaceUIElementsWithUILiterals(steps, language, keywords, ctx, onlyFillSteps = true) {
        const refReplacer = new ReferenceReplacer_1.ReferenceReplacer();
        for (let step of steps) {
            if (onlyFillSteps) {
                // Ignore steps with 'fill' entity
                const fillEntity = this.extractDataInputActionEntity(step);
                if (TypeChecking_1.isDefined(fillEntity)) {
                    continue;
                }
            }
            // Recognize again to adjust positions entities positions
            // -> Needed because there is a conversion of AND steps in GIVEN to GIVEN and this changes the position
            this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
            let before = step.content;
            let [newContent, comment] = refReplacer.replaceUIElementsWithUILiterals(step.content, step.nlpResult, ctx.doc, ctx.spec, this.uiLiteralCaseOption);
            // Replace content
            step.content = newContent;
            // Add comment if non empty
            if (comment.length > 0) {
                step.comment = ' ' + comment + (step.comment || '');
            }
            // Add target types
            step.targetTypes = this.extractTargetTypes(step, ctx.doc, ctx.spec);
            if (before != newContent) {
                // console.log( 'BEFORE', before, "\nNEW   ", newContent);
                // Update NLP !
                this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
            }
        }
    }
    extractTargetTypes(step, doc, spec) {
        if (!step.nlpResult) {
            return [];
        }
        let action = step.action || null;
        let targetTypes = [];
        for (let e of step.nlpResult.entities || []) {
            switch (e.entity) {
                case Entities_1.Entities.UI_ACTION: {
                    if (null === action) {
                        action = e.value;
                    }
                    break;
                }
                case Entities_1.Entities.UI_ELEMENT: {
                    const uie = spec.uiElementByVariable(e.value, doc);
                    if (TypeChecking_1.isDefined(uie)) {
                        const uieType = this._uiePropExtractor.extractType(uie);
                        targetTypes.push(uieType);
                        break;
                    }
                    // continue as UI_LITERAL
                }
                case Entities_1.Entities.UI_LITERAL: {
                    if (TypeChecking_1.isDefined(action)) {
                        targetTypes.push(ActionMap_1.ACTION_TARGET_MAP.get(action) || ActionTargets_1.ActionTargets.NONE);
                    }
                    break;
                }
            }
        }
        return targetTypes;
    }
    fillUIElementWithValueAndReplaceByUILiteralInStep(step, langContent, uieVariableToUIETestPlanMap, uieVariableToValueMap, language, ctx) {
        const dataInputActionEntity = this.extractDataInputActionEntity(step);
        if (null === dataInputActionEntity || this.hasValue(step) || this.hasNumber(step)) {
            let steps = [step];
            this.replaceUIElementsWithUILiterals(steps, language, langContent.keywords, ctx, false);
            return [steps, []];
        }
        // Add target types
        step.targetTypes = this.extractTargetTypes(step, ctx.doc, ctx.spec);
        // Check UI Elements
        let uiElements = this._nlpUtil.entitiesNamed(Entities_1.Entities.UI_ELEMENT, step.nlpResult);
        const uiElementsCount = uiElements.length;
        if (uiElementsCount < 1) {
            return [[step], []]; // nothing to do
        }
        const keywords = langContent.keywords || new EnglishKeywordDictionary_1.EnglishKeywordDictionary();
        let nodeType = step.nodeType;
        let prefix = this.stepPrefixNodeType(nodeType, keywords);
        const prefixAnd = CaseConversor_1.upperFirst(!keywords ? 'And' : (keywords.stepAnd[0] || 'And'));
        const keywordI = !keywords.i ? 'I' : (keywords.i[0] || 'I');
        const keywordWith = !keywords.with ? 'with' : (keywords.with[0] || 'with');
        const keywordValid = !keywords.valid ? 'valid' : (keywords.valid[0] || 'valid');
        const keywordInvalid = !keywords.invalid ? 'invalid' : (keywords.invalid[0] || 'invalid');
        // const keywordRandom = ! keywords.random ? 'random' : ( keywords.random[ 0 ] || 'random' );
        const keywordFrom = !keywords.from ? 'from' : (keywords.from[0] || 'from');
        let steps = [], oracles = [], line = step.location.line, count = 0;
        // console.log( 'step', step.content );
        const uieNameHandler = new UIElementNameHandler_1.UIElementNameHandler();
        for (let entity of uiElements) {
            // Change to "AND" when more than one entity is available
            if (count > 0) {
                nodeType = NodeTypes_1.NodeTypes.STEP_AND;
                prefix = prefixAnd;
            }
            const uieName = entity.value;
            let [featureName, uieNameWithoutFeature] = uieNameHandler.extractNamesOf(uieName);
            let variable;
            let uie;
            if (TypeChecking_1.isDefined(featureName)) {
                variable = uieName;
                uie = ctx.spec.uiElementByVariable(uieName);
            }
            else {
                uie = ctx.spec.uiElementByVariable(uieName, ctx.doc);
                variable = !uie ? uieName : (!uie.info ? uieName : uie.info.fullVariableName);
            }
            let value = uieVariableToValueMap.get(variable);
            if (!TypeChecking_1.isDefined(value)) {
                const fileName = path_1.basename(ctx.doc.fileInfo.path);
                const locStr = '(' + step.location.line + ',' + step.location.column + ')';
                const msg = 'Could not retrieve a value from ' +
                    Symbols_1.Symbols.UI_ELEMENT_PREFIX + variable + Symbols_1.Symbols.UI_ELEMENT_SUFFIX +
                    ' in ' + fileName + ' ' + locStr + '. It will receive an empty value.';
                // console.log( uieVariableToValueMap );
                // console.log( variable, '<'.repeat( 10 ) );
                ctx.warnings.push(new RuntimeException_1.RuntimeException(msg));
                value = '';
            }
            let uieLiteral = TypeChecking_1.isDefined(uie) && TypeChecking_1.isDefined(uie.info) ? uie.info.uiLiteral : null;
            // console.log( 'uieName', uieName, 'uieLiteral', uieLiteral, 'variable', variable, 'doc', ctx.doc.fileInfo.path );
            if (null === uieLiteral) { // Should never happer since Spec defines Literals for mapped UI Elements
                uieLiteral = CaseConversor_1.convertCase(variable, this.uiLiteralCaseOption);
                const msg = 'Could not retrieve a literal from ' +
                    Symbols_1.Symbols.UI_ELEMENT_PREFIX + variable +
                    Symbols_1.Symbols.UI_ELEMENT_SUFFIX + '. Generating the identification "' + uieLiteral + '"';
                ctx.warnings.push(new RuntimeException_1.RuntimeException(msg, step.location));
            }
            // TODO: l10n / i18n
            let formattedValue = value;
            if (value instanceof js_joda_1.LocalTime) {
                formattedValue = value.format(js_joda_1.DateTimeFormatter.ofPattern('HH:mm')).toString();
            }
            else if (value instanceof js_joda_1.LocalDate) {
                formattedValue = value.format(js_joda_1.DateTimeFormatter.ofPattern('dd/MM/yyyy')).toString();
            }
            else if (value instanceof js_joda_1.LocalDateTime) {
                formattedValue = value.format(js_joda_1.DateTimeFormatter.ofPattern('dd/MM/yyyy HH:mm')).toString();
            }
            // Generate the sentence
            let sentence = prefix + ' ' + keywordI + ' ' + dataInputActionEntity.string + ' ' +
                Symbols_1.Symbols.UI_LITERAL_PREFIX + uieLiteral + Symbols_1.Symbols.UI_LITERAL_SUFFIX +
                ' ' + keywordWith + ' ' +
                ('number' === typeof formattedValue
                    ? formattedValue
                    : Symbols_1.Symbols.VALUE_WRAPPER + formattedValue + Symbols_1.Symbols.VALUE_WRAPPER);
            const uieTestPlan = uieVariableToUIETestPlanMap.get(variable) || null;
            let expectedResult, dtc;
            // console.log( 'uieTestPlan', uieTestPlan );
            // Evaluate the test plan and oracles
            if (null === uieTestPlan) { // not expected
                expectedResult = keywordValid;
                dtc = '??? (no test plan for variable ' + variable + ')';
            }
            else {
                if (DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID === uieTestPlan.result) {
                    expectedResult = keywordInvalid;
                    // Process ORACLES as steps
                    let oraclesClone = this.processOracles(uieTestPlan.otherwiseSteps, language, keywords, ctx);
                    // Add comments in them
                    for (let o of oraclesClone) {
                        o.comment = (o.comment || '') + ' ' + keywordFrom + ' ' +
                            Symbols_1.Symbols.UI_LITERAL_PREFIX + uieLiteral + Symbols_1.Symbols.UI_LITERAL_SUFFIX;
                    }
                    // Add oracles
                    oracles.push.apply(oracles, oraclesClone);
                }
                else {
                    expectedResult = keywordValid;
                }
                if (TypeChecking_1.isDefined(langContent.testCaseNames)) {
                    dtc = langContent.testCaseNames[uieTestPlan.dtc] || (uieTestPlan.dtc || '??? (no data test case)').toString();
                }
                else {
                    dtc = (uieTestPlan.dtc || '??? (no translation and data test case)').toString();
                }
            }
            // Make comment
            let comment = ' ' + expectedResult + Symbols_1.Symbols.TITLE_SEPARATOR + ' ' + dtc;
            if (uieNameWithoutFeature) {
                comment = ' ' + Symbols_1.Symbols.UI_ELEMENT_PREFIX + uieNameWithoutFeature + Symbols_1.Symbols.UI_ELEMENT_SUFFIX + ',' + comment;
            }
            // Make the step
            let newStep = {
                nodeType: nodeType,
                content: sentence,
                comment: (step.comment || '') + comment,
                location: {
                    column: step.location.column,
                    // column: this._lineChecker.countLeftSpacesAndTabs( sentence ),
                    line: line++,
                    filePath: step.location.filePath
                },
                isInvalidValue: (TypeChecking_1.isDefined(uieTestPlan) && uieTestPlan.result === DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID)
            };
            // Update NLP !
            this._variantSentenceRec.recognizeSentences(language, [newStep], ctx.errors, ctx.warnings);
            steps.push(newStep);
            ++count;
        }
        return [steps, oracles];
    }
    processOracles(steps, language, keywords, ctx) {
        if (steps.length < 1) {
            return steps;
        }
        let stepsClone = deepcopy(steps);
        // CONSTANTS
        this.replaceConstantsWithTheirValues(stepsClone, language, ctx);
        // UI LITERALS
        stepsClone = this.fillUILiteralsWithoutValueInSteps(stepsClone, language, keywords, ctx);
        // UI ELEMENTS
        this.replaceUIElementsWithUILiterals(stepsClone, language, keywords, ctx, true);
        // Note: Oracle steps cannot have 'fill' steps
        return stepsClone;
    }
    normalizeOracleSentences(steps, keywords) {
        if (steps.length < 1) {
            return;
        }
        const otherwiseKeywords = (!keywords.stepOtherwise || keywords.stepOtherwise.length < 1)
            ? ['otherwise'] : keywords.stepOtherwise;
        // const andKeywords = ( ! keywords.stepAnd || keywords.stepAnd.length < 1 )
        //     ? [ 'and' ] : keywords.stepAnd;
        const prefixAnd = this.stepPrefixNodeType(NodeTypes_1.NodeTypes.STEP_AND, keywords);
        const prefixThen = this.stepPrefixNodeType(NodeTypes_1.NodeTypes.STEP_THEN, keywords);
        // const keywordRandom = ! keywords.random ? 'random' : ( keywords.random[ 0 ] || 'random' );
        let oracles = [], line = steps[0].location.line, count = 0;
        for (let step of steps) {
            if (TypeChecking_1.isDefined(step.location)) {
                step.location.line = line;
            }
            if (step.nodeType === NodeTypes_1.NodeTypes.STEP_OTHERWISE) {
                let nodeType = NodeTypes_1.NodeTypes.STEP_AND;
                let prefix = prefixAnd;
                if (count <= 0) {
                    nodeType = NodeTypes_1.NodeTypes.STEP_THEN;
                    prefix = prefixThen;
                }
                // Change nodeType
                step.nodeType = nodeType;
                // Try to change the content with the new prefix
                let index = -1, start = -1;
                for (let keyword of otherwiseKeywords) {
                    index = step.content.toLowerCase().indexOf(keyword);
                    if (index >= 0) {
                        start = keyword.length;
                        if (start === step.content.indexOf(',')) {
                            ++start;
                        }
                        step.content = prefix + step.content.substr(start);
                        break;
                    }
                }
            }
            ++line;
            ++count;
        }
    }
    //
    // OTHER
    //
    extractDataInputActionEntity(step) {
        return step.nlpResult.entities
            .find(e => e.entity === Entities_1.Entities.UI_ACTION && this.isDataInputAction(e.value)) || null;
    }
    isDataInputAction(action) {
        return Actions_1.Actions.FILL === action ||
            Actions_1.Actions.SELECT === action ||
            Actions_1.Actions.APPEND === action ||
            Actions_1.Actions.ATTACH_FILE === action;
    }
    hasValue(step) {
        if (!step || !step.nlpResult) {
            return false;
        }
        return this._nlpUtil.hasEntityNamed(Entities_1.Entities.VALUE, step.nlpResult);
    }
    hasNumber(step) {
        if (!step || !step.nlpResult) {
            return false;
        }
        return this._nlpUtil.hasEntityNamed(Entities_1.Entities.NUMBER, step.nlpResult);
    }
    randomString() {
        return this._randomString.between(this.minRandomStringSize, this.maxRandomStringSize);
    }
    stepPrefixNodeType(nodeType, keywords) {
        let prefix;
        switch (nodeType) {
            case NodeTypes_1.NodeTypes.STEP_GIVEN:
                prefix = !keywords ? 'Given that' : (keywords.stepGiven[0] || 'Given that');
                break;
            case NodeTypes_1.NodeTypes.STEP_WHEN:
                prefix = !keywords ? 'When' : (keywords.stepWhen[0] || 'When');
                break;
            case NodeTypes_1.NodeTypes.STEP_THEN:
                prefix = !keywords ? 'Then' : (keywords.stepThen[0] || 'Then');
                break;
            case NodeTypes_1.NodeTypes.STEP_AND:
                prefix = !keywords ? 'And' : (keywords.stepAnd[0] || 'And');
                break;
            case NodeTypes_1.NodeTypes.STEP_OTHERWISE:
                prefix = !keywords ? 'Otherwise' : (keywords.stepOtherwise[0] || 'Otherwise');
                break;
            default:
                prefix = !nodeType ? '???' : nodeType.toString();
        }
        return CaseConversor_1.upperFirst(prefix);
    }
}
exports.PreTestCaseGenerator = PreTestCaseGenerator;
