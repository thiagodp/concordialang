"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const Options_1 = require("../../modules/app/Options");
const LexerBuilder_1 = require("../../modules/lexer/LexerBuilder");
const path_1 = require("path");
/**
 * @author Thiago Delgado Pinto
 */
describe('LexerTest', () => {
    const options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
    let lexer = (new LexerBuilder_1.LexerBuilder()).build(options, 'en');
    // Helper function
    function assertLineExpectations(lines) {
        lines.forEach((val, index) => lexer.addNodeFromLine(val.l, index + 1));
        expect(lexer.errors().length).toBe(0);
        let expectations = lines
            .filter(val => val.e !== null) // only the defined expectations
            .map(val => val.e); // return the expectations
        lexer.nodes().forEach((node, index) => {
            if (node.nodeType !== expectations[index]) {
                console.log('At index', index, 'got', node.nodeType, 'expected', expectations[index], "\nnode", node);
            }
            expect(node.nodeType).toBe(expectations[index]); // same index as the expectation
        });
    }
    beforeEach(() => {
        lexer.reset();
    });
    it('ignores empty lines', () => {
        expect(lexer.addNodeFromLine('', 1)).toBeFalsy();
    });
    it('detects correctly in english', () => {
        let lines = [
            { l: '#language:en', e: NodeTypes_1.NodeTypes.LANGUAGE },
            { l: '', e: null },
            { l: 'import "somefile"', e: NodeTypes_1.NodeTypes.IMPORT },
            { l: '', e: null },
            { l: '@important', e: NodeTypes_1.NodeTypes.TAG },
            { l: 'Feature: my feature', e: NodeTypes_1.NodeTypes.FEATURE },
            { l: '  As a user', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '  I would to like to login', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '  In order to access the system', e: NodeTypes_1.NodeTypes.TEXT },
            { l: ' \t', e: null },
            { l: 'Background:', e: NodeTypes_1.NodeTypes.BACKGROUND },
            { l: '  Given something', e: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { l: '    and another thing', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  When anything happens', e: NodeTypes_1.NodeTypes.STEP_WHEN },
            { l: '    and other thing happens', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '    but other thing does not happen', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  Then the result is anything', e: NodeTypes_1.NodeTypes.STEP_THEN },
            { l: '    and another result could also happen', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: ' \t', e: null },
            { l: 'Scenario: hello', e: NodeTypes_1.NodeTypes.SCENARIO },
            { l: '  Given something', e: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { l: '    and another thing', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  When anything happens', e: NodeTypes_1.NodeTypes.STEP_WHEN },
            { l: '    and other thing happens', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '    but other thing does not happen', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  Then the result is anything', e: NodeTypes_1.NodeTypes.STEP_THEN },
            { l: '    and another result could also happen', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Variant: my variant', e: NodeTypes_1.NodeTypes.VARIANT },
            { l: '  Given that I see the {Login Page}', e: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { l: '  When I fill the {Username}', e: NodeTypes_1.NodeTypes.STEP_WHEN },
            { l: '    And I fill the {Password}', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '    And I click on {Enter}', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  Then I see the {Home Page}', e: NodeTypes_1.NodeTypes.STEP_THEN },
            { l: '', e: null },
            { l: 'Test Case: my test case', e: NodeTypes_1.NodeTypes.TEST_CASE },
            { l: '  Given that I see the url "/login"', e: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { l: '  When I fill "#username" with ""', e: NodeTypes_1.NodeTypes.STEP_WHEN },
            { l: '    And I fill "#password" with "bobp4ss"', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '    And I click "Enter"', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  Then I see the url "/home"', e: NodeTypes_1.NodeTypes.STEP_THEN },
            { l: '', e: null },
            { l: 'Constants:', e: NodeTypes_1.NodeTypes.CONSTANT_BLOCK },
            { l: '  - "msg" is "hello"', e: NodeTypes_1.NodeTypes.CONSTANT },
            { l: '  - "max_name_size" is 60', e: NodeTypes_1.NodeTypes.CONSTANT },
            { l: '  - "pi" is 3.14', e: NodeTypes_1.NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'Regular Expressions:', e: NodeTypes_1.NodeTypes.REGEX_BLOCK },
            { l: '  - "name" is "[A-Za-z]{2,60}"', e: NodeTypes_1.NodeTypes.REGEX },
            { l: '', e: null },
            { l: 'Table: users', e: NodeTypes_1.NodeTypes.TABLE },
            { l: '  | column1 | column2 |', e: NodeTypes_1.NodeTypes.TABLE_ROW },
            { l: '  | value1 | value2 |', e: NodeTypes_1.NodeTypes.TABLE_ROW },
            { l: '', e: null },
            { l: 'Before All:', e: NodeTypes_1.NodeTypes.BEFORE_ALL },
            { l: 'After All:', e: NodeTypes_1.NodeTypes.AFTER_ALL },
            { l: 'Before Feature:', e: NodeTypes_1.NodeTypes.BEFORE_FEATURE },
            { l: 'After Feature:', e: NodeTypes_1.NodeTypes.AFTER_FEATURE },
            { l: 'Before Each Scenario:', e: NodeTypes_1.NodeTypes.BEFORE_EACH_SCENARIO },
            { l: 'After Each Scenario:', e: NodeTypes_1.NodeTypes.AFTER_EACH_SCENARIO },
            { l: '', e: null },
            { l: 'this must be recognized as text', e: NodeTypes_1.NodeTypes.TEXT }
        ];
        assertLineExpectations(lines);
    });
    it('detects correctly in portuguese', () => {
        let lines = [
            { l: '#language:pt', e: NodeTypes_1.NodeTypes.LANGUAGE },
            { l: '', e: null },
            { l: 'importe "somefile"', e: NodeTypes_1.NodeTypes.IMPORT },
            { l: '', e: null },
            { l: '@importante', e: NodeTypes_1.NodeTypes.TAG },
            { l: 'Característica: my feature', e: NodeTypes_1.NodeTypes.FEATURE },
            { l: '  Como um user', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '  Eu gostaria de to login', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '  Para to access the system', e: NodeTypes_1.NodeTypes.TEXT },
            { l: ' \t', e: null },
            { l: 'Background:', e: NodeTypes_1.NodeTypes.BACKGROUND },
            { l: '  dado something', e: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { l: '    e another thing', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  quando anything happens', e: NodeTypes_1.NodeTypes.STEP_WHEN },
            { l: '    e other thing happens', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '    mas other thing does not happen', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  então the result is anything', e: NodeTypes_1.NodeTypes.STEP_THEN },
            { l: '    e another result could also happen', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: ' \t', e: null },
            { l: 'Cenário: hello', e: NodeTypes_1.NodeTypes.SCENARIO },
            { l: '  dado something', e: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { l: '    e another thing', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  quando anything happens', e: NodeTypes_1.NodeTypes.STEP_WHEN },
            { l: '    e other thing happens', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '    mas other thing does not happen', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  então the result is anything', e: NodeTypes_1.NodeTypes.STEP_THEN },
            { l: '    e another result could also happen', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Variante: minha variante', e: NodeTypes_1.NodeTypes.VARIANT },
            { l: '  Dado que vejo a {Pagina de Login}', e: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { l: '  Quando preencho {Username}', e: NodeTypes_1.NodeTypes.STEP_WHEN },
            { l: '    E preencho {Password}', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '    E clico em {Enter}', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  Então vejo a {Pagina Inicial}', e: NodeTypes_1.NodeTypes.STEP_THEN },
            { l: '', e: null },
            { l: 'Caso de Teste: my test case', e: NodeTypes_1.NodeTypes.TEST_CASE },
            { l: '  Dado que vejo a url "/login"', e: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { l: '  Quando preencho "#username" com ""', e: NodeTypes_1.NodeTypes.STEP_WHEN },
            { l: '    E preencho "#password" com "bobp4ss"', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '    E clico "Enter"', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  Então vejo a url "/home"', e: NodeTypes_1.NodeTypes.STEP_THEN },
            { l: '', e: null },
            { l: 'Constantes:', e: NodeTypes_1.NodeTypes.CONSTANT_BLOCK },
            { l: '  - "msg" é "hello"', e: NodeTypes_1.NodeTypes.CONSTANT },
            { l: '  - "max_name_size" é 60', e: NodeTypes_1.NodeTypes.CONSTANT },
            { l: '  - "pi" é 3.14', e: NodeTypes_1.NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'Expressões Regulares:', e: NodeTypes_1.NodeTypes.REGEX_BLOCK },
            { l: '  - "nome" é "[A-Za-z]{2,60}"', e: NodeTypes_1.NodeTypes.REGEX },
            { l: '', e: null },
            { l: 'Tabela: users', e: NodeTypes_1.NodeTypes.TABLE },
            { l: '  | column1 | column2 |', e: NodeTypes_1.NodeTypes.TABLE_ROW },
            { l: '  | value1 | value2 |', e: NodeTypes_1.NodeTypes.TABLE_ROW },
            { l: '', e: null },
            { l: 'Antes de Todos:', e: NodeTypes_1.NodeTypes.BEFORE_ALL },
            { l: 'Depois de Todos:', e: NodeTypes_1.NodeTypes.AFTER_ALL },
            { l: 'Antes da Feature:', e: NodeTypes_1.NodeTypes.BEFORE_FEATURE },
            { l: 'Após a Feature:', e: NodeTypes_1.NodeTypes.AFTER_FEATURE },
            { l: 'Antes de Cada Cenário:', e: NodeTypes_1.NodeTypes.BEFORE_EACH_SCENARIO },
            { l: 'Depois de Cada Cenário:', e: NodeTypes_1.NodeTypes.AFTER_EACH_SCENARIO },
            { l: '', e: null },
            { l: 'isso deve ser reconhecido como texto', e: NodeTypes_1.NodeTypes.TEXT }
        ];
        assertLineExpectations(lines);
    });
    it('recognizes everything inside long strings as text', () => {
        let lines = [
            { l: '"""', e: NodeTypes_1.NodeTypes.LONG_STRING },
            { l: '#language:pt', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '', e: null },
            { l: 'importe "somefile"', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '', e: null },
            { l: '@importante', e: NodeTypes_1.NodeTypes.TEXT },
            { l: 'Característica: my feature', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '  Como um user', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '  Eu gostaria de to login', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '  Para to access the system', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '"""', e: NodeTypes_1.NodeTypes.LONG_STRING },
            { l: ' \t', e: null },
            { l: '#language:pt', e: NodeTypes_1.NodeTypes.LANGUAGE },
            { l: 'Característica: my feature', e: NodeTypes_1.NodeTypes.FEATURE },
            { l: 'Background:', e: NodeTypes_1.NodeTypes.BACKGROUND },
            { l: '  dado something', e: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { l: '    e another thing', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  quando anything happens', e: NodeTypes_1.NodeTypes.STEP_WHEN },
            { l: '    e other thing happens', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '    mas other thing does not happen', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: '  então the result is anything', e: NodeTypes_1.NodeTypes.STEP_THEN },
            { l: '    e another result could also happen', e: NodeTypes_1.NodeTypes.STEP_AND },
            { l: ' \t', e: null },
            { l: '"""', e: NodeTypes_1.NodeTypes.LONG_STRING },
            { l: 'Cenário: hello', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '  dado something', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '    e another thing', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '  quando anything happens', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '    e other thing happens', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '    mas other thing does not happen', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '  então the result is anything', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '    e another result could also happen', e: NodeTypes_1.NodeTypes.TEXT },
            { l: '', e: null },
            { l: '"""', e: NodeTypes_1.NodeTypes.LONG_STRING },
            { l: 'isso deve ser reconhecido como texto', e: NodeTypes_1.NodeTypes.TEXT }
        ];
        assertLineExpectations(lines);
    });
});
//# sourceMappingURL=LexerTest.spec.js.map