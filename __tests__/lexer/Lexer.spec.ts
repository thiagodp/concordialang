import * as fs from 'fs';
import { resolve } from 'path';

import { DEFAULT_DIR_LANGUAGE, DEFAULT_LANGUAGE } from '../../modules/app/default-options';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../modules/language';
import { Lexer } from '../../modules/lexer/Lexer';
import { NodeTypes } from '../../modules/req/NodeTypes';
import { FSFileHandler } from '../../modules/util/file/FSFileHandler';

describe( 'Lexer', () => {

	const dir = resolve( process.cwd(), 'dist/' );
	const langDir = resolve( dir, DEFAULT_DIR_LANGUAGE );

    const fileHandler = new FSFileHandler( fs );

    const langLoader: LanguageContentLoader = new JsonLanguageContentLoader(
        langDir,
        {},
        fileHandler,
        fileHandler
        );

    const lexer: Lexer = new Lexer( DEFAULT_LANGUAGE, langLoader ); // under test

    // Helper function
    function assertLineExpectations( lines: any[] ) {
        lines.forEach( ( val, index ) => lexer.addNodeFromLine( val.l, index + 1 ) );

        expect( lexer.errors().length ).toBe( 0 );

        let expectations = lines
            .filter( val => val.e !== null ) // only the defined expectations
            .map( val => val.e ); // return the expectations

        lexer.nodes().forEach( ( node, index ) => {
            if ( node.nodeType !== expectations[ index ] ) {
                console.log( 'At index', index, 'got', node.nodeType, 'expected', expectations[ index ], "\nnode", node );
            }
            expect( node.nodeType ).toBe( expectations[ index ] );  // same index as the expectation
        } );
    }


    beforeEach( () => {
        lexer.reset();
    } );

    it( 'ignores empty lines', () => {
        expect( lexer.addNodeFromLine( '', 1 ) ).toBeFalsy();
    } );

    it( 'detects correctly in english', () => {
        let lines =
        [
            { l: '#language:en', e: NodeTypes.LANGUAGE },
            { l: '', e: null },
            { l: 'import "somefile"', e: NodeTypes.IMPORT },
            { l: '', e: null },
            { l: '@important', e: NodeTypes.TAG },
            { l: 'Feature: my feature', e: NodeTypes.FEATURE },
            { l: '  As a user', e: NodeTypes.TEXT },
            { l: '  I would to like to login', e: NodeTypes.TEXT },
            { l: '  In order to access the system', e: NodeTypes.TEXT },
            { l: ' \t', e: null },
            { l: 'Background:', e: NodeTypes.BACKGROUND },
            { l: '  Given something', e: NodeTypes.STEP_GIVEN },
            { l: '    and another thing', e: NodeTypes.STEP_AND },
            { l: '  When anything happens', e: NodeTypes.STEP_WHEN },
            { l: '    and other thing happens', e: NodeTypes.STEP_AND },
            { l: '    but other thing does not happen', e: NodeTypes.STEP_AND },
            { l: '  Then the result is anything', e: NodeTypes.STEP_THEN },
            { l: '    and another result could also happen', e: NodeTypes.STEP_AND },
            { l: ' \t', e: null },
            { l: 'Scenario: hello', e: NodeTypes.SCENARIO },
            { l: '  Given something', e: NodeTypes.STEP_GIVEN },
            { l: '    and another thing', e: NodeTypes.STEP_AND },
            { l: '  When anything happens', e: NodeTypes.STEP_WHEN },
            { l: '    and other thing happens', e: NodeTypes.STEP_AND },
            { l: '    but other thing does not happen', e: NodeTypes.STEP_AND },
            { l: '  Then the result is anything', e: NodeTypes.STEP_THEN },
            { l: '    and another result could also happen', e: NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Variant: my variant', e: NodeTypes.VARIANT },
            { l: '  Given that I see the {Login Page}', e: NodeTypes.STEP_GIVEN },
            { l: '  When I fill the {Username}', e: NodeTypes.STEP_WHEN },
            { l: '    And I fill the {Password}', e: NodeTypes.STEP_AND },
            { l: '    And I click on {Enter}', e: NodeTypes.STEP_AND },
            { l: '  Then I see the {Home Page}', e: NodeTypes.STEP_THEN },
            { l: '', e: null },
            { l: 'Test Case: my test case', e: NodeTypes.TEST_CASE },
            { l: '  Given that I see the url "/login"', e: NodeTypes.STEP_GIVEN },
            { l: '  When I fill "#username" with ""', e: NodeTypes.STEP_WHEN },
            { l: '    And I fill "#password" with "bobp4ss"', e: NodeTypes.STEP_AND },
            { l: '    And I click "Enter"', e: NodeTypes.STEP_AND },
            { l: '  Then I see the url "/home"', e: NodeTypes.STEP_THEN },
            { l: '', e: null },
            { l: 'Constants:', e: NodeTypes.CONSTANT_BLOCK },
            { l: '  - "msg" is "hello"', e: NodeTypes.CONSTANT },
            { l: '  - "max_name_size" is 60', e: NodeTypes.CONSTANT },
            { l: '  - "pi" is 3.14', e: NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'Regular Expressions:', e: NodeTypes.REGEX_BLOCK },
            { l: '  - "name" is "[A-Za-z]{2,60}"', e: NodeTypes.REGEX },
            { l: '', e: null },
            { l: 'Table: users', e: NodeTypes.TABLE },
            { l: '  | column1 | column2 |', e: NodeTypes.TABLE_ROW },
            { l: '  | value1 | value2 |', e: NodeTypes.TABLE_ROW },
            { l: '', e: null },
            { l: 'Before All:', e: NodeTypes.BEFORE_ALL },
            { l: 'After All:', e: NodeTypes.AFTER_ALL },
            { l: 'Before Feature:', e: NodeTypes.BEFORE_FEATURE },
            { l: 'After Feature:', e: NodeTypes.AFTER_FEATURE },
            { l: 'Before Each Scenario:', e: NodeTypes.BEFORE_EACH_SCENARIO },
            { l: 'After Each Scenario:', e: NodeTypes.AFTER_EACH_SCENARIO },
            { l: '', e: null },
            { l: 'this must be recognized as text', e: NodeTypes.TEXT }
        ];

        assertLineExpectations( lines );
    } );


    it( 'detects correctly in portuguese', () => {
        let lines =
        [
            { l: '#language:pt', e: NodeTypes.LANGUAGE },
            { l: '', e: null },
            { l: 'importe "somefile"', e: NodeTypes.IMPORT },
            { l: '', e: null },
            { l: '@importante', e: NodeTypes.TAG },
            { l: 'Característica: my feature', e: NodeTypes.FEATURE },
            { l: '  Como um user', e: NodeTypes.TEXT },
            { l: '  Eu gostaria de to login', e: NodeTypes.TEXT },
            { l: '  Para to access the system', e: NodeTypes.TEXT },
            { l: ' \t', e: null },
            { l: 'Background:', e: NodeTypes.BACKGROUND },
            { l: '  dado something', e: NodeTypes.STEP_GIVEN },
            { l: '    e another thing', e: NodeTypes.STEP_AND },
            { l: '  quando anything happens', e: NodeTypes.STEP_WHEN },
            { l: '    e other thing happens', e: NodeTypes.STEP_AND },
            { l: '    mas other thing does not happen', e: NodeTypes.STEP_AND },
            { l: '  então the result is anything', e: NodeTypes.STEP_THEN },
            { l: '    e another result could also happen', e: NodeTypes.STEP_AND },
            { l: ' \t', e: null },
            { l: 'Cenário: hello', e: NodeTypes.SCENARIO },
            { l: '  dado something', e: NodeTypes.STEP_GIVEN },
            { l: '    e another thing', e: NodeTypes.STEP_AND },
            { l: '  quando anything happens', e: NodeTypes.STEP_WHEN },
            { l: '    e other thing happens', e: NodeTypes.STEP_AND },
            { l: '    mas other thing does not happen', e: NodeTypes.STEP_AND },
            { l: '  então the result is anything', e: NodeTypes.STEP_THEN },
            { l: '    e another result could also happen', e: NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Variante: minha variante', e: NodeTypes.VARIANT },
            { l: '  Dado que vejo a {Pagina de Login}', e: NodeTypes.STEP_GIVEN },
            { l: '  Quando preencho {Username}', e: NodeTypes.STEP_WHEN },
            { l: '    E preencho {Password}', e: NodeTypes.STEP_AND },
            { l: '    E clico em {Enter}', e: NodeTypes.STEP_AND },
            { l: '  Então vejo a {Pagina Inicial}', e: NodeTypes.STEP_THEN },
            { l: '', e: null },
            { l: 'Caso de Teste: my test case', e: NodeTypes.TEST_CASE },
            { l: '  Dado que vejo a url "/login"', e: NodeTypes.STEP_GIVEN },
            { l: '  Quando preencho "#username" com ""', e: NodeTypes.STEP_WHEN },
            { l: '    E preencho "#password" com "bobp4ss"', e: NodeTypes.STEP_AND },
            { l: '    E clico "Enter"', e: NodeTypes.STEP_AND },
            { l: '  Então vejo a url "/home"', e: NodeTypes.STEP_THEN },
            { l: '', e: null },
            { l: 'Constantes:', e: NodeTypes.CONSTANT_BLOCK },
            { l: '  - "msg" é "hello"', e: NodeTypes.CONSTANT },
            { l: '  - "max_name_size" é 60', e: NodeTypes.CONSTANT },
            { l: '  - "pi" é 3.14', e: NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'Expressões Regulares:', e: NodeTypes.REGEX_BLOCK },
            { l: '  - "nome" é "[A-Za-z]{2,60}"', e: NodeTypes.REGEX },
            { l: '', e: null },
            { l: 'Tabela: users', e: NodeTypes.TABLE },
            { l: '  | column1 | column2 |', e: NodeTypes.TABLE_ROW },
            { l: '  | value1 | value2 |', e: NodeTypes.TABLE_ROW },
            { l: '', e: null },
            { l: 'Antes de Todos:', e: NodeTypes.BEFORE_ALL },
            { l: 'Depois de Todos:', e: NodeTypes.AFTER_ALL },
            { l: 'Antes da Funcionalidade:', e: NodeTypes.BEFORE_FEATURE },
            { l: 'Depois da Funcionalidade:', e: NodeTypes.AFTER_FEATURE },
            { l: 'Antes de Cada Cenário:', e: NodeTypes.BEFORE_EACH_SCENARIO },
            { l: 'Depois de Cada Cenário:', e: NodeTypes.AFTER_EACH_SCENARIO },
            { l: '', e: null },
            { l: 'isso deve ser reconhecido como texto', e: NodeTypes.TEXT }
        ];

        assertLineExpectations( lines );
    } );



    it( 'recognizes everything inside long strings as text', () => {
        let lines =
        [
            { l: '"""', e: NodeTypes.LONG_STRING }, // start here
            { l: '#language:pt', e: NodeTypes.TEXT },
            { l: '', e: null },
            { l: 'importe "somefile"', e: NodeTypes.TEXT },
            { l: '', e: null },
            { l: '@importante', e: NodeTypes.TEXT },
            { l: 'Característica: my feature', e: NodeTypes.TEXT },
            { l: '  Como um user', e: NodeTypes.TEXT },
            { l: '  Eu gostaria de to login', e: NodeTypes.TEXT },
            { l: '  Para to access the system', e: NodeTypes.TEXT },
            { l: '"""', e: NodeTypes.LONG_STRING }, // finish here
            { l: ' \t', e: null },
            { l: '#language:pt', e: NodeTypes.LANGUAGE },
            { l: 'Característica: my feature', e: NodeTypes.FEATURE },
            { l: 'Background:', e: NodeTypes.BACKGROUND },
            { l: '  dado something', e: NodeTypes.STEP_GIVEN },
            { l: '    e another thing', e: NodeTypes.STEP_AND },
            { l: '  quando anything happens', e: NodeTypes.STEP_WHEN },
            { l: '    e other thing happens', e: NodeTypes.STEP_AND },
            { l: '    mas other thing does not happen', e: NodeTypes.STEP_AND },
            { l: '  então the result is anything', e: NodeTypes.STEP_THEN },
            { l: '    e another result could also happen', e: NodeTypes.STEP_AND },
            { l: ' \t', e: null },
            { l: '"""', e: NodeTypes.LONG_STRING }, // restart here
            { l: 'Cenário: hello', e: NodeTypes.TEXT },
            { l: '  dado something', e: NodeTypes.TEXT },
            { l: '    e another thing', e: NodeTypes.TEXT },
            { l: '  quando anything happens', e: NodeTypes.TEXT },
            { l: '    e other thing happens', e: NodeTypes.TEXT },
            { l: '    mas other thing does not happen', e: NodeTypes.TEXT },
            { l: '  então the result is anything', e: NodeTypes.TEXT },
            { l: '    e another result could also happen', e: NodeTypes.TEXT },
            { l: '', e: null },
            { l: '"""', e: NodeTypes.LONG_STRING }, // finish here
            { l: 'isso deve ser reconhecido como texto', e: NodeTypes.TEXT }
        ];

        assertLineExpectations( lines );
    } );

} );
