import { DateTimeFormatter, LocalTime, Clock, Instant, ZoneId } from "@js-joda/core";
import * as fs from 'fs';
import { resolve } from "path";
import { Options } from "../../../modules/app/Options";
import { JsonLanguageContentLoader, LanguageContentLoader } from "../../../modules/language";
import { Intents, NLP, NLPResult, NLPTrainer } from "../../../modules/nlp";
import { Entities } from "../../../modules/nlp/Entities";
import { FSFileHandler } from "../../../modules/util/file";
import { shouldHaveUIEntities, shouldNotHaveEntities } from "../util";

describe( 'nlp.pt.time', () => {

    let nlp: NLP; // under test

    let clock: Clock; // helper

    const LANGUAGE = 'pt';
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const fileHandler = new FSFileHandler( fs );
    const langLoader: LanguageContentLoader = new JsonLanguageContentLoader(
        options.languageDir,
        {},
        fileHandler,
        fileHandler
        );

    // entities
    const TIME: string = Entities.TIME;
    const UI_PROPERTY: string = Entities.UI_PROPERTY;

    function recognize( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence );
    }


    beforeAll( () => {
        nlp = new NLP();
        const ok = ( new NLPTrainer( langLoader ) ).trainNLP( nlp, LANGUAGE );
        expect( ok ).toBeTruthy();

        clock = nlp.createFixedClockFromNow();
        nlp.setInternalClock( clock );
    } );

    afterAll( () => {
        nlp.resetInternalClock();
        nlp = null;
    } );

    const timePattern = DateTimeFormatter.ofPattern( "HH:mm:ss" );

    function checkTime( text: string, expected: LocalTime ): void {
        const r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ UI_PROPERTY, TIME ] );
        const time = r.entities.filter( e => e.entity === TIME );
        const receivedStr = time[ 0 ].value.format( timePattern ).toString();
        const expectedStr = expected.format( timePattern ).toString();
        expect( receivedStr ).toEqual( expectedStr );
    }

    function checkValueOfTime( text: string, expected: number ): void {
        const r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ UI_PROPERTY, TIME ] );
        const time = r.entities.filter( e => e.entity === TIME );
        const value = time[ 0 ].value;
        expect( value ).toEqual( expected );
    }

    function checkNotTime( text: string ): void {
        const r: NLPResult = recognize( text );
        shouldNotHaveEntities( r, [ TIME ], Intents.UI );
    }

    const parseTime = ( text: string ): LocalTime => {
        return LocalTime.parse( text, timePattern );
    };

    describe( 'value', () => {

        it( 'first time of the day', () => {
            checkTime(
                'valor é 00:00:00',
                parseTime( "00:00:00" )
                );
        } );

        it( 'last time of the day', () => {
            checkTime(
                'valor é 23:59:59',
                parseTime( "23:59:59" )
                );
        } );

        it( 'invalid hour', () => {
            checkNotTime(
                'valor é 24:59:59'
                );
        } );

        it( 'invalid minute', () => {
            checkNotTime(
                'valor é 23:60:59'
                );
        } );

        it( 'invalid second makes not consider the second', () => {
            checkTime(
                'valor é 23:59:60',
                parseTime( "23:59:00" )
                );
        } );

    } );


    describe( 'expression without a number - present', () => {

        it( 'now', () => {
            checkTime(
                'valor é agora',
                LocalTime.now( clock )
                );
        } );

        it( 'current time', () => {
            checkTime(
                'valor é hora atual',
                LocalTime.now( clock )
                );
        } );

    } );


    describe( 'expression without a number - past, prefix', () => {

        it( 'previous hour', () => {
            checkTime(
                'valor é última hora',
                LocalTime.now( clock ).minusHours( 1 )
                );
        } );

        it( 'previous minute', () => {
            checkTime(
                'valor é último minuto',
                LocalTime.now( clock ).minusMinutes( 1 )
                );
        } );

        it( 'previous second', () => {
            checkTime(
                'valor é último segundo',
                LocalTime.now( clock ).minusSeconds( 1 )
                );
        } );

    } );

    describe( 'expression without a number - past, suffix', () => {

        it( 'hour ago', () => {
            checkTime(
                'valor é hora anterior',
                LocalTime.now( clock ).minusHours( 1 )
                );
        } );

        it( 'minute ago', () => {
            checkTime(
                'valor é minuto anterior',
                LocalTime.now( clock ).minusMinutes( 1 )
                );
        } );

        it( 'second ago', () => {
            checkTime(
                'valor é segundo anterior',
                LocalTime.now( clock ).minusSeconds( 1 )
                );
        } );

    } );


    describe( 'expression without a number - future, prefix', () => {

        it( 'next hour', () => {
            checkTime(
                'valor é próxima hora',
                LocalTime.now( clock ).plusHours( 1 )
                );
        } );

        it( 'next minute', () => {
            checkTime(
                'valor é próximo minuto',
                LocalTime.now( clock ).plusMinutes( 1 )
                );
        } );

        it( 'next second', () => {
            checkTime(
                'valor é próximo segundo',
                LocalTime.now( clock ).plusSeconds( 1 )
                );
        } );

    } );


    describe( 'expression without a number - future, suffix', () => {

        it( 'hour later', () => {
            checkTime(
                'valor é hora seguinte',
                LocalTime.now( clock ).plusHours( 1 )
                );
        } );

        it( 'minute later', () => {
            checkTime(
                'valor é minuto seguinte',
                LocalTime.now( clock ).plusMinutes( 1 )
                );
        } );

        it( 'second later', () => {
            checkTime(
                'valor é segundo seguinte',
                LocalTime.now( clock ).plusSeconds( 1 )
                );
        } );

    } );


    describe( 'expression with a number - past, prefix', () => {

        it( 'past 0 hours', () => {
            checkTime(
                'valor é há 0 horas',
                LocalTime.now( clock )
                );
        } );

        it( 'past 1 hour', () => {
            checkTime(
                'valor é há 1 hora',
                LocalTime.now( clock ).minusHours( 1 )
                );
        } );

        it( 'past 2 hours', () => {
            checkTime(
                'valor é há 2 horas',
                LocalTime.now( clock ).minusHours( 2 )
                );
        } );

        it( 'past 99 hours', () => {
            checkTime(
                'valor é há 99 horas',
                LocalTime.now( clock ).minusHours( 99 )
                );
        } );

        it( 'past 0 minutes', () => {
            checkTime(
                'valor é há 0 minutos',
                LocalTime.now( clock )
                );
        } );

        it( 'past 1 minute', () => {
            checkTime(
                'valor é há 1 minuto',
                LocalTime.now( clock ).minusMinutes( 1 )
                );
        } );

        it( 'past 2 minutes', () => {
            checkTime(
                'valor é há 2 minutos',
                LocalTime.now( clock ).minusMinutes( 2 )
                );
        } );

        it( 'past 999 minutes', () => {
            checkTime(
                'valor é há 999 minutos',
                LocalTime.now( clock ).minusMinutes( 999 )
                );
        } );

        it( 'past 0 seconds', () => {
            checkTime(
                'valor é há 0 segundos',
                LocalTime.now( clock )
                );
        } );

        it( 'past 1 second', () => {
            checkTime(
                'valor é há 1 segundo',
                LocalTime.now( clock ).minusSeconds( 1 )
                );
        } );

        it( 'past 2 seconds', () => {
            checkTime(
                'valor é há 2 segundos',
                LocalTime.now( clock ).minusSeconds( 2 )
                );
        } );

        it( 'past 99999 seconds', () => {
            checkTime(
                'valor é há 99999 segundos',
                LocalTime.now( clock ).minusSeconds( 99999 )
                );
        } );

    } );


    describe( 'expression with a number - past, suffix', () => {

        it( '0 hour ago', () => {
            checkTime(
                'valor é 0 hora atrás',
                LocalTime.now( clock )
                );
        } );

        it( '1 hour ago', () => {
            checkTime(
                'valor é 1 hora atrás',
                LocalTime.now( clock ).minusHours( 1 )
                );
        } );

        it( '2 hours ago', () => {
            checkTime(
                'valor é 2 hora atrás',
                LocalTime.now( clock ).minusHours( 2 )
                );
        } );

        it( '99 hours ago', () => {
            checkTime(
                'valor é 99 horas atrás',
                LocalTime.now( clock ).minusHours( 99 )
                );
        } );

        it( '0 minute ago', () => {
            checkTime(
                'valor é 0 minuto atrás',
                LocalTime.now( clock )
                );
        } );

        it( '1 minute ago', () => {
            checkTime(
                'valor é 1 minuto atrás',
                LocalTime.now( clock ).minusMinutes( 1 )
                );
        } );

        it( '2 minutes ago', () => {
            checkTime(
                'valor é 2 minutos atrás',
                LocalTime.now( clock ).minusMinutes( 2 )
                );
        } );

        it( '999 minutes ago', () => {
            checkTime(
                'valor é 999 minutos atrás',
                LocalTime.now( clock ).minusMinutes( 999 )
                );
        } );

        it( '0 second ago', () => {
            checkTime(
                'valor é 0 segundo atrás',
                LocalTime.now( clock )
                );
        } );

        it( '1 second ago', () => {
            checkTime(
                'valor é 1 segundo atrás',
                LocalTime.now( clock ).minusSeconds( 1 )
                );
        } );

        it( '2 seconds ago', () => {
            checkTime(
                'valor é 2 segundos atrás',
                LocalTime.now( clock ).minusSeconds( 2 )
                );
        } );

        it( '99999 seconds ago', () => {
            checkTime(
                'valor é 99999 segundos atrás',
                LocalTime.now( clock ).minusSeconds( 99999 )
                );
        } );

    } );


    describe( 'expression with a number - future, prefix', () => {

        it( 'in 0 hour', () => {
            checkTime(
                'valor é daqui a 0 horas',
                LocalTime.now( clock )
                );
        } );

        it( 'in 1 hour', () => {
            checkTime(
                'valor é daqui a 1 hora',
                LocalTime.now( clock ).plusHours( 1 )
                );
        } );

        it( 'in 2 hours', () => {
            checkTime(
                'valor é daqui a 2 horas',
                LocalTime.now( clock ).plusHours( 2 )
                );
        } );

        it( 'in 99 hours', () => {
            checkTime(
                'valor é daqui a 99 horas',
                LocalTime.now( clock ).plusHours( 99 )
                );
        } );

        it( 'in 0 minute', () => {
            checkTime(
                'valor é daqui a 0 minutos',
                LocalTime.now( clock )
                );
        } );

        it( 'in 1 minute', () => {
            checkTime(
                'valor é daqui a 1 minuto',
                LocalTime.now( clock ).plusMinutes( 1 )
                );
        } );

        it( 'in 2 minutes', () => {
            checkTime(
                'valor é daqui a 2 minutos',
                LocalTime.now( clock ).plusMinutes( 2 )
                );
        } );

        it( 'in 999 minutes', () => {
            checkTime(
                'valor é daqui a 999 minutos',
                LocalTime.now( clock ).plusMinutes( 999 )
                );
        } );

        it( 'in 0 second', () => {
            checkTime(
                'valor é daqui a 0 segundos',
                LocalTime.now( clock )
                );
        } );

        it( 'in 1 second', () => {
            checkTime(
                'valor é daqui a 1 segundo',
                LocalTime.now( clock ).plusSeconds( 1 )
                );
        } );

        it( 'in 2 seconds', () => {
            checkTime(
                'valor é daqui a 2 segundos',
                LocalTime.now( clock ).plusSeconds( 2 )
                );
        } );

        it( 'in 99999 seconds', () => {
            checkTime(
                'valor é daqui a 99999 segundos',
                LocalTime.now( clock ).plusSeconds( 99999 )
                );
        } );

    } );


    describe( 'expression with a number - future, suffix', () => {

        it( '0 hours ahead', () => {
            checkTime(
                'valor é 0 horas à frente',
                LocalTime.now( clock )
                );
        } );

        it( '1 hour ahead', () => {
            checkTime(
                'valor é 1 hora à frente',
                LocalTime.now( clock ).plusHours( 1 )
                );
        } );

        it( '2 hours ahead', () => {
            checkTime(
                'valor é 2 horas à frente',
                LocalTime.now( clock ).plusHours( 2 )
                );
        } );

        it( '99 hours ahead', () => {
            checkTime(
                'valor é 99 horas à frente',
                LocalTime.now( clock ).plusHours( 99 )
                );
        } );

        it( '0 minutes ahead', () => {
            checkTime(
                'valor é 0 minutos à frente',
                LocalTime.now( clock )
                );
        } );

        it( '1 minutes ahead', () => {
            checkTime(
                'valor é 1 minuto à frente',
                LocalTime.now( clock ).plusMinutes( 1 )
                );
        } );

        it( '2 minutes ahead', () => {
            checkTime(
                'valor é 2 minutos à frente',
                LocalTime.now( clock ).plusMinutes( 2 )
                );
        } );

        it( '999 minutes ahead', () => {
            checkTime(
                'valor é 999 minutos à frente',
                LocalTime.now( clock ).plusMinutes( 999 )
                );
        } );

        it( '0 seconds ahead', () => {
            checkTime(
                'valor é 0 segundos à frente',
                LocalTime.now( clock )
                );
        } );

        it( '1 second ahead', () => {
            checkTime(
                'valor é 1 segundo à frente',
                LocalTime.now( clock ).plusSeconds( 1 )
                );
        } );

        it( '2 seconds ahead', () => {
            checkTime(
                'valor é 2 segundos à frente',
                LocalTime.now( clock ).plusSeconds( 2 )
                );
        } );

        it( '99999 seconds ahead', () => {
            checkTime(
                'valor é 99999 segundos à frente',
                LocalTime.now( clock ).plusSeconds( 99999 )
                );
        } );

    } );


    describe( 'value from a expression', () => {

        it( 'hour from now', () => {
            checkValueOfTime(
                'valor é hora de agora',
                LocalTime.now( clock ).hour()
                );
        } );

        it( 'minute from now', () => {
            checkValueOfTime(
                'valor é minuto de agora',
                LocalTime.now( clock ).minute()
                );
        } );

        it( 'second from now', () => {
            checkValueOfTime(
                'valor é segundo de agora',
                LocalTime.now( clock ).second()
                );
        } );

    } );


} );