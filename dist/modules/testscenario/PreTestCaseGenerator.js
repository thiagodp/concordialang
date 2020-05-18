"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const arrayDiff = require("arr-diff");
const deepcopy = require("deepcopy");
const enumUtil = require("enum-util");
const path_1 = require("path");
const CaseType_1 = require("../util/CaseType");
const ast_1 = require("../ast");
const error_1 = require("../error");
const EnglishKeywordDictionary_1 = require("../language/EnglishKeywordDictionary");
const nlp_1 = require("../nlp");
const SyntacticException_1 = require("../parser/SyntacticException");
const LineChecker_1 = require("../req/LineChecker");
const NodeTypes_1 = require("../req/NodeTypes");
const Symbols_1 = require("../req/Symbols");
const TestPlan_1 = require("../testcase/TestPlan");
const DataGenerator_1 = require("../testdata/DataGenerator");
const DataGeneratorBuilder_1 = require("../testdata/DataGeneratorBuilder");
const DataTestCaseAnalyzer_1 = require("../testdata/DataTestCaseAnalyzer");
const Random_1 = require("../testdata/random/Random");
const RandomString_1 = require("../testdata/random/RandomString");
const UIElementValueGenerator_1 = require("../testdata/UIElementValueGenerator");
const util_1 = require("../util");
const PreTestCase_1 = require("./PreTestCase");
const UIPropertyReferenceReplacer_1 = require("./UIPropertyReferenceReplacer");
const value_formatter_1 = require("./value-formatter");
class GenContext {
    constructor(spec, doc, errors, warnings) {
        this.spec = spec;
        this.doc = doc;
        this.errors = errors;
        this.warnings = warnings;
    }
}
exports.GenContext = GenContext;
var UIElementReplacementOption;
(function (UIElementReplacementOption) {
    UIElementReplacementOption[UIElementReplacementOption["ALL"] = 0] = "ALL";
    UIElementReplacementOption[UIElementReplacementOption["JUST_INPUT_ACTIONS"] = 1] = "JUST_INPUT_ACTIONS";
    UIElementReplacementOption[UIElementReplacementOption["NO_INPUT_ACTIONS"] = 2] = "NO_INPUT_ACTIONS";
})(UIElementReplacementOption || (UIElementReplacementOption = {}));
/**
 * Generates `PreTestCase`s.
 *
 * @author Thiago Delgado Pinto
 */
