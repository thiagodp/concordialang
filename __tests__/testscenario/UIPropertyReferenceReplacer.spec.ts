import { LocalDate, LocalDateTime, LocalTime } from '@js-joda/core';

import { EntityValueType, Step } from '../../modules/ast';
import { LocatedException } from '../../modules/error/LocatedException';
import { AugmentedSpec } from '../../modules/req';
import { createDefaultLocaleMap } from '../../modules/testscenario/locale';
import { LocaleContext } from '../../modules/testscenario/LocaleContext';
import { GenContext } from '../../modules/testscenario/PreTestCaseGenerator';
import { UIPropertyReferenceExtractor } from '../../modules/testscenario/UIPropertyReferenceExtractor';
import { UIPropertyReferenceReplacer } from '../../modules/testscenario/UIPropertyReferenceReplacer';
import { SimpleCompiler } from '../SimpleCompiler';


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

			async function chkWithLocalePtBR(
                line: string, key: string, value: any, expected: string
                ): Promise< void > {

                const lines = [
                    `Feature: ${FEATURE}`,
                    'Scenario: S1',
                    '  Variant: V1',
                    '    Given that I see {Foo}',
                    line,
                    '',
					'UI Element: Foo',
					' - locale is "pt-BR"'
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


			it( 'replaces by a long time', async () => {

                const lines = [
                    'Feature: F1',
                    'Scenario: S1',
                    '  Variant: V1',
                    '    Given that I see {Foo}',
                    '    Then I see {Foo|value}',
                    '',
					'UI Element: Foo',
					' - data type is long time'
                ];

                await check( compiler, 'en', lines, 'F1:Foo', LocalTime.of( 13, 1 ), 'Then I see "13:01:00"' );
			} );

			it( 'replaces by a long datetime', async () => {

                const lines = [
                    'Feature: F1',
                    'Scenario: S1',
                    '  Variant: V1',
                    '    Given that I see {Foo}',
                    '    Then I see {Foo|value}',
                    '',
					'UI Element: Foo',
					' - data type is long datetime'
                ];

				const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
                await check( compiler, 'en', lines, 'F1:Foo', value, 'Then I see "12/31/2001 13:01:00"' );
			} );


			describe( 'with locale "pt-BR"', () => {

				it( 'replaces a date', async () => {
					const value: LocalDate = LocalDate.of( 2001, 12, 31 );
					await chkWithLocalePtBR( 'Then I see {Foo|value}', `${FEATURE}:Foo`, value, 'Then I see "31/12/2001"'  );
				} );

				it( 'replaces a datetime', async () => {
					const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
                	await chkWithLocalePtBR( 'Then I see {Foo|value}', `${FEATURE}:Foo`, value, 'Then I see "31/12/2001 13:01"'  );
				} );

				it( 'replaces a long datetime', async () => {

					const lines = [
						'Feature: F1',
						'Scenario: S1',
						'  Variant: V1',
						'    Given that I see {Foo}',
						'    Then I see {Foo|value}',
						'',
						'UI Element: Foo',
						' - data type is long datetime',
						' - locale is "pt-BR"',
					];

					const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
					await check( compiler, 'en', lines, 'F1:Foo', value, 'Then I see "31/12/2001 13:01:00"' );
				} );

			} );


			it( 'time respects locale format', async () => {

				const lines = [
					'Feature: F1',
					'Scenario: S1',
					'  Variant: V1',
					'    Given that I see {Foo}',
					'    Then I see {Foo|value}',
					'',
					'UI Element: Foo',
					' - data type is time',
					' - locale format is "HH"',
				];

				const value: LocalTime = LocalTime.of( 13, 1 );
				await check( compiler, 'en', lines, 'F1:Foo', value, 'Then I see "13"' );
			} );

			it( 'date respects locale format', async () => {

				const lines = [
					'Feature: F1',
					'Scenario: S1',
					'  Variant: V1',
					'    Given that I see {Foo}',
					'    Then I see {Foo|value}',
					'',
					'UI Element: Foo',
					' - data type is date',
					' - locale format é "dd-MM"'
				];

				const value: LocalDate = LocalDate.of( 2001, 12, 31 );
				await check( compiler, 'en', lines, 'F1:Foo', value, 'Then I see "31-12"' );
			} );

			it( 'datetime respects locale format', async () => {

				const lines = [
					'Feature: F1',
					'Scenario: S1',
					'  Variant: V1',
					'    Given that I see {Foo}',
					'    Then I see {Foo|value}',
					'',
					'UI Element: Foo',
					' - data type is datetime',
					' - locale format is "dd-MM-yyyy HH;mm;ss"'
				];

				const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
				await check( compiler, 'en', lines, 'F1:Foo', value, 'Then I see "31-12-2001 13;01;00"' );
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


			async function chkWithLocaleEnUS(
                line: string, key: string, value: any, expected: string
                ): Promise< void > {

                const lines = [
                    `Funcionalidade: ${FEATURE}`,
                    'Cenário: S1',
                    '  Variante: V1',
                    '    Dado que eu vejo {Foo}',
                    line,
                    '',
					'Elemento de IU: Foo',
					' - locale is "en-US"'
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

			it( 'replaces by a long time', async () => {

                const lines = [
                    `Funcionalidade: F1`,
                    'Cenário: S1',
                    '  Variante: V1',
                    '    Dado que eu vejo {Foo}',
                    '    Então eu vejo {Foo|value}',
                    '',
					'Elemento de IU: Foo',
					' - tipo de dado é hora longa'
                ];

                await check( compiler, 'pt', lines, 'F1:Foo', LocalTime.of( 13, 1 ), 'Então eu vejo "13:01:00"' );
			} );

			it( 'replaces by a long datetime', async () => {

                const lines = [
                    `Funcionalidade: F1`,
                    'Cenário: S1',
                    '  Variante: V1',
                    '    Dado que eu vejo {Foo}',
                    '    Então eu vejo {Foo|value}',
                    '',
					'Elemento de IU: Foo',
					' - tipo de dado é datahora longa'
                ];

				const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
                await check( compiler, 'pt', lines, 'F1:Foo', value, 'Então eu vejo "31/12/2001 13:01:00"' );
			} );



			describe( 'with locale "en-US"', () => {

				it( 'replaces a date', async () => {
					const value: LocalDate = LocalDate.of( 2001, 12, 31 );
					await chkWithLocaleEnUS( 'Então eu vejo {Foo|value}', `${FEATURE}:Foo`, value, 'Então eu vejo "12/31/2001"'  );
				} );

				it( 'replaces a datetime', async () => {
					const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
                	await chkWithLocaleEnUS( 'Então eu vejo {Foo|value}', `${FEATURE}:Foo`, value, 'Então eu vejo "12/31/2001 13:01"'  );
				} );

				it( 'replaces by a long datetime', async () => {

					const lines = [
						`Funcionalidade: F1`,
						'Cenário: S1',
						'  Variante: V1',
						'    Dado que eu vejo {Foo}',
						'    Então eu vejo {Foo|value}',
						'',
						'Elemento de IU: Foo',
						' - tipo de dado é datahora longa',
						' - localidade é "en-US"'
					];

					const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
					await check( compiler, 'pt', lines, 'F1:Foo', value, 'Então eu vejo "12/31/2001 13:01:00"' );
				} );

			} );

			it( 'time respects locale format', async () => {

				const lines = [
					`Funcionalidade: F1`,
					'Cenário: S1',
					'  Variante: V1',
					'    Dado que eu vejo {Foo}',
					'    Então eu vejo {Foo|value}',
					'',
					'Elemento de IU: Foo',
					' - tipo de dado é hora',
					' - formato de localidade é "HH"'
				];

				const value: LocalTime = LocalTime.of( 13, 1 );
				await check( compiler, 'pt', lines, 'F1:Foo', value, 'Então eu vejo "13"' );
			} );

			it( 'date respects locale format', async () => {

				const lines = [
					`Funcionalidade: F1`,
					'Cenário: S1',
					'  Variante: V1',
					'    Dado que eu vejo {Foo}',
					'    Então eu vejo {Foo|value}',
					'',
					'Elemento de IU: Foo',
					' - tipo de dado é date',
					' - formato de localidade é "dd-MM"'
				];

				const value: LocalDate = LocalDate.of( 2001, 12, 31 );
				await check( compiler, 'pt', lines, 'F1:Foo', value, 'Então eu vejo "31-12"' );
			} );

			it( 'datetime respects locale format', async () => {

				const lines = [
					`Funcionalidade: F1`,
					'Cenário: S1',
					'  Variante: V1',
					'    Dado que eu vejo {Foo}',
					'    Então eu vejo {Foo|value}',
					'',
					'Elemento de IU: Foo',
					' - tipo de dado é datetime',
					' - formato de localidade é "dd-MM-yyyy HH;mm;ss"'
				];

				const value: LocalDateTime = LocalDateTime.of( 2001, 12, 31, 13, 1 );
				await check( compiler, 'pt', lines, 'F1:Foo', value, 'Então eu vejo "31-12-2001 13;01;00"' );
			} );


		} ); // pt

    } ); // #replaceUIPropertyReferencesByTheirValue

} );
