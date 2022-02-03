import { Document } from '../../modules/ast/Document';
import { SingleFileCompiler } from '../../modules/compiler/SingleFileCompiler';
import { FileProblemMapper } from '../../modules/error';
import languageMap from '../../modules/language/data/map';
import { Lexer } from '../../modules/lexer/Lexer';
import { NLPBasedSentenceRecognizer } from '../../modules/nlp/NLPBasedSentenceRecognizer';
import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { Parser } from '../../modules/parser/Parser';

describe( 'SingleFileCompiler', () => {

	const LANGUAGE = 'pt';

    const lexer: Lexer = new Lexer( LANGUAGE, languageMap );

    const parser = new Parser();

    const nlpTrainer = new NLPTrainer( languageMap );
    const nlpRec: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( nlpTrainer );

    const singleDocProcessor: SingleFileCompiler = new SingleFileCompiler(
        lexer, parser, nlpRec, LANGUAGE
    );

    const analyze = ( doc ): Error[] => {
        const problems = new FileProblemMapper();
        singleDocProcessor.analyzeNodes( problems, doc );
        return problems.getAllErrors();
    };


    it( 'recognizes a database', () => {
        [
            'Banco de dados: acme',
            '- tipo é "mysql"',
            '- host é "127.0.0.2"',
            '- username é "root"',
            '- password é ""',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc: Document = {};

        const errors = analyze( doc );
        expect( errors ).toHaveLength( 0 );
        expect( doc.databases ).toHaveLength( 1 );
    } );

} );
