import { FileInfo } from '../../modules/ast/FileInfo';
import { Import } from '../../modules/ast/Import';
import { Location } from '../../modules/ast/Location';
import { NodeTypes } from '../../modules/req/NodeTypes';
import { ReservedTags } from '../../modules/req/ReservedTags';
import { Tag } from '../../modules/ast/Tag';
import { Variant } from '../../modules/ast/Variant';
import { Feature } from '../../modules/ast/Feature';
import { Document } from '../../modules/ast/Document';
import { Spec } from '../../modules/ast/Spec';
import { VariantSSA } from '../../modules/semantic/VariantSSA';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'VariantSSATest', () => {

    const analyzer = new VariantSSA(); // under test

    let spec: Spec;
    let docA: Document;
    let docB: Document;
    let docC: Document;
    let docD: Document;
    let docE1: Document;
    let docE2: Document;
    let docF: Document;
    let docG: Document;

    beforeEach( () => {

        /*
            - C imports A, B, and E
            - A and B have features
            - E1 and E2 have no features
            - D imports E1 and E2
            - F has a feature and no imports
            - G has a feature, no imports, and the tag references another feature
        */

        spec = new Spec( '.' );
        
        docA = {
            fileInfo: { path: "./A.feature" } as FileInfo,
            feature: {
                name: "My feature A",
                location: {}
            } as Feature
        };

        docB = {
            fileInfo: { path: "./B.feature" } as FileInfo,
            feature: {
                name: "My feature B",
                location: {}
            } as Feature
        };        

        docE1 = {
            fileInfo: { path: "./E1.feature" } as FileInfo
        };

        docE2 = {
            fileInfo: { path: "./E2.feature" } as FileInfo
        };         
    
        docC = {
            fileInfo: { path: "./C.feature" } as FileInfo,
            imports: [
                {
                    value: "./A.feature"
                } as Import,
                {
                    value: "./B.feature"
                } as Import,                
                {
                    value: "./E1.feature"
                } as Import                
            ],
            variants: [
                {
                    name: "My variant 1",
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
                } as Variant
            ]
        };

        docD = {
            fileInfo: { path: "./D.feature" } as FileInfo,
            imports: [
                {
                    value: "./E1.feature"
                } as Import,
                {
                    value: "./E2.feature"
                } as Import                
            ],
            variants: [
                {
                    name: "My variant 1",
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
                } as Variant
            ]            
        };

        docF = {
            fileInfo: { path: "./F.feature" } as FileInfo,
            feature: {
                name: "My feature F",
                location: {},
                variants: [
                    {
                        name: "My F variant 1",
                        location: {}
                    } as Variant
                ]                 
            } as Feature            
        };

        docG = {
            fileInfo: { path: "./G.feature" } as FileInfo,
            feature: {
                name: "My feature G",
                location: {},
                variants: [
                    {
                        name: "My G variant 1",
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
                    } as Variant
                ]                
            } as Feature
        };        
    
        spec.docs.push( docA, docB, docC, docD, docE1, docE2, docF, docG );
    } );   


    it( 'criticizes a variant without a feature and an import', () => {
        docC.imports = []; // empty
        let errors: Error[] = [];
        analyzer.analyzeDocument( spec, docC, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /import/ui );      
    } );

    it( 'does not criticizes the lack of tags if its imports have a single feature', () => {
        docC.variants[ 0 ].tags = []; // empty
        docC.imports.splice( 1 ); // remove the B, in order to have just one feature
        let errors: Error[] = [];
        analyzer.analyzeDocument( spec, docC, errors );
        expect( errors ).toHaveLength( 0 );
    } );

    it( 'criticizes the lack of tags if its imports have more than one feature', () => {
        docC.variants[ 0 ].tags = []; // empty
        let errors: Error[] = [];
        analyzer.analyzeDocument( spec, docC, errors );
        expect( errors ).toHaveLength( 1 );        
        expect( errors[ 0 ].message ).toMatch( /tag/ui );
    } );

    it( 'copies variants to the referenced feature', () => {
        let errors: Error[] = [];
        analyzer.analyzeDocument( spec, docC, errors );
        expect( errors ).toHaveLength( 0 );
        expect( docA.feature.variants ).toHaveLength( 1 );
    } );

    it( 'does not criticize the lack of feature if the file has a feature', () => {
        let errors: Error[] = [];
        analyzer.analyzeDocument( spec, docF, errors );
        expect( errors ).toHaveLength( 0 );
    } );

    it( 'does not criticize a referenced feature that is the file\'s feature', () => {
        docG.feature.variants[ 0 ].tags[ 0 ].content = docG.feature.name;
        let errors: Error[] = [];
        analyzer.analyzeDocument( spec, docG, errors );
        expect( errors ).toHaveLength( 0 );
    } );    

    it( 'criticizes a referenced feature not imported', () => {
        let errors: Error[] = [];
        analyzer.analyzeDocument( spec, docG, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /tag/ui );
    } );

    it( 'criticizes duplicated variant names', () => {
        docF.feature.variants.push(
            {
                name: "My F variant 1",
                location: {}
            } as Variant
        );

        let errors: Error[] = [];
        analyzer.analyzeDocument( spec, docF, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
    } );

} );