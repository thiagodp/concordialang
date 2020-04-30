import { DateTimeFormatter, LocalDateTime } from '@js-joda/core';
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
    const TIME: string = Entities.TIME;
    const DATE: string = Entities.DATE;
    const TIME_PERIOD: string = Entities.TIME_PERIOD;
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
        const ok = ( new NLPTrainer( langLoader ) ).trainNLP( nlp, LANGUAGE );
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

        function checkDate( text: string, expected: LocalDateTime ): void {
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
                LocalDateTime.now().minusYears( 1 )
                );
        } );

        it( 'last semester', () => {
            checkDate(
                'value is last semester',
                LocalDateTime.now().minusMonths( 6 )
                );
        } );

        it( 'last month', () => {
            checkDate(
                'value is last month',
                LocalDateTime.now().minusMonths( 1 )
                );
        } );

        it( 'last week', () => {
            checkDate(
                'value is last week',
                LocalDateTime.now().minusDays( 7 )
                );
        } );

        it( 'the day before yesterday', () => {
            checkDate(
                'value is the day before yesterday',
                LocalDateTime.now().minusDays( 2 )
                );
        } );

        it( 'yesterday', () => {
            checkDate(
                'value is yesterday',
                LocalDateTime.now().minusDays( 1 )
                );
        } );

        it( 'today', () => {
            checkDate(
                'value is today',
                LocalDateTime.now()
                );
        } );

        it( 'tomorrow', () => {
            checkDate(
                'value is tomorrow',
                LocalDateTime.now().plusDays( 1 )
                );
        } );

        it( 'the day after tomorrow', () => {
            checkDate(
                'value is the day after tomorrow',
                LocalDateTime.now().plusDays( 2 )
                );
        } );

        it( 'next week', () => {
            checkDate(
                'value is next week',
                LocalDateTime.now().plusDays( 7 )
                );
        } );

        it( 'next month', () => {
            checkDate(
                'value is next month',
                LocalDateTime.now().plusMonths( 1 )
                );
        } );

        it( 'next semester', () => {
            checkDate(
                'value is next semester',
                LocalDateTime.now().plusMonths( 6 )
                );
        } );

        it( 'next year', () => {
            checkDate(
                'value is next year',
                LocalDateTime.now().plusYears( 1 )
                );
        } );

        //
        // dynamic - past
        //

        it( 'dynamic - past 1 year', () => {
            const expected = LocalDateTime.now().minusYears( 1 );
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
            const expected = LocalDateTime.now().minusYears( 2 );
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
            const expected = LocalDateTime.now().minusMonths( 1 );
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
            const expected = LocalDateTime.now().minusMonths( 2 );
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
            const expected = LocalDateTime.now().minusDays( 7 );
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
            const expected = LocalDateTime.now().minusDays( 14 );
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
            const expected = LocalDateTime.now().minusDays( 1 );
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
            const expected = LocalDateTime.now().minusDays( 2 );
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
            const expected = LocalDateTime.now().plusYears( 1 );
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
            const expected = LocalDateTime.now().plusYears( 2 );
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
            const expected = LocalDateTime.now().plusMonths( 1 );
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
            const expected = LocalDateTime.now().plusMonths( 2 );
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
            const expected = LocalDateTime.now().plusDays( 7 );
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
            const expected = LocalDateTime.now().plusDays( 14 );
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
            const expected = LocalDateTime.now().plusDays( 1 );
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
            const expected = LocalDateTime.now().plusDays( 2 );
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

    } );


} );