import { Intents } from '../../modules/nlp/Intents';
import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { Entities } from '../../modules/nlp/Entities';
import { NLP } from '../../modules/nlp/NLP';
import { Options } from '../../modules/app/Options';
import { resolve } from 'path';
import { LanguageContentLoader, JsonLanguageContentLoader } from '../../modules/dict/LanguageContentLoader';
import { NLPResult } from '../../modules/nlp/NLPResult';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'NLPInPortugueseTest', () => {

    let nlp: NLP; // under test
    const LANGUAGE = 'pt';
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( options.languageDir, {}, options.encoding );

    // entities
    const UI_ELEMENT: string = Entities.UI_ELEMENT;
    const UI_LITERAL: string = Entities.UI_LITERAL;
    const VALUE: string = Entities.VALUE;
    const NUMBER: string = Entities.NUMBER;
    const CONSTANT: string = Entities.CONSTANT;
    const QUERY: string = Entities.QUERY;
    const STATE: string = Entities.STATE;
    const UI_ACTION: string = Entities.UI_ACTION;
    const UI_ACTION_MODIFIER = Entities.UI_ACTION_MODIFIER;
    const UI_ACTION_OPTION = Entities.UI_ACTION_OPTION;
    const UI_ELEMENT_TYPE: string = Entities.UI_ELEMENT_TYPE;
    const UI_PROPERTY: string = Entities.UI_PROPERTY;
    const UI_CONNECTOR: string = Entities.UI_CONNECTOR;
    const UI_DATA_TYPE: string = Entities.UI_DATA_TYPE;
    const EXEC_ACTION: string = Entities.EXEC_ACTION;

    beforeAll( () => { // once
        nlp = new NLP();
        ( new NLPTrainer( langLoader ) ).trainNLP( nlp, LANGUAGE );
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

    function shouldHaveEntities(
        results: NLPResult[],
        expectedEntitiesNames: string[],
        intent: string,
        debug: boolean = false
    ) {
        for ( let r of results ) {
            if ( debug ) { console.log( 'NLP Result is', r ); }
            expect( r ).not.toBeFalsy();
            expect( r.intent ).toEqual( intent );
            expect( r.entities ).not.toBeNull();
            expect( r.entities.length ).toBeGreaterThanOrEqual( expectedEntitiesNames.length );
            let entities = r.entities.map( e => e.entity );
            expect( entities ).toEqual( expect.arrayContaining( expectedEntitiesNames ) ); // doesn't matter the array order
        }
    }

    function shouldHaveTestCaseEntities( results: any[], expectedEntitiesNames: string[], debug: boolean = false ) {
        shouldHaveEntities( results, expectedEntitiesNames, 'testcase', debug );
    }

    function shouldHaveUIEntities( results: any[], expectedEntitiesNames: string[], debug: boolean = false ) {
        shouldHaveEntities( results, expectedEntitiesNames, 'ui', debug );
    }


    describe( 'testcase entities', () => {

        const entity = 'testcase';

        // it( '', () => {

        // } );

        describe( 'structure', () => {

            it( '{ui_action} {ui_element}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu clico em {Salvar}' ) );
                results.push( recognizeInTestCase( 'eu preencho {Nome}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT ] );
            } );

            it( '{ui_action} {ui_literal}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu clico em <salvar>' ) );
                results.push( recognizeInTestCase( 'eu preencho <nome>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL ] );
            } );

            it( '{ui_action} {value}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu pressiono "F8"' ) );
                results.push( recognizeInTestCase( 'eu vejo "algo"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, VALUE ] );
            } );

            it( '{ui_action} {number}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu pressiono 1' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, NUMBER ] );
            } );

            it( '{ui_action} {constant}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu pressiono [Ajuda]' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, CONSTANT ] );
            } );

            it( '{ui_action} {ui_element} {value}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu preencho o {Nome} com "Jane"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, VALUE ] );
            } );

            it( '{ui_action} {ui_element} {number}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu preencho o {Salário} com 5000' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, NUMBER ] );
            } );

            it( '{ui_action} {ui_element} {constant}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu preencho o {Salário} com [Salário Padrão]' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, CONSTANT ] );
            } );

            it( '{ui_action} {ui_element} {ui_action_option}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu arrasto a {Foto} para a direita' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, UI_ACTION_OPTION ] );
            } );

            it( '{ui_action} {ui_element} {ui_action_option} {ui_element}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo {Foo} dentro de {Bar}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, UI_ACTION_OPTION, UI_ELEMENT ] );
            } );

            it( '{ui_action} {ui_element} {ui_action_option} {ui_literal}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo {Foo} dentro de <bar>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, UI_ACTION_OPTION, UI_LITERAL ] );
            } );

            it( '{ui_action} {value} {ui_element}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu digito "Jane" em {Nome}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, VALUE, UI_ELEMENT ] );
            } );

            it( '{ui_action} {number} {ui_element}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu digito 5000 em {Salário}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, NUMBER, UI_ELEMENT ] );
            } );

            it( '{ui_action} {constant} {ui_element}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu digito [Salário Padrão] em {Salário}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, CONSTANT, UI_ELEMENT ] );
            } );

            it( '{ui_action} {ui_literal} {value}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu preencho o <nome> com "Jane"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL, VALUE ] );
            } );

            it( '{ui_action} {ui_literal} {number}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu preencho o <salario> com 5000' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL, NUMBER ] );
            } );

            it( '{ui_action} {ui_literal} {constant}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu preencho o <salario> com [Salário Padrão]' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL, CONSTANT ] );
            } );

            it( '{ui_action} {ui_literal} {ui_action_option}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu arrasto a <foto> para a direita' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL, UI_ACTION_OPTION ] );
            } );

            it( '{ui_action} {ui_literal} {ui_action_option} {ui_element}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo <foo> dentro de {Bar}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL, UI_ACTION_OPTION, UI_ELEMENT ] );
            } );

            it( '{ui_action} {ui_literal} {ui_action_option} {ui_literal}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo <foo> dentro de <bar>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL, UI_ACTION_OPTION, UI_LITERAL ] );
            } );

            it( '{ui_action} {value} {ui_literal}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu entro com "Jane" em <nome>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, VALUE, UI_LITERAL ] );
            } );

            it( '{ui_action} {number} {ui_literal}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu entro com 1 em <salario>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, NUMBER, UI_LITERAL ] );
            } );

            it( '{ui_action} {constant} {ui_literal}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu entro com [Salário Padrão] em <salario>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, CONSTANT, UI_LITERAL ] );
            } );

            it( '{ui_action} {ui_element_type} {value}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo o título da janela com "Documento 1"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, VALUE ] );
            } );

            it( '{ui_action} {ui_element_type} {number}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo o título da janela com 100' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, NUMBER ] );
            } );

            it( '{ui_action} {ui_element_type} {constant}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo o título da janela com [Título Padrão]' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, CONSTANT ] );
            } );

            // it( '{ui_action} {ui_element_type} {ui_property} {constant}', () => {
            //     let results = [];
            //     results.push( recognizeInTestCase( 'eu vejo a janela com cor [Cor Padrão]' ) );
            //     shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, UI_PROPERTY, CONSTANT ] );
            // } );

            // ---
        } );


        describe( 'free', () => {

            it( 'click with a literal', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu clico em <x>' ) );
                results.push( recognizeInTestCase( 'eu clico na opção <x>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL ] );
            } );

            it( 'click on a ui_element_type and a ui_literal', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu clico no botão <x>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, UI_LITERAL ] );
            } );

            it( 'click on a ui_element inside another ui_element', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu clico em {x} dentro de {y}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, UI_ACTION_OPTION, UI_ELEMENT ] );
            } );

            it( 'click on a ui_literal inside another ui_literal', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu clico em <x> dentro de <y>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL, UI_ACTION_OPTION, UI_LITERAL ] );
            } );

            it( 'fill with a ui_element', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu preencho {Nome}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT ] );
            } );

            it( 'fill with an element and a value', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu preencho {Nome} com "Bob"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, VALUE ] );
            } );

            it( 'fill with a target and a value', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu preencho o botão com "hello"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, VALUE ] );
            } );

            it( 'fill with a target, an element, and a value', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu preencho a caixa de texto {Nome} com "hello"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, UI_ELEMENT, VALUE ] );
            } );

            it( 'requirement for a state', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase( 'eu preciso ter ~algum estado~') );
                shouldHaveTestCaseEntities( results, [ EXEC_ACTION, STATE ] );
                expect( r.entities[ 1 ].value ).toBe( 'algum estado' );
            } );

            it( 'execution for a state', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase( 'eu executo o estado ~algum estado~' ) );
                shouldHaveTestCaseEntities( results, [ EXEC_ACTION, STATE ] );
            } );

        });

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