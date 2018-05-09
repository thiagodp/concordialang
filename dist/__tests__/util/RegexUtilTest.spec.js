"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegexUtil_1 = require("../../modules/util/RegexUtil");
/**
 * @author Thiago Delgado Pinto
 */
describe('RegexUtilTest', () => {
    let ru = new RegexUtil_1.RegexUtil();
    it('returns the full match and group match by default', () => {
        let r = ru.matches(/(foo)/, 'foo');
        expect(r).toEqual(['foo', 'foo']);
    });
    it('can ignore full matches', () => {
        let r = ru.matches(/(foo)/, 'foo', true);
        expect(r).toEqual(['foo']);
    });
});
//# sourceMappingURL=RegexUtilTest.spec.js.map