import { Clock, DateTimeFormatter, LocalDate } from '@js-joda/core';
import * as fs from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

import { DEFAULT_DIR_LANGUAGE } from '../../../modules/app/default-options';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../../modules/language';
import { Intents, NLP, NLPResult, NLPTrainer } from '../../../modules/nlp';
import { Entities } from '../../../modules/nlp/Entities';
import { FSFileHandler } from '../../../modules/util/fs/FSFileHandler';
import { shouldHaveUIEntities, shouldNotHaveEntities } from '../entity-util';

describe( 'nlp.pt.date', () => {

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

    // entities
    const DATE: string = Entities.DATE;
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

    const fullPattern = DateTimeFormatter.ofPattern( 'dd/MM/yyyy' );

    function checkDate( text: string, expected: LocalDate ): void {
        let r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ UI_PROPERTY, DATE  ] );
        const expectedStr = expected.format( fullPattern ).toString();
        const entity = r.entities.filter( e => e.entity === DATE );
        const valueStr = entity[ 0 ].value.format( fullPattern ).toString();
        expect( valueStr ).toEqual( expectedStr );
    }

    function checkNotDate( text: string ): void {
        let r: NLPResult = recognize( text );
        shouldNotHaveEntities( r, [ DATE ], Intents.UI );
    }

    function checkValueOfDate( text: string, value: number ): void {
        let r: NLPResult = recognize( text );
        shouldHaveUIEntities( [ r ], [ UI_PROPERTY, DATE ] );
        const entity = r.entities.filter( e => e.entity === DATE );
        expect( entity[ 0 ].value ).toEqual( value );
    }

    //
    // DATE EXPRESSIONS WITHOUT NUMBER
    //

    it( 'last year', () => {
        checkDate(
            'valor é ano passado',
            LocalDate.now( clock ).minusYears( 1 )
            );
    } );

    it( 'last semester', () => {
        checkDate(
            'valor é semestre passado',
            LocalDate.now( clock ).minusMonths( 6 )
            );
    } );

    it( 'last month', () => {
        checkDate(
            'valor é mês passado',
            LocalDate.now( clock ).minusMonths( 1 )
            );
    } );

    it( 'last week', () => {
        checkDate(
            'valor é semana passada',
            LocalDate.now( clock ).minusDays( 7 )
            );
    } );

    it( 'the day before yesterday', () => {
        checkDate(
            'valor é anteontem',
            LocalDate.now( clock ).minusDays( 2 )
            );
        checkDate(
            'valor é antes de ontem',
            LocalDate.now( clock ).minusDays( 2 )
            );
    } );

    it( 'yesterday', () => {
        checkDate(
            'valor é ontem',
            LocalDate.now( clock ).minusDays( 1 )
            );
    } );

    it( 'today', () => {
        checkDate(
            'valor é hoje',
            LocalDate.now( clock )
            );
    } );

    it( 'tomorrow', () => {
        checkDate(
            'valor é amanhã',
            LocalDate.now( clock ).plusDays( 1 )
            );
    } );

    it( 'the day after tomorrow', () => {
        checkDate(
            'valor é depois de amanhã',
            LocalDate.now( clock ).plusDays( 2 )
            );
    } );

    it( 'next week', () => {
        checkDate(
            'valor é semana que vem',
            LocalDate.now( clock ).plusDays( 7 )
            );
    } );

    it( 'next month', () => {
        checkDate(
            'valor é mês que vem',
            LocalDate.now( clock ).plusMonths( 1 )
            );
    } );

    it( 'next semester', () => {
        checkDate(
            'valor é semestre que vem',
            LocalDate.now( clock ).plusMonths( 6 )
            );
    } );

    it( 'next year', () => {
        checkDate(
            'valor é ano que vem',
            LocalDate.now( clock ).plusYears( 1 )
            );
    } );

    //
    // DATE EXPRESSIONS WITH NUMBER
    //

    // past - suffix

    it( 'past 1 year', () => {
        checkDate(
            'valor é 1 ano atrás',
            LocalDate.now( clock ).minusYears( 1 )
            );
    } );

    it( 'past 2 years', () => {
        checkDate(
            'valor é 2 anos atrás',
            LocalDate.now( clock ).minusYears( 2 )
            );
    } );

    it( 'past 1 month', () => {
        checkDate(
            'valor é 1 mês atrás',
            LocalDate.now( clock ).minusMonths( 1 )
            );
        checkDate(
            'valor é 1 mes atras',
            LocalDate.now( clock ).minusMonths( 1 )
            );
    } );

    it( 'past 2 months', () => {
        checkDate(
            'valor é 2 meses atrás',
            LocalDate.now( clock ).minusMonths( 2 )
            );
        checkDate(
            'valor é 2 meses atras',
            LocalDate.now( clock ).minusMonths( 2 )
            );
    } );

    it( 'past 1 week', () => {
        checkDate(
            'valor é 1 semana atrás',
            LocalDate.now( clock ).minusDays( 7 )
            );
        checkDate(
            'valor é 1 semana atras',
            LocalDate.now( clock ).minusDays( 7 )
            );
    } );

    it( 'past 2 weeks', () => {
        checkDate(
            'valor é 2 semanas atrás',
            LocalDate.now( clock ).minusDays( 14 )
            );
        checkDate(
            'valor é 2 semanas atras',
            LocalDate.now( clock ).minusDays( 14 )
            );
    } );

    it( 'past 1 day', () => {
        checkDate(
            'valor é 1 dia atrás',
            LocalDate.now( clock ).minusDays( 1 )
            );
        checkDate(
            'valor é 1 dia atras',
            LocalDate.now( clock ).minusDays( 1 )
            );
    } );

    it( 'past 2 days', () => {
        checkDate(
            'valor é 2 dia atrás',
            LocalDate.now( clock ).minusDays( 2 )
            );
        checkDate(
            'valor é 2 dia atras',
            LocalDate.now( clock ).minusDays( 2 )
            );
    } );

    // future - prefix

    it( 'in 1 year', () => {
        checkDate(
            'valor é em 1 ano',
            LocalDate.now( clock ).plusYears( 1 )
            );
    } );

    it( 'in 2 years', () => {
        checkDate(
            'valor é em 2 anos',
            LocalDate.now( clock ).plusYears( 2 )
            );
    } );

    it( 'in 1 month', () => {
        checkDate(
            'valor é em 1 mês',
            LocalDate.now( clock ).plusMonths( 1 )
            );
    } );

    it( 'in 2 months', () => {
        checkDate(
            'valor é em 2 meses',
            LocalDate.now( clock ).plusMonths( 2 )
            );
    } );

    it( 'in 1 week', () => {
        checkDate(
            'valor é em 1 semana',
            LocalDate.now( clock ).plusDays( 7 )
            );
    } );

    it( 'in 2 weeks', () => {
        checkDate(
            'valor é em 2 semanas',
            LocalDate.now( clock ).plusDays( 14 )
            );
    } );

    it( 'in 1 day', () => {
        checkDate(
            'valor é em 1 dia',
            LocalDate.now( clock ).plusDays( 1 )
            );
    } );

    it( 'in 2 days', () => {
        checkDate(
            'valor é em 2 dias',
            LocalDate.now( clock ).plusDays( 2 )
            );
    } );

    //
    // date
    //

    const parseDate = ( text: string ): LocalDate => {
        return LocalDate.parse( text, DateTimeFormatter.ofPattern( "dd/MM/yyyy" ) );
    };

    it( 'full date', () => {
        checkDate(
            'valor é 31/12/2020',
            parseDate( "31/12/2020" )
            );
    } );

    it( 'partial date', () => {
        checkDate(
            'valor é 31/12',
            parseDate( "31/12/" + LocalDate.now( clock ).year() )
            );
    } );

    it( 'invalid date', () => {
        checkNotDate(
            'valor é 32/12/2020'
            );
    } );

    //
    // year of
    //

    it( 'year of + static expression', () => {
        checkValueOfDate(
            'valor é ano de hoje',
            LocalDate.now( clock ).year()
            );
    } );

    it( 'year of + dynamic expression', () => {
        checkValueOfDate(
            'valor é ano de 2 anos atrás',
            LocalDate.now( clock ).minusYears( 2 ).year()
            );
    } );

    //
    // month of
    //

    it( 'month of + static expression', () => {
        checkValueOfDate(
            'valor é mês de hoje',
            LocalDate.now( clock ).monthValue()
            );
    } );

    it( 'month of + dynamic expression', () => {
        checkValueOfDate(
            'valor é mês de 2 meses atrás',
            LocalDate.now( clock ).minusMonths( 2 ).monthValue()
            );
    } );

    //
    // day of
    //

    it( 'day of + static expression', () => {
        checkValueOfDate(
            'valor é dia de hoje',
            LocalDate.now( clock ).dayOfMonth()
            );
    } );

    it( 'day of + dynamic expression', () => {
        checkValueOfDate(
            'valor é dia de 2 dias atrás',
            LocalDate.now( clock ).minusDays( 2 ).dayOfMonth()
            );
    } );


} );
