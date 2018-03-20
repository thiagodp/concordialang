import { TestCaseGenerator } from '../../modules/testcase/TestCaseGenerator';
import { SimpleCompiler } from '../../modules/util/SimpleCompiler';
import { SpecFilter } from '../../modules/selection/SpecFilter';
import { BatchSpecificationAnalyzer } from '../../modules/semantic/BatchSpecificationAnalyzer';
import { Variant } from '../../modules/ast/Variant';
import { Tag } from '../../modules/ast/Tag';
import { Document } from '../../modules/ast/Document';
import { Spec } from '../../modules/ast/Spec';
import { LocatedException } from '../../modules/req/LocatedException';
import { Warning } from '../../modules/req/Warning';
import { CaseType } from '../../modules/app/CaseType';


describe( 'TestCaseGeneratorTest', () => {

    let gen: TestCaseGenerator = new TestCaseGenerator(); // under test

    let cp = new SimpleCompiler();

    //
    // TESTS
    //

    it( 'add tags correctly', () => {

        const variant: Variant = {
            tags: [ {
                name: "importance",
                content: "9",
                location: {
                    column: 1,
                    line: 1
                }
            } as Tag
            ],
            name: "Foo Bar",
            sentences: []
        } as Variant;

        const tags: Tag[] = gen.createTags( variant, 1, true, [], [] );
        const names: string[] = tags.map( t => t.name );
        const contents: string[] = tags.map( t => t.content );
        const lines: number[] = tags.map( t => t.location.line );

        expect( names ).toEqual( [
            'generated',
            'importance',
            'variant'
        ] );

        expect( contents ).toEqual( [
            undefined,
            "9",
            "Foo Bar"
        ] );

        expect( lines ).toEqual( [ 1, 2, 3 ] );

    } );


    it( 'replaces references to constants', () => {

        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Constantes:',
                ' - "ipsum" é "ipsum lorem"',
                ' - "pi" é 3.1416'
            ] );

        let doc2: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 2',
                'Scenario: Foo',
                'Variant: Foo',
                '  Dado que espero ter ~foo~',
                '  Quando eu preencho <a> com [ipsum]',
                '    E eu preencho <b> com [pi]'
            ] );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );

        let variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let errors: LocatedException[] = [];
        let warnings: Warning[] = [];

        let newVariant = gen.replaceReferences(
            variant,
            spec,
            doc2,
            CaseType.CAMEL,
            errors,
            warnings
        );

        expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <a> com "ipsum lorem"' );
        expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <b> com 3.1416' );
    } );



    it( 'replaces references to ui elements', async () => {

        let spec = new Spec( '.' );

        let doc: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 2',
                'Scenario: Foo',
                'Variant: Foo',
                '  Dado que espero ter ~foo~',
                '  Quando eu preencho {A} com "ipsum lorem"',
                '    E eu preencho {B} com 3.1416',
                'UI Element: A',
                ' - id é "ax"',
                'UI Element: B',
                ' - id é "bx"'
            ] );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        expect( doc.fileErrors ).toEqual( [] );
        expect( errors ).toEqual( [] );

        let variant = doc.feature.scenarios[ 0 ].variants[ 0 ];
        let warnings: Warning[] = [];

        let newVariant = gen.replaceReferences(
            variant,
            spec,
            doc,
            CaseType.CAMEL,
            errors,
            warnings
        );

        expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <ax> com "ipsum lorem"' );
        expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <bx> com 3.1416' );
    } );


    // Helper function
    let replacesForDifferentStringCases = ( lines: string[] ) => {

        return () => {

            let spec = new Spec( '.' );
            let doc: Document = cp.addToSpec( spec, lines );
            expect( doc.fileErrors ).toEqual( [] );

            let variant = doc.feature.scenarios[ 0 ].variants[ 0 ];
            let errors: LocatedException[] = [];
            let warnings: Warning[] = [];

            beforeEach( () => {
                errors = [];
                warnings = [];
            } );


            it( 'same name', () => {
                let newVariant = gen.replaceReferences(
                    variant,
                    spec,
                    doc,
                    CaseType.NONE,
                    errors,
                    warnings
                );
                expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <Primeiro Campo> com "ipsum lorem"' );
                expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <Segundo Campo> com 3.1416' );
            } );

            it( 'in camel case', () => {
                let newVariant = gen.replaceReferences(
                    variant,
                    spec,
                    doc,
                    CaseType.CAMEL,
                    errors,
                    warnings
                );
                expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <primeiroCampo> com "ipsum lorem"' );
                expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <segundoCampo> com 3.1416' );
            } );

            it( 'in pascal case', () => {
                let newVariant = gen.replaceReferences(
                    variant,
                    spec,
                    doc,
                    CaseType.PASCAL,
                    errors,
                    warnings
                );
                expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <PrimeiroCampo> com "ipsum lorem"' );
                expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <SegundoCampo> com 3.1416' );
            } );

            it( 'in kebab (aka dashed) case', () => {
                let newVariant = gen.replaceReferences(
                    variant,
                    spec,
                    doc,
                    CaseType.KEBAB,
                    errors,
                    warnings
                );
                expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <primeiro-campo> com "ipsum lorem"' );
                expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <segundo-campo> com 3.1416' );
            } );

            it( 'in snake case', () => {
                let newVariant = gen.replaceReferences(
                    variant,
                    spec,
                    doc,
                    CaseType.SNAKE,
                    errors,
                    warnings
                );
                expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <primeiro_campo> com "ipsum lorem"' );
                expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <segundo_campo> com 3.1416' );
            } );

        };
    };


    describe( 'replaces with the UI Element name when the id property is not declared',
        replacesForDifferentStringCases( [
            '#language:pt',
            'Feature: Feature 2',
            'Scenario: Foo',
            'Variant: Foo',
            '  Dado que espero ter ~foo~',
            '  Quando eu preencho {Primeiro Campo} com "ipsum lorem"',
            '    E eu preencho {Segundo Campo} com 3.1416',
            'UI Element: Primeiro Campo',
            'UI Element: Segundo Campo'
        ] )
    );


    describe( 'generates a UI Element name from the sentence when it is not declared',
        replacesForDifferentStringCases( [
            '#language:pt',
            'Feature: Feature 2',
            'Scenario: Foo',
            'Variant: Foo',
            '  Dado que espero ter ~foo~',
            '  Quando eu preencho {Primeiro Campo} com "ipsum lorem"',
            '    E eu preencho {Segundo Campo} com 3.1416'
            // NO UIElements !!!
        ] )
    );



    it( 'replaces both references to ui elements and constants', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Constantes:',
                ' - "ipsum" é "ipsum lorem"',
                ' - "pi" é 3.1416'
            ] );

        let doc2: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 2',
                'Scenario: Foo',
                'Variant: Foo',
                '  Dado que espero ter ~foo~',
                '  Quando eu preencho {A} com [ipsum]',
                '    E eu preencho {B} com [pi]',
                'UI Element: A',
                ' - id é "ax"',
                'UI Element: B',
                ' - id é "bx"'
            ] );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        expect( doc1.fileErrors ).toEqual( [] );
        expect( doc2.fileErrors ).toEqual( [] );
        expect( errors ).toEqual( [] );

        expect( spec.uiElementByVariable( 'A', doc2 ) ).toBeDefined();
        expect( spec.uiElementByVariable( 'B', doc2 ) ).toBeDefined();

        let variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let warnings: Warning[] = [];

        let newVariant = gen.replaceReferences(
            variant,
            spec,
            doc2,
            CaseType.CAMEL,
            errors,
            warnings
        );

        expect( newVariant.sentences ).toHaveLength( 3 );
        expect( newVariant.sentences[ 1 ].content ).toEqual( 'Quando eu preencho <ax> com "ipsum lorem"' );
        expect( newVariant.sentences[ 2 ].content ).toEqual( 'E eu preencho <bx> com 3.1416' );
    } );


} );