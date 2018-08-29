import { NLPUtil, NLPEntity } from "../nlp/NLPResult";
import { Step } from "../ast/Step";
import { Location } from "../ast/Location";
import { Entities } from "../nlp/Entities";
import { Random } from "../testdata/random/Random";
import { RandomString } from "../testdata/random/RandomString";
import { RandomLong } from "../testdata/random/RandomLong";
import { UIElementPropertyExtractor } from "../util/UIElementPropertyExtractor";
import { DataTestCaseAnalyzer, DTCAnalysisResult } from "../testdata/DataTestCaseAnalyzer";
import { DataGenerator } from "../testdata/DataGenerator";
import { DataGeneratorBuilder } from "../testdata/DataGeneratorBuilder";
import { upperFirst, convertCase } from "../util/CaseConversor";
import { KeywordDictionary } from "../dict/KeywordDictionary";
import { Symbols } from "../req/Symbols";
import { NodeTypes } from "../req/NodeTypes";
import { Document } from "../ast/Document";
import { LanguageContentLoader } from "../dict/LanguageContentLoader";
import { UIElement, EntityValueType } from "../ast/UIElement";
import { Spec } from "../ast/Spec";
import { LocatedException } from "../req/LocatedException";
import { RuntimeException } from "../req/RuntimeException";
import { DataTestCase } from "../testdata/DataTestCase";
import { TestPlanMaker } from "../testcase/TestPlanMaker";
import { TestPlan } from "../testcase/TestPlan";
import { UIElementValueGenerator, ValueGenContext } from "../testdata/UIElementValueGenerator";
import { isDefined } from "../util/TypeChecking";
import { UIETestPlan } from "../testcase/UIETestPlan";
import { LanguageContent } from "../dict/LanguageContent";
import { EnglishKeywordDictionary } from "../dict/EnglishKeywordDictionary";
import { ReferenceReplacer } from "../util/ReferenceReplacer";
import { VariantSentenceRecognizer } from "../nlp/VariantSentenceRecognizer";
import { CaseType } from "../app/CaseType";
import { PreTestCase } from "./PreTestCase";
import { LocalTime, DateTimeFormatter, LocalDate, LocalDateTime } from "js-joda";
import { ACTION_TARGET_MAP } from "../util/ActionMap";
import { Actions } from "../util/Actions";
import { ActionTargets } from "../util/ActionTargets";
import { UIElementNameHandler } from "../util/UIElementNameHandler";
import { LineChecker } from "../req/LineChecker";
import { Pair } from "ts-pair";
import { basename } from "path";
import * as arrayDiff from 'arr-diff';
import * as deepcopy from 'deepcopy';

export class GenContext {
    constructor(
        public spec: Spec,
        public doc: Document,
        public errors: LocatedException[],
        public warnings: LocatedException[]
    ) {
    }
}

/**
 * Generates `PreTestCase`s.
 *
 * @author Thiago Delgado Pinto
 */
export class PreTestCaseGenerator {

    private readonly _nlpUtil = new NLPUtil();
    private readonly _uiePropExtractor = new UIElementPropertyExtractor();
    private readonly _lineChecker = new LineChecker();

    private readonly _randomString: RandomString;
    private readonly _randomLong: RandomLong;
    private readonly _dtcAnalyzer: DataTestCaseAnalyzer;
    private readonly _uieValueGen: UIElementValueGenerator;


