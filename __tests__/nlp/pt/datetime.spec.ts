import { Clock, DateTimeFormatter, LocalDateTime } from '@js-joda/core';
import * as fs from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

import { DEFAULT_DIR_LANGUAGE } from '../../../modules/app/default-options';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../../modules/language';
import { Entities, Intents, NLP, NLPResult, NLPTrainer } from '../../../modules/nlp';
import { FSFileHandler } from '../../../modules/util/fs/FSFileHandler';
import { shouldHaveUIEntities, shouldNotHaveEntities } from '../entity-util';


describe( 'nlp.pt.datetime', () => {

    let nlp: NLP; // under test

    let clock: Clock; // helper

	const LANGUAGE = 'pt';
	const dir = resolve( process.cwd(), 'dist/' );
	const langDir = resolve( dir, DEFAULT_DIR_LANGUAGE );

    const fileHandler = new FSFileHandler( fs, promisify );
    const langLoader: LanguageContentLoader = new JsonLanguageContentLoader(
        langDir,
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

    const fullPattern = DateTimeFormatter.ofPattern( "dd/MM/yyyy HH:mm:ss" );
    const partialPattern = DateTimeFormatter.ofPattern( "dd/MM/yyyy HH:mm" );

    function checkDateTime( text: string, expected: LocalDateTime ): void {
        const r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ Entities.UI_PROPERTY, Entities.DATE_TIME ] );
        const entity = r.entities.filter( e => e.entity === Entities.DATE_TIME );
        const receivedStr = entity[ 0 ].value.format( fullPattern ).toString();
        const expectedStr = expected.format( fullPattern ).toString();
        expect( receivedStr ).toEqual( expectedStr );
    }

    function checkValueOfDateTime( text: string, expected: number ): void {
        const r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ Entities.UI_PROPERTY, Entities.DATE_TIME ] );
        const entity = r.entities.filter( e => e.entity === Entities.DATE_TIME );
        const value = entity[ 0 ].value;
        expect( value ).toEqual( expected );
    }

    function checkNotDateTime( text: string ): void {
        const r: NLPResult = recognize( text );
        shouldNotHaveEntities( r, [ Entities.DATE_TIME ], Intents.UI );
    }

    function parseDateTime( text: string, partial: boolean = false ): LocalDateTime {
        return LocalDateTime.parse( text, partial ? partialPattern : fullPattern );
    }

    it( 'expression - current date and time', () => {
        checkDateTime(
            'valor é data e hora atuais',
            LocalDateTime.now( clock )
            );
    } );

    it( 'expression - current date and time - v2', () => {
        checkDateTime(
            'valor é data e hora atual',
            LocalDateTime.now( clock )
            );
    } );

    it( 'value - full date, partial time', () => {
        checkDateTime(
            'valor é 31/12/2020 23:59',
            parseDateTime( '31/12/2020 23:59', true )
            );
    } );

    it( 'value - full date and time', () => {
        checkDateTime(
            'valor é 31/12/2020 23:59:59',
            parseDateTime( '31/12/2020 23:59:59' )
            );
    } );

} );
