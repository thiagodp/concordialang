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
import { Pair } from "ts-pair";
import { TestPlanMaker } from "../testcase/TestPlanMaker";
import { TestPlan } from "../testcase/TestPlan";
import { UIElementValueGenerator, ValueGenContext } from "../testdata/UIElementValueGenerator";
import { isDefined } from "../util/TypeChecking";
import { UIETestPlan } from "../testcase/UIETestPlan";
import { LanguageContent } from "../dict/LanguageContent";
import { EnglishKeywordDictionary } from "../dict/EnglishKeywordDictionary";
import * as arrayDiff from 'arr-diff';
import * as deepcopy from 'deepcopy';
import { ReferenceReplacer } from "../util/ReferenceReplacer";
import { VariantSentenceRecognizer } from "../nlp/VariantSentenceRecognizer";
import { Keywords } from "../req/Keywords";
import { CaseType } from "../app/CaseType";

    // /** Test cases produced from the Variant */
    // testCases: TestCase[];

    // /**
    //  * Maps a postcondition to previously generated test cases.
    //  * It makes easier to locate test cases that produces a certain postcondition.
    //  */
    // postconditionToTestCasesMap: Map< State, TestCase[] >;


// Fill UI Literals with random values
// Extract UI Elements to generate value
// Analyze DataTestCases for every UI Element
// Generate values for UI Element according to the goal


class GenContext {
    constructor(
        public doc: Document,
        public spec: Spec,
        public errors: LocatedException[],
        public warnings: LocatedException[]
    ) {
    }
}

export class GenUtil {

    public validKeyword: string = 'valid'; //       TODO: i18n
    public invalidKeyword: string = 'invalid'; //   TODO: i18n
    public randomKeyword: string = 'random'; //     TODO: i18n

    private readonly _nlpUtil = new NLPUtil();
    private readonly _uiePropExtractor = new UIElementPropertyExtractor();

    private readonly _randomString: RandomString;
    private readonly _randomLong: RandomLong;
    private readonly _dtcAnalyzer: DataTestCaseAnalyzer;
    private readonly _uieValueGen: UIElementValueGenerator;
    private readonly _variantSentenceRec: VariantSentenceRecognizer;

    constructor(
        private readonly _langContentLoader: LanguageContentLoader,
        public readonly seed: string,
        public readonly defaultLanguage: string,
        public readonly uiLiteralCaseOption: CaseType,
        public readonly minRandomStringSize = 0,
        public readonly maxRandomStringSize = 100,
        public readonly randomTriesToInvalidValues = 5
    ) {
        const random = new Random( seed );
        this._randomString = new RandomString( random );
        this._randomLong = new RandomLong( random );
        this._dtcAnalyzer = new DataTestCaseAnalyzer( seed );
        this._uieValueGen = new UIElementValueGenerator( seed, randomTriesToInvalidValues );
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
    generate(
        steps: Step[],
        ctx: GenContext,
        testPlanMakers: TestPlanMaker[]
    ): Array< Pair< Step[], Step[] > > { // Array< Pair< Steps with values, Oracles > >

        // Determine the language to use
        const language = ! ctx.doc.language ? this.defaultLanguage : ctx.doc.language.value;
        const langContent = this._langContentLoader.load( language );

        let clonedSteps = deepcopy( steps );

        // # Replace CONSTANTS with VALUES
        this.replaceConstantsWithTheirValues( clonedSteps, language, ctx );

        let newSteps: Step[] = this.fillUILiteralsWithValueInSteps(
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
        const stepUIEVariables: string[] = stepUIElements.map( uie => uie.info ? uie.info.fullVariableName : uie.name );

        const allAvailableUIElements: UIElement[] = ctx.spec.extractUIElementsFromDocumentAndImports( ctx.doc );
        const allAvailableVariables: string[] = allAvailableUIElements.map( uie => uie.info ? uie.info.fullVariableName : uie.name );

        const alwaysValidUIEVariables: string[] = arrayDiff( allAvailableVariables, stepUIElements ); // order matters


        // # Analyze DataTestCases for every UI Element
        //   Non-editable UI Elements are not included
        //   { Full variable name => { DTC => { Result, Otherwise steps }} }
        let uieVariableToDTCMap = new Map< string, Map< DataTestCase, Pair< DTCAnalysisResult, Step[] > > >();
        for ( let uie of allAvailableUIElements ) {
            let map = this._dtcAnalyzer.analyzeUIElement( uie, ctx.errors );
            uieVariableToDTCMap.set( uie.info.fullVariableName, map );
        }

        // # Generate DataTestCases for the UI Elements, according to the goal and the combination strategy.
        //   Both are embedded in a TestPlanMaker.
        let allTestPlans: TestPlan[] = [];
        for ( let maker of testPlanMakers ) {
            allTestPlans.push.apply( allTestPlans, maker.make( uieVariableToDTCMap, alwaysValidUIEVariables ) );
        }

        // # Generate values for all the UI Elements, according to the DataTestCase
        let all: Array< Pair< Step[], Step[] > > = [];
        for ( let plan of allTestPlans ) { // Each plan maps string => UIETestPlan

            let uieVariableToValueMap = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plan.dataTestCases, uieVariableToValueMap );

            for ( let [ uieVar, uieTestPlan ] of plan.dataTestCases ) {
                this._uieValueGen.generate( uieVar, context, ctx.doc, ctx.spec, ctx.errors );
            }

            // Steps & Oracles

            let completeSteps: Step[] = [], stepOracles: Step[] = [];
            for ( let step of newSteps ) {

                // Resulting oracles are already processed
                let [ resultingSteps, resultingOracles ] = this.fillUIElementWithValueAndReplaceByUILiteralInStep(
                    step, langContent, plan.dataTestCases, uieVariableToValueMap, language, ctx );

                completeSteps.push.apply( completeSteps, resultingSteps );
                if ( resultingOracles.length > 0 ) {
                    stepOracles.push.apply( resultingOracles );
                }
            }

            all.push( new Pair( completeSteps, stepOracles ) );
        }

        return all;
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

            let before = step.content;

            // Replace content
            step.content = refReplacer.replaceConstantsWithTheirValues( step.content, step.nlpResult, ctx.spec );

            if ( before != step.content ) {
                // Update NLP !
                this._variantSentenceRec.recognizeSentences( language, [ step ], ctx.errors, ctx.warnings );
            }
        }
    }

    //
    // UI LITERALS
    //

    fillUILiteralsWithValueInSteps(
        steps: Step[],
        language: string,
        keywords: KeywordDictionary,
        ctx: GenContext
    ): Step[] {
        let newSteps: Step[] = [];
        for ( let step of steps ) {

            // # Fill UI Literals with random values
            let resultingSteps = this.fillUILiteralsWithValueInSingleStep( step, keywords );

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
    fillUILiteralsWithValueInSingleStep( step: Step, keywords: KeywordDictionary ): Step[] {

        const fillEntity = this.extractFillEntity( step );

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

        const prefixAnd = upperFirst( keywords.stepAnd[ 0 ] || 'And' );
        let prefix = this.prefixFor( step, keywords );
        const keywordI = keywords.i[ 0 ] || 'I';
        const keywordWith = keywords.with[ 0 ] || 'with';

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

        for ( let entity of entities ) {

            // Change to "AND" when more than one UI Literal is available
            if ( count > 0 ) {
                prefix = prefixAnd;
            }

            let sentence = prefix + ' ' + keywordI + ' ' + fillEntity.string + ' ';
            if ( Entities.UI_LITERAL === entity.entity ) {
                sentence += Symbols.UI_LITERAL_PREFIX + entity.string + Symbols.UI_LITERAL_SUFFIX +
                    ' ' + keywordWith + ' ' +
                    Symbols.VALUE_WRAPPER + this.randomString() + Symbols.VALUE_WRAPPER;

                // Add comment
                sentence += ' ' + Symbols.COMMENT_PREFIX + ' ' + this.validKeyword + Symbols.TITLE_SEPARATOR + ' ' + this.randomKeyword;
            } else {
                sentence += entity.string; // UI Element currently doesn't need prefix/sufix
            }

            let newStep = {
                content: sentence,
                type: step.nodeType,
                location: {
                    column: step.location.column,
                    line: line++,
                    filePath: step.location.filePath
                } as Location
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


    replaceUIElementsWithUILiteralsInNonFillSteps(
        steps: Step[],
        language: string,
        keywords: KeywordDictionary,
        ctx: GenContext
    ): void {
        const refReplacer = new ReferenceReplacer();

        for ( let step of steps ) {

            // Ignore steps with 'fill' entity
            const fillEntity = this.extractFillEntity( step );
            if ( isDefined( fillEntity ) ) {
                continue;
            }

            let before = step.content;

            // Replace content
            step.content = refReplacer.replaceUIElementsWithUILiterals(
                step.content, step.nlpResult, ctx.doc, ctx.spec, this.uiLiteralCaseOption );

            if ( before != step.content ) {
                // Update NLP !
                this._variantSentenceRec.recognizeSentences( language, [ step ], ctx.errors, ctx.warnings );
            }
        }
    }


    fillUIElementWithValueAndReplaceByUILiteralInStep(
        step: Step,
        langContent: LanguageContent,
        uieVariableToUIETestPlanMap: Map< string, UIETestPlan >,
        uieVariableToValueMap: Map< string, EntityValueType >,
        language: string,
        ctx: GenContext
    ): [ Step[], Step[] ] {  // [ steps, oracles ]

        const fillEntity = this.extractFillEntity( step );

        if ( null === fillEntity || this.hasValue( step ) || this.hasNumber( step ) ) {
            return [ [ step ], [] ];
        }

        let uiElements = this._nlpUtil.entitiesNamed( Entities.UI_ELEMENT, step.nlpResult );
        const uiElementsCount = uiElements.length;
        if ( uiElementsCount < 1 ) {
            return [ [ step ], [] ]; // nothing to do
        }

        const keywords = langContent.keywords || new EnglishKeywordDictionary();

        const prefixAnd = upperFirst( keywords.stepAnd[ 0 ] || 'And' );
        let prefix = this.prefixFor( step, keywords );
        const keywordI = keywords.i[ 0 ] || 'I';
        const keywordWith = keywords.with[ 0 ] || 'with';

        let steps: Step[] = [],
            oracles: Step[] = [],
            line = step.location.line,
            count = 0;

        for ( let entity of uiElements ) {

            // Change to "AND" when more than one entity is available
            if ( count > 0 ) {
                prefix = prefixAnd;
            }

            const uieName = entity.value;
            const uie = ctx.spec.uiElementByVariable( uieName, ctx.doc );

            const variable = ! uie ? uieName : ( ! uie.info ? uieName : uie.info.fullVariableName );
            let value = uieVariableToValueMap.get( variable ) || null;
            if ( null === value ) {
                const msg = 'Could not retrieve value from the UI Element "' + variable + '". It will receive an empty value.';
                ctx.warnings.push( new RuntimeException( msg, step.location ) );
                value = '';
            }

            let uieLiteral = isDefined( uie ) && isDefined( uie.info ) ? uie.info.uiLiteral : null;
            if ( null === uieLiteral ) { // Should never happer since Spec defines Literals for mapped UI Elements
                uieLiteral = convertCase( variable, this.uiLiteralCaseOption );
                const msg = 'Could not retrieve a literal from the UI Element "' + variable + '". Generating one: "' + uieLiteral + '"';
                ctx.warnings.push( new RuntimeException( msg, step.location ) );
            }

            // Generate the sentence
            let sentence = prefix + ' ' + keywordI + ' ' + fillEntity.string + ' ' +
                Symbols.UI_LITERAL_PREFIX + uieLiteral + Symbols.UI_LITERAL_SUFFIX +
                ' ' + keywordWith + ' ' +
                Symbols.VALUE_WRAPPER + value + Symbols.VALUE_WRAPPER;

            // Add comment
            const uieTestPlan = uieVariableToUIETestPlanMap.get( variable ) || null;
            let expectedResult, dtc;
            if ( null === uieTestPlan ) { // not expected
                expectedResult = this.validKeyword  + ' ???';
                dtc = '';
            } else {

                if ( DTCAnalysisResult.INVALID === uieTestPlan.result ) {
                    expectedResult = this.invalidKeyword;

                    // Process ORACLES as steps

                    let oraclesClone = this.processOracles(
                        uieTestPlan.otherwiseSteps, language, keywords, ctx );

                    // Add oracles
                    oracles.push.apply( oraclesClone );

                } else {
                    expectedResult = this.validKeyword;
                }

                expectedResult = uieTestPlan.result === DTCAnalysisResult.VALID ? this.validKeyword : this.invalidKeyword;

                if ( isDefined( langContent.testCaseNames ) ) {
                    dtc = langContent.testCaseNames[ uieTestPlan.dtc ] || '';
                } else {
                    dtc = '';
                }
            }
            sentence += ' ' + Symbols.COMMENT_PREFIX + ' ' + expectedResult + Symbols.TITLE_SEPARATOR + ' ' + dtc;

            // Make the step
            let newStep = {
                content: sentence,
                type: step.nodeType,
                location: {
                    column: step.location.column,
                    line: line++,
                    filePath: step.location.filePath
                } as Location
            } as Step;

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

        stepsClone = this.fillUILiteralsWithValueInSteps(
            stepsClone, language, keywords, ctx );

        // UI ELEMENTS

        this.replaceUIElementsWithUILiteralsInNonFillSteps(
            stepsClone, language, keywords, ctx );

        // Note: Oracle steps cannot have 'fill' steps

        return stepsClone;
    }


    //
    // OTHER
    //

    extractFillEntity( step: Step ): NLPEntity | null {
        return step.nlpResult.entities
            .find( e => e.entity === Entities.UI_ACTION && this.isFillAction( e.value ) ) || null;
    }

    isFillAction( action: string ): boolean {
        return 'fill' === action; // TODO: refactor
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


    prefixFor( step: Step, keywords: KeywordDictionary ): string {
        let prefix;
        switch ( step.nodeType ) {
            case NodeTypes.STEP_GIVEN: prefix = keywords.stepGiven[ 0 ] || 'Given that'; break;
            case NodeTypes.STEP_WHEN: prefix = keywords.stepWhen[ 0 ] || 'When'; break;
            case NodeTypes.STEP_THEN: prefix = keywords.stepThen[ 0 ] || 'Then'; break;
            case NodeTypes.STEP_AND: prefix = keywords.stepAnd[ 0 ] || 'And'; break;
            default: prefix = keywords.stepOtherwise[ 0 ] || 'Otherwise'; break;
        }
        return upperFirst( prefix );
    }


}