    constructor(
        private readonly _variantSentenceRec: VariantSentenceRecognizer,
        public readonly langContentLoader: LanguageContentLoader,
        public readonly defaultLanguage: string,
        public readonly seed: string,
        public readonly uiLiteralCaseOption: CaseType = CaseType.CAMEL,
        public readonly minRandomStringSize = 0,
        public readonly maxRandomStringSize = 100,
        public readonly randomTriesToInvalidValues = 5
    ) {
        const random = new Random( seed );
        this._randomString = new RandomString( random );
        this._randomLong = new RandomLong( random );
        this._dtcAnalyzer = new DataTestCaseAnalyzer( seed );
        this._uieValueGen = new UIElementValueGenerator(
            new DataGenerator(
                new DataGeneratorBuilder( seed, randomTriesToInvalidValues, maxRandomStringSize )
            )
        );
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
    async generate(
        steps: Step[],
        ctx: GenContext,
        testPlanMakers: TestPlanMaker[]
    ): Promise< PreTestCase[] > {

        if ( ! steps || steps.length < 1 ) {
            return [];
        }

        // Determine the language to use
        const language = this.docLanguage( ctx.doc );
        const langContent = this.langContentLoader.load( language );

        let clonedSteps: Step[] = this.cloneSteps( steps );

        // # Replace CONSTANTS with VALUES
        this.replaceConstantsWithTheirValues( clonedSteps, language, ctx );

        // # Replace UI LITERALS without VALUES with VALUES
        let newSteps: Step[] = this.fillUILiteralsWithoutValueInSteps(
            clonedSteps, language, langContent.keywords, ctx
        );

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

        const stepUIElements: UIElement[] = this.extractUIElementsFromSteps( newSteps, ctx );

        // NO UI ELEMENTS --> No values to generate and no oracles to add
        if ( stepUIElements.length < 1 ) {
            let preTC = new PreTestCase( new TestPlan(), newSteps, [] );
            return [ preTC ];
        }

        const stepUIEVariables: string[] = stepUIElements.map( uie => uie.info ? uie.info.fullVariableName : uie.name );

        const allAvailableUIElements: UIElement[] = ctx.spec.extractUIElementsFromDocumentAndImports( ctx.doc );
        const allAvailableVariables: string[] = allAvailableUIElements.map( uie => uie.info ? uie.info.fullVariableName : uie.name );

        const alwaysValidUIEVariables: string[] = arrayDiff( allAvailableVariables, stepUIEVariables ); // order matters

        // # Analyze DataTestCases for every UI Element
        //   Non-editable UI Elements are not included
        //   { Full variable name => { DTC => { Result, Otherwise steps }} }
        let uieVariableToDTCMap = new Map< string, Map< DataTestCase, Pair< DTCAnalysisResult, Step[] > > >();
        for ( let uie of allAvailableUIElements ) {
            let map = this._dtcAnalyzer.analyzeUIElement( uie, ctx.errors );
            uieVariableToDTCMap.set( uie.info.fullVariableName, map );
        }
        // console.log( 'doc', ctx.doc.fileInfo.path );
        // console.log( 'UIE', stepUIElements.map( uie => uie.name ) );
        // console.log( 'alwaysValid', alwaysValidUIEVariables );
        // console.log( uieVariableToDTCMap );

        // # Generate DataTestCases for the UI Elements, according to the goal and the combination strategy.
        //   Both are embedded in a TestPlanMaker.
        let allTestPlans: TestPlan[] = [];
        for ( let maker of testPlanMakers ) {
            let testPlans = maker.make( uieVariableToDTCMap, alwaysValidUIEVariables );
            // console.log( 'maker did these plans', testPlans );
            allTestPlans.push.apply( allTestPlans, testPlans );
        }
        // console.log( 'allTestPlans length', allTestPlans.length );
        // console.log( 'allTestPlans', allTestPlans );

        // # Generate values for all the UI Elements, according to the DataTestCase
        let all: PreTestCase[] = [];
        for ( let plan of allTestPlans ) { // Each plan maps string => UIETestPlan

            // console.log( 'CURRENT plan', plan );

            let uieVariableToValueMap = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plan.dataTestCases, uieVariableToValueMap );

            for ( let [ uieVar, uieTestPlan ] of plan.dataTestCases ) {
                // console.log( 'uieVar', uieVar, '\nuieTestPlan', uieTestPlan, "\n" );
                let generatedValue = await this._uieValueGen.generate( uieVar, context, ctx.doc, ctx.spec, ctx.errors );
                // console.log( 'GENERATED', generatedValue, '<'.repeat( 10 ) );
                uieVariableToValueMap.set( uieVar, generatedValue );
            }
            // console.log( 'uieVariableToValueMap', uieVariableToValueMap );

            // Steps & Oracles

            let completeSteps: Step[] = [], stepOracles: Step[] = [];
            for ( let step of newSteps ) {

                // Resulting oracles are also processed
                let [ resultingSteps, resultingOracles ] = this.fillUIElementWithValueAndReplaceByUILiteralInStep(
                    step, langContent, plan.dataTestCases, uieVariableToValueMap, language, ctx );

                // console.log( 'ORACLES', '>'.repeat(10), resultingOracles );

                completeSteps.push.apply( completeSteps, resultingSteps );
                if ( resultingOracles.length > 0 ) {
                    stepOracles.push.apply( stepOracles, resultingOracles );
                }
            }

            this.normalizeOracleSentences( stepOracles, langContent.keywords );

            all.push( new PreTestCase( plan, completeSteps, stepOracles ) );
        }

        // console.log( all.map( ptc => ptc.steps.map( s => s.content ) ) );

        return all;
    }


