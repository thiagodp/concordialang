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
import { upperFirst } from "../util/CaseConversor";
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
import { TestPlanMaker, TestGoal } from "../testcase/TestPlanMaker";
import { TestPlan } from "../testcase/TestPlan";
import { UIElementValueGenerator, ValueGenContext } from "../testdata/UIElementValueGenerator";
import * as arrayDiff from 'arr-diff';

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

export class GenUtil {

    public validKeyword: string = 'valid';
    public randomKeyword: string = 'random';

    private readonly _nlpUtil = new NLPUtil();
    private readonly _uiePropExtractor = new UIElementPropertyExtractor();

    private readonly _randomString: RandomString;
    private readonly _randomLong: RandomLong;
    private readonly _dtcAnalyzer: DataTestCaseAnalyzer;
    private readonly _uieValueGen: UIElementValueGenerator;

    constructor(
        private readonly _langContentLoader: LanguageContentLoader,
        public readonly seed: string,
        public readonly defaultLanguage: string,
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


    a(
        steps: Step[],
        doc: Document,
        spec: Spec,
        errors: LocatedException[],
        testPlanMakers: TestPlanMaker[]
    ): Map< TestPlanMaker, Step[] > {

        // Determine the language to use
        const language = ! doc.language ? this.defaultLanguage : doc.language.value;
        const langContent = this._langContentLoader.load( language );

        let newSteps: Step[] = [];
        for ( let step of steps ) {
            // # Fill UI Literals with random values
            let resultingSteps = this.fillEventualUILiteralsWithoutValueWithRandomValue( step, langContent.keywords );
            // Add all resulting steps
            newSteps.push.apply( newSteps, resultingSteps );
        }

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

        const stepUIElements: UIElement[] = this.extractUIElementsFromSteps( newSteps, doc, spec, errors );
        const stepUIEVariables: string[] = stepUIElements.map( uie => uie.info ? uie.info.fullVariableName : uie.name );

        const allAvailableUIElements: UIElement[] = spec.extractUIElementsFromDocumentAndImports( doc );
        const allAvailableVariables: string[] = allAvailableUIElements.map( uie => uie.info ? uie.info.fullVariableName : uie.name );

        const alwaysValidUIEVariables: string[] = arrayDiff( allAvailableVariables, stepUIElements ); // order matters


        // # Analyze DataTestCases for every UI Element
        //   Non-editable UI Elements are not included
        //   { Full variable name => { DTC => { Result, Otherwise steps }} }
        let uieVariableToDTCMap = new Map< string, Map< DataTestCase, Pair< DTCAnalysisResult, Step[] > > >();
        for ( let uie of allAvailableUIElements ) {
            let map = this._dtcAnalyzer.analyzeUIElement( uie, errors );
            uieVariableToDTCMap.set( uie.info.fullVariableName, map );
        }

        // # Generate DataTestCases for the UI Elements, according to
        //   the goal and the combination strategy. Both are embedded
        //   in a TestPlanMaker.
        let allTestPlans: TestPlan[] = [];
        for ( let maker of testPlanMakers ) {
            allTestPlans.push.apply( allTestPlans, maker.make( uieVariableToDTCMap, alwaysValidUIEVariables ) );
        }

        // # Generate values for all the UI Elements, according to the DataTestCase
        for ( let plan of allTestPlans ) { // Each plan maps string => UIETestPlan

            let uieVariableToValueMap = new Map< string, EntityValueType >();
            let context = new ValueGenContext( plan.dataTestCases, uieVariableToValueMap );
            for ( let [ uieVar, uieTestPlan ] of plan.dataTestCases ) {
                this._uieValueGen.generate( uieVar, context, doc, spec, errors )
            }

            // << in this point, we can replace steps

            // ?
            // let completeSteps: Step[] = [];
            // for ( let step of newSteps ) {
            //     let resultingSteps = this.fillUIEWithoutValueWithUILWithValue(
            //         step, langContent.keywords, uieVariableToValueMap, doc, spec, errors );
            //     completeSteps.push.apply( completeSteps, resultingSteps );
            // }


        }


        return newSteps;
    }


    extractUIElementsFromSteps(
        steps: Step[],
        doc: Document,
        spec: Spec,
        errors: LocatedException[]
    ): UIElement[] {
        let all: UIElement[] = [];
        const uieNames = this.extractUIElementNamesFromSteps( steps );
        const baseMsg = 'Referenced UI Element not found: ';
        for ( let name of uieNames ) {
            let uie = spec.uiElementByVariable( name, doc );
            if ( ! uie ) {
                errors.push( new RuntimeException( baseMsg + name ) );
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



    /**
     * Fill UI Literals without value with a random value. It generates one step for every UI Literal
     * or UI Element found. Only UI Literals receive value.
     *
     * @param step Step to analyze
     * @param keywords Keywords dictionary
     */
    fillEventualUILiteralsWithoutValueWithRandomValue( step: Step, keywords: KeywordDictionary ): Step[] {

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