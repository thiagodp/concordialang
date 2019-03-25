"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AugmentedSpec_1 = require("../../modules/ast/AugmentedSpec");
const SimpleCompiler_1 = require("../../modules/util/SimpleCompiler");
const path_1 = require("path");
describe('SpecTest', () => {
    let spec; // under test
    const basePath = process.cwd();
    beforeEach(() => spec = new AugmentedSpec_1.AugmentedSpec(basePath));
    afterEach(() => spec = null);
    describe('findUIElementInDocumentImports', () => {
        describe('found', () => {
            it('in the same level', () => {
                const sc = new SimpleCompiler_1.SimpleCompiler('pt');
                let doc1 = sc.addToSpec(spec, [
                    '#language: pt',
                    'Feature: foo',
                    'UI Element: x1'
                ], {
                    path: path_1.join(basePath, 'A.feature')
                });
                let doc2 = sc.addToSpec(spec, [
                    '#language: pt',
                    'import "A.feature"',
                    'Feature: bar'
                ], {
                    path: path_1.join(basePath, 'B.feature')
                });
                const uie = spec.findUIElementInDocumentImports('foo:x1', doc2);
                expect(uie).not.toBeNull();
            });
            it('in a level up', () => {
                const sc = new SimpleCompiler_1.SimpleCompiler('pt');
                let doc1 = sc.addToSpec(spec, [
                    '#language: pt',
                    'Feature: foo',
                    'UI Element: x1'
                ], {
                    path: path_1.join(basePath, '../A.feature')
                });
                let doc2 = sc.addToSpec(spec, [
                    '#language: pt',
                    'import "../A.feature"',
                    'Feature: bar'
                ], {
                    path: path_1.join(basePath, 'B.feature')
                });
                const uie = spec.findUIElementInDocumentImports('foo:x1', doc2);
                expect(uie).not.toBeNull();
            });
            it('in a level down', () => {
                const sc = new SimpleCompiler_1.SimpleCompiler('pt');
                let doc1 = sc.addToSpec(spec, [
                    '#language: pt',
                    'Feature: foo',
                    'UI Element: x1'
                ], {
                    path: path_1.join(basePath, 'fake/A.feature')
                });
                let doc2 = sc.addToSpec(spec, [
                    '#language: pt',
                    'import "fake/A.feature"',
                    'Feature: bar'
                ], {
                    path: path_1.join(basePath, 'B.feature')
                });
                const uie = spec.findUIElementInDocumentImports('foo:x1', doc2);
                expect(uie).not.toBeNull();
            });
        });
        describe('not found', () => {
            it('when not declared', () => {
                const sc = new SimpleCompiler_1.SimpleCompiler('pt');
                let doc1 = sc.addToSpec(spec, [
                    '#language: pt',
                    'Feature: foo'
                ], {
                    path: path_1.join(basePath, 'A.feature')
                });
                let doc2 = sc.addToSpec(spec, [
                    '#language: pt',
                    'import "A.feature"',
                    'Feature: bar'
                ], {
                    path: path_1.join(basePath, 'B.feature')
                });
                const uie = spec.findUIElementInDocumentImports('foo:x1', doc2);
                expect(uie).toBeNull();
            });
        });
    });
    describe('uiElementByVariable', () => {
        describe('found', () => {
            it('same file, with feature name', () => {
                const sc = new SimpleCompiler_1.SimpleCompiler('pt');
                let doc1 = sc.addToSpec(spec, [
                    '#language: pt',
                    'Feature: foo',
                    'UI Element: x1'
                ], {
                    path: path_1.join(basePath, 'A.feature')
                });
                const uie = spec.uiElementByVariable('foo:x1', doc1);
                expect(uie).not.toBeNull();
            });
            it('same file, without feature name', () => {
                const sc = new SimpleCompiler_1.SimpleCompiler('pt');
                let doc1 = sc.addToSpec(spec, [
                    '#language: pt',
                    'Feature: foo',
                    'UI Element: x1'
                ], {
                    path: path_1.join(basePath, 'A.feature')
                });
                const uie = spec.uiElementByVariable('x1', doc1);
                expect(uie).not.toBeNull();
            });
            it('in an import file, with feature name', () => {
                const sc = new SimpleCompiler_1.SimpleCompiler('pt');
                let doc1 = sc.addToSpec(spec, [
                    '#language: pt',
                    'Feature: foo',
                    'UI Element: x1'
                ], {
                    path: path_1.join(basePath, 'A.feature')
                });
                let doc2 = sc.addToSpec(spec, [
                    '#language: pt',
                    'import "A.feature"',
                    'Feature: bar'
                ], {
                    path: path_1.join(basePath, 'B.feature')
                });
                const uie = spec.uiElementByVariable('foo:x1', doc2);
                expect(uie).not.toBeNull();
            });
        });
        describe('not found', () => {
            it('in the same file, when not declared', () => {
                const sc = new SimpleCompiler_1.SimpleCompiler('pt');
                let doc1 = sc.addToSpec(spec, [
                    '#language: pt',
                    'Feature: foo'
                ], {
                    path: path_1.join(basePath, 'A.feature')
                });
                const uie = spec.uiElementByVariable('x1', doc1);
                expect(uie).toBeNull();
            });
            it('in an import file, when not declared', () => {
                const sc = new SimpleCompiler_1.SimpleCompiler('pt');
                let doc1 = sc.addToSpec(spec, [
                    '#language: pt',
                    'Feature: foo',
                ], {
                    path: path_1.join(basePath, 'A.feature')
                });
                let doc2 = sc.addToSpec(spec, [
                    '#language: pt',
                    'import "A.feature"',
                    'Feature: bar'
                ], {
                    path: path_1.join(basePath, 'B.feature')
                });
                const uie = spec.uiElementByVariable('foo:x1', doc2);
                expect(uie).toBeNull();
            });
            // it( 'in an import file, without feature name', () => {
            //     const sc = new SimpleCompiler( 'pt' );
            //     let doc1 = sc.addToSpec(
            //         spec,
            //         [
            //             '#language: pt',
            //             'Feature: foo',
            //             'UI Element: x1'
            //         ],
            //         {
            //             path: join( basePath, 'A.feature' )
            //         } as FileInfo
            //     );
            //     let doc2 = sc.addToSpec(
            //         spec,
            //         [
            //             '#language: pt',
            //             'import "A.feature"',
            //             'Feature: bar'
            //         ],
            //         {
            //             path: join( basePath, 'B.feature' )
            //         } as FileInfo
            //     );
            //     const uie = spec.uiElementByVariable( 'x1', doc2 );
            //     expect( uie ).toBeNull();
            // } );
        });
    });
});
