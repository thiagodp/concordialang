"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const ReservedTags_1 = require("../../modules/req/ReservedTags");
const AugmentedSpec_1 = require("../../modules/ast/AugmentedSpec");
const TestCaseSSA_1 = require("../../modules/semantic/TestCaseSSA");
const path_1 = require("path");
/**
 * @author Thiago Delgado Pinto
 */
describe('TestCaseSSATest', () => {
    let analyzer; // under test
    const path = process.cwd();
    let spec;
    let docA;
    let docB;
    let docC;
    let docD;
    let docE1;
    let docE2;
    let docF;
    let docG;
    beforeEach(() => {
        analyzer = new TestCaseSSA_1.TestCaseSSA();
        /*
            - C imports A, B, and E
            - A and B have features
            - E1 and E2 have no features
            - D imports E1 and E2
            - F has a feature and no imports
            - G has a feature, no imports, and the tag references another feature
        */
        spec = new AugmentedSpec_1.AugmentedSpec(path);
        docA = {
            fileInfo: { path: path_1.join(path, "A.feature") },
            feature: {
                name: "My feature A",
                location: {}
            }
        };
        docB = {
            fileInfo: { path: path_1.join(path, "B.feature") },
            feature: {
                name: "My feature B",
                location: {}
            }
        };
        docE1 = {
            fileInfo: { path: path_1.join(path, "E1.feature") }
        };
        docE2 = {
            fileInfo: { path: path_1.join(path, "E2.feature") }
        };
        docC = {
            fileInfo: { path: path_1.join(path, "C.feature") },
            imports: [
                {
                    value: "A.feature"
                },
                {
                    value: "B.feature"
                },
                {
                    value: "E1.feature"
                }
            ],
            testCases: [
                {
                    name: "My test case 1",
                    location: {},
                    tags: [
                        {
                            name: ReservedTags_1.ReservedTags.FEATURE,
                            content: "My feature A",
                            nodeType: NodeTypes_1.NodeTypes.TAG,
                            location: {}
                        }
                    ]
                }
            ]
        };
        docD = {
            fileInfo: { path: path_1.join(path, "D.feature") },
            imports: [
                {
                    value: "E1.feature"
                },
                {
                    value: "E2.feature"
                }
            ],
            testCases: [
                {
                    name: "My test case 1",
                    location: {},
                    tags: [
                        {
                            name: ReservedTags_1.ReservedTags.FEATURE,
                            content: "My feature A",
                            nodeType: NodeTypes_1.NodeTypes.TAG,
                            location: {}
                        }
                    ]
                }
            ]
        };
        docF = {
            fileInfo: { path: path_1.join(path, "F.feature") },
            feature: {
                name: "My feature F",
                location: {}
            },
            testCases: [
                {
                    name: "My F test case 1",
                    location: {}
                }
            ]
        };
        docG = {
            fileInfo: { path: path_1.join(path, "G.feature") },
            feature: {
                name: "My feature G",
                location: {},
            },
            testCases: [
                {
                    name: "My G test case 1",
                    location: {},
                    tags: [
                        {
                            name: ReservedTags_1.ReservedTags.FEATURE,
                            content: "My feature A",
                            nodeType: NodeTypes_1.NodeTypes.TAG,
                            location: {}
                        }
                    ]
                }
            ]
        };
        spec.docs.push(docA, docB, docC, docD, docE1, docE2, docF, docG);
    });
    afterEach(() => {
        analyzer = null;
    });
    it('criticizes the lack of a feature and an import', () => {
        docC.imports = []; // empty
        let errors = [];
        analyzer.analyzeDocument(spec, docC, errors);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/import/ui);
    });
    it('does not criticizes the lack of tags if its imports have a single feature', () => {
        docC.testCases[0].tags = []; // empty
        docC.imports.splice(1); // remove the B, in order to have just one feature
        let errors = [];
        analyzer.analyzeDocument(spec, docC, errors);
        expect(errors).toHaveLength(0);
    });
    it('criticizes the lack of tags if its imports have more than one feature', () => {
        docC.testCases[0].tags = []; // empty
        let errors = [];
        analyzer.analyzeDocument(spec, docC, errors);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/tag/ui);
    });
    it('does not criticize the lack of feature if the file has a feature', () => {
        let errors = [];
        analyzer.analyzeDocument(spec, docF, errors);
        expect(errors).toHaveLength(0);
    });
    it('does not criticize a referenced feature that is the file\'s feature', () => {
        docG.testCases[0].tags[0].content = docG.feature.name;
        let errors = [];
        analyzer.analyzeDocument(spec, docG, errors);
        expect(errors).toHaveLength(0);
    });
    it('criticizes a referenced feature not imported', () => {
        let errors = [];
        analyzer.analyzeDocument(spec, docG, errors);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/tag/ui);
    });
    it('criticizes duplicated names', () => {
        docF.testCases.push({
            name: "My F test case 1",
            location: {}
        });
        let errors = [];
        analyzer.analyzeDocument(spec, docF, errors);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/duplicated/ui);
    });
});
