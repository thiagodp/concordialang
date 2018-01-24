import { Intents } from '../../modules/nlp/Intents';
import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { Entities } from '../../modules/nlp/Entities';
import { NLP } from '../../modules/nlp/NLP';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'NLPInPortugueseTest', () => {

    let nlp: NLP; // under test    
    const LANGUAGE = 'pt';

    // entities
    const ELEMENT: string = Entities.ELEMENT;
    const VALUE: string = Entities.VALUE;
    const NUMBER: string = Entities.NUMBER;
    const QUERY: string = Entities.QUERY;
    const UI_ACTION: string = Entities.UI_ACTION;
    const UI_ACTION_MODIFIER = Entities.UI_ACTION_MODIFIER;
    const UI_ACTION_OPTION = Entities.UI_ACTION_OPTION;
    const UI_ELEMENT_TYPE: string = Entities.UI_ELEMENT_TYPE;
    const UI_PROPERTY: string = Entities.UI_PROPERTY;
    const UI_CONNECTOR: string = Entities.UI_CONNECTOR;
    const UI_DATA_TYPE: string = Entities.UI_DATA_TYPE;

    beforeAll( () => { // once
        nlp = new NLP();
        ( new NLPTrainer() ).trainNLP( nlp, LANGUAGE );
    } );

    function recognize( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence );
    }    

    function recognizeInTestCase( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence, Intents.TEST_CASE );
    }

    function recognizeInUI( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence, Intents.UI );
    }

    function recognizeInUIItemQuery( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence, Intents.UI_ITEM_QUERY );
    }    
    
    function shouldHaveEntities( results: any[], expectedEntitiesNames: string[], intent: string ) {
        for ( let r of results ) {
            //console.log( r );
            expect( r ).not.toBeFalsy();
            expect( r.intent ).toEqual( intent );
            expect( r.entities ).not.toBeNull();
            expect( r.entities.length ).toBeGreaterThanOrEqual( expectedEntitiesNames.length );
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


    describe( 'testcase entities', () => {

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
            shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, VALUE ] );
        } );

        it( 'recognizes a click with a target inside another element', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu clico em "x" dentro de "y"' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, VALUE, UI_ACTION_OPTION, VALUE ] );
        } );        

        it( 'recognizes a fill with an element', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu preencho {Nome}' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, ELEMENT ] );
        } );    

        it( 'recognizes a fill with an element and a value', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu preencho {Nome} com "Bob"' ) );
            //results.push( recognizeInTestCase( 'eu preencho "Bob" em <Nome>' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, ELEMENT, VALUE ] );
        } );

        it( 'recognizes a fill with a target and a value', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu preencho o botão com "x"' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, VALUE ] );
        } );

        it( 'recognizes a fill with a target, an element, and a value', () => {
            let results = [];
            results.push( recognizeInTestCase( 'eu preencho a caixa de texto {Nome} com "x"' ) );
            shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, ELEMENT, VALUE ] );
        } );        

    } );



    describe( 'ui entities', () => {

        it( 'recognizes id definitions', () => {
            let results = [];
            results.push( recognizeInUI( 'id é "#ok"' ) );
            shouldHaveUIEntities( results, [ UI_PROPERTY, UI_CONNECTOR, VALUE ] );            
        } );

        it( 'recognizes type definitions', () => {
            let results = [];
            results.push( recognizeInUI( 'tipo é botão' ) );
            results.push( recognizeInUI( 'tipo é caixa de texto' ) );
            results.push( recognizeInUI( 'tipo é caixa de seleção' ) );
            results.push( recognizeInUI( 'tipo é caixa de marcação' ) );
            results.push( recognizeInUI( 'tipo é janela' ) );
            results.push( recognizeInUI( 'tipo é url' ) );
            results.push( recognizeInUI( 'tipo é rótulo' ) );
            shouldHaveUIEntities( results, [ UI_PROPERTY, UI_CONNECTOR, UI_ELEMENT_TYPE ] );
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
            shouldHaveUIEntities( results, [ UI_PROPERTY, UI_CONNECTOR, UI_DATA_TYPE  ] );
        } );
        
        it( 'recognizes value definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'valor é "foo"' ) ],
                [ UI_PROPERTY, UI_CONNECTOR, VALUE  ] );
            shouldHaveUIEntities( [ recognizeInUI( 'valor é 3.1416' ) ],
                [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );
            shouldHaveUIEntities( [ recognizeInUI( 'valor é 0' ) ],
                [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );
            shouldHaveUIEntities( [ recognizeInUI( 'valor é -3.1416' ) ],
                [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );                
        } );

        it( 'recognizes min value definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'valor mínimo é -50.2' ) ],
                [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );                
        } );

        it( 'recognizes max value definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'valor máximo é 50.2' ) ],
                [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );                
        } );
        
        it( 'recognizes min length definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'comprimento mínimo é 0' ) ],
                [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );                
        } );

        it( 'recognizes max length definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'comprimento máximo é 100' ) ],
                [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );                
        } );
        
        it( 'recognizes format definitions', () => {
            shouldHaveUIEntities( [ recognizeInUI( 'formato é "[A-Z]"' ) ],
                [ UI_PROPERTY, UI_CONNECTOR, VALUE  ] );                
        } );
        
        it( 'recognizes script definitions', () => {
            shouldHaveUIEntities( [ recognize( 'valor vem de "SELECT * FROM someTable"' ) ],
                [ UI_PROPERTY, UI_CONNECTOR, QUERY  ] );
        } );        

    } );

} );