class PreTestCaseGenerator {
    constructor(_variantSentenceRec, langContentLoader, defaultLanguage, seed, uiLiteralCaseOption = CaseType_1.CaseType.CAMEL, minRandomStringSize = 0, maxRandomStringSize = 100, randomTriesToInvalidValues = 5, randomStringOptions = { escapeChars: true, avoidDatabaseChars: true }) {
        this._variantSentenceRec = _variantSentenceRec;
        this.langContentLoader = langContentLoader;
        this.defaultLanguage = defaultLanguage;
        this.seed = seed;
        this.uiLiteralCaseOption = uiLiteralCaseOption;
        this.minRandomStringSize = minRandomStringSize;
        this.maxRandomStringSize = maxRandomStringSize;
        this.randomTriesToInvalidValues = randomTriesToInvalidValues;
        this.randomStringOptions = randomStringOptions;
        this._nlpUtil = new nlp_1.NLPUtil();
        this._uiePropExtractor = new util_1.UIElementPropertyExtractor();
        this._lineChecker = new LineChecker_1.LineChecker();
        this._targetTypeUtil = new util_1.TargetTypeUtil();
        const random = new Random_1.Random(seed);
        this._randomString = new RandomString_1.RandomString(random, randomStringOptions);
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
            // console.log( '>>> input steps');
            // console.log( steps );
            if (!steps || steps.length < 1) {
                return [];
            }
            // Determine the language to use
            const language = this.docLanguage(ctx.doc);
            const langContent = this.langContentLoader.load(language);
            let clonedSteps = this.cloneSteps(steps);
            // # Replace CONSTANTS with VALUES
            this.replaceConstantsWithTheirValues(clonedSteps, language, ctx);
            // # Check UI Property References
            const referenceExtractor = new util_1.UIPropertyReferenceExtractor();
            for (let step of clonedSteps) {
                const references = referenceExtractor.extractReferences(step.nlpResult.entities, step.location.line);
                let languageIndependentReferences = this.checkUIPropertyReferences(references, langContent, ctx);
                if (!step.uiePropertyReferences) {
                    step.uiePropertyReferences = languageIndependentReferences;
                }
            }
            // # Replace UI LITERALS without VALUES with VALUES
            let newSteps = this.fillUILiteralsWithoutValueInSteps(clonedSteps, language, langContent.keywords, ctx);
            // # (NEW-2019-03-16) Replace UI ELEMENTS with VALUES by UI LITERALS
            // console.log( 'BEFORE' );
            // console.log( newSteps.map( ( e ) => e.content ) );
            for (let step of newSteps) {
                const inputDataActionEntity = this.extractDataInputActionEntity(step); // 'fill'-like entity
                if (util_1.isDefined(inputDataActionEntity) && (this.hasValue(step) || this.hasNumber(step))) {
                    this.replaceUIElementsWithUILiterals([step], language, langContent, ctx, UIElementReplacementOption.JUST_INPUT_ACTIONS);
                }
                // # (NEW-2019-06-19) Replace UI ELEMENTS without input actions and values by UI LITERALS
                else {
                    this.replaceUIElementsWithUILiterals([step], language, langContent, ctx, UIElementReplacementOption.NO_INPUT_ACTIONS);
                }
            }
            // console.log( 'AFTER' );
            // console.log( newSteps.map( ( e ) => e.content ) );
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
            // ALL UI ELEMENTS WITH FIXED VALUES --> No values to generate and no oracles to add
            // ---
            // let uiElementsWithValue: number = 0;
            // let uiElementsWithFillEntity: number = 0;
            // for ( let step of newSteps ) {
            //     const hasUIE: boolean = !! step.nlpResult.entities.find( e => e.entity === Entities.UI_ELEMENT );
            //     const hasValue: boolean = ( step.values || [] ).length > 0;
            //     if ( hasUIE && hasValue ) {
            //         ++uiElementsWithValue;
            //     }
            //     const dataInputActionEntity = this.extractDataInputActionEntity( step );
            //     if ( isDefined( dataInputActionEntity ) ) {
            //         ++uiElementsWithFillEntity;
            //     }
            // }
            // if ( uiElementsWithValue >= uiElementsWithFillEntity ) {
            //     this.replaceUIElementsWithUILiterals( newSteps, language, ctx, UIElementReplacementOption.JUST_INPUT_ACTIONS );
            //     let preTC = new PreTestCase( new TestPlan(), newSteps, [] );
            //     return [ preTC ];
            // }
            // ---
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
                for (let [uieVar,] of plan.dataTestCases) {
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
                let filledSteps = [];
                let filledOtherwiseSteps = [];
                let filledCorrespondingOtherwiseSteps = [];
                for (let step of newSteps) {
                    // Resulting otherwiseSteps are also processed
                    let [resultingSteps, correspondingOtherwiseSteps] = this.fillUIElementWithValueAndReplaceByUILiteralInStep(step, langContent, plan.dataTestCases, uieVariableToValueMap, language, ctx);
                    // console.log( 'ORACLES', '>'.repeat(10), resultingOracles );
                    filledSteps.push.apply(filledSteps, resultingSteps);
                    if (correspondingOtherwiseSteps.length > 0) {
                        let allOracles = [];
                        for (let c of correspondingOtherwiseSteps) {
                            allOracles.push.apply(allOracles, c.otherwiseSteps);
                        }
                        filledOtherwiseSteps.push.apply(filledOtherwiseSteps, allOracles);
                        filledCorrespondingOtherwiseSteps.push.apply(filledCorrespondingOtherwiseSteps, correspondingOtherwiseSteps);
                    }
                }
                this.normalizeOracleSentences(filledOtherwiseSteps, langContent.keywords);
                // # (2019-07-13)
                this.replaceUIPropertyReferencesInsideValues(filledSteps, filledOtherwiseSteps, uieVariableToValueMap, language, langContent, ctx);
                // ---
                all.push(new PreTestCase_1.PreTestCase(plan, filledSteps, filledOtherwiseSteps, filledCorrespondingOtherwiseSteps));
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
        const refReplacer = new util_1.ReferenceReplacer();
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
        const inputDataActionEntity = this.extractDataInputActionEntity(step); // 'fill'-like entity
        if (null === inputDataActionEntity
            || this.hasValue(step)
            || this.hasNumber(step)
            || this.hasUIPropertyReference(step)) {
            return [step];
        }
        let uiLiterals = this._nlpUtil.entitiesNamed(nlp_1.Entities.UI_LITERAL, step.nlpResult);
        const uiLiteralsCount = uiLiterals.length;
        if (uiLiteralsCount < 1) {
            return [step]; // nothing to do
        }
        let uiElements = this._nlpUtil.entitiesNamed(nlp_1.Entities.UI_ELEMENT_REF, step.nlpResult);
        // Create a step with 'fill' step for every UI_LITERAL
        // console.log( step.nodeType, '<'.repeat( 20 ) );
        let nodeType = step.nodeType;
        let prefix = this.stepPrefixNodeType(nodeType, keywords);
        const prefixAnd = util_1.upperFirst(!keywords.stepAnd ? 'And' : (keywords.stepAnd[0] || 'And'));
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
            let sentence = prefix + ' ' + keywordI + ' ' + inputDataActionEntity.string + ' ';
            let comment = null;
            if (nlp_1.Entities.UI_LITERAL === entity.entity) {
                sentence += Symbols_1.Symbols.UI_LITERAL_PREFIX + entity.value + Symbols_1.Symbols.UI_LITERAL_SUFFIX +
                    ' ' + keywordWith + ' ' +
                    Symbols_1.Symbols.VALUE_WRAPPER + this.randomString() + Symbols_1.Symbols.VALUE_WRAPPER;
                comment = ' ' + keywordValid + Symbols_1.Symbols.TITLE_SEPARATOR + ' ' + keywordRandom;
            }
            else {
                sentence += entity.string; // UI Element currently doesn't need prefix/suffix
            }
            let newStep = deepcopy(step);
            newStep.nodeType = nodeType;
            newStep.content = sentence;
            newStep.comment = comment;
            newStep.location = {
                // column: step.location.column,
                column: this._lineChecker.countLeftSpacesAndTabs(sentence),
                line: line++,
                filePath: step.location.filePath
            };
            newStep.isInvalidValue = false;
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
            const err = new error_1.RuntimeException(msg);
            ctx.errors.push(err);
        }
        return all;
    }
    extractUIElementNamesFromSteps(steps) {
        let uniqueNames = new Set();
        for (let step of steps) {
            let entities = this._nlpUtil.entitiesNamed(nlp_1.Entities.UI_ELEMENT_REF, step.nlpResult);
            for (let e of entities) {
                uniqueNames.add(e.value);
            }
        }
        return Array.from(uniqueNames);
    }
    replaceUIElementsWithUILiterals(steps, language, langContent, ctx, option) {
        const refReplacer = new util_1.ReferenceReplacer();
        for (let step of steps) {
            let dataInputActionEntity = this.extractDataInputActionEntity(step);
            let hasInputAction = util_1.isDefined(dataInputActionEntity);
            if (UIElementReplacementOption.ALL !== option) {
                // Ignore steps with an input data action - i.e., 'fill' like steps
                if (hasInputAction && UIElementReplacementOption.NO_INPUT_ACTIONS === option
                    || !hasInputAction && UIElementReplacementOption.JUST_INPUT_ACTIONS === option) {
                    continue;
                }
            }
            // Recognize again to adjust positions entities positions
            // -> Needed because there is a conversion of AND steps in GIVEN to GIVEN and this changes the position
            this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
            let before = step.content;
            // Add target types
            step.targetTypes = this._targetTypeUtil.extractTargetTypes(step, ctx.doc, ctx.spec, this._uiePropExtractor);
            let [newContent, comment] = refReplacer.replaceUIElementsWithUILiterals(step, hasInputAction, ctx.doc, ctx.spec, langContent, this.uiLiteralCaseOption);
            // Replace content
            step.content = newContent;
            // Add comment if non empty
            if (comment.length > 0) {
                step.comment = ' ' + comment + (step.comment || '');
            }
            if (before != newContent) {
                // console.log( 'BEFORE', before, "\nNEW   ", newContent);
                // Update NLP !
                this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
            }
        }
    }
    fillUIElementWithValueAndReplaceByUILiteralInStep(inputStep, langContent, uieVariableToUIETestPlanMap, uieVariableToValueMap, language, ctx) {
        let step = deepcopy(inputStep);
        if (this.hasUIPropertyReference(step)) {
            const uipRefReplacer = new UIPropertyReferenceReplacer_1.UIPropertyReferenceReplacer();
            step.content = uipRefReplacer.replaceUIPropertyReferencesByTheirValue(language, step, step.content, step.uiePropertyReferences, uieVariableToValueMap, ctx);
            // Update NLP !
            this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
        }
        const dataInputActionEntity = this.extractDataInputActionEntity(step);
        if (null === dataInputActionEntity || this.hasValue(step) || this.hasNumber(step)) {
            let steps = [step];
            this.replaceUIElementsWithUILiterals(steps, language, langContent, ctx, UIElementReplacementOption.ALL);
            // console.log( "EXIT 1" );
            return [steps, []];
        }
        // Add target types
        step.targetTypes = this._targetTypeUtil.extractTargetTypes(step, ctx.doc, ctx.spec, this._uiePropExtractor);
        // Check for UIE entities
        let uieEntities = this._nlpUtil.entitiesNamed(nlp_1.Entities.UI_ELEMENT_REF, step.nlpResult);
        if (uieEntities.length < 1) {
            // console.log( "EXIT 2" );
            return [[step], []]; // nothing to do
        }
        const keywords = langContent.keywords || new EnglishKeywordDictionary_1.EnglishKeywordDictionary();
        let nodeType = step.nodeType;
        let prefix = this.stepPrefixNodeType(nodeType, keywords);
        const prefixAnd = util_1.upperFirst(!keywords ? 'And' : (keywords.stepAnd[0] || 'And'));
        const keywordI = !keywords.i ? 'I' : (keywords.i[0] || 'I');
        const keywordWith = !keywords.with ? 'with' : (keywords.with[0] || 'with');
        const keywordValid = !keywords.valid ? 'valid' : (keywords.valid[0] || 'valid');
        const keywordInvalid = !keywords.invalid ? 'invalid' : (keywords.invalid[0] || 'invalid');
        // const keywordRandom = ! keywords.random ? 'random' : ( keywords.random[ 0 ] || 'random' );
        const keywordFrom = !keywords.from ? 'from' : (keywords.from[0] || 'from');
        let steps = [];
        let oracles = [];
        let line = step.location.line;
        let count = 0;
        // console.log( 'step', step.content );
        const uieNameHandler = new util_1.UIElementNameHandler();
        for (let entity of uieEntities) {
            // Change to "AND" when more than one entity is available
            if (count > 0) {
                nodeType = NodeTypes_1.NodeTypes.STEP_AND;
                prefix = prefixAnd;
            }
            const uieName = entity.value;
            let [featureName, uieNameWithoutFeature] = uieNameHandler.extractNamesOf(uieName);
            let variable;
            let uie;
            if (util_1.isDefined(featureName)) {
                variable = uieName;
                uie = ctx.spec.uiElementByVariable(uieName);
            }
            else {
                uie = ctx.spec.uiElementByVariable(uieName, ctx.doc);
                variable = !uie ? uieName : (!uie.info ? uieName : uie.info.fullVariableName);
            }
            let value = uieVariableToValueMap.get(variable);
            if (!util_1.isDefined(value)) {
                const fileName = path_1.basename(ctx.doc.fileInfo.path);
                const locStr = '(' + step.location.line + ',' + step.location.column + ')';
                const msg = 'Could not retrieve a value from ' +
                    Symbols_1.Symbols.UI_ELEMENT_PREFIX + variable + Symbols_1.Symbols.UI_ELEMENT_SUFFIX +
                    ' in ' + fileName + ' ' + locStr + '. It will receive an empty value.';
                // console.log( uieVariableToValueMap );
                // console.log( variable, '<'.repeat( 10 ) );
                ctx.warnings.push(new error_1.RuntimeException(msg));
                value = '';
            }
            let uieLiteral = util_1.isDefined(uie) && util_1.isDefined(uie.info) ? uie.info.uiLiteral : null;
            // console.log( 'uieName', uieName, 'uieLiteral', uieLiteral, 'variable', variable, 'doc', ctx.doc.fileInfo.path );
            if (null === uieLiteral) { // Should never happen since Spec defines Literals for mapped UI Elements
                uieLiteral = util_1.convertCase(variable, this.uiLiteralCaseOption);
                const msg = 'Could not retrieve a literal from ' +
                    Symbols_1.Symbols.UI_ELEMENT_PREFIX + variable +
                    Symbols_1.Symbols.UI_ELEMENT_SUFFIX + '. Generating the identification "' + uieLiteral + '"';
                ctx.warnings.push(new error_1.RuntimeException(msg, step.location));
            }
            // Analyze whether it is an input target type
            let targetType = '';
            if (!dataInputActionEntity) {
                targetType = this._targetTypeUtil.analyzeInputTargetTypes(step, langContent) + ' ';
            }
            const formattedValue = value_formatter_1.formatValueToUseInASentence(language, value);
            // Generate the sentence
            let sentence = prefix + ' ' + keywordI + ' ' + dataInputActionEntity.string + ' ' +
                targetType +
                Symbols_1.Symbols.UI_LITERAL_PREFIX + uieLiteral + Symbols_1.Symbols.UI_LITERAL_SUFFIX +
                ' ' + keywordWith + ' ' + formattedValue;
            // if ( targetType != '' ) {
            //     console.log( sentence );
            // }
            const uieTestPlan = uieVariableToUIETestPlanMap.get(variable) || null;
            let expectedResult, dtc;
            let oraclesToAdd = [];
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
                    let oraclesClone = this.processOracles(uieTestPlan.otherwiseSteps, language, langContent, keywords, ctx);
                    // Add comments in them
                    for (let o of oraclesClone) {
                        o.comment = (o.comment || '') + ' ' + keywordFrom + ' ' +
                            Symbols_1.Symbols.UI_LITERAL_PREFIX + uieLiteral + Symbols_1.Symbols.UI_LITERAL_SUFFIX;
                    }
                    // Add oracles
                    // oracles.push.apply( oracles, oraclesClone );
                    oraclesToAdd = oraclesClone; // Save to add later
                }
                else {
                    expectedResult = keywordValid;
                }
                if (util_1.isDefined(langContent.testCaseNames)) {
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
            let newStep = step;
            newStep.nodeType = nodeType;
            newStep.content = sentence;
            newStep.comment = (step.comment || '') + comment;
            newStep.location = {
                column: step.location.column,
                // column: this._lineChecker.countLeftSpacesAndTabs( sentence ),
                line: line++,
                filePath: step.location.filePath
            };
            newStep.isInvalidValue = (util_1.isDefined(uieTestPlan) && uieTestPlan.result === DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID);
            // console.log( newStep );
            // let newStep = {
            //     nodeType: nodeType,
            //     content: sentence,
            //     comment: ( step.comment || '' ) + comment,
            //     location: {
            //         column: step.location.column,
            //         // column: this._lineChecker.countLeftSpacesAndTabs( sentence ),
            //         line: line++,
            //         filePath: step.location.filePath
            //     } as Location,
            //     isInvalidValue: ( isDefined( uieTestPlan ) && uieTestPlan.result === DTCAnalysisResult.INVALID )
            // } as Step;
            // Update NLP !
            this._variantSentenceRec.recognizeSentences(language, [newStep], ctx.errors, ctx.warnings);
            steps.push(newStep);
            if (oraclesToAdd.length > 0) {
                oracles.push({ step: newStep, otherwiseSteps: oraclesToAdd });
            }
            ++count;
        }
        return [steps, oracles];
    }
    processOracles(steps, language, langContent, keywords, ctx) {
        if (steps.length < 1) {
            return steps;
        }
        let stepsClone = deepcopy(steps);
        // CONSTANTS
        this.replaceConstantsWithTheirValues(stepsClone, language, ctx);
        // UI LITERALS
        stepsClone = this.fillUILiteralsWithoutValueInSteps(stepsClone, language, keywords, ctx);
        // UI ELEMENTS
        this.replaceUIElementsWithUILiterals(stepsClone, language, langContent, ctx, UIElementReplacementOption.ALL);
        // Note: Oracle steps cannot have 'fill' steps
        return stepsClone;
    }
    /**
     * Transforms Otherwise steps into Then steps.
     *
     * @param steps Oracle steps.
     * @param keywords Keywords.
     */
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
        let line = steps[0].location.line;
        let count = 0;
        for (let step of steps) {
            if (util_1.isDefined(step.location)) {
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
    /**
     * Replace UIE property references inside values.
     *
     * @param steps Steps.
     * @param oracles Oracles.
     * @param uieVariableToValueMap Value map.
     * @param language Language.
     */
    replaceUIPropertyReferencesInsideValues(steps, oracles, uieVariableToValueMap, language, langContent, ctx) {
        for (let step of steps) {
            this.replaceUIPropertyReferencesInsideValuesOfStep(step, uieVariableToValueMap, language, langContent, ctx);
        }
        for (let step of oracles) {
            this.replaceUIPropertyReferencesInsideValuesOfStep(step, uieVariableToValueMap, language, langContent, ctx);
        }
    }
    replaceUIPropertyReferencesInsideValuesOfStep(step, uieVariableToValueMap, language, langContent, ctx) {
        const extractor = new util_1.UIPropertyReferenceExtractor();
        const replacer = new UIPropertyReferenceReplacer_1.UIPropertyReferenceReplacer();
        const valueEntities = this._nlpUtil.entitiesNamed(nlp_1.Entities.VALUE, step.nlpResult);
        const contentBefore = step.content;
        // For all the values in the step
        for (let entity of valueEntities) {
            const before = entity.value; // Assumes that it is a language-independent value (!)
            const references = extractor.extractReferencesFromValue(before, step.location.line);
            this.checkUIPropertyReferences(references, langContent, ctx); // Also transforms into language-independent format
            const after = replacer.replaceUIPropertyReferencesByTheirValue(language, step, before, references, uieVariableToValueMap, ctx, true);
            if (after == before) {
                continue;
            }
            // Change the value of the step
            step.content = step.content.replace(Symbols_1.Symbols.VALUE_WRAPPER + before + Symbols_1.Symbols.VALUE_WRAPPER, Symbols_1.Symbols.VALUE_WRAPPER + after + Symbols_1.Symbols.VALUE_WRAPPER);
        }
        // Updates NLP if needed
        if (contentBefore != step.content) {
            this._variantSentenceRec.recognizeSentences(language, [step], ctx.errors, ctx.warnings);
        }
    }
    //
    // UI PROPERTY REFERENCES
    //
    /**
     * Returns `true` if the given step has a UIE property reference, or false otherwise.
     *
     * @param step Step
     */
    hasUIPropertyReference(step) {
        if (!step || !step.nlpResult) {
            return false;
        }
        return this._nlpUtil.hasEntityNamed(nlp_1.Entities.UI_PROPERTY_REF, step.nlpResult);
    }
    /**
     * Checks whether the given UIE property references are correct and supported.
     * Errors or warning are added to the generation context.
     *
     * @param references References to check.
     * @param langContent Language content.
     * @param ctx Generation context.
     */
    checkUIPropertyReferences(references, langContent, ctx) {
        let languageIndependentReferences = [];
        for (let uipRef of references) {
            if (uipRef.location && !uipRef.location.filePath) {
                uipRef.location.filePath = ctx.doc.fileInfo.path;
            }
            this.transformLanguageDependentIntoLanguageIndependent(uipRef, langContent);
            if (!this.hasLanguageIndependentProperty(uipRef)) {
                const msg = 'Incorrect reference to a UI Element property: ' + uipRef.content;
                const e = new SyntacticException_1.SyntacticException(msg, uipRef.location);
                ctx.errors.push(e);
                continue;
            }
            else {
                languageIndependentReferences.push(uipRef);
            }
            // CURRENTLY, only the property `value` is supported <<<
            if (!this.isUIPropertyReferenceToValue(uipRef, langContent)) {
                const msg = 'Unsupported reference to a UI Element property: ' + uipRef.content;
                const e = new error_1.Warning(msg, uipRef.location);
                ctx.warnings.push(e);
            }
        }
        return languageIndependentReferences;
    }
    /**
     * Adjusts the given UIE property reference' property to have a language-independent property.
     *
     * @param uipRef UIE property reference.
     * @param langContent Language content.
     */
    transformLanguageDependentIntoLanguageIndependent(uipRef, langContent) {
        // TO-DO: refactor magic values
        const langUIProperties = ((langContent.nlp["ui"] || {})["ui_property"] || {});
        const uipRefProp = uipRef.property.toLowerCase();
        for (let prop in langUIProperties) {
            const propValues = langUIProperties[prop] || [];
            if (uipRefProp == prop || propValues.indexOf(uipRefProp) >= 0) {
                uipRef.property = prop;
            }
        }
    }
    /**
     * Returns `true` if the given UIE property reference is language-independent property, or `false` otherwise.
     *
     * @param uipRef UIE property reference.
     */
    hasLanguageIndependentProperty(uipRef) {
        const values = enumUtil.getValues(ast_1.UIPropertyTypes);
        return values.indexOf(uipRef.property.toLowerCase()) >= 0;
    }
    /**
     * Returns `true` if the given UIE property reference is a value property, or `false` otherwise.
     *
     * @param uipRef UIE property reference.
     * @param langContent Language content.
     */
    isUIPropertyReferenceToValue(uipRef, langContent) {
        const VALUE = 'value';
        // TO-DO: refactor magic values
        const valuesOfThePropertyValue = ((langContent.nlp["ui"] || {})["ui_property"] || {})[VALUE] || {};
        const uipRefProp = uipRef.property.toLowerCase();
        return VALUE === uipRefProp || valuesOfThePropertyValue.indexOf(uipRefProp) >= 0;
    }
    //
    // OTHER
    //
    extractDataInputActionEntity(step) {
        return step.nlpResult.entities
            .find(e => e.entity === nlp_1.Entities.UI_ACTION && this.isDataInputAction(e.value)) || null;
    }
    isDataInputAction(action) {
        return util_1.Actions.FILL === action ||
            util_1.Actions.SELECT === action ||
            util_1.Actions.APPEND === action ||
            util_1.Actions.ATTACH_FILE === action;
    }
    hasValue(step) {
        if (!step || !step.nlpResult) {
            return false;
        }
        return this._nlpUtil.hasEntityNamed(nlp_1.Entities.VALUE, step.nlpResult);
    }
    hasNumber(step) {
        if (!step || !step.nlpResult) {
            return false;
        }
        return this._nlpUtil.hasEntityNamed(nlp_1.Entities.NUMBER, step.nlpResult);
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
        return util_1.upperFirst(prefix);
    }
}
exports.PreTestCaseGenerator = PreTestCaseGenerator;
