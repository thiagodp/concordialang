import { DateTimeFormatter, LocalDate } from '@js-joda/core';
import * as fs from 'fs';
import { resolve } from 'path';
import { Options } from '../../modules/app/Options';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../modules/language';
import { Entities, Intents, NLP, NLPResult, NLPTrainer } from '../../modules/nlp';
import { FSFileHandler } from '../../modules/util/file/FSFileHandler';

describe( 'NLP in English', () => {

    let nlp: NLP; // under test

    const LANGUAGE = 'en';
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const fileHandler = new FSFileHandler( fs );
    const langLoader: LanguageContentLoader = new JsonLanguageContentLoader(
        options.languageDir,
        {},
        fileHandler,
        fileHandler
        );

    // entities
    const UI_ELEMENT: string = Entities.UI_ELEMENT_REF;
    const UI_LITERAL: string = Entities.UI_LITERAL;
    const VALUE: string = Entities.VALUE;
    const NUMBER: string = Entities.NUMBER;
    const CONSTANT: string = Entities.CONSTANT;
    const QUERY: string = Entities.QUERY;
    const STATE: string = Entities.STATE;
    const COMMAND: string = Entities.COMMAND;
    const DATE: string = Entities.DATE;
    const TIME: string = Entities.TIME;
    const UI_ACTION: string = Entities.UI_ACTION;
    const UI_ACTION_MODIFIER = Entities.UI_ACTION_MODIFIER;
    const UI_ACTION_OPTION = Entities.UI_ACTION_OPTION;
    const UI_ELEMENT_TYPE: string = Entities.UI_ELEMENT_TYPE;
    const UI_PROPERTY: string = Entities.UI_PROPERTY;
    const UI_CONNECTOR: string = Entities.UI_CONNECTOR;
    const UI_DATA_TYPE: string = Entities.UI_DATA_TYPE;
    const EXEC_ACTION: string = Entities.EXEC_ACTION;

    beforeEach( () => {
        nlp = new NLP();
        const nlpTrainer = new NLPTrainer( langLoader );
        const ok = nlpTrainer.trainNLP( nlp, LANGUAGE );
        expect( ok ).toBeTruthy();
    } );

    afterEach( () => {
        nlp = null;
    } );

    function recognize( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence );
    }

    function recognizeInTestCase( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence, Intents.TEST_CASE );
    }

    function recognizeInUI( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence, Intents.UI );
    }

    function shouldHaveEntities(
        results: NLPResult[],
        expectedEntitiesNames: string[],
        intent: string,
        debug: boolean = false
    ) {
        for ( let r of results ) {
            if ( debug ) { console.log( 'NLP Result is', r ); }
            expect( r ).not.toBeFalsy();
            expect( r.intent ).toEqual( intent );
            expect( r.entities ).not.toBeNull();
            expect( r.entities.length ).toBeGreaterThanOrEqual( expectedEntitiesNames.length );
            let entities = r.entities.map( e => e.entity );
            expect( entities ).toEqual( expect.arrayContaining( expectedEntitiesNames ) ); // it doesn't matter the array order
        }
    }

    function shouldHaveTestCaseEntities( results: any[], expectedEntitiesNames: string[], debug: boolean = false ) {
        shouldHaveEntities( results, expectedEntitiesNames, Intents.TEST_CASE, debug );
    }

    function shouldHaveUIEntities( results: any[], expectedEntitiesNames: string[], debug: boolean = false ) {
        shouldHaveEntities( results, expectedEntitiesNames, Intents.UI, debug );
    }


    describe( 'recognizes a date period', () => {

        function checkDate( text: string, expected: LocalDate ): void {
            let r: NLPResult = recognize( text );
            shouldHaveUIEntities( [ r ], [ UI_PROPERTY, DATE  ] );

            const expectedStr = expected.format(
                DateTimeFormatter.ofPattern( 'yyyy-MM-dd' ) ).toString();

            const date = r.entities.filter( e => e.entity === DATE );
            expect( date[ 0 ].value ).toEqual( expectedStr );
        }

        it( 'last year', () => {
            checkDate(
                'value is last year',
                LocalDate.now().minusYears( 1 )
                );
        } );

        it( 'last semester', () => {
            checkDate(
                'value is last semester',
                LocalDate.now().minusMonths( 6 )
                );
        } );

        it( 'last month', () => {
            checkDate(
                'value is last month',
                LocalDate.now().minusMonths( 1 )
                );
        } );

        it( 'last week', () => {
            checkDate(
                'value is last week',
                LocalDate.now().minusDays( 7 )
                );
        } );

        it( 'the day before yesterday', () => {
            checkDate(
                'value is the day before yesterday',
                LocalDate.now().minusDays( 2 )
                );
        } );

        it( 'yesterday', () => {
            checkDate(
                'value is yesterday',
                LocalDate.now().minusDays( 1 )
                );
        } );

        it( 'today', () => {
            checkDate(
                'value is today',
                LocalDate.now()
                );
        } );

        it( 'tomorrow', () => {
            checkDate(
                'value is tomorrow',
                LocalDate.now().plusDays( 1 )
                );
        } );

        it( 'the day after tomorrow', () => {
            checkDate(
                'value is the day after tomorrow',
                LocalDate.now().plusDays( 2 )
                );
        } );

        it( 'next week', () => {
            checkDate(
                'value is next week',
                LocalDate.now().plusDays( 7 )
                );
        } );

        it( 'next month', () => {
            checkDate(
                'value is next month',
                LocalDate.now().plusMonths( 1 )
                );
        } );

        it( 'next semester', () => {
            checkDate(
                'value is next semester',
                LocalDate.now().plusMonths( 6 )
                );
        } );

        it( 'next year', () => {
            checkDate(
                'value is next year',
                LocalDate.now().plusYears( 1 )
                );
        } );

        //
        // dynamic - past
        //

        it( 'dynamic - past 1 year', () => {
            const expected = LocalDate.now().minusYears( 1 );
            checkDate(
                'value is past 1 year',
                expected
            );
            checkDate(
                'value is 1 year ago',
                expected
            );
        } );

        it( 'dynamic - past 2 years', () => {
            const expected = LocalDate.now().minusYears( 2 );
            checkDate(
                'value is past 2 years',
                expected
            );
            checkDate(
                'value is 2 years ago',
                expected
            );
        } );

        it( 'dynamic - past 1 month', () => {
            const expected = LocalDate.now().minusMonths( 1 );
            checkDate(
                'value is past 1 month',
                expected
                );
            checkDate(
                'value is 1 month ago',
                expected
                );
        } );

        it( 'dynamic - past 2 months', () => {
            const expected = LocalDate.now().minusMonths( 2 );
            checkDate(
                'value is past 2 months',
                expected
            );
            checkDate(
                'value is 2 months ago',
                expected
            );
        } );

        it( 'dynamic - past 1 week', () => {
            const expected = LocalDate.now().minusDays( 7 );
            checkDate(
                'value is past 1 week',
                expected
            );
            checkDate(
                'value is 1 week ago',
                expected
            );
        } );

        it( 'dynamic - past 2 weeks', () => {
            const expected = LocalDate.now().minusDays( 14 );
            checkDate(
                'value is past 2 weeks',
                expected
            );
            checkDate(
                'value is 2 weeks ago',
                expected
            );
        } );

        it( 'dynamic - past 1 day', () => {
            const expected = LocalDate.now().minusDays( 1 );
            checkDate(
                'value is past 1 day',
                expected
            );
            checkDate(
                'value is 1 day ago',
                expected
            );
        } );

        it( 'dynamic - past 2 days', () => {
            const expected = LocalDate.now().minusDays( 2 );
            checkDate(
                'value is past 2 days',
                expected
            );
            checkDate(
                'value is 2 days ago',
                expected
            );
        } );


        // dynamic - future


        it( 'dynamic - next 1 year', () => {
            const expected = LocalDate.now().plusYears( 1 );
            checkDate(
                'value is next 1 year',
                expected
                );
            checkDate(
                'value is 1 year ahead',
                expected
                );
            checkDate(
                'value is 1 year in the future',
                expected
                );
        } );

        it( 'dynamic - next 2 years', () => {
            const expected = LocalDate.now().plusYears( 2 );
            checkDate(
                'value is next 2 years',
                expected
            );
            checkDate(
                'value is 2 years ahead',
                expected
            );
            checkDate(
                'value is 2 years in the future',
                expected
            );
        } );

        it( 'dynamic - next 1 month', () => {
            const expected = LocalDate.now().plusMonths( 1 );
            checkDate(
                'value is next 1 month',
                expected
            );
            checkDate(
                'value is 1 month ahead',
                expected
            );
            checkDate(
                'value is 1 month in the future',
                expected
            );
        } );

        it( 'dynamic - next 2 months', () => {
            const expected = LocalDate.now().plusMonths( 2 );
            checkDate(
                'value is next 2 months',
                expected
            );
            checkDate(
                'value is 2 months ahead',
                expected
            );
            checkDate(
                'value is 2 months in the future',
                expected
            );
        } );

        it( 'dynamic - next 1 week', () => {
            const expected = LocalDate.now().plusDays( 7 );
            checkDate(
                'value is next 1 week',
                expected
            );
            checkDate(
                'value is 1 week ahead',
                expected
            );
            checkDate(
                'value is 1 week in the future',
                expected
            );
        } );

        it( 'dynamic - next 2 weeks', () => {
            const expected = LocalDate.now().plusDays( 14 );
            checkDate(
                'value is next 2 weeks',
                expected
            );
            checkDate(
                'value is 2 weeks ahead',
                expected
            );
            checkDate(
                'value is 2 weeks in the future',
                expected
            );
        } );

        it( 'dynamic - next 1 day', () => {
            const expected = LocalDate.now().plusDays( 1 );
            checkDate(
                'value is next 1 day',
                expected
            );
            checkDate(
                'value is 1 day ahead',
                expected
            );
            checkDate(
                'value is 1 day in the future',
                expected
            );
        } );

        it( 'dynamic - next 2 days', () => {
            const expected = LocalDate.now().plusDays( 2 );
            checkDate(
                'value is next 2 days',
                expected
            );
            checkDate(
                'value is 2 days ahead',
                expected
            );
            checkDate(
                'value is 2 days in the future',
                expected
            );
        } );

            //
            // date
            //

            const parseDate = ( text: string ): LocalDate => {
                return LocalDate.parse( text, DateTimeFormatter.ofPattern( "MM/dd/yyyy" ) );
            };

            it( 'full date', () => {
                checkDate(
                    'value is 12/31/2020',
                    parseDate( "12/31/2020" )
                    );
            } );

            it( 'partial date', () => {
                checkDate(
                    'value is 12/31',
                    parseDate( "12/31/" + LocalDate.now().year() )
                    );
            } );

            //
            // year of
            //

            function checkValueOfDate( text: string, value: number ): void {
                let r: NLPResult = recognize( text );
                shouldHaveUIEntities( [ r ], [ UI_PROPERTY, DATE ] );
                const date = r.entities.filter( e => e.entity === DATE );
                expect( date[ 0 ].value ).toEqual( value );
            }

            it( 'year of + static expression', () => {
                checkValueOfDate(
                    'value is year of today',
                    LocalDate.now().year()
                    );
            } );

            it( 'year of + dynamic expression', () => {
                checkValueOfDate(
                    'value is year of 2 years ago',
                    LocalDate.now().minusYears( 2 ).year()
                    );
            } );

            //
            // month of
            //

            it( 'month of + static expression', () => {
                checkValueOfDate(
                    'value is month of today',
                    LocalDate.now().monthValue()
                    );
            } );

            it( 'month of + dynamic expression', () => {
                checkValueOfDate(
                    'value is month of 2 months ago',
                    LocalDate.now().minusMonths( 2 ).monthValue()
                    );
            } );

            //
            // day of
            //

            it( 'day of + static expression', () => {
                checkValueOfDate(
                    'value is day of today',
                    LocalDate.now().dayOfMonth()
                    );
            } );

            it( 'day of + dynamic expression', () => {
                checkValueOfDate(
                    'value is day of 2 days ago',
                    LocalDate.now().minusDays( 2 ).dayOfMonth()
                    );
            } );

    } );


} );