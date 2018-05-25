"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestCaseFileGenerator_1 = require("../../modules/testcase/TestCaseFileGenerator");
const LanguageContentLoader_1 = require("../../modules/dict/LanguageContentLoader");
const path_1 = require("path");
const Options_1 = require("../../modules/app/Options");
const SingleFileCompiler_1 = require("../../modules/app/SingleFileCompiler");
const LexerBuilder_1 = require("../../modules/lexer/LexerBuilder");
const Parser_1 = require("../../modules/parser/Parser");
const NLPBasedSentenceRecognizer_1 = require("../../modules/nlp/NLPBasedSentenceRecognizer");
const NLPTrainer_1 = require("../../modules/nlp/NLPTrainer");
const SingleFileProcessor_1 = require("../../modules/app/SingleFileProcessor");
/**
 * @author Thiago Delgado Pinto
 */
describe('TestCaseFileGeneratorTest', () => {
    const LANGUAGE = 'en';
    const options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
    const langLoader = new LanguageContentLoader_1.JsonLanguageContentLoader(options.languageDir, {}, options.encoding);
    let sfc = new SingleFileCompiler_1.SingleFileCompiler((new LexerBuilder_1.LexerBuilder()).build(options, LANGUAGE), new Parser_1.Parser(), new NLPBasedSentenceRecognizer_1.NLPBasedSentenceRecognizer(new NLPTrainer_1.NLPTrainer(langLoader)), LANGUAGE, true // <<< Semantic analysis ignored
    );
    // utility
    function check(input, language = LANGUAGE, expected) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield sfc.process(new SingleFileProcessor_1.FileData(new SingleFileProcessor_1.FileMeta('./fake.testcase', 100, 'fake-hash'), input.join("\n")), "\n");
            expect(result.errors).toHaveLength(0);
            let errors = result.errors;
            let doc = result.content;
            const gen = new TestCaseFileGenerator_1.TestCaseFileGenerator(langLoader, language); // under test
            const output = gen.createLinesFromDoc(doc, errors, true)
                .map(s => s.toLowerCase());
            const wanted = (expected || input).map(s => s.toLowerCase());
            expect(output).toEqual(wanted);
        });
    }
    // ENGLISH
    it('generates basic lines in english', () => __awaiter(this, void 0, void 0, function* () {
        const input = [
            'import "fake.feature"',
            '',
            'test case: foo'
        ];
        yield check(input, 'en');
    }));
    it('generates with a single test case', () => __awaiter(this, void 0, void 0, function* () {
        const input = [
            'import "fake.feature"',
            '',
            'test case: foo',
            '  given that I see the url "http://localhost/foo"',
            '  when I click <register>',
            '  then I see "Register"',
            '    and I see the url "http://localhost/foo/register"'
        ];
        yield check(input, 'en');
    }));
    it('generates with more than one test case', () => __awaiter(this, void 0, void 0, function* () {
        const input = [
            'import "fake.feature"',
            '',
            'test case: foo',
            '  given that I see the url "http://localhost/foo"',
            '  when I click <register>',
            '  then I see "Register"',
            '    and I see the url "http://localhost/foo/register"',
            '',
            'test case: bar',
            '  given that I see the url "http://localhost/bar"',
            '    and I see "Bar"',
            '    and I don\'t see "Foo"',
            '  when I click <menu>',
            '    and I click <login>',
            '  then I see "Login"',
            '    and I see the url "http://localhost/foo/login"'
        ];
        yield check(input, 'en');
    }));
    // PORTUGUESE
    it('generates basic lines in portuguse', () => __awaiter(this, void 0, void 0, function* () {
        const input = [
            'import "fake.feature"',
            '',
            'test case: foo'
        ];
        const expected = [
            'importe "fake.feature"',
            '',
            'caso de teste: foo'
        ];
        yield check(input, 'pt', expected);
    }));
    it('generates with a single test case in portuguese', () => __awaiter(this, void 0, void 0, function* () {
        const input = [
            '#language:pt',
            '',
            'importe "fake.feature"',
            '',
            'caso de teste: foo',
            '  dado que eu vejo a url "http://localhost/foo"',
            '  quando click em <register>',
            '  então eu vejo "Register"',
            '    e eu vejo a url "http://localhost/foo/register"'
        ];
        yield check(input, 'pt');
    }));
    it('generates with more than one test case in portuguese', () => __awaiter(this, void 0, void 0, function* () {
        const input = [
            '#language:pt',
            '',
            'importe "fake.feature"',
            '',
            'caso de teste: foo',
            '  dado que eu vejo a url "http://localhost/foo"',
            '  quando click em <register>',
            '  então eu vejo "Register"',
            '    e eu vejo a url "http://localhost/foo/register"',
            '',
            'caso de teste: bar',
            '  dado que eu vejo a url "http://localhost/bar"',
            '    e eu vejo "Bar"',
            '    e eu não vejo "Foo"',
            '  quando eu clico em <menu>',
            '    e eu clico em <login>',
            '  então eu vejo "Login"',
            '    e eu vejo a url "http://localhost/foo/login"'
        ];
        yield check(input, 'pt');
    }));
});
