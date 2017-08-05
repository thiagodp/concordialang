
import { ImportAnalyzer } from '../../modules/req/analyzer/ImportAnalyzer';
import { Import } from '../../modules/req/old_ast/Import';
import { Location } from '../../modules/req/old_ast/Location';
import { Keywords } from '../../modules/req/Keywords';

/**
 * @author Thiago Delgado Pinto
 */
/*
describe( 'ImportAnalyzer Test', () => {

    let analyzer = new ImportAnalyzer();
    let doc = {};
    let errors = [];

    beforeEach( () => {
        doc = {};
        errors = [];
    } );

    it( 'must work when declarations are right', () => {
        let nodes = [
            { keyword: Keywords.IMPORT, location: { line: 1, column: 1 }, content: "path/to/file.ext" },
            { keyword: Keywords.IMPORT, location: { line: 2, column: 1 }, content: "other/path/to/file.ext" },
            { keyword: Keywords.FEATURE, location: { line: 3, column: 1 } }
        ];
        let current = nodes[ 0 ] as Import;
        analyzer.analyzeNodes( current, nodes, doc, errors, true );
        expect( errors.length ).toBe( 0 );
    } );    

    it( 'must detect when an import appears before any other keyword', () => {
        let nodes = [
            { keyword: Keywords.FEATURE, location: { line: 1, column: 1 } },
            { keyword: Keywords.IMPORT, location: { line: 2, column: 1 }, content: "path/to/file.ext" },
            { keyword: Keywords.IMPORT, location: { line: 3, column: 1 }, content: "other/path/to/file.ext" }
        ];
        let current = nodes[ 1 ] as Import;
        analyzer.analyzeNodes( current, nodes, doc, errors, true );
        expect( errors.length ).toBe( 1 );
    } );

    it( 'must detect duplicate imports', () => {
        let nodes = [
            { keyword: Keywords.IMPORT, location: { line: 1, column: 1 }, content: "path/to/file.ext" },
            { keyword: Keywords.IMPORT, location: { line: 2, column: 1 }, content: "other/path/to/file.ext" },
            { keyword: Keywords.IMPORT, location: { line: 3, column: 1 }, content: "path/to/file.ext" },
            { keyword: Keywords.FEATURE, location: { line: 4, column: 1 } }
        ];
        let current = nodes[ 1 ] as Import;
        analyzer.analyzeNodes( current, nodes, doc, errors, true );
        expect( errors.length ).toBe( 1 );
    } );

} );
*/