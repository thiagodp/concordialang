import { EnglishKeywordDictionary } from '../../modules/dict/EnglishKeywordDictionary';
import { InMemoryKeywordDictionaryLoader } from '../../modules/dict/InMemoryKeywordDictionaryLoader';
import { Node } from '../../modules/ast/Node';
import { NodeIterator } from '../../modules/parser/NodeIterator';
import { ParsingContext } from '../../modules/parser/ParsingContext';
import { TokenTypes } from '../../modules/req/TokenTypes';
import { Feature } from '../../modules/ast/Feature';
import { FeatureParser } from '../../modules/parser/FeatureParser';
import { Lexer } from "../../modules/lexer/Lexer";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'FeatureParserTest', () => {

    let parser = new FeatureParser(); // under test

    let dictMap = { 'en': new EnglishKeywordDictionary() };
    let lexer = new Lexer( 'en', new InMemoryKeywordDictionaryLoader( dictMap ) );    

    let context: ParsingContext = null;
    let nodes: Node[] = [];
    let nodeIt: NodeIterator = null;
    let errors: Error[] = [];
    
    let featureNode: Feature = {
        keyword: TokenTypes.FEATURE,
        location: { column: 1, line: 1 },
        name: "My feature"
    };    

    beforeEach( () => {
        nodes = [];
        nodeIt = new NodeIterator( nodes );
        errors = [];
        context = new ParsingContext();

        lexer.reset();
    } );


    it( 'adds a feature when a feature is not defined', () => {
        expect( context.doc.feature ).not.toBeDefined();

        parser.analyze( featureNode, context, nodeIt, errors );

        expect( errors ).toHaveLength( 0 );
        expect( context.doc.feature ).toBeDefined();
        expect( context.doc.feature.name ).toBe( "My feature" );        
    } );

    it( 'generates an error when a feature was already defined', () => {        
        parser.analyze( featureNode, context, nodeIt, errors );
        parser.analyze( featureNode, context, nodeIt, errors );
        expect( errors ).toHaveLength( 1 );
    } );

    it( 'indicates that it is in a feature when a feature is detected', () => {
        parser.analyze( featureNode, context, nodeIt, errors );
        expect( context.inFeature ).toBeTruthy();
    } );

} );