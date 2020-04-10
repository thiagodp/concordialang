import { LocalDate, LocalDateTime, LocalTime } from "js-joda";
import { EntityValueType, Step } from '../../modules/ast';
import { LocatedException } from "../../modules/error/LocatedException";
import { AugmentedSpec } from "../../modules/req";
import { GenContext } from "../../modules/testscenario/PreTestCaseGenerator";
import { UIPropertyReferenceReplacer } from '../../modules/testscenario/UIPropertyReferenceReplacer';
import { UIPropertyReferenceExtractor } from "../../modules/util/UIPropertyReferenceExtractor";
import { SimpleCompiler } from "../SimpleCompiler";


describe( 'UIPropertyReferenceReplacer', () => {

    describe( 'replaceUIPropertyReferencesByTheirValue', () => {

        const FEATURE: string = 'F1';

        async function chk(
            line: string, key: string, value: any, expected: string
            ): Promise< void > {

            const extractor = new UIPropertyReferenceExtractor();
            const replacer = new UIPropertyReferenceReplacer(); // immutable

            const compiler = new SimpleCompiler( 'en' );
            let spec: AugmentedSpec = new AugmentedSpec( '.' );

            let doc = await compiler.addToSpec( spec, [
                `Feature: ${FEATURE}`,
                'Scenario: S1',
                '  Variant: V1',
                '    Given that I see {Foo}',
                line,
                '',
                'UI Element: Foo'
            ] );

            let errors: LocatedException[] = [];
            let warnings: LocatedException[] = [];
            let ctx = new GenContext( spec, doc, errors, warnings );

            let uieVarToValue: Map< string, EntityValueType > = new Map< string, EntityValueType >();
            uieVarToValue.set( key, value );

            let step: Step = doc.feature.scenarios[ 0 ].variants[ 0 ].sentences[ 1 ]; // Then...
            let references = extractor.extractReferences( step.nlpResult.entities, step.location.line );

            const sentence = replacer.replaceUIPropertyReferencesByTheirValue(
                step, step.content, references, uieVarToValue, ctx );
            expect( sentence ).toEqual( expected );
        }

        it( 'replaces by a number', async () => {
            await chk( 'Then I see {Foo|value}', `${FEATURE}:Foo`, 1, 'Then I see 1' );
        } );

        it( 'replaces by an empty string', async () => {
            await chk( 'Then I see {Foo|value}', `${FEATURE}:Foo`, "", 'Then I see ""' );
        } );

        it( 'replaces by a non empty string', async () => {
            await chk( 'Then I see {Foo|value}', `${FEATURE}:Foo`, "bar", 'Then I see "bar"' );
        } );

        it( 'replaces by a date', async () => {
            // TO-DO: l10n
            const value: LocalDate = LocalDate.of( 2001, 12, 31 );
            await chk( 'Then I see {Foo|value}', `${FEATURE}:Foo`, value, 'Then I see "31/12/2001"'  );
        } );

        it( 'replaces by a time', async () => {
            // TO-DO: l10n
            const value: LocalTime = LocalTime.of( 13, 1 );
            await chk( 'Then I see {Foo|value}', `${FEATURE}:Foo`, value, 'Then I see "13:01"'  );
        } );

        it( 'replaces by a datetime', async () => {
            // TO-DO: l10n
            const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
            await chk( 'Then I see {Foo|value}', `${FEATURE}:Foo`, value, 'Then I see "31/12/2001 13:01"'  );
        } );

    } );

} );