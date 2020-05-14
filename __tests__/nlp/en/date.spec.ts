import { DateTimeFormatter, LocalDate, LocalTime, Clock, Instant, ZoneId } from '@js-joda/core';
import * as fs from 'fs';
import { resolve } from 'path';
import { Options } from '../../../modules/app/Options';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../../modules/language';
import { Entities, Intents, NLP, NLPResult, NLPTrainer } from '../../../modules/nlp';
import { FSFileHandler } from '../../../modules/util/file/FSFileHandler';

import { shouldHaveUIEntities, shouldNotHaveEntities } from "../entity-util";

describe( 'nlp.en.date', () => {

    let nlp: NLP; // under test

    let clock: Clock; // helper

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
    const DATE: string = Entities.DATE;
    const UI_PROPERTY: string = Entities.UI_PROPERTY;

    beforeAll( () => {
        nlp = new NLP();
        const nlpTrainer = new NLPTrainer( langLoader );
        const ok = nlpTrainer.trainNLP( nlp, LANGUAGE );
        expect( ok ).toBeTruthy();

        clock = nlp.createFixedClockFromNow();
        nlp.setInternalClock( clock );
    } );

    afterAll( () => {
        nlp.resetInternalClock();
        nlp = null;
    } );

    function recognize( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence );
    }


    const genericPattern = DateTimeFormatter.ofPattern( 'yyyy-MM-dd' );
    const englishPattern = DateTimeFormatter.ofPattern( "MM/dd/yyyy" );

    function parseDate( text: string ): LocalDate {
        return LocalDate.parse( text, englishPattern );
    }

    function checkDate( text: string, expected: LocalDate ): void {
        let r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ UI_PROPERTY, DATE  ] );
        const expectedStr = expected.format( genericPattern ).toString();
        const entity = r.entities.filter( e => e.entity === DATE );
        const valueStr = entity[ 0 ].value.format( genericPattern ).toString();
        expect( valueStr ).toEqual( expectedStr );
    }

    function checkValueOfDate( text: string, expected: number ): void {
        let r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ UI_PROPERTY, DATE  ] );
        const entity = r.entities.filter( e => e.entity === DATE );
        expect( entity[ 0 ].value ).toEqual( expected );
    }


    describe( 'value', () => {

        it( 'full date', () => {
            checkDate(
                'value is 12/31/2020',
                parseDate( "12/31/2020" )
                );
        } );

        it( 'partial date', () => {
            checkDate(
                'value is 12/31',
                parseDate( "12/31/" + LocalDate.now( clock ).year() )
                );
        } );

    } );


    describe( 'expression without a number - present', () => {

        it( 'today', () => {
            checkDate(
                'value is today',
                LocalDate.now( clock )
                );
        } );

        it( 'current date', () => {
            checkDate(
                'value is current date',
                LocalDate.now( clock )
                );
        } );

    } );

    describe( 'expression without a number - past', () => {

        it( 'last year', () => {
            checkDate(
                'value is last year',
                LocalDate.now( clock ).minusYears( 1 )
                );
        } );

        it( 'last semester', () => {
            checkDate(
                'value is last semester',
                LocalDate.now( clock ).minusMonths( 6 )
                );
        } );

        it( 'last month', () => {
            checkDate(
                'value is last month',
                LocalDate.now( clock ).minusMonths( 1 )
                );
        } );

        it( 'last week', () => {
            checkDate(
                'value is last week',
                LocalDate.now( clock ).minusDays( 7 )
                );
        } );

        it( 'the day before yesterday', () => {
            checkDate(
                'value is the day before yesterday',
                LocalDate.now( clock ).minusDays( 2 )
                );
        } );

        it( 'yesterday', () => {
            checkDate(
                'value is yesterday',
                LocalDate.now( clock ).minusDays( 1 )
                );
        } );

    } );


    describe( 'expression without a number - future', () => {

        it( 'tomorrow', () => {
            checkDate(
                'value is tomorrow',
                LocalDate.now( clock ).plusDays( 1 )
                );
        } );

        it( 'the day after tomorrow', () => {
            checkDate(
                'value is the day after tomorrow',
                LocalDate.now( clock ).plusDays( 2 )
                );
        } );

        it( 'next week', () => {
            checkDate(
                'value is next week',
                LocalDate.now( clock ).plusDays( 7 )
                );
        } );

        it( 'next month', () => {
            checkDate(
                'value is next month',
                LocalDate.now( clock ).plusMonths( 1 )
                );
        } );

        it( 'next semester', () => {
            checkDate(
                'value is next semester',
                LocalDate.now( clock ).plusMonths( 6 )
                );
        } );

        it( 'next year', () => {
            checkDate(
                'value is next year',
                LocalDate.now( clock ).plusYears( 1 )
                );
        } );

    } );


    describe( 'expression with a number - past', () => {

        it( 'past 1 year', () => {
            const expected = LocalDate.now( clock ).minusYears( 1 );
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
            const expected = LocalDate.now( clock ).minusYears( 2 );
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
            const expected = LocalDate.now( clock ).minusMonths( 1 );
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
            const expected = LocalDate.now( clock ).minusMonths( 2 );
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
            const expected = LocalDate.now( clock ).minusDays( 7 );
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
            const expected = LocalDate.now( clock ).minusDays( 14 );
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
            const expected = LocalDate.now( clock ).minusDays( 1 );
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
            const expected = LocalDate.now( clock ).minusDays( 2 );
            checkDate(
                'value is past 2 days',
                expected
            );
            checkDate(
                'value is 2 days ago',
                expected
            );
        } );

    } );


    describe( 'expression without a number - future', () => {

        it( 'dynamic - next 1 year', () => {
            const expected = LocalDate.now( clock ).plusYears( 1 );
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
            const expected = LocalDate.now( clock ).plusYears( 2 );
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
            const expected = LocalDate.now( clock ).plusMonths( 1 );
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
            const expected = LocalDate.now( clock ).plusMonths( 2 );
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
            const expected = LocalDate.now( clock ).plusDays( 7 );
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
            const expected = LocalDate.now( clock ).plusDays( 14 );
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
            const expected = LocalDate.now( clock ).plusDays( 1 );
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
            const expected = LocalDate.now( clock ).plusDays( 2 );
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


    describe( 'value from expression', () => {

        //
        // year of
        //

        it( 'year of + static expression', () => {
            checkValueOfDate(
                'value is year of today',
                LocalDate.now( clock ).year()
                );
        } );

        it( 'year of + dynamic expression', () => {
            checkValueOfDate(
                'value is year of 2 years ago',
                LocalDate.now( clock ).minusYears( 2 ).year()
                );
        } );

        //
        // month of
        //

        it( 'month of + static expression', () => {
            checkValueOfDate(
                'value is month of today',
                LocalDate.now( clock ).monthValue()
                );
        } );

        it( 'month of + dynamic expression', () => {
            checkValueOfDate(
                'value is month of 2 months ago',
                LocalDate.now( clock ).minusMonths( 2 ).monthValue()
                );
        } );

        //
        // day of
        //

        it( 'value of - day of today', () => {
            checkValueOfDate(
                'value is day of today',
                LocalDate.now( clock ).dayOfMonth()
                );
        } );

        it( 'value of - day of 2 days ago', () => {
            checkValueOfDate(
                'value is day of 2 days ago',
                LocalDate.now( clock ).minusDays( 2 ).dayOfMonth()
                );
        } );

    } );

} );