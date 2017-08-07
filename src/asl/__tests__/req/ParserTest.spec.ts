import { Parser } from '../../modules/req/lexer/Lexer';
import { KeywordDictionary } from '../../modules/req/KeywordDictionary';
import { Feature } from "../../modules/req/ast/Feature";
import { Scenario } from "../../modules/req/ast/Scenario";
import { Import } from "../../modules/req/ast/Import";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'Parser Test', () => {

    let dict: KeywordDictionary = {
        feature: [ 'feature' ],
        scenario: [ 'scenario' ],
        import: [ 'import' ]
    };
    
    let parser = new Parser( dict );
    
    beforeEach( () => {
        parser.reset();
    } );

    it( 'detects a feature', () => {
        let i = 0;
        parser.onLineRead( 'Feature: Hello', ++i );
        expect( parser.errors() ).toHaveLength( 0 );
        let nodes = parser.nodes();

        expect( nodes ).toHaveLength( 1 );
        expect( nodes[ 0 ].keyword ).toBe( "feature" );
        expect( ( nodes[ 0 ] as Feature ).name  ).toBe( "Hello" );
    } );

    it( 'detects a scenario', () => {
        let i = 0;
        parser.onLineRead( 'Scenario: World', ++i );
        expect( parser.errors() ).toHaveLength( 0 );
        let nodes = parser.nodes();

        expect( nodes ).toHaveLength( 1 );
        expect( nodes[ 0 ].keyword ).toBe( "scenario" );
        expect( ( nodes[ 0 ] as Scenario ).name  ).toBe( "World" );
    } );    


    it( 'detects an import', () => {
        let i = 0;
        parser.onLineRead( 'Import "path/to/SomeFile.extension"', ++i );
        expect( parser.errors() ).toHaveLength( 0 );
        let nodes = parser.nodes();

        expect( nodes ).toHaveLength( 1 );
        expect( nodes[ 0 ].keyword ).toBe( "import" );
        expect( ( nodes[ 0 ] as Import ).content  ).toBe( "path/to/SomeFile.extension" );
    } );

} );