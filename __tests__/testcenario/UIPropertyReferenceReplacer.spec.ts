import { LocalDate, LocalDateTime, LocalTime } from "@js-joda/core";
import { EntityValueType, Step } from '../../modules/ast';
import { LocatedException } from "../../modules/error/LocatedException";
import { AugmentedSpec } from "../../modules/req";
import { createDefaultLocaleMap } from "../../modules/testscenario/locale";
import { LocaleContext } from "../../modules/testscenario/LocaleContext";
import { GenContext } from "../../modules/testscenario/PreTestCaseGenerator";
import { UIPropertyReferenceReplacer } from '../../modules/testscenario/UIPropertyReferenceReplacer';
import { UIPropertyReferenceExtractor } from "../../modules/util/UIPropertyReferenceExtractor";
import { SimpleCompiler } from "../SimpleCompiler";


describe( 'UIPropertyReferenceReplacer', () => {

    describe( '#replaceUIPropertyReferencesByTheirValue', () => {

        const localeMap = createDefaultLocaleMap();

        async function check(
            compiler: SimpleCompiler,
            language: string,
            specLines: string[],
            key: string,
            value: any,
            expected: string
            ): Promise< void > {

            const replacer = new UIPropertyReferenceReplacer(); // immutable, under test

            let spec: AugmentedSpec = new AugmentedSpec( '.' );

            let doc = await compiler.addToSpec( spec, specLines );

            let errors: LocatedException[] = [];
            let warnings: LocatedException[] = [];
            let ctx = new GenContext( spec, doc, errors, warnings );

            let uieVarToValue: Map< string, EntityValueType > = new Map< string, EntityValueType >();
            uieVarToValue.set( key, value );

            let step: Step = doc.feature.scenarios[ 0 ].variants[ 0 ].sentences[ 1 ]; // Then...

            let references = ( new UIPropertyReferenceExtractor() ).extractReferences(
                step.nlpResult.entities, step.location.line );

            const localeContext = new LocaleContext( language, language, localeMap );

            const sentence = await replacer.replaceUIPropertyReferencesByTheirValue(
                localeContext, step, step.content, references, uieVarToValue, ctx );

            expect( sentence ).toEqual( expected );
        }


        describe( 'en', () => {

            const FEATURE: string = 'F1';
            const compiler = new SimpleCompiler( 'en' );

            async function chk(
                line: string, key: string, value: any, expected: string
                ): Promise< void > {

                const lines = [
                    `Feature: ${FEATURE}`,
                    'Scenario: S1',
                    '  Variant: V1',
                    '    Given that I see {Foo}',
                    line,
                    '',
                    'UI Element: Foo'
                ];

                await check( compiler, 'en', lines, key, value, expected );
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
                const value: LocalDate = LocalDate.of( 2001, 12, 31 );
                await chk( 'Then I see {Foo|value}', `${FEATURE}:Foo`, value, 'Then I see "12/31/2001"'  );
            } );

            it( 'replaces by a time', async () => {
                const value: LocalTime = LocalTime.of( 13, 1 );
                await chk( 'Then I see {Foo|value}', `${FEATURE}:Foo`, value, 'Then I see "13:01"'  );
            } );

            it( 'replaces by a datetime', async () => {
                const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
                await chk( 'Then I see {Foo|value}', `${FEATURE}:Foo`, value, 'Then I see "12/31/2001 13:01"'  );
            } );

        } );



        describe( 'pt', () => {

            const FEATURE: string = 'F1';
            const compiler = new SimpleCompiler( 'pt' );

            async function chk(
                line: string, key: string, value: any, expected: string
                ): Promise< void > {

                const lines = [
                    `Funcionalidade: ${FEATURE}`,
                    'Cenário: S1',
                    '  Variante: V1',
                    '    Dado que eu vejo {Foo}',
                    line,
                    '',
                    'Elemento de IU: Foo'
                ];

                await check( compiler, 'pt', lines, key, value, expected );
            }


            it( 'replaces by a number', async () => {
                await chk( 'Então eu vejo {Foo|value}', `${FEATURE}:Foo`, 1, 'Então eu vejo 1' );
            } );

            it( 'replaces by an empty string', async () => {
                await chk( 'Então eu vejo {Foo|value}', `${FEATURE}:Foo`, "", 'Então eu vejo ""' );
            } );

            it( 'replaces by a non empty string', async () => {
                await chk( 'Então eu vejo {Foo|value}', `${FEATURE}:Foo`, "bar", 'Então eu vejo "bar"' );
            } );

            it( 'replaces by a date', async () => {
                const value: LocalDate = LocalDate.of( 2001, 12, 31 );
                await chk( 'Então eu vejo {Foo|value}', `${FEATURE}:Foo`, value, 'Então eu vejo "31/12/2001"'  );
            } );

            it( 'replaces by a time', async () => {
                const value: LocalTime = LocalTime.of( 13, 1 );
                await chk( 'Então eu vejo {Foo|value}', `${FEATURE}:Foo`, value, 'Então eu vejo "13:01"'  );
            } );

            it( 'replaces by a datetime', async () => {
                const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
                await chk( 'Então eu vejo {Foo|value}', `${FEATURE}:Foo`, value, 'Então eu vejo "31/12/2001 13:01"'  );
            } );

        } );


    } );

} );