    docLanguage( doc: Document ): string {
        return ! doc.language ? this.defaultLanguage : doc.language.value;
    }

    private cloneSteps( steps: Step[] ): Step[] {
        // return deepcopy( steps );
        let newSteps: Step[] = [];
        for ( let step of steps ) {
            newSteps.push( deepcopy( step ) as Step );
        }
        return newSteps;
    }


    //
    // CONSTANTS
    //

    replaceConstantsWithTheirValues(
        steps: Step[],
        language: string,
        ctx: GenContext
    ): void {
        const refReplacer = new ReferenceReplacer();

        // # Replace CONSTANTS with VALUES
        for ( let step of steps ) {

            if ( ! step.nlpResult ) {
                // console.log( 'step without NLPResult', step.content );
                // Update NLP !
                this._variantSentenceRec.recognizeSentences( language, [ step ], ctx.errors, ctx.warnings );
                // console.log( 'after', step.nlpResult );
            }

            let before = step.content;

            let [ newContent, comment ] = refReplacer.replaceConstantsWithTheirValues( step.content, step.nlpResult, ctx.spec );

            // Replace content
            step.content = newContent;
            // Add comment if non empty
            if ( comment.length > 0 ) {
                step.comment = ( step.comment || '' ) + ' ' + comment;
            }

            if ( before != newContent ) {
                // Update NLP !
                this._variantSentenceRec.recognizeSentences( language, [ step ], ctx.errors, ctx.warnings );
            }
        }
    }

    //
    // UI LITERALS
    //

