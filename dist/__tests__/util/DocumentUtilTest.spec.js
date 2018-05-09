"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DocumentUtil_1 = require("../../modules/util/DocumentUtil");
describe('DocumentUtilTest', () => {
    const util = new DocumentUtil_1.DocumentUtil(); // under test (no state)
    it('maps ui element variables from a document', () => {
        const doc = {
            feature: {
                name: "Feature A",
                location: {},
                uiElements: [
                    {
                        name: 'foo'
                    }
                ]
            }
        };
        let map = new Map();
        util.mapUIElementVariables(doc, map);
        expect(map.size).toEqual(1);
        expect(map.get('Feature A:foo')).toBeDefined();
    });
    it('finds a ui element of a feature', () => {
        const doc = {
            feature: {
                name: "Feature A",
                location: {},
                uiElements: [
                    {
                        name: 'foo'
                    }
                ]
            }
        };
        const uie = util.findUIElementInTheDocument('{Feature A:foo}', doc);
        expect(uie).not.toBeNull();
    });
    it('finds global ui element declared in the document', () => {
        const doc = {
            feature: {
                name: "Feature A",
                location: {},
                uiElements: [
                    {
                        name: 'foo'
                    }
                ]
            },
            uiElements: [
                {
                    name: 'bar'
                }
            ]
        };
        const uie = util.findUIElementInTheDocument('{bar}', doc);
        expect(uie).not.toBeNull();
    });
    it('finds feature ui element from a variable without the feature name', () => {
        const doc = {
            feature: {
                name: "Feature A",
                location: {},
                uiElements: [
                    {
                        name: 'foo'
                    }
                ]
            },
            uiElements: [
                {
                    name: 'bar'
                }
            ]
        };
        const uie = util.findUIElementInTheDocument('{foo}', doc);
        expect(uie).not.toBeNull();
    });
    it('does not find a non existent ui element', () => {
        const doc = {
            feature: {
                name: "Feature A",
                location: {},
                uiElements: [
                    {
                        name: 'foo'
                    }
                ]
            },
            uiElements: [
                {
                    name: 'bar'
                }
            ]
        };
        const uie = util.findUIElementInTheDocument('{zoo}', doc);
        expect(uie).toBeNull();
    });
});
//# sourceMappingURL=DocumentUtilTest.spec.js.map