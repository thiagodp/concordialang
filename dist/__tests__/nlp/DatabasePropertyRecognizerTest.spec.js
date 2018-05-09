"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabasePropertyRecognizer_1 = require("../../modules/nlp/DatabasePropertyRecognizer");
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const NLPTrainer_1 = require("../../modules/nlp/NLPTrainer");
const NLP_1 = require("../../modules/nlp/NLP");
const Options_1 = require("../../modules/app/Options");
const path_1 = require("path");
const LanguageContentLoader_1 = require("../../modules/dict/LanguageContentLoader");
describe('DatabasePropertyRecognizerTest', () => {
    let nodes = [];
    let errors = [];
    let warnings = [];
    const options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
    const langLoader = new LanguageContentLoader_1.JsonLanguageContentLoader(options.languageDir, {}, options.encoding);
    // helper
    function makeNode(content, line = 1, column = 1) {
        return {
            nodeType: NodeTypes_1.NodeTypes.DATABASE_PROPERTY,
            location: { line: line, column: column },
            content: content
        };
    }
    describe('In Portuguese', () => {
        const LANGUAGE = 'pt';
        let nlp = new NLP_1.NLP();
        let rec = new DatabasePropertyRecognizer_1.DatabasePropertyRecognizer(nlp); // under test
        let nlpTrainer = new NLPTrainer_1.NLPTrainer(langLoader);
        rec.trainMe(nlpTrainer, LANGUAGE);
        function shouldRecognize(sentence, property, value) {
            nodes = [];
            errors = [];
            warnings = [];
            let node = makeNode(sentence);
            nodes.push(node);
            rec.recognizeSentences(LANGUAGE, nodes, errors, warnings);
            expect(errors).toHaveLength(0);
            expect(warnings).toHaveLength(0);
            expect(node.property).toBe(property);
            expect(node.value).toEqual(value);
        }
        it('recognizes type', () => {
            shouldRecognize('tipo é "mysql"', 'type', 'mysql');
            shouldRecognize('type é "mysql"', 'type', 'mysql');
        });
        it('recognizes path', () => {
            shouldRecognize('caminho é "path/to/db"', 'path', 'path/to/db');
            shouldRecognize('path é "path/to/db"', 'path', 'path/to/db');
            shouldRecognize('nome é "mydb"', 'path', 'mydb');
            shouldRecognize('name é "mydb"', 'path', 'mydb');
        });
    });
});
//# sourceMappingURL=DatabasePropertyRecognizerTest.spec.js.map