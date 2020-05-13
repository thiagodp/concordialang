import { DateTimeFormatter, LocalDate, LocalTime, Clock, Instant, ZoneId } from '@js-joda/core';
import * as fs from 'fs';
import { resolve } from 'path';
import { Options } from '../../../modules/app/Options';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../../modules/language';
import { Entities, Intents, NLP, NLPResult, NLPTrainer } from '../../../modules/nlp';
import { FSFileHandler } from '../../../modules/util/file/FSFileHandler';

import { shouldHaveUIEntities, shouldNotHaveEntities } from "../entity-util";

describe( 'nlp.en.time', () => {

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

    // time utilities

    const fullPattern = DateTimeFormatter.ofPattern( "HH:mm:ss" );
    const partialPattern = DateTimeFormatter.ofPattern( "HH:mm" );

    function checkTime( text: string, expected: LocalTime ): void {
        const r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ Entities.UI_PROPERTY, Entities.TIME ] );
        const entity = r.entities.filter( e => e.entity === Entities.TIME );
        const receivedStr = entity[ 0 ].value.format( fullPattern ).toString();
        const expectedStr = expected.format( fullPattern ).toString();
        expect( receivedStr ).toEqual( expectedStr );
    }

    function checkValueOfTime( text: string, expected: number ): void {
        const r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ Entities.UI_PROPERTY, Entities.TIME ] );
        const time = r.entities.filter( e => e.entity === Entities.TIME );
        const value = time[ 0 ].value;
        expect( value ).toEqual( expected );
    }

    function checkNotTime( text: string ): void {
        const r: NLPResult = recognize( text );
        shouldNotHaveEntities( r, [ Entities.TIME ], Intents.UI );
    }

    function parseTime( text: string, partial: boolean = false ): LocalTime {
        return LocalTime.parse( text, partial ? partialPattern : fullPattern );
    }


    describe( 'value', () => {

        it( 'first time of the day', () => {
            checkTime(
                'value is 00:00:00',
                parseTime( "00:00:00" )
                );
        } );

        it( 'last time of the day', () => {
            checkTime(
                'value is 23:59:59',
                parseTime( "23:59:59" )
                );
        } );

        it( 'invalid hour', () => {
            checkNotTime(
                'value is 24:59:59'
                );
        } );

        it( 'invalid minute', () => {
            checkNotTime(
                'value is 23:60:59'
                );
        } );

        it( 'invalid second makes not consider the second', () => {
            checkTime(
                'value is 23:59:60',
                parseTime( "23:59:00" )
                );
        } );

        it( 'partial time, first of the day', () => {
            checkTime(
                'value is 00:00',
                parseTime( "00:00:00" )
                );
        } );

    } );

    describe( 'expression without a number - present', () => {

        it( 'now', () => {
            checkTime(
                'value is now',
                LocalTime.now( clock )
                );
        } );

        it( 'current time', () => {
            checkTime(
                'value is current time',
                LocalTime.now( clock )
                );
        } );

    } );

    describe( 'expression without a number - past, prefix', () => {

        it( 'last hour', () => {
            checkTime(
                'value is last hour',
                LocalTime.now( clock ).minusHours( 1 )
                );
        } );

        it( 'previous hour', () => {
            checkTime(
                'value is previous hour',
                LocalTime.now( clock ).minusHours( 1 )
                );
        } );

        it( 'last minute', () => {
            checkTime(
                'value is last minute',
                LocalTime.now( clock ).minusMinutes( 1 )
                );
        } );

        it( 'previous minute', () => {
            checkTime(
                'value is previous minute',
                LocalTime.now( clock ).minusMinutes( 1 )
                );
        } );

        it( 'last second', () => {
            checkTime(
                'value is last second',
                LocalTime.now( clock ).minusSeconds( 1 )
                );
        } );

        it( 'previous second', () => {
            checkTime(
                'value is previous second',
                LocalTime.now( clock ).minusSeconds( 1 )
                );
        } );

    } );

    // describe( 'expression without a number - past, suffix', () => {
    //     // none
    // } );

    describe( 'expression without a number - future', () => {

        it( 'next hour', () => {
            checkTime(
                'value is next hour',
                LocalTime.now( clock ).plusHours( 1 )
                );
        } );

        it( 'next minute', () => {
            checkTime(
                'value is next minute',
                LocalTime.now( clock ).plusMinutes( 1 )
                );
        } );

        it( 'next second', () => {
            checkTime(
                'value is next second',
                LocalTime.now( clock ).plusSeconds( 1 )
                );
        } );

    } );

    describe( 'expression with a number - past, prefix', () => {

        it( 'past 0 hours', () => {
            checkTime(
                'value is past 0 hours',
                LocalTime.now( clock )
                );
        } );

        it( 'past 1 hour', () => {
            checkTime(
                'value is past 1 hour',
                LocalTime.now( clock ).minusHours( 1 )
                );
        } );

        it( 'past 2 hours', () => {
            checkTime(
                'value is past 2 hours',
                LocalTime.now( clock ).minusHours( 2 )
                );
        } );

        it( 'past 99 hours', () => {
            checkTime(
                'value is past 99 hours',
                LocalTime.now( clock ).minusHours( 99 )
                );
        } );

        it( 'past 0 minutes', () => {
            checkTime(
                'value is past 0 minutes',
                LocalTime.now( clock )
                );
        } );

        it( 'past 1 minute', () => {
            checkTime(
                'value is past 1 minute',
                LocalTime.now( clock ).minusMinutes( 1 )
                );
        } );

        it( 'past 2 minutes', () => {
            checkTime(
                'value is past 2 minutes',
                LocalTime.now( clock ).minusMinutes( 2 )
                );
        } );

        it( 'past 999 minutes', () => {
            checkTime(
                'value is past 999 minutes',
                LocalTime.now( clock ).minusMinutes( 999 )
                );
        } );

        it( 'past 0 seconds', () => {
            checkTime(
                'value is past 0 seconds',
                LocalTime.now( clock )
                );
        } );

        it( 'past 1 second', () => {
            checkTime(
                'value is past 1 second',
                LocalTime.now( clock ).minusSeconds( 1 )
                );
        } );

        it( 'past 2 seconds', () => {
            checkTime(
                'value is past 2 seconds',
                LocalTime.now( clock ).minusSeconds( 2 )
                );
        } );

        it( 'past 99999 seconds', () => {
            checkTime(
                'value is past 99999 seconds',
                LocalTime.now( clock ).minusSeconds( 99999 )
                );
        } );

    } );


    describe( 'expression with a number - past, suffix', () => {

        it( '0 hour ago', () => {
            checkTime(
                'value is 0 hour ago',
                LocalTime.now( clock )
                );
        } );

        it( '1 hour ago', () => {
            checkTime(
                'value is 1 hour ago',
                LocalTime.now( clock ).minusHours( 1 )
                );
        } );

        it( '2 hours ago', () => {
            checkTime(
                'value is 2 hour ago',
                LocalTime.now( clock ).minusHours( 2 )
                );
        } );

        it( '99 hours ago', () => {
            checkTime(
                'value is 99 hours ago',
                LocalTime.now( clock ).minusHours( 99 )
                );
        } );

        it( '0 minute ago', () => {
            checkTime(
                'value is 0 minute ago',
                LocalTime.now( clock )
                );
        } );

        it( '1 minute ago', () => {
            checkTime(
                'value is 1 minute ago',
                LocalTime.now( clock ).minusMinutes( 1 )
                );
        } );

        it( '2 minutes ago', () => {
            checkTime(
                'value is 2 minutes ago',
                LocalTime.now( clock ).minusMinutes( 2 )
                );
        } );

        it( '999 minutes ago', () => {
            checkTime(
                'value is 999 minutes ago',
                LocalTime.now( clock ).minusMinutes( 999 )
                );
        } );

        it( '0 second ago', () => {
            checkTime(
                'value is 0 second ago',
                LocalTime.now( clock )
                );
        } );

        it( '1 second ago', () => {
            checkTime(
                'value is 1 second ago',
                LocalTime.now( clock ).minusSeconds( 1 )
                );
        } );

        it( '2 seconds ago', () => {
            checkTime(
                'value is 2 seconds ago',
                LocalTime.now( clock ).minusSeconds( 2 )
                );
        } );

        it( '99999 seconds ago', () => {
            checkTime(
                'value is 99999 seconds ago',
                LocalTime.now( clock ).minusSeconds( 99999 )
                );
        } );

    } );


    describe( 'expression with a number - future, prefix', () => {

        it( 'in 0 hours', () => {
            checkTime(
                'value is in 0 hours',
                LocalTime.now( clock )
                );
        } );

        it( 'in 1 hour', () => {
            checkTime(
                'value is in 1 hour',
                LocalTime.now( clock ).plusHours( 1 )
                );
        } );

        it( 'in 2 hours', () => {
            checkTime(
                'value is in 2 hours',
                LocalTime.now( clock ).plusHours( 2 )
                );
        } );

        it( 'in 99 hours', () => {
            checkTime(
                'value is in 99 hours',
                LocalTime.now( clock ).plusHours( 99 )
                );
        } );

        it( 'in 0 minutes', () => {
            checkTime(
                'value is in 0 minutes',
                LocalTime.now( clock )
                );
        } );

        it( 'in 1 minute', () => {
            checkTime(
                'value is in 1 minute',
                LocalTime.now( clock ).plusMinutes( 1 )
                );
        } );

        it( 'in 2 minutes', () => {
            checkTime(
                'value is in 2 minutes',
                LocalTime.now( clock ).plusMinutes( 2 )
                );
        } );

        it( 'in 999 minutes', () => {
            checkTime(
                'value is in 999 minutes',
                LocalTime.now( clock ).plusMinutes( 999 )
                );
        } );

        it( 'in 0 seconds', () => {
            checkTime(
                'value is in 0 seconds',
                LocalTime.now( clock )
                );
        } );

        it( 'in 1 second', () => {
            checkTime(
                'value is in 1 second',
                LocalTime.now( clock ).plusSeconds( 1 )
                );
        } );

        it( 'in 2 seconds', () => {
            checkTime(
                'value is in 2 seconds',
                LocalTime.now( clock ).plusSeconds( 2 )
                );
        } );

        it( 'in 99999 seconds', () => {
            checkTime(
                'value is in 99999 seconds',
                LocalTime.now( clock ).plusSeconds( 99999 )
                );
        } );

    } );


    describe( 'expression with a number - future, suffix', () => {

        it( '0 hours ahead', () => {
            checkTime(
                'value is 0 hours ahead',
                LocalTime.now( clock )
                );
        } );

        it( '1 hour ahead', () => {
            checkTime(
                'value is 1 hour ahead',
                LocalTime.now( clock ).plusHours( 1 )
                );
        } );

        it( '2 hours ahead', () => {
            checkTime(
                'value is 2 hours ahead',
                LocalTime.now( clock ).plusHours( 2 )
                );
        } );

        it( '99 hours ahead', () => {
            checkTime(
                'value is 99 hours ahead',
                LocalTime.now( clock ).plusHours( 99 )
                );
        } );

        it( '0 minutes ahead', () => {
            checkTime(
                'value is 0 minutes ahead',
                LocalTime.now( clock )
                );
        } );

        it( '1 minutes ahead', () => {
            checkTime(
                'value is 1 minutes ahead',
                LocalTime.now( clock ).plusMinutes( 1 )
                );
        } );

        it( '2 minutes ahead', () => {
            checkTime(
                'value is 2 minutes ahead',
                LocalTime.now( clock ).plusMinutes( 2 )
                );
        } );

        it( '999 minutes ahead', () => {
            checkTime(
                'value is 999 minutes ahead',
                LocalTime.now( clock ).plusMinutes( 999 )
                );
        } );

        it( '0 seconds ahead', () => {
            checkTime(
                'value is 0 seconds ahead',
                LocalTime.now( clock )
                );
        } );

        it( '1 second ahead', () => {
            checkTime(
                'value is 1 second ahead',
                LocalTime.now( clock ).plusSeconds( 1 )
                );
        } );

        it( '2 seconds ahead', () => {
            checkTime(
                'value is 2 seconds ahead',
                LocalTime.now( clock ).plusSeconds( 2 )
                );
        } );

        it( '99999 seconds ahead', () => {
            checkTime(
                'value is 99999 seconds ahead',
                LocalTime.now( clock ).plusSeconds( 99999 )
                );
        } );

    } );


    describe( 'value from a time expression', () => {

        it( 'hour from now', () => {
            checkValueOfTime(
                'value is hour from now',
                LocalTime.now( clock ).hour()
                );
        } );

        it( 'hour of the last hour', () => {
            checkValueOfTime(
                'value is hour of the last hour',
                LocalTime.now( clock ).minusHours( 1 ).hour()
                );
        } );

        it( 'minute from now', () => {
            checkValueOfTime(
                'value is minute from now',
                LocalTime.now( clock ).minute()
                );
        } );

        it( 'second from now', () => {
            checkValueOfTime(
                'value is second from now',
                LocalTime.now( clock ).second()
                );
        } );

    } );

} );