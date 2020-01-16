import { resolve } from 'path';

import {
    Entities,
    Intents,
    NLP,
    NLPResult,
    NLPTrainer
} from '../../modules/nlp';
import { LanguageContentLoader, JsonLanguageContentLoader } from '../../modules/dict';
import { Options } from '../../modules/app/Options';

describe( 'NLPInPortuguese', () => {

    let nlp: NLP; // under test
    const LANGUAGE = 'pt';
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( options.languageDir, {}, options.encoding );

    // entities
    const UI_ELEMENT: string = Entities.UI_ELEMENT_REF;
    const UI_LITERAL: string = Entities.UI_LITERAL;
    const VALUE: string = Entities.VALUE;
    const NUMBER: string = Entities.NUMBER;
    const CONSTANT: string = Entities.CONSTANT;
    const QUERY: string = Entities.QUERY;
    const STATE: string = Entities.STATE;
    const COMMAND: string = Entities.COMMAND;
    const UI_ACTION: string = Entities.UI_ACTION;
    const UI_ACTION_MODIFIER = Entities.UI_ACTION_MODIFIER;
    const UI_ACTION_OPTION = Entities.UI_ACTION_OPTION;
    const UI_ELEMENT_TYPE: string = Entities.UI_ELEMENT_TYPE;
    const UI_PROPERTY: string = Entities.UI_PROPERTY;
    const UI_CONNECTOR: string = Entities.UI_CONNECTOR;
    const UI_DATA_TYPE: string = Entities.UI_DATA_TYPE;
    const EXEC_ACTION: string = Entities.EXEC_ACTION;

    beforeEach( () => {
        nlp = new NLP();
        const ok = ( new NLPTrainer( langLoader ) ).trainNLP( nlp, LANGUAGE );
        expect( ok ).toBeTruthy();
    } );

    afterEach( () => {
        nlp = null;
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
        shouldHaveEntities( results, expectedEntitiesNames, Intents.TEST_CASE, debug );
    }

    function shouldHaveUIEntities( results: any[], expectedEntitiesNames: string[], debug: boolean = false ) {
        shouldHaveEntities( results, expectedEntitiesNames, Intents.UI, debug );
    }


    describe( 'testcase entities', () => {

        describe( 'structured', () => {

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

            it( '{ui_action} {ui_element} {ui_action_option} {value}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo {Foo} com classe "ativo"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, UI_ACTION_OPTION, VALUE ] );
            } );

            it( '{ui_action} {ui_element} {ui_action_option} {value} {value}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo {Foo} com atributo "name" sendo "bar"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, UI_ACTION_OPTION, VALUE, VALUE ] );
            } );

            it( '{ui_action} {ui_element} {ui_action_option} {value} {value}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo {Foo} com atributo "name" igual "bar"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, UI_ACTION_OPTION, VALUE, VALUE ] );
            } );

            it( '{ui_action} {ui_element} {ui_action_option} {value} {constant}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo {Foo} com atributo "name" igual [BAR]' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, UI_ACTION_OPTION, VALUE, CONSTANT ] );
            } );

            it( '{ui_action} {ui_element} {ui_action_option} {value} {ui_action_option} {value}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo {Foo} com atributo "name" com valor "bar"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, UI_ACTION_OPTION, VALUE, UI_ACTION_OPTION, VALUE ] );
            } );


            it( '{ui_action} {ui_literal} {ui_action_option} {value} {ui_action_option} {value}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo <#foo> com atributo "name" com valor "bar"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL, UI_ACTION_OPTION, VALUE, UI_ACTION_OPTION, VALUE ] );
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

            // it( '{ui_action} {value} {ui_literal}', () => {
            //     let results = [];
            //     results.push( recognizeInTestCase( 'eu entro com "Jane" em <nome>' ) );
            //     shouldHaveTestCaseEntities( results, [ UI_ACTION, VALUE, UI_LITERAL ] );
            // } );

            // it( '{ui_action} {number} {ui_literal}', () => {
            //     let results = [];
            //     results.push( recognizeInTestCase( 'eu entro com 1 em <salario>' ) );
            //     shouldHaveTestCaseEntities( results, [ UI_ACTION, NUMBER, UI_LITERAL ] );
            // } );

            // it( '{ui_action} {constant} {ui_literal}', () => {
            //     let results = [];
            //     results.push( recognizeInTestCase( 'eu entro com [Salário Padrão] em <salario>' ) );
            //     shouldHaveTestCaseEntities( results, [ UI_ACTION, CONSTANT, UI_LITERAL ] );
            // } );

            it( '{ui_action} {ui_element_type} {value}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo o título com "Documento 1"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, VALUE ] );
            } );

            it( '{ui_action} {ui_element_type} {number}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo o título com 100' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, NUMBER ] );
            } );

            it( '{ui_action} {ui_element_type} {constant}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo o título com [Título Padrão]' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, CONSTANT ] );
            } );

            // it( '{ui_action} {ui_element_type} {ui_property} {constant}', () => {
            //     let results = [];
            //     results.push( recognizeInTestCase( 'eu vejo a janela com cor [Cor Padrão]' ) );
            //     shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, UI_PROPERTY, CONSTANT ] );
            // } );

            it( '{ui_action} {ui_property} {ui_element}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo o valor de {Foo}' ) );
                results.push( recognizeInTestCase( 'eu vejo o valor mínimo de {Foo}' ) );
                results.push( recognizeInTestCase( 'eu vejo o valor máximo de {Foo}' ) );
                results.push( recognizeInTestCase( 'eu vejo o comprimento mínimo de {Foo}' ) );
                results.push( recognizeInTestCase( 'eu vejo o comprimento máximo de {Foo}' ) );
                results.push( recognizeInTestCase( 'eu vejo o formato de {Foo}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_PROPERTY, UI_ELEMENT ] );
            } );

            it( '{ui_action} {ui_property} {ui_element} {ui_action_option} {ui_element}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu vejo o valor de {Foo} dentro de {Foo}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_PROPERTY, UI_ELEMENT, UI_ACTION_OPTION, UI_ELEMENT ] );
            } );

            // ...

            it( '{exec_action} {state}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'eu tenho ~foo~' ) );
                shouldHaveTestCaseEntities( results, [ EXEC_ACTION, STATE ] );
            } );

            it( 'given {exec_action} {state}', () => {
                let results = [];
                results.push( recognizeInTestCase( 'dado que eu tenho ~foo~' ) );
                shouldHaveTestCaseEntities( results, [ EXEC_ACTION, STATE ] );
            } );

            it( '{ui_action} {ui_action_option} {command}', () => {
                let results = [];
                results.push( recognizeInTestCase( "dado que eu executo o script 'foo'" ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ACTION_OPTION, COMMAND ] );
            } );

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
                results.push( recognizeInTestCase( 'eu clico em {x} dentro {y}' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT, UI_ACTION_OPTION, UI_ELEMENT ] );
            } );

            // it( 'click on a ui_literal inside another ui_literal', () => {
            //     let results = [];
            //     results.push( recognizeInTestCase( 'eu clico em <x> dentro de <y>' ) );
            //     shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL, UI_ACTION_OPTION, UI_LITERAL ] );
            // } );

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
                results.push( r = recognizeInTestCase( 'eu preciso de ~algum estado~') );
                shouldHaveTestCaseEntities( results, [ EXEC_ACTION, STATE ] );
                expect( r.entities[ 1 ].value ).toBe( 'algum estado' );
            } );

            it( 'execution for a state', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase( 'eu tenho ~algum estado~' ) );
                shouldHaveTestCaseEntities( results, [ EXEC_ACTION, STATE ] );
            } );

            it( 'click with escaped xpath', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase( 'eu clico em "//*[@id=\\"left-panel\\"]/nav/ul/li[2]/a"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, VALUE ] );
                expect( r.entities.find( e => e.entity === VALUE ).value ).toEqual( '//*[@id=\\"left-panel\\"]/nav/ul/li[2]/a' );
            } );

            it( 'click with long css selector', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase( 'eu clico em "#js-repo-pjax-container > div.container.new-discussion-timeline.experiment-repo-nav > div.repository-content > div.release-show > div > div.release-body.commit.open.float-left > div.my-4 > h2"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, VALUE ] );
                expect( r.entities.find( e => e.entity === VALUE ).value ).toEqual( '#js-repo-pjax-container > div.container.new-discussion-timeline.experiment-repo-nav > div.repository-content > div.release-show > div > div.release-body.commit.open.float-left > div.my-4 > h2' );
            } );

            it( 'see with long escaped css selector as ui literal', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase( 'eu vejo <#js-repo-pjax-container \> div.container.new-discussion-timeline.experiment-repo-nav \> div.repository-content \> div.release-show \> div \> div.release-body.commit.open.float-left \> div.my-4 \> h2>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL ] );
                expect( r.entities.find( e => e.entity === UI_LITERAL ).value ).toEqual(
                    '#js-repo-pjax-container > div.container.new-discussion-timeline.experiment-repo-nav > div.repository-content > div.release-show > div > div.release-body.commit.open.float-left > div.my-4 > h2' );
            } );

            it( 'see the url', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase( 'eu vejo a url "/foo"' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_ELEMENT_TYPE, VALUE ] );
                expect( r.entities.find( e => e.entity === UI_ACTION ).value ).toEqual( 'see' );
                expect( r.entities.find( e => e.entity === UI_ELEMENT_TYPE ).value ).toEqual( 'url' );
                expect( r.entities.find( e => e.entity === VALUE ).value ).toEqual( '/foo' );
            } );

            it( 'drag and drop with with long escaped css selector as ui literals', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase(
                    'eu arrasto <#js-repo-pjax-container \> div.container \> div h2> para <foo \> bar \> zoo>' ) );
                shouldHaveTestCaseEntities( results, [ UI_ACTION, UI_LITERAL, UI_LITERAL ] );

                let found = r.entities.filter( e => e.entity === UI_LITERAL );
                expect( found[ 0 ].value ).toEqual( '#js-repo-pjax-container \> div.container \> div h2' );
                expect( found[ 1 ].value ).toEqual( 'foo \> bar \> zoo' );
            } );

            it( 'fill with ui literal and long value', () => {

                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase(
                    'Quando eu informo <Nome> com    "kz[RU8\'$}*Nxzk)tdc/%56Qy\\v,7hkkK-(@X ]\\"k\\FQxj%rF=PNzAP:\'%@Tp9IY4[yr,03OCd1BTY5z5RW\\"Z1Qy_4#e`1aE_6)U|:]bgP^-sb\\>|-wSBA4dn}B.9OGB?uMpT`xd8G7I~=+*,T?nUmL2!EIXA(}ywY*CW2Hb*6`E{I).B`n`eAIx0]hjz#,T;sE|pPWxM0`92`h#Iw3jXp *z*ERq"'
                ) );

                shouldHaveTestCaseEntities( results, [ UI_LITERAL, VALUE ] );
                let uiLiterals = r.entities.filter( e => e.entity === UI_LITERAL );
                let values = r.entities.filter( e => e.entity === VALUE );
                expect( uiLiterals[ 0 ].value ).toEqual( 'Nome' );
                expect( values[ 0 ].value ).toEqual( 'kz[RU8\'$}*Nxzk)tdc/%56Qy\\v,7hkkK-(@X ]\\"k\\FQxj%rF=PNzAP:\'%@Tp9IY4[yr,03OCd1BTY5z5RW\\"Z1Qy_4#e`1aE_6)U|:]bgP^-sb\\>|-wSBA4dn}B.9OGB?uMpT`xd8G7I~=+*,T?nUmL2!EIXA(}ywY*CW2Hb*6`E{I).B`n`eAIx0]hjz#,T;sE|pPWxM0`92`h#Iw3jXp *z*ERq' );
            } );

            it( 'fill with ui literal and problematic values', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase(
                    'Quando eu informo <#foo> com    "t-HK pf79U~M#Q?mDTN~eW;+UwsheU8^@_j2\\qaX6;w\\""'
                ) );

                shouldHaveTestCaseEntities( results, [ UI_LITERAL, VALUE ] );
                let uiLiterals = r.entities.filter( e => e.entity === UI_LITERAL );
                let values = r.entities.filter( e => e.entity === VALUE );
                expect( uiLiterals[ 0 ].value ).toEqual( '#foo' );
                expect( values[ 0 ].value ).toEqual( 't-HK pf79U~M#Q?mDTN~eW;+UwsheU8^@_j2\\qaX6;w\\"' );
            } );

            it( 'fill with ui literal and long negative number', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase(
                    'Quando eu preencho <bar> com -53358731722743'
                ) );

                shouldHaveTestCaseEntities( results, [ UI_LITERAL, NUMBER ] );
                let uiLiterals = r.entities.filter( e => e.entity === UI_LITERAL );
                let numbers = r.entities.filter( e => e.entity === NUMBER );
                expect( uiLiterals[ 0 ].value ).toEqual( 'bar' );
                expect( numbers[ 0 ].value ).toEqual( -53358731722743 );
            } );

            it( 'switch to iframe', () => {
                let results = [];
                let r: NLPResult;
                results.push( r = recognizeInTestCase(
                    'Quando eu troco para iframe'
                ) );

                shouldHaveTestCaseEntities( results, [ UI_ELEMENT_TYPE ] );
                let actionOption = r.entities.filter( e => e.entity === UI_ELEMENT_TYPE );
                expect( actionOption[ 0 ].value ).toEqual( 'frame' );
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