    fillUILiteralsWithoutValueInSteps(
        steps: Step[],
        language: string,
        keywords: KeywordDictionary,
        ctx: GenContext
    ): Step[] {
        let newSteps: Step[] = [];
        for ( let step of steps || [] ) {

            // # Fill UI Literals with random values
            let resultingSteps = this.fillUILiteralsWithoutValueInSingleStep( step, keywords );

            if ( resultingSteps.length > 1 || resultingSteps[ 0 ].content != step.content ) {
                // Update NLP !
                this._variantSentenceRec.recognizeSentences( language, resultingSteps, ctx.errors, ctx.warnings );
            }

            // Add all resulting steps
            newSteps.push.apply( newSteps, resultingSteps );
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
    fillUILiteralsWithoutValueInSingleStep( step: Step, keywords: KeywordDictionary ): Step[] {

        const fillEntity = this.extractDataInputActionEntity( step );

        if ( null === fillEntity || this.hasValue( step ) || this.hasNumber( step ) ) {
            return [ step ];
        }

        let uiLiterals = this._nlpUtil.entitiesNamed( Entities.UI_LITERAL, step.nlpResult );
        const uiLiteralsCount = uiLiterals.length;
        if ( uiLiteralsCount < 1 ) {
            return [ step ]; // nothing to do
        }

        let uiElements = this._nlpUtil.entitiesNamed( Entities.UI_ELEMENT, step.nlpResult );

        // Create a step with 'fill' step for every UI_LITERAL

        // console.log( step.nodeType, '<'.repeat( 20 ) );
        let nodeType = step.nodeType;
        let prefix = this.stepPrefixNodeType( nodeType, keywords );

        const prefixAnd = upperFirst( ! keywords.stepAnd ? 'And' : ( keywords.stepAnd[ 0 ] || 'And' ) );
        const keywordI = ! keywords.i ? 'I' : ( keywords.i[ 0 ] || 'I' );
        const keywordWith = ! keywords.with ? 'with' : ( keywords.with[ 0 ] || 'with' );
        const keywordValid = ! keywords.valid ? 'valid' : ( keywords.valid[ 0 ] || 'valid' );
        const keywordRandom = ! keywords.random ? 'random' : ( keywords.random[ 0 ] || 'random' );

        let steps: Step[] = [];
        let line = step.location.line, count = 0;

        let entities: NLPEntity[] = [];
        if ( uiElements.length > 0 ) {
            entities.push.apply( entities, uiLiterals );
            entities.push.apply( entities, uiElements );
            entities.sort( ( a, b ) => a.position - b.position ); // sort by position
        } else {
            entities = uiLiterals;
        }

        // Create a Step for every entity
        for ( let entity of entities ) {

            // Change to "AND" when more than one UI Literal is available
            if ( count > 0 ) {
                nodeType = NodeTypes.STEP_AND;
                prefix = prefixAnd;
            }

            let sentence = prefix + ' ' + keywordI + ' ' + fillEntity.string + ' ';
            let comment = null;

            if ( Entities.UI_LITERAL === entity.entity ) {
                sentence += Symbols.UI_LITERAL_PREFIX + entity.value + Symbols.UI_LITERAL_SUFFIX +
                    ' ' + keywordWith + ' ' +
                    Symbols.VALUE_WRAPPER + this.randomString() + Symbols.VALUE_WRAPPER;

                comment = ' ' + keywordValid + Symbols.TITLE_SEPARATOR + ' ' + keywordRandom;
            } else {
                sentence += entity.string; // UI Element currently doesn't need prefix/sufix
            }

            let newStep = {
                nodeType: nodeType,
                content: sentence,
                comment: comment,
                location: {
                    // column: step.location.column,
                    column: this._lineChecker.countLeftSpacesAndTabs( sentence ),
                    line: line++,
                    filePath: step.location.filePath
                } as Location,

                isInvalidValue: false

            } as Step;

            steps.push( newStep );

            ++count;
        }

        return steps;
    }

    //
    // UI ELEMENTS
    //

    extractUIElementsFromSteps(
        steps: Step[],
        ctx: GenContext
    ): UIElement[] {
        let all: UIElement[] = [];
        const uieNames = this.extractUIElementNamesFromSteps( steps );
        const baseMsg = 'Referenced UI Element not found: ';
        for ( let name of uieNames ) {
            let uie = ctx.spec.uiElementByVariable( name, ctx.doc );
            if ( ! uie ) {
                ctx.errors.push( new RuntimeException( baseMsg + name ) );
                continue;
            }
            all.push( uie );
        }
        return all;
    }

    extractUIElementNamesFromSteps( steps: Step[] ): string[] {
        let uniqueNames = new Set< string >();
        for ( let step of steps ) {
            let entities: NLPEntity[] = this._nlpUtil.entitiesNamed( Entities.UI_ELEMENT, step.nlpResult );
            for ( let e of entities ) {
                uniqueNames.add( e.value );
            }
        }
        return Array.from( uniqueNames );
    }


    replaceUIElementsWithUILiterals(
        steps: Step[],
        language: string,
        keywords: KeywordDictionary,
        ctx: GenContext,
        onlyFillSteps: boolean = true
    ): void {
        const refReplacer = new ReferenceReplacer();

        for ( let step of steps ) {

            if ( onlyFillSteps ) {
                // Ignore steps with 'fill' entity
                const fillEntity = this.extractDataInputActionEntity( step );
                if ( isDefined( fillEntity ) ) {
                    continue;
                }
            }

            // Recognize again to adjust positions entities positions
            // -> Needed because there is a conversion of AND steps in GIVEN to GIVEN and this changes the position
            this._variantSentenceRec.recognizeSentences( language, [ step ], ctx.errors, ctx.warnings );

            let before = step.content;

            let [ newContent, comment ] = refReplacer.replaceUIElementsWithUILiterals(
                step.content, step.nlpResult, ctx.doc, ctx.spec, this.uiLiteralCaseOption );

            // Replace content
            step.content = newContent;
            // Add comment if non empty
            if ( comment.length > 0 ) {
                step.comment = ' ' + comment + ( step.comment || '' );
            }

            // Add target types
            step.targetTypes = this.extractTargetTypes( step, ctx.doc, ctx.spec );

            if ( before != newContent ) {
                // console.log( 'BEFORE', before, "\nNEW   ", newContent);
                // Update NLP !
                this._variantSentenceRec.recognizeSentences( language, [ step ], ctx.errors, ctx.warnings );
            }
        }
    }

    extractTargetTypes( step: Step, doc: Document, spec: Spec ): string[] {
        if ( ! step.nlpResult ) {
            return [];
        }
        let action = step.action || null;
        let targetTypes: string[] = [];
        for ( let e of step.nlpResult.entities || [] ) {
            switch ( e.entity ) {
                case Entities.UI_ACTION: {
                    if ( null === action ) {
                        action = e.value;
                    }
                    break;
                }
                case Entities.UI_ELEMENT: {
                    const uie = spec.uiElementByVariable( e.value, doc );
                    if ( isDefined( uie ) ) {
                        const uieType = this._uiePropExtractor.extractType( uie );
                        targetTypes.push( uieType );
                        break;
                    }
                    // continue as UI_LITERAL
                }
                case Entities.UI_LITERAL: {
                    if ( isDefined( action ) ) {
                        targetTypes.push(
                            ACTION_TARGET_MAP.get( action ) || ActionTargets.NONE
                        );
                    }
                    break;
                }
            }
        }
        return targetTypes;
    }


    fillUIElementWithValueAndReplaceByUILiteralInStep(
        step: Step,
        langContent: LanguageContent,
        uieVariableToUIETestPlanMap: Map< string, UIETestPlan >,
        uieVariableToValueMap: Map< string, EntityValueType >,
        language: string,
        ctx: GenContext
    ): [ Step[], Step[] ] {  // [ steps, oracles ]


        const dataInputActionEntity = this.extractDataInputActionEntity( step );
        if ( null === dataInputActionEntity || this.hasValue( step ) || this.hasNumber( step ) ) {

            let steps = [ step ];
            this.replaceUIElementsWithUILiterals( steps, language, langContent.keywords, ctx, false );

            return [ steps, [] ];
        }

        // Add target types
        step.targetTypes = this.extractTargetTypes( step, ctx.doc, ctx.spec );

        // Check UI Elements
        let uiElements = this._nlpUtil.entitiesNamed( Entities.UI_ELEMENT, step.nlpResult );
        const uiElementsCount = uiElements.length;
        if ( uiElementsCount < 1 ) {
            return [ [ step ], [] ]; // nothing to do
        }

        const keywords = langContent.keywords || new EnglishKeywordDictionary();

        let nodeType = step.nodeType;
        let prefix = this.stepPrefixNodeType( nodeType, keywords );

        const prefixAnd = upperFirst( ! keywords ? 'And' : ( keywords.stepAnd[ 0 ] || 'And' ) );
        const keywordI = ! keywords.i ? 'I' : ( keywords.i[ 0 ] || 'I' );
        const keywordWith = ! keywords.with ? 'with' : ( keywords.with[ 0 ] || 'with' );
        const keywordValid = ! keywords.valid ? 'valid' : ( keywords.valid[ 0 ] || 'valid' );
        const keywordInvalid = ! keywords.invalid ? 'invalid' : ( keywords.invalid[ 0 ] || 'invalid' );
        // const keywordRandom = ! keywords.random ? 'random' : ( keywords.random[ 0 ] || 'random' );
        const keywordFrom = ! keywords.from ? 'from' : ( keywords.from[ 0 ] || 'from' );

        let steps: Step[] = [],
            oracles: Step[] = [],
            line = step.location.line,
            count = 0;
        // console.log( 'step', step.content );

        const uieNameHandler = new UIElementNameHandler();

        for ( let entity of uiElements ) {

            // Change to "AND" when more than one entity is available
            if ( count > 0 ) {
                nodeType = NodeTypes.STEP_AND;
                prefix = prefixAnd;
            }

            const uieName = entity.value;

            let [ featureName, uieNameWithoutFeature ] = uieNameHandler.extractNamesOf( uieName );
            let variable: string;
            let uie;
            if ( isDefined( featureName ) ) {
                variable = uieName;
                uie = ctx.spec.uiElementByVariable( uieName );
            } else {
                uie = ctx.spec.uiElementByVariable( uieName, ctx.doc );
                variable = ! uie ? uieName : ( ! uie.info ? uieName : uie.info.fullVariableName );
            }

            let value = uieVariableToValueMap.get( variable );
            if ( ! isDefined( value ) ) {
                const fileName = basename( ctx.doc.fileInfo.path );
                const locStr = '(' + step.location.line + ',' + step.location.column + ')';
                const msg = 'Could not retrieve a value from ' +
                    Symbols.UI_ELEMENT_PREFIX + variable + Symbols.UI_ELEMENT_SUFFIX +
                    ' of ' + fileName + ' ' + locStr + '. It will receive an empty value.';
                // console.log( uieVariableToValueMap );
                // console.log( variable, '<'.repeat( 10 ) );
                ctx.warnings.push( new RuntimeException( msg ) );
                value = '';
            }

            let uieLiteral = isDefined( uie ) && isDefined( uie.info ) ? uie.info.uiLiteral : null;
            // console.log( 'uieName', uieName, 'uieLiteral', uieLiteral, 'variable', variable, 'doc', ctx.doc.fileInfo.path );

            if ( null === uieLiteral ) { // Should never happer since Spec defines Literals for mapped UI Elements
                uieLiteral = convertCase( variable, this.uiLiteralCaseOption );
                const msg = 'Could not retrieve a literal from ' +
                Symbols.UI_ELEMENT_PREFIX + variable + Symbols.UI_ELEMENT_SUFFIX +
                '. Generating one: "' + uieLiteral + '"';
                ctx.warnings.push( new RuntimeException( msg, step.location ) );
            }

            // TODO: l10n / i18n
            let formattedValue = value;
            if ( value instanceof LocalTime ) {
                formattedValue = value.format( DateTimeFormatter.ofPattern( 'HH:mm' ) ).toString();
            } else if ( value instanceof LocalDate ) {
                formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy' ) ).toString();
            } else if ( value instanceof LocalDateTime ) {
                formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy HH:mm' ) ).toString();
            }

            // Generate the sentence
            let sentence = prefix + ' ' + keywordI + ' ' + dataInputActionEntity.string + ' ' +
                Symbols.UI_LITERAL_PREFIX + uieLiteral + Symbols.UI_LITERAL_SUFFIX +
                ' ' + keywordWith + ' ' +
                ( 'number' === typeof formattedValue
                    ? formattedValue
                    : Symbols.VALUE_WRAPPER + formattedValue + Symbols.VALUE_WRAPPER );

            const uieTestPlan = uieVariableToUIETestPlanMap.get( variable ) || null;
            let expectedResult, dtc;

            // console.log( 'uieTestPlan', uieTestPlan );

            // Evaluate the test plan and oracles
            if ( null === uieTestPlan ) { // not expected
                expectedResult = keywordValid;
                dtc = '??? (no test plan for variable ' + variable + ')';
            } else {

                if ( DTCAnalysisResult.INVALID === uieTestPlan.result ) {
                    expectedResult = keywordInvalid;

                    // Process ORACLES as steps
                    let oraclesClone = this.processOracles(
                        uieTestPlan.otherwiseSteps, language, keywords, ctx );

                    // Add comments in them
                    for ( let o of oraclesClone ) {
                        o.comment = ( o.comment || '' ) + ' ' + keywordFrom + ' ' +
                            Symbols.UI_LITERAL_PREFIX + uieLiteral + Symbols.UI_LITERAL_SUFFIX;
                    }

                    // Add oracles
                    oracles.push.apply( oracles, oraclesClone );

                } else {
                    expectedResult = keywordValid;
                }

                if ( isDefined( langContent.testCaseNames ) ) {
                    dtc = langContent.testCaseNames[ uieTestPlan.dtc ] || ( uieTestPlan.dtc || '??? (no data test case)' ).toString();
                } else {
                    dtc = ( uieTestPlan.dtc || '??? (no translation and data test case)' ).toString();
                }
            }

            // Make comment
            let comment = ' ' + expectedResult + Symbols.TITLE_SEPARATOR + ' ' + dtc;
            if ( uieNameWithoutFeature ) {
                comment = ' ' + Symbols.UI_ELEMENT_PREFIX + uieNameWithoutFeature + Symbols.UI_ELEMENT_SUFFIX + ',' + comment;
            }

            // Make the step
            let newStep = {
                nodeType: nodeType,
                content: sentence,
                comment: ( step.comment || '' ) + comment,
                location: {
                    column: step.location.column,
                    // column: this._lineChecker.countLeftSpacesAndTabs( sentence ),
                    line: line++,
                    filePath: step.location.filePath
                } as Location,

                isInvalidValue: ( isDefined( uieTestPlan ) && uieTestPlan.result === DTCAnalysisResult.INVALID )

            } as Step;

            // Update NLP !
            this._variantSentenceRec.recognizeSentences( language, [ newStep ], ctx.errors, ctx.warnings );

            steps.push( newStep );

            ++count;
        }

        return [ steps, oracles ];
    }


    processOracles(
        steps: Step[],
        language: string,
        keywords: KeywordDictionary,
        ctx: GenContext
    ): Step[] {

        if ( steps.length < 1 ) {
            return steps;
        }

        let stepsClone = deepcopy( steps );

        // CONSTANTS

        this.replaceConstantsWithTheirValues(
            stepsClone, language, ctx );

        // UI LITERALS

        stepsClone = this.fillUILiteralsWithoutValueInSteps(
            stepsClone, language, keywords, ctx );

        // UI ELEMENTS

        this.replaceUIElementsWithUILiterals(
            stepsClone, language, keywords, ctx, true );

        // Note: Oracle steps cannot have 'fill' steps

        return stepsClone;
    }


    normalizeOracleSentences( steps: Step[], keywords: KeywordDictionary ): void {

        if ( steps.length < 1 ) {
            return;
        }

        const otherwiseKeywords = ( ! keywords.stepOtherwise || keywords.stepOtherwise.length < 1 )
            ? [ 'otherwise' ] : keywords.stepOtherwise;

        // const andKeywords = ( ! keywords.stepAnd || keywords.stepAnd.length < 1 )
        //     ? [ 'and' ] : keywords.stepAnd;

        const prefixAnd = this.stepPrefixNodeType( NodeTypes.STEP_AND, keywords );
        const prefixThen = this.stepPrefixNodeType( NodeTypes.STEP_THEN, keywords );

        // const keywordRandom = ! keywords.random ? 'random' : ( keywords.random[ 0 ] || 'random' );

        let oracles: Step[] = [],
            line = steps[ 0 ].location.line,
            count = 0;

        for ( let step of steps ) {

            if ( isDefined( step.location ) ) {
                step.location.line = line;
            }

            if ( step.nodeType === NodeTypes.STEP_OTHERWISE ) {

                let nodeType = NodeTypes.STEP_AND;
                let prefix = prefixAnd;

                if ( count <= 0 ) {
                    nodeType = NodeTypes.STEP_THEN;
                    prefix = prefixThen;
                }

                // Change nodeType
                step.nodeType = nodeType;

                // Try to change the content with the new prefix
                let index = -1, start = -1;
                for ( let keyword of otherwiseKeywords ) {
                    index = step.content.toLowerCase().indexOf( keyword );
                    if ( index >= 0 ) {
                        start = keyword.length;
                        if ( start === step.content.indexOf( ',' ) ) {
                            ++start;
                        }
                        step.content = prefix + step.content.substr( start );
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

    extractDataInputActionEntity( step: Step ): NLPEntity | null {
        return step.nlpResult.entities
            .find( e => e.entity === Entities.UI_ACTION && this.isDataInputAction( e.value ) ) || null;
    }

    isDataInputAction( action: string ): boolean {
        return Actions.FILL === action ||
            Actions.SELECT === action ||
            Actions.APPEND === action ||
            Actions.ATTACH_FILE === action;
    }

    hasValue( step: Step ): boolean {
        if ( ! step || ! step.nlpResult ) {
            return false;
        }
        return this._nlpUtil.hasEntityNamed( Entities.VALUE, step.nlpResult );
    }

    hasNumber( step: Step ): boolean {
        if ( ! step || ! step.nlpResult ) {
            return false;
        }
        return this._nlpUtil.hasEntityNamed( Entities.NUMBER, step.nlpResult );
    }

    randomString(): string {
        return this._randomString.between( this.minRandomStringSize, this.maxRandomStringSize );
    }


    stepPrefixNodeType( nodeType: NodeTypes, keywords: KeywordDictionary ): string {
        let prefix;
        switch ( nodeType ) {
            case NodeTypes.STEP_GIVEN:
                prefix = ! keywords ? 'Given that' : ( keywords.stepGiven[ 0 ] || 'Given that' );
                break;
            case NodeTypes.STEP_WHEN:
                prefix = ! keywords ? 'When' : ( keywords.stepWhen[ 0 ] || 'When' );
                break;
            case NodeTypes.STEP_THEN:
                prefix = ! keywords ? 'Then' : ( keywords.stepThen[ 0 ] || 'Then' );
                break;
            case NodeTypes.STEP_AND:
                prefix = ! keywords ? 'And' : ( keywords.stepAnd[ 0 ] || 'And' );
                break;
            case NodeTypes.STEP_OTHERWISE:
                prefix = ! keywords ? 'Otherwise' : ( keywords.stepOtherwise[ 0 ] || 'Otherwise' );
                break;
            default:
                prefix = ! nodeType ? '???' : nodeType.toString();
        }
        return upperFirst( prefix );
    }


}