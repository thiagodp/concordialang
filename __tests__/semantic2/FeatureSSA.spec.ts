import * as fs from 'fs';
import { resolve } from 'path';
import { Options } from '../../modules/app/Options';
import { Document } from '../../modules/ast/Document';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../modules/language';
import { Lexer } from '../../modules/lexer/Lexer';
import { Parser } from '../../modules/parser/Parser';
import { AugmentedSpec } from '../../modules/req/AugmentedSpec';
import { SpecFilter } from '../../modules/selection/SpecFilter';
import { FeatureSSA } from '../../modules/semantic2/FeatureSSA';
import { FSFileHandler } from '../../modules/util/file/FSFileHandler';
import { FileProblemMapper } from '../../modules/error/FileProblemMapper';

describe( 'FeatureSSA', () => {

    const analyzer = new FeatureSSA(); // under test

    const parser = new Parser();
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    const fileHandler = new FSFileHandler( fs );
    const langLoader: LanguageContentLoader =
        new JsonLanguageContentLoader( options.languageDir, {}, fileHandler, fileHandler );
    const lexer: Lexer = new Lexer( options.language, langLoader );

    beforeEach( () => {
        lexer.reset();
    } );

    it( 'does not criticize when everything is ok', async () => {
        [
            'feature: my feature 1',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc1: Document = {};
        parser.analyze( lexer.nodes(), doc1 );

        lexer.reset();

        [
            'feature: my feature 2',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc2: Document = {};
        parser.analyze( lexer.nodes(), doc2 );


        let spec = new AugmentedSpec( '.' );
        spec.addDocument( doc1 );
        spec.addDocument( doc2 );
        const graph = ( new SpecFilter( spec ) ).graph();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, graph );
        const errors = problems.getAllErrors();

        expect( errors ).toHaveLength( 0 );
    } );


    it( 'criticizes duplicated names', async () => {

        [
            'feature: my feature 1',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );

        const doc1: Document = {
            fileInfo: {
                path: 'f1.feature',
                hash: ''
            }
        };
        parser.analyze( lexer.nodes(), doc1 );

        lexer.reset();

        [
            'feature: my feature 1',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );

        const doc2: Document = {
            fileInfo: {
                path: 'f2.feature',
                hash: ''
            }
        };

        parser.analyze( lexer.nodes(), doc2 );

        const spec = new AugmentedSpec( '.' );
        spec.addDocument( doc1 );
        spec.addDocument( doc2 );
        const graph = ( new SpecFilter( spec ) ).graph();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, graph );
        const errors = problems.getAllErrors();
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
    } );

} );