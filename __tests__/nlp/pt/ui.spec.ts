import * as fs from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

import { DEFAULT_DIR_LANGUAGE } from '../../../modules/app/default-options';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../../modules/language';
import { Intents, NLP, NLPTrainer } from '../../../modules/nlp';
import { Entities } from '../../../modules/nlp/Entities';
import { FSFileHandler } from '../../../modules/util/fs/FSFileHandler';
import { shouldHaveUIEntities } from '../entity-util';

describe( 'nlp.pt.ui', () => {

    let nlp: NLP; // under test

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

    beforeAll( () => {
        nlp = new NLP();
        const ok = ( new NLPTrainer( langLoader ) ).trainNLP( nlp, LANGUAGE );
        expect( ok ).toBeTruthy();
    } );

    afterAll( () => {
        nlp = null;
    } );

    function recognize( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence );
    }

    function recognizeInUI( sentence: string ) {
        return nlp.recognize( LANGUAGE, sentence, Intents.UI );
    }

    it( 'recognizes id definitions', () => {
        let results = [];
        results.push( recognizeInUI( 'id é "#ok"' ) );
        shouldHaveUIEntities( results, [ UI_PROPERTY, UI_CONNECTOR, VALUE ] );
    } );

    it( 'recognizes type definitions', () => {
        let results = [];
        results.push( recognizeInUI( 'tipo é botão' ) );
        results.push( recognizeInUI( 'tipo é caixa de texto' ) );
        results.push( recognizeInUI( 'tipo é caixa de seleção' ) );
        results.push( recognizeInUI( 'tipo é caixa de marcação' ) );
        results.push( recognizeInUI( 'tipo é janela' ) );
        results.push( recognizeInUI( 'tipo é url' ) );
        results.push( recognizeInUI( 'tipo é rótulo' ) );
        shouldHaveUIEntities( results, [ UI_PROPERTY, UI_CONNECTOR, UI_ELEMENT_TYPE ] );
    } );

    it( 'recognizes datatype definitions', () => {
        let results = [];
        results.push( recognizeInUI( 'tipo de dado é texto' ) );
        results.push( recognizeInUI( 'tipo de dado é string' ) );
        results.push( recognizeInUI( 'tipo de dado é inteiro' ) );
        results.push( recognizeInUI( 'tipo de dado é integer' ) );
        results.push( recognizeInUI( 'tipo de dado é flutuante' ) );
        results.push( recognizeInUI( 'tipo de dado é double' ) );
        results.push( recognizeInUI( 'tipo de dado é data' ) );
        results.push( recognizeInUI( 'tipo de dado é date' ) );
        results.push( recognizeInUI( 'tipo de dado é hora' ) );
        results.push( recognizeInUI( 'tipo de dado é time' ) );
        results.push( recognizeInUI( 'tipo de dado é datahora' ) );
        results.push( recognizeInUI( 'tipo de dado é datetime' ) );
        shouldHaveUIEntities( results, [ UI_PROPERTY, UI_CONNECTOR, UI_DATA_TYPE  ] );
    } );

    it( 'recognizes value definitions', () => {
        shouldHaveUIEntities( [ recognizeInUI( 'valor é "foo"' ) ],
            [ UI_PROPERTY, UI_CONNECTOR, VALUE  ] );
        shouldHaveUIEntities( [ recognizeInUI( 'valor é 3.1416' ) ],
            [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );
        shouldHaveUIEntities( [ recognizeInUI( 'valor é 0' ) ],
            [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );
        shouldHaveUIEntities( [ recognizeInUI( 'valor é -3.1416' ) ],
            [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );
    } );

    it( 'recognizes min value definitions', () => {
        shouldHaveUIEntities( [ recognizeInUI( 'valor mínimo é -50.2' ) ],
            [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );
    } );

    it( 'recognizes max value definitions', () => {
        shouldHaveUIEntities( [ recognizeInUI( 'valor máximo é 50.2' ) ],
            [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );
    } );

    it( 'recognizes min length definitions', () => {
        shouldHaveUIEntities( [ recognizeInUI( 'comprimento mínimo é 0' ) ],
            [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );
    } );

    it( 'recognizes max length definitions', () => {
        shouldHaveUIEntities( [ recognizeInUI( 'comprimento máximo é 100' ) ],
            [ UI_PROPERTY, UI_CONNECTOR, NUMBER  ] );
    } );

    it( 'recognizes format definitions', () => {
        shouldHaveUIEntities( [ recognizeInUI( 'formato é "[A-Z]"' ) ],
            [ UI_PROPERTY, UI_CONNECTOR, VALUE  ] );
    } );

    it( 'recognizes script definitions', () => {
        shouldHaveUIEntities( [ recognize( 'valor vem de "SELECT * FROM someTable"' ) ],
            [ UI_PROPERTY, UI_CONNECTOR, QUERY  ] );
    } );

} );
