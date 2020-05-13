import { Clock, DateTimeFormatter, LocalDateTime } from '@js-joda/core';
import * as fs from 'fs';
import { resolve } from 'path';
import { Options } from '../../../modules/app/Options';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../../modules/language';
import { Entities, Intents, NLP, NLPResult, NLPTrainer } from '../../../modules/nlp';
import { FSFileHandler } from '../../../modules/util/file/FSFileHandler';
import { shouldHaveUIEntities, shouldNotHaveEntities } from "../entity-util";


describe( 'nlp.en.datetime', () => {

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

    // date and time utilities

    const fullPattern = DateTimeFormatter.ofPattern( "MM/dd/yyyy HH:mm:ss" );
    const partialPattern = DateTimeFormatter.ofPattern( "MM/dd/yyyy HH:mm" );

    function checkDateTime( text: string, expected: LocalDateTime ): void {
        const r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ Entities.UI_PROPERTY, Entities.DATETIME ] );
        const entity = r.entities.filter( e => e.entity === Entities.DATETIME );
        const receivedStr = entity[ 0 ].value.format( fullPattern ).toString();
        const expectedStr = expected.format( fullPattern ).toString();
        expect( receivedStr ).toEqual( expectedStr );
    }

    function checkValueOfDateTime( text: string, expected: number ): void {
        const r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ Entities.UI_PROPERTY, Entities.DATETIME ] );
        const entity = r.entities.filter( e => e.entity === Entities.DATETIME );
        const value = entity[ 0 ].value;
        expect( value ).toEqual( expected );
    }

    function checkNotDateTime( text: string ): void {
        const r: NLPResult = recognize( text );
        shouldNotHaveEntities( r, [ Entities.DATETIME ], Intents.UI );
    }

    function parseDateTime( text: string, partial: boolean = false ): LocalDateTime {
        return LocalDateTime.parse( text, partial ? partialPattern : fullPattern );
    }

    it( 'expression - current date and time', () => {
        checkDateTime(
            'value is current date and time',
            LocalDateTime.now( clock )
            );
    } );

    it( 'value - full date, partial time', () => {
        checkDateTime(
            'value is 12/31/2020 23:59',
            parseDateTime( '12/31/2020 23:59', true )
            );
    } );

    it( 'value - full date and time', () => {
        checkDateTime(
            'value is 12/31/2020 23:59:59',
            parseDateTime( '12/31/2020 23:59:59' )
            );
    } );

} );