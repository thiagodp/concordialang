import { Location } from "concordialang-types";

import { NLP, NLPTrainingDataConversor, NLPTrainingData, NLPResult } from "../../modules/nlp";
import { UIPropertyReferenceExtractor } from '../../modules/util/UIPropertyReferenceExtractor';
import { UIPropertyReference } from "../../modules/ast";

describe( 'UIPropertyReferenceExtractor', () => {

    function fakeTrainingData(): NLPTrainingData {
        let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
        let data: NLPTrainingData = conversor.convert( {}, [] );
        return data;
    }

    function makeTrainedNLP(): NLP {
        let nlp = new NLP();
        nlp.train( 'en', fakeTrainingData() );
        return nlp;
    }

    function extractReferences( text: string, line?: number ): UIPropertyReference[] {
        const nlp = makeTrainedNLP();
        const result: NLPResult = nlp.recognize( 'en', text );
        const replacer = new UIPropertyReferenceExtractor();
        return replacer.extractReferences( result.entities, line );
    }

    describe( 'extractReferences', () => {

        it( 'extracts a single reference', () => {
            const references: UIPropertyReference[] = extractReferences(
                'When I see {Name|value}' );
            expect( references ).toHaveLength( 1 );

            expect( references[ 0 ].content ).toEqual( 'Name|value' );
            expect( references[ 0 ].uiElementName ).toEqual( 'Name' );
            expect( references[ 0 ].property ).toEqual( 'value' );
        } );

        it( 'extracts two references', () => {
            const references: UIPropertyReference[] = extractReferences(
                'When I drag {Foo|value}, {Bar|minlength} to {Foo}' );
            expect( references ).toHaveLength( 2 );

            expect( references[ 0 ].content ).toEqual( 'Foo|value' );
            expect( references[ 0 ].uiElementName ).toEqual( 'Foo' );
            expect( references[ 0 ].property ).toEqual( 'value' );

            expect( references[ 1 ].content ).toEqual( 'Bar|minlength' );
            expect( references[ 1 ].uiElementName ).toEqual( 'Bar' );
            expect( references[ 1 ].property ).toEqual( 'minlength' );
        } );

        it( 'extracts three references', () => {
            const references: UIPropertyReference[] = extractReferences(
                'When I drag {Foo|value}, {Bar|minlength}, {Zoo|maxvalue} to {Foo}' );
            expect( references ).toHaveLength( 3 );

            expect( references[ 0 ].content ).toEqual( 'Foo|value' );
            expect( references[ 0 ].uiElementName ).toEqual( 'Foo' );
            expect( references[ 0 ].property ).toEqual( 'value' );

            expect( references[ 1 ].content ).toEqual( 'Bar|minlength' );
            expect( references[ 1 ].uiElementName ).toEqual( 'Bar' );
            expect( references[ 1 ].property ).toEqual( 'minlength' );

            expect( references[ 2 ].content ).toEqual( 'Zoo|maxvalue' );
            expect( references[ 2 ].uiElementName ).toEqual( 'Zoo' );
            expect( references[ 2 ].property ).toEqual( 'maxvalue' );
        } );

        // it( 'does not extract a not valid property', () => {
        //     const references: UIPropertyReference[] = extractReferences(
        //         'When I drag {Foo|bar}, {Bar|foo} to {Foo}' );
        //     expect( references ).toHaveLength( 0 );
        // } );

        it( 'extraction has the right column number - in the end', () => {
            const references: UIPropertyReference[] = extractReferences(
                'When I drag {Foo|value}' );
            const column: number = 'When I drag '.length;
            expect( references ).toHaveLength( 1 );
            const loc: Location = references[ 0 ].location;
            expect( loc.column ).toEqual( column );
        } );

        it( 'extraction has the right column number - in the beginning', () => {
            const references: UIPropertyReference[] = extractReferences(
                '{Foo|value}' );
            const column: number = 0;
            expect( references ).toHaveLength( 1 );
            const loc: Location = references[ 0 ].location;
            expect( loc.column ).toEqual( column );
        } );

    } );

} );