import { Clock, DateTimeFormatter, LocalDateTime } from '@js-joda/core';

import languageMap from '../../../modules/language/data/map';
import { Entities, Intents, NLP, NLPResult, NLPTrainer } from '../../../modules/nlp';
import { shouldHaveUIEntities, shouldNotHaveEntities } from '../entity-util';

describe( 'nlp.en.datetime', () => {

    let nlp: NLP; // under test

    let clock: Clock; // helper

	const LANGUAGE = 'en';

    beforeAll( () => {
        nlp = new NLP();
        const nlpTrainer = new NLPTrainer( languageMap );
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
