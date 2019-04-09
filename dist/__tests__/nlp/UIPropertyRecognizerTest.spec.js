"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const NLPTrainer_1 = require("../../modules/nlp/NLPTrainer");
const NLP_1 = require("../../modules/nlp/NLP");
const UIPropertyRecognizer_1 = require("../../modules/nlp/UIPropertyRecognizer");
const Options_1 = require("../../modules/app/Options");
const LanguageContentLoader_1 = require("../../modules/dict/LanguageContentLoader");
describe('UIPropertyRecognizerTest', () => {
    let nodes = [];
    let errors = [];
    let warnings = [];
    const options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
    const langLoader = new LanguageContentLoader_1.JsonLanguageContentLoader(options.languageDir, {}, options.encoding);
    // helper
    function makeNode(content, line = 1, column = 1) {
        return {
            nodeType: NodeTypes_1.NodeTypes.UI_PROPERTY,
            location: { line: line, column: column },
            content: content
        };
    }
    describe('In Portuguese', () => {
        const LANGUAGE = 'pt';
        let nlp = new NLP_1.NLP();
        let rec = new UIPropertyRecognizer_1.UIPropertyRecognizer(nlp); // under test
        let nlpTrainer = new NLPTrainer_1.NLPTrainer(langLoader);
        rec.trainMe(nlpTrainer, LANGUAGE);
        function shouldRecognize(sentence, property, expectedValue) {
            nodes = [];
            errors = [];
            warnings = [];
            let node = makeNode(sentence);
            nodes.push(node);
            rec.recognizeSentences(LANGUAGE, nodes, errors, warnings);
            expect(errors).toHaveLength(0);
            expect(warnings).toHaveLength(0);
            expect(node.property).toBe(property);
            expect(node.value).toBeDefined();
            expect(node.value.value).toBe(expectedValue);
        }
        describe('recognizes', () => {
            it('an id with a value', () => {
                shouldRecognize('- id é "foo"', 'id', 'foo');
            });
            it('a max length with a value', () => {
                shouldRecognize('- comprimento máximo é 8', 'maxlength', 8);
            });
            it('a min length with a value', () => {
                shouldRecognize('- comprimento mínimo é 1', 'minlength', 1);
            });
            it('a max value with a value', () => {
                shouldRecognize('- valor máximo é 7.33', 'maxvalue', 7.33);
            });
            it('a min value with a value', () => {
                shouldRecognize('- valor mínimo é -15.22', 'minvalue', -15.22);
            });
            it('a value with a query', () => {
                shouldRecognize('- valor está em "SELECT * FROM someTable"', 'value', 'SELECT * FROM someTable');
            });
            describe('a required property', () => {
                it('with true', () => {
                    shouldRecognize('- obrigatório é true', 'required', true);
                });
                it('with false', () => {
                    shouldRecognize('- obrigatório é false', 'required', false);
                });
                it('with verdadeiro', () => {
                    shouldRecognize('- obrigatório é verdadeiro', 'required', true);
                });
                it('with falso', () => {
                    shouldRecognize('- obrigatório é falso', 'required', false);
                });
                it('without value as true', () => {
                    shouldRecognize('- obrigatório', 'required', true);
                });
            });
            describe('an editable property', () => {
                it('with true', () => {
                    shouldRecognize('- editável é true', 'editable', true);
                });
                it('with false', () => {
                    shouldRecognize('- editável é false', 'editable', false);
                });
                it('with verdadeiro', () => {
                    shouldRecognize('- editável é verdadeiro', 'editable', true);
                });
                it('with falso', () => {
                    shouldRecognize('- editável é falso', 'editable', false);
                });
                it('without value as true', () => {
                    shouldRecognize('- editável', 'editable', true);
                });
            });
        });
    });
});
