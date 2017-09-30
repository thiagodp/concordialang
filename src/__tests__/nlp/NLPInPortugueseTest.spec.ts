import { Entities } from '../../modules/nlp/Entities';
import { NLPTrainingDataConversor } from '../../modules/nlp/NLPTrainingDataConversor';
import { NLPEntityUsageExample, NLPTrainingData } from '../../modules/nlp/NLPTrainingData';
import { NLP } from '../../modules/nlp/NLP';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'NLPInPortugueseTest', () => {

    let nlp: NLP; // under test    

    // entities
    const ELEMENT: string = Entities.ELEMENT;
    const VALUE: string = Entities.VALUE;
    const NUMBER: string = Entities.NUMBER;
    const UI_ACTION_MODIFIER = Entities.UI_ACTION_MODIFIER;
    const UI_ACTION: string = Entities.UI_ACTION;
    const UI_TARGET_TYPE: string = Entities.UI_TARGET_TYPE;
    const UI_PROPERTY: string = Entities.UI_PROPERTY;
    const UI_VERB: string = Entities.UI_VERB;
    const UI_DATA_TYPE: string = Entities.UI_DATA_TYPE;

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

    function recognizeInTestCase( sentence: string ) {
        return nlp.recognize( sentence, 'testcase' );
    }

    function recognizeInUI( sentence: string ) {
        return nlp.recognize( sentence, 'ui' );
    }
    
    function shouldHaveEntities( results: any[], expectedEntitiesNames: string[], intent: string ) {
        for ( let r of results ) {
            //console.log( r );
            expect( r ).not.toBeFalsy();
            expect( r.intent ).toEqual( intent );
            expect( r.entities ).toHaveLength( expectedEntitiesNames.length );
            let entities = r.entities.map( e => e.entity );
            expect( entities ).toEqual( expect.arrayContaining( expectedEntitiesNames ) ); // doesn't matter the array order
        }
    }    

    function shouldHaveTestCaseEntities( results: any[], expectedEntitiesNames: string[] ) {
        shouldHaveEntities( results, expectedEntitiesNames, 'testcase' );
    }
    
    function shouldHaveUIEntities( results: any[], expectedEntitiesNames: string[] ) {
        shouldHaveEntities( results, expectedEntitiesNames, 'ui' );
    }    


    describe( 'testcase', () => {

        const entity = 'testcase';

        it( 'recognizes a click with a value', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu clico em "x"' ) );
            results.push( recognizeInTestCase( 'eu clico na opção "x"' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, VALUE ] );
        } );

        it( 'recognizes a click with a target and a value', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu clico no botão "x"' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_TARGET_TYPE, VALUE ] );
        } );

        it( 'recognizes a fill with an element', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu preencho <Nome>' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, ELEMENT ] );
        } );    

        it( 'recognizes a fill with an element and a value', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu preencho <Nome> com "Bob"' ) );
            results.push( recognizeInTestCase( 'eu preencho "Bob" em <Nome>' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, ELEMENT, VALUE ] );
        } );

        it( 'recognizes a fill with a target and a value', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu preencho o botão com "x"' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_TARGET_TYPE, VALUE ] );
        } );

        it( 'recognizes a fill with a target, an element, and a value', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu preencho o botão <Nome> com "x"' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_TARGET_TYPE, ELEMENT, VALUE ] );
        } );        

    } );



    describe( 'ui', () => {

        it( 'recognizes id definitions', () => {
            let results = [];
            results.push( recognizeInUI( 'id é "#ok"' ) );
            shouldHaveUIEntities( results, [ UI_PROPERTY, UI_VERB, VALUE ] );            
        } );

        it( 'recognizes type definitions', () => {
            let results = [];
            results.push( recognizeInUI( 'tipo é botão' ) );
            shouldHaveUIEntities( results, [ UI_PROPERTY, UI_VERB, UI_TARGET_TYPE ] );
        } );        
        
        it( 'recognizes datatype definitions', () => {
            let results = [];
            results.push( recognizeInUI( 'tipo de dado é texto' ) );
            results.push( recognizeInUI( 'tipo de dado é string' ) );
            results.push( recognizeInUI( 'tipo de dado é inteiro' ) );
            results.push( recognizeInUI( 'tipo de dado é integer' ) );
            results.push( recognizeInUI( 'tipo de dado é flutuante' ) );
            results.push( recognizeInUI( 'tipo de dado é double' ) );
            results.push( recognizeInUI( 'tipo de dado é data' ) );
            results.push( recognizeInUI( 'tipo de dado é date' ) );
            results.push( recognizeInUI( 'tipo de dado é hora' ) );
            results.push( recognizeInUI( 'tipo de dado é time' ) );
            results.push( recognizeInUI( 'tipo de dado é datahora' ) );
            results.push( recognizeInUI( 'tipo de dado é datetime' ) );
            shouldHaveUIEntities( results, [ UI_PROPERTY, UI_VERB, UI_DATA_TYPE  ] );
        } );
        
        it( 'recognizes value definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'valor é "foo"' ) ],
                [ UI_PROPERTY, UI_VERB, VALUE  ] );
            shouldHaveUIEntities( [ recognizeInUI( 'valor é 3.1416' ) ],
                [ UI_PROPERTY, UI_VERB, NUMBER  ] );
            shouldHaveUIEntities( [ recognizeInUI( 'valor é 0' ) ],
                [ UI_PROPERTY, UI_VERB, NUMBER  ] );
            shouldHaveUIEntities( [ recognizeInUI( 'valor é -3.1416' ) ],
                [ UI_PROPERTY, UI_VERB, NUMBER  ] );                
        } );

        it( 'recognizes min value definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'valor mínimo é -50.2' ) ],
                [ UI_PROPERTY, UI_VERB, NUMBER  ] );                
        } );

        it( 'recognizes max value definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'valor máximo é 50.2' ) ],
                [ UI_PROPERTY, UI_VERB, NUMBER  ] );                
        } );
        
        it( 'recognizes min length definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'comprimento mínimo é 0' ) ],
                [ UI_PROPERTY, UI_VERB, NUMBER  ] );                
        } );

        it( 'recognizes max length definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'comprimento máximo é 100' ) ],
                [ UI_PROPERTY, UI_VERB, NUMBER  ] );                
        } );
        
        it( 'recognizes format definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'formato é "[A-Z]"' ) ],
                [ UI_PROPERTY, UI_VERB, VALUE  ] );                
        } );         

    } );

} );