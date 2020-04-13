import { Location } from 'concordialang-types';
import { join } from 'path';
import { Document, Feature, FileInfo, Import, ReservedTags, Tag, TestCase } from '../../modules/ast';
import { AugmentedSpec } from '../../modules/req/AugmentedSpec';
import { NodeTypes } from '../../modules/req/NodeTypes';
import { TestCaseSSA } from '../../modules/semantic2/TestCaseSSA';


describe( 'TestCaseSSA', () => {

    let analyzer: TestCaseSSA; // under test

    const path = process.cwd();

    let spec: AugmentedSpec;
    let docA: Document;
    let docB: Document;
    let docC: Document;
    let docD: Document;
    let docE1: Document;
    let docE2: Document;
    let docF: Document;
    let docG: Document;

    beforeEach( () => {

        analyzer = new TestCaseSSA();

        /*
            - C imports A, B, and E
            - A and B have features
            - E1 and E2 have no features
            - D imports E1 and E2
            - F has a feature and no imports
            - G has a feature, no imports, and the tag references another feature
        */

        spec = new AugmentedSpec( path );

        docA = {
            fileInfo: { path: join( path, "A.feature" ) } as FileInfo,
            feature: {
                name: "My feature A",
                location: {}
            } as Feature
        };

        docB = {
            fileInfo: { path: join( path, "B.feature" ) } as FileInfo,
            feature: {
                name: "My feature B",
                location: {}
            } as Feature
        };

        docE1 = {
            fileInfo: { path: join( path, "E1.feature" ) } as FileInfo
        };

        docE2 = {
            fileInfo: { path: join( path, "E2.feature" ) } as FileInfo
        };

        docC = {
            fileInfo: { path: join( path, "C.feature" ) } as FileInfo,
            imports: [
                {
                    value: "A.feature"
                } as Import,
                {
                    value: "B.feature"
                } as Import,
                {
                    value: "E1.feature"
                } as Import
            ],
            testCases: [
                {
                    name: "My test case 1",
                    location: {},
                    tags: [
                        {
                            name: ReservedTags.FEATURE,
                            content: "My feature A",
                            nodeType: NodeTypes.TAG,
                            location: {
                            } as Location
                        } as Tag
                    ]
                } as TestCase
            ]
        };

        docD = {
            fileInfo: { path: join( path, "D.feature" ) } as FileInfo,
            imports: [
                {
                    value: "E1.feature"
                } as Import,
                {
                    value: "E2.feature"
                } as Import
            ],
            testCases: [
                {
                    name: "My test case 1",
                    location: {},
                    tags: [
                        {
                            name: ReservedTags.FEATURE,
                            content: "My feature A",
                            nodeType: NodeTypes.TAG,
                            location: {
                            } as Location
                        } as Tag
                    ]
                } as TestCase
            ]
        };

        docF = {
            fileInfo: { path: join( path, "F.feature" ) } as FileInfo,
            feature: {
                name: "My feature F",
                location: {}
            } as Feature,
            testCases: [
                {
                    name: "My F test case 1",
                    location: {}
                } as TestCase
            ]
        };

        docG = {
            fileInfo: { path: join( path, "G.feature" ) } as FileInfo,
            feature: {
                name: "My feature G",
                location: {},
            } as Feature,
            testCases: [
                {
                    name: "My G test case 1",
                    location: {},
                    tags: [
                        {
                            name: ReservedTags.FEATURE,
                            content: "My feature A",
                            nodeType: NodeTypes.TAG,
                            location: {
                            } as Location
                        } as Tag
                    ]
                } as TestCase
            ]
        };

        spec.addDocument( docA, docB, docC, docD, docE1, docE2, docF, docG );
    } );


    afterEach( () => {
        analyzer = null;
    } );


    it( 'criticizes the lack of a feature and an import', () => {
        docC.imports = []; // empty
        const errors = [];
        analyzer.analyzeDocument( spec, docC, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /import/ui );
    } );

    it( 'does not criticizes the lack of tags if its imports have a single feature', () => {
        docC.testCases[ 0 ].tags = []; // empty
        docC.imports.splice( 1 ); // remove the B, in order to have just one feature
        const errors = [];
        analyzer.analyzeDocument( spec, docC, errors );
        expect( errors ).toHaveLength( 0 );
    } );

    it( 'criticizes the lack of tags if its imports have more than one feature', () => {
        docC.testCases[ 0 ].tags = []; // empty
        const errors = [];
        analyzer.analyzeDocument( spec, docC, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /tag/ui );
    } );

    it( 'does not criticize the lack of feature if the file has a feature', () => {
        const errors = [];
        analyzer.analyzeDocument( spec, docF, errors );
        expect( errors ).toHaveLength( 0 );
    } );

    it( 'does not criticize a referenced feature that is the file\'s feature', () => {
        docG.testCases[ 0 ].tags[ 0 ].content = docG.feature.name;
        const errors = [];
        analyzer.analyzeDocument( spec, docG, errors );
        expect( errors ).toHaveLength( 0 );
    } );

    it( 'criticizes a referenced feature not imported', () => {
        const errors = [];
        analyzer.analyzeDocument( spec, docG, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /tag/ui );
    } );

    it( 'criticizes duplicated names', () => {
        docF.testCases.push(
            {
                name: "My F test case 1",
                location: {}
            } as TestCase
        );

        const errors = [];
        analyzer.analyzeDocument( spec, docF, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
    } );

} );