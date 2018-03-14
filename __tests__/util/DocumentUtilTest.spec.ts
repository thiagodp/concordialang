import { DocumentUtil } from "../../modules/util/DocumentUtil";
import { Feature } from "../../modules/ast/Feature";
import { Document } from "../../modules/ast/Document";
import { UIElement } from "../../modules/ast/UIElement";

describe( 'DocumentUtilTest', () => {

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

        const map = util.mapUIElementsVariablesOf( doc );
        expect( map.size ).toEqual( 1 );
        expect( map.get( '{Feature A:foo}' ) ).toHaveProperty( 'name', 'foo' );
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

        const uie = util.findUIElementWithName( '{Feature A:foo}', doc );
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

        const uie = util.findUIElementWithName( '{bar}', doc );
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

        const uie = util.findUIElementWithName( '{foo}', doc );
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

        const uie = util.findUIElementWithName( '{zoo}', doc );
        expect( uie ).toBeNull();
    } );

} );