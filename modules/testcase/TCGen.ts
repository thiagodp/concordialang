import { Variant, TestCase } from "../ast/Variant";
import { TestScenario } from "../testscenario/TestScenario";
import { Step } from "../ast/Step";
import { NLPUtil, NLPEntity } from "../nlp/NLPResult";
import { Entities } from "../nlp/Entities";
import { KeywordDictionary } from "../dict/KeywordDictionary";
import { NodeTypes } from "../req/NodeTypes";
import { LanguageContent } from "../dict/LanguageContent";
import { Symbols } from "../req/Symbols";
import { RandomString } from "../testdata/random/RandomString";
import { Random } from "../testdata/random/Random";
import { Location } from "../ast/Location";
import { upperFirst } from "../util/CaseConversor";

export class TCGen {

    private readonly _nlpUtil = new NLPUtil();
    private readonly _randomString: RandomString;

    constructor(
        // private _variantToTestCaseMap: Map< Variant, TestCase[] >
        public readonly seed: string,
        public readonly minRandomStringSize = 0,
        public readonly maxRandomStringSize = 100,
    ) {
        this._randomString = new RandomString( new Random( seed ) );
    }

    generate(
        variant: Variant,
        testScenarios: TestScenario[]
    ): TestCase[] {
        let testCases: TestCase[] = [];

        //
        // Test Cases are formed according to the UI Elements and applicable Data Test Cases.
        //
        // Steps with the "external" flag set - referred here as "external step" - indicate
        // that a valid value should be generated for it. So if an external step has a UI Element
        // reference, there is a need to generate a valid value. Thus, such steps from any
        // Test Scenario must be changed.
        //
        // Non external steps that have references to UI Elements must receive test data
        // according to the applicable Data Test Case. Since there may be an explosion of
        // combinations, a combination strategy is needed (ex.: defaults to 1-wise).
        //

        // Question: gerar valores para UI Elements de Variants externas ao gerar o cenário de teste?

        return testCases;
    }


    fillEventualUILiteralsWithoutValueWithRandomValue( step: Step, keywords: KeywordDictionary ): Step[] {

        const fillEntity = step.nlpResult.entities
            .find( e => e.entity === Entities.UI_ACTION && this.isFillAction( e.value ) ) || null;

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
        let prefix;
        switch ( step.nodeType ) {
            case NodeTypes.STEP_GIVEN: prefix = keywords.stepGiven[ 0 ] || 'Given that'; break;
            case NodeTypes.STEP_WHEN: prefix = keywords.stepWhen[ 0 ] || 'When'; break;
            case NodeTypes.STEP_THEN: prefix = keywords.stepThen[ 0 ] || 'Then'; break;
            case NodeTypes.STEP_AND: prefix = prefixAnd; break;
            default: prefix = keywords.stepOtherwise[ 0 ] || 'Otherwise'; break;
        }
        prefix = upperFirst( prefix );
        const keywordI = keywords.i[ 0 ] || 'I';
        const keywordWith = keywords.with[ 0 ] || 'with';

        let steps: Step[] = [];
        let line = step.location.line;
        let count = 0;

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
            } else {
                sentence += entity.string; // currently doesn't need prefix/sufix
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

    // hasFillAction( step: Step ): boolean {
    //     if ( ! step || ! step.action ) {
    //         return false;
    //     }
    //     return this.isFillAction( step.action );
    // }

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

    // hasUiLiteral( step: Step ): boolean {
    //     if ( ! step || ! step.nlpResult ) {
    //         return false;
    //     }
    //     return this._nlpUtil.hasEntityNamed( Entities.UI_LITERAL, step.nlpResult );
    // }

    randomString(): string {
        return this._randomString.between( this.minRandomStringSize, this.maxRandomStringSize );
    }

}