import { TestCaseEntities } from '../../modules/nlp/TestCaseEntities';
import { NLPTrainingDataConversor } from '../../modules/nlp/NLPTrainingDataConversor';
import { NLPEntityUsageExample, NLPTrainingData } from '../../modules/nlp/NLPTrainingData';
import { NLP } from '../../modules/nlp/NLP';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'NLPInPortugueseTest', () => {

    let nlp: NLP; // under test    

    // entities
    const UI_ACTION_MODIFIER = TestCaseEntities.UI_ACTION_MODIFIER;
    const UI_ACTION: string = TestCaseEntities.UI_ACTION;
    const UI_TARGET_TYPE: string = TestCaseEntities.UI_TARGET_TYPE;
    const ELEMENT: string = TestCaseEntities.ELEMENT;
    const VALUE: string = TestCaseEntities.VALUE;

    // helpers
    let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
    let translationMap = makeTranslationMap();
    let examples = makeTrainingExamples();
    let data: NLPTrainingData = conversor.convert( translationMap, examples );

    function makeTranslationMap(): any {
        return require( '../../data/nlp/pt.json' );
    }

    function makeTrainingExamples(): NLPEntityUsageExample[] {
        return require( '../../data/training/pt.json' );
    }

    beforeAll( () => { // once
        nlp = new NLP();
        nlp.train( data );
    } );

    function shouldHaveEntities( results: any[], expectedEntitiesNames: string[] ) {
        for ( let r of results ) {
            //console.log( r );
            expect( r ).not.toBeFalsy();
            expect( r.intent ).toEqual( "testcase" );
            expect( r.entities ).toHaveLength( expectedEntitiesNames.length );
            let entities = r.entities.map( e => e.entity );
            expect( entities ).toEqual( expect.arrayContaining( expectedEntitiesNames ) ); // doesn't matter the array order
        }
    }

    describe( 'testcase', () => {

        it( 'recognizes a click with a value', () => {
            let results = [];
            results.push( nlp.recognize( 'eu clico em "x"' ) );
            results.push( nlp.recognize( 'eu clico na opção "x"' ) );
            shouldHaveEntities( results, [ UI_ACTION, VALUE ] );
        } );

        it( 'recognizes a click with a target and a value', () => {
            let results = [];
            results.push( nlp.recognize( 'eu clico no botão "x"' ) );
            shouldHaveEntities( results, [ UI_ACTION, UI_TARGET_TYPE, VALUE ] );
        } );

        it( 'recognizes a fill with an element', () => {
            let results = [];
            results.push( nlp.recognize( 'eu preencho <Nome>' ) );
            shouldHaveEntities( results, [ UI_ACTION, ELEMENT ] );
        } );    

        it( 'recognizes a fill with an element and a value', () => {
            let results = [];
            results.push( nlp.recognize( 'eu preencho <Nome> com "Bob"' ) );
            results.push( nlp.recognize( 'eu preencho "Bob" em <Nome>' ) );
            shouldHaveEntities( results, [ UI_ACTION, ELEMENT, VALUE ] );
        } );

        it( 'recognizes a fill with a target and a value', () => {
            let results = [];
            results.push( nlp.recognize( 'eu preencho o botão com "x"' ) );
            shouldHaveEntities( results, [ UI_ACTION, UI_TARGET_TYPE, VALUE ] );
        } );

        it( 'recognizes a fill with a target, an element, and a value', () => {
            let results = [];
            results.push( nlp.recognize( 'eu preencho o botão <Nome> com "x"' ) );
            shouldHaveEntities( results, [ UI_ACTION, UI_TARGET_TYPE, ELEMENT, VALUE ] );
        } );        

    } );

} );