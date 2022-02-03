import { Location } from 'concordialang-types';

import { UIPropertyReference } from '../../modules/ast';
import { NLP, NLPResult, NLPTrainingData, NLPTrainingDataConversor } from '../../modules/nlp';
import { UIPropertyReferenceExtractor } from '../../modules/testscenario/UIPropertyReferenceExtractor';


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


    describe( 'extractReferencesFromValue', () => {

        it( 'extracts one reference with a feature', () => {

            const feature = 'Feature 1';
            const uie = 'Foo';
            const property = 'value';
            const referenceText = `I see {${feature}:${uie}|${property}}`;

            const extractor = new UIPropertyReferenceExtractor();
            const references: UIPropertyReference[] = extractor.extractReferencesFromValue( referenceText, 1 );
            expect( references ).toHaveLength( 1 );

            const ref: UIPropertyReference = references[ 0 ];
            expect( ref ).toBeDefined();
            expect( ref.uiElementName ).toEqual( feature + ':' + uie );
            expect( ref.property ).toEqual( property );
        } );

        it( 'extracts one reference without a feature', () => {

            const uie = 'Foo';
            const property = 'value';
            const referenceText = `I see {${uie}|${property}}`;

            const extractor = new UIPropertyReferenceExtractor();
            const references: UIPropertyReference[] = extractor.extractReferencesFromValue( referenceText, 1 );
            expect( references ).toHaveLength( 1 );

            const ref: UIPropertyReference = references[ 0 ];
            expect( ref ).toBeDefined();
            expect( ref.uiElementName ).toEqual( uie );
            expect( ref.property ).toEqual( property );
        } );

        it( 'extracts two references with a feature', () => {

            const feature1 = 'Feature 1';
            const uie1 = 'Foo';
            const property1 = 'value';

            const feature2 = 'Feature 2';
            const uie2 = 'Bar';
            const property2 = 'minvalue';

            const referenceText = `I see {${feature1}:${uie1}|${property1}} and {${feature2}:${uie2}|${property2}}`;

            const extractor = new UIPropertyReferenceExtractor();
            const references: UIPropertyReference[] = extractor.extractReferencesFromValue( referenceText, 1 );
            expect( references ).toHaveLength( 2 );

            const ref: UIPropertyReference = references[ 0 ];
            expect( ref ).toBeDefined();
            expect( ref.uiElementName ).toEqual( feature1 + ':' + uie1 );
            expect( ref.property ).toEqual( property1 );

            const ref2: UIPropertyReference = references[ 1 ];
            expect( ref2 ).toBeDefined();
            expect( ref2.uiElementName ).toEqual( feature2 + ':' + uie2 );
            expect( ref2.property ).toEqual( property2 );
        } );

        it( 'extracts two references without feature', () => {

            const uie1 = 'Foo';
            const property1 = 'value';

            const uie2 = 'Bar';
            const property2 = 'minvalue';

            const referenceText = `I see {${uie1}|${property1}} and {${uie2}|${property2}}`;

            const extractor = new UIPropertyReferenceExtractor();
            const references: UIPropertyReference[] = extractor.extractReferencesFromValue( referenceText, 1 );
            expect( references ).toHaveLength( 2 );

            const ref: UIPropertyReference = references[ 0 ];
            expect( ref ).toBeDefined();
            expect( ref.uiElementName ).toEqual( uie1 );
            expect( ref.property ).toEqual( property1 );

            const ref2: UIPropertyReference = references[ 1 ];
            expect( ref2 ).toBeDefined();
            expect( ref2.uiElementName ).toEqual( uie2 );
            expect( ref2.property ).toEqual( property2 );
        } );

        it( 'extracts mixed references', () => {

            const uie1 = 'Foo';
            const property1 = 'value';

            const feature2 = 'Feature 1';
            const uie2 = 'Bar';
            const property2 = 'minvalue';

            const uie3 = 'Foo';
            const property3 = 'maxlength';

            const referenceText = `I see {${uie1}|${property1}} and {${feature2}:${uie2}|${property2}} and {${uie3}|${property3}}`;

            const extractor = new UIPropertyReferenceExtractor();
            const references: UIPropertyReference[] = extractor.extractReferencesFromValue( referenceText, 1 );
            expect( references ).toHaveLength( 3 );

            const ref: UIPropertyReference = references[ 0 ];
            expect( ref ).toBeDefined();
            expect( ref.uiElementName ).toEqual( uie1 );
            expect( ref.property ).toEqual( property1 );

            const ref2: UIPropertyReference = references[ 1 ];
            expect( ref2 ).toBeDefined();
            expect( ref2.uiElementName ).toEqual( feature2 + ':' + uie2 );
            expect( ref2.property ).toEqual( property2 );

            const ref3: UIPropertyReference = references[ 2 ];
            expect( ref3 ).toBeDefined();
            expect( ref3.uiElementName ).toEqual( uie3 );
            expect( ref3.property ).toEqual( property3 );
        } );

    } );


    describe( 'makeReferenceFromString', () => {

        it( 'makes from a reference with a feature', () => {

            const feature = 'Feature 1';
            const uie = 'Foo';
            const property = 'value';
            const referenceString = `{${feature}:${uie}|${property}}`;

            const extractor = new UIPropertyReferenceExtractor();
            const ref: UIPropertyReference = extractor.makeReferenceFromString( referenceString, null );
            expect( ref ).toBeDefined();
            expect( ref.uiElementName ).toEqual( feature + ':' + uie );
            expect( ref.property ).toEqual( property );
        } );

        it( 'makes from a reference without a feature', () => {

            const uie = 'Foo';
            const property = 'value';
            const referenceString = `{${uie}|${property}}`;

            const extractor = new UIPropertyReferenceExtractor();
            const ref: UIPropertyReference = extractor.makeReferenceFromString( referenceString, null );
            expect( ref ).toBeDefined();
            expect( ref.uiElementName ).toEqual( uie );
            expect( ref.property ).toEqual( property );
        } );

    } );

} );
