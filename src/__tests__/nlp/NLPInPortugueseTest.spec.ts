import { NLPTrainingDataConversor } from '../../modules/nlp/NLPTrainingDataConversor';
import { NLPEntityUsageExample, NLPTrainingData } from '../../modules/nlp/NLPTrainingData';
import { NLP } from '../../modules/nlp/NLP';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'NLPInPortugueseTest', () => {

    let nlp: NLP; // under test

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
            expect( entities ).toEqual( expectedEntitiesNames );
        }
    }

    it( 'testcase - pt - recognizes a click with a value', () => {
        let results = [];
        results.push( nlp.recognize( 'eu clico em "x"' ) );
        results.push( nlp.recognize( 'eu clico na opção "x"' ) );
        shouldHaveEntities( results, [ "ui_action", "value" ] );
    } );

    it( 'testcase - pt - recognizes a click with a target and a value', () => {
        let results = [];
        results.push( nlp.recognize( 'eu clico no botão "x"' ) );
        shouldHaveEntities( results, [ "ui_action", "ui_target_type", "value" ] );
    } );

    it( 'testcase - pt - recognizes a fill with an element', () => {
        let results = [];
        results.push( nlp.recognize( 'eu preencho <Nome>' ) );
        shouldHaveEntities( results, [ "ui_action", "element" ] );
    } );    

    it( 'testcase - pt - recognizes a fill with an element and a value', () => {
        let results = [];
        results.push( nlp.recognize( 'eu preencho <Nome> com "Bob"' ) );
        shouldHaveEntities( results, [ "ui_action", "element", "value" ] );
    } );

} );