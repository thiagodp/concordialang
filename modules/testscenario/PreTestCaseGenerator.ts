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
import { PreTestCase } from "./PreTestCase";
import { escapeString } from "../util/escape";

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

    public validKeyword: string = 'valid'; //       TODO: i18n
    public invalidKeyword: string = 'invalid'; //   TODO: i18n
    public randomKeyword: string = 'random'; //     TODO: i18n

    private readonly _nlpUtil = new NLPUtil();
    private readonly _uiePropExtractor = new UIElementPropertyExtractor();

    private readonly _randomString: RandomString;
    private readonly _randomLong: RandomLong;
    private readonly _dtcAnalyzer: DataTestCaseAnalyzer;
    private readonly _uieValueGen: UIElementValueGenerator;

    constructor(
        public readonly langContentLoader: LanguageContentLoader,
        public readonly defaultLanguage: string,
        public readonly seed: string,
        private readonly _variantSentenceRec: VariantSentenceRecognizer,
        public readonly uiLiteralCaseOption: CaseType = CaseType.CAMEL,
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
    ): PreTestCase[] { // Array< Pair< Steps with values, Oracles > >

        if ( ! steps || steps.length < 1 ) {
            return [];
        }

        // Determine the language to use
        const language = this.docLanguage( ctx.doc );
        const langContent = this.langContentLoader.load( language );

        let clonedSteps: Step[] = this.cloneSteps( steps );

        // # Replace CONSTANTS with VALUES
        this.replaceConstantsWithTheirValues( clonedSteps, language, ctx );

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

        // # Generate DataTestCases for the UI Elements, according to the goal and the combination strategy.
        //   Both are embedded in a TestPlanMaker.
        let allTestPlans: TestPlan[] = [];
        for ( let maker of testPlanMakers ) {
            allTestPlans.push.apply( allTestPlans, maker.make( uieVariableToDTCMap, alwaysValidUIEVariables ) );
        }

        // # Generate values for all the UI Elements, according to the DataTestCase
        let all: PreTestCase[] = [];
        for ( let plan of allTestPlans ) { // Each plan maps string => UIETestPlan

            let uieVariableToValueMap = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plan.dataTestCases, uieVariableToValueMap );

            for ( let [ uieVar, uieTestPlan ] of plan.dataTestCases ) {
                this._uieValueGen.generate( uieVar, context, ctx.doc, ctx.spec, ctx.errors );
            }

            // Steps & Oracles

            let completeSteps: Step[] = [], stepOracles: Step[] = [];
            for ( let step of newSteps ) {

                // Resulting oracles are also processed
                let [ resultingSteps, resultingOracles ] = this.fillUIElementWithValueAndReplaceByUILiteralInStep(
                    step, langContent, plan.dataTestCases, uieVariableToValueMap, language, ctx );

                completeSteps.push.apply( completeSteps, resultingSteps );
                if ( resultingOracles.length > 0 ) {
                    stepOracles.push.apply( resultingOracles );
                }
            }

            all.push( new PreTestCase( plan, completeSteps, stepOracles ) );
        }

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

        // Create a Step for every entity
        for ( let entity of entities ) {

            // Change to "AND" when more than one UI Literal is available
            if ( count > 0 ) {
                prefix = prefixAnd;
            }

            let sentence = prefix + ' ' + keywordI + ' ' + fillEntity.string + ' ';
            let comment = null;

            if ( Entities.UI_LITERAL === entity.entity ) {
                sentence += Symbols.UI_LITERAL_PREFIX + entity.string + Symbols.UI_LITERAL_SUFFIX +
                    ' ' + keywordWith + ' ' +
                    Symbols.VALUE_WRAPPER + this.randomString() + Symbols.VALUE_WRAPPER;

                comment = ' ' + this.validKeyword + Symbols.TITLE_SEPARATOR + ' ' + this.randomKeyword;
            } else {
                sentence += entity.string; // UI Element currently doesn't need prefix/sufix
            }

            let newStep = {
                content: sentence,
                comment: comment,
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
                const fillEntity = this.extractFillEntity( step );
                if ( isDefined( fillEntity ) ) {
                    continue;
                }
            }

            let before = step.content;

            let [ newContent, comment ] = refReplacer.replaceUIElementsWithUILiterals(
                step.content, step.nlpResult, ctx.doc, ctx.spec, this.uiLiteralCaseOption );

            // Replace content
            step.content = newContent;
            // Add comment if non empty
            if ( comment.length > 0 ) {
                step.comment = ' ' + comment + ( step.comment || '' );
            }

            if ( before != newContent ) {
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

            let steps = [ step ];
            this.replaceUIElementsWithUILiterals( steps, language, langContent.keywords, ctx, false );

            return [ steps, [] ];
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

            const uieTestPlan = uieVariableToUIETestPlanMap.get( variable ) || null;
            let expectedResult, dtc;

            // Evaluate the test plan and oracles
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

            // Make comment
            const comment = ' ' + expectedResult + Symbols.TITLE_SEPARATOR + ' ' + dtc;

            // Make the step
            let newStep = {
                content: sentence,
                comment: ( step.comment || '' ) + comment,
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

        stepsClone = this.fillUILiteralsWithoutValueInSteps(
            stepsClone, language, keywords, ctx );

        // UI ELEMENTS

        this.replaceUIElementsWithUILiterals(
            stepsClone, language, keywords, ctx, true );

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
        let value = this._randomString.between( this.minRandomStringSize, this.maxRandomStringSize );
        value = escapeString( value );
        return value;
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