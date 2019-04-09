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
const path_1 = require("path");
const InMemoryTableWrapper_1 = require("../../modules/db/InMemoryTableWrapper");
const Parser_1 = require("../../modules/parser/Parser");
const Options_1 = require("../../modules/app/Options");
const LexerBuilder_1 = require("../../modules/lexer/LexerBuilder");
/**
 * @author Thiago Delgado Pinto
 */
describe('InMemoryTableWrapperTest', () => {
    let wrapper = new InMemoryTableWrapper_1.InMemoryTableWrapper(); // under test
    let parser = new Parser_1.Parser();
    const options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
    let lexer = (new LexerBuilder_1.LexerBuilder()).build(options, 'en');
    it('creates a database table from a table node', () => __awaiter(this, void 0, void 0, function* () {
        [
            'Table: foo',
            '|a|b   |c    |d         |e       |f                  |g    |',
            '|1|2.01|three|2017-01-04|05:06:07|2017-01-06 08:09:10|true |',
            '|2|3.01|four |2017-01-05|06:07:08|2017-01-07 09:10:11|false|',
            '|3|4.01|five |2017-01-05|06:07:08|2017-01-07 09:10:11|false|'
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        const table = doc.tables[0];
        yield wrapper.connect(table);
        const data = yield wrapper.query('SELECT * FROM foo WHERE b <= 3.01', {});
        expect(data[0].a).toBe(1);
        expect(data[0].b).toBe(2.01);
        expect(data[0].c).toBe('three');
        expect(data[0].d).toBe('2017-01-04');
        expect(data[0].e).toBe('05:06:07');
        expect(data[0].f).toBe('2017-01-06 08:09:10');
        expect(data[0].g).toBe(true);
    }));
});
