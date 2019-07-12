import { Feature, Document, UIElement } from "../../modules/ast";
import { DocumentUtil } from "../../modules/util/DocumentUtil";

describe( 'DocumentUtil', () => {

    const util = new DocumentUtil(); // under test (no state)

    it( 'maps ui element variables from a document', () => {

        const doc = {
            feature: {
                name: "Feature A",
                location: {},

                uiElements: [
                    {
                        name: 'foo'
                    } as UIElement
                ]
            } as Feature
        } as Document;

        let map = new Map< string, UIElement >();
        util.mapUIElementVariables( doc, map );
        expect( map.size ).toEqual( 1 );
        expect( map.get( 'Feature A:foo' ) ).toBeDefined();
    } );


    it( 'finds a ui element of a feature', () => {

        const doc = {
            feature: {
                name: "Feature A",
                location: {},

                uiElements: [
                    {
                        name: 'foo'
                    } as UIElement
                ]
            } as Feature
        } as Document;

        const uie = util.findUIElementInTheDocument( '{Feature A:foo}', doc );
        expect( uie ).not.toBeNull();
    } );


    it( 'finds global ui element declared in the document', () => {

        const doc = {
            feature: {
                name: "Feature A",
                location: {},

                uiElements: [
                    {
                        name: 'foo'
                    } as UIElement
                ]
            } as Feature,

            uiElements: [
                {
                    name: 'bar'
                } as UIElement
            ]
        } as Document;

        const uie = util.findUIElementInTheDocument( '{bar}', doc );
        expect( uie ).not.toBeNull();
    } );



    it( 'finds feature ui element from a variable without the feature name', () => {

        const doc = {
            feature: {
                name: "Feature A",
                location: {},

                uiElements: [
                    {
                        name: 'foo'
                    } as UIElement
                ]
            } as Feature,

            uiElements: [
                {
                    name: 'bar'
                } as UIElement
            ]
        } as Document;

        const uie = util.findUIElementInTheDocument( '{foo}', doc );
        expect( uie ).not.toBeNull();
    } );


    it( 'does not find a non existent ui element', () => {

        const doc = {
            feature: {
                name: "Feature A",
                location: {},

                uiElements: [
                    {
                        name: 'foo'
                    } as UIElement
                ]
            } as Feature,

            uiElements: [
                {
                    name: 'bar'
                } as UIElement
            ]
        } as Document;

        const uie = util.findUIElementInTheDocument( '{zoo}', doc );
        expect( uie ).toBeNull();
    } );

} );