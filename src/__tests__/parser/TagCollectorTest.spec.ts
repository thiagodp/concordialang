import { NodeIterator } from '../../modules/parser/NodeIterator';
import { Node } from '../../modules/ast/Node';
import { Tag } from '../../modules/ast/Tag';
import { Feature } from '../../modules/ast/Feature';
import { TagCollector } from '../../modules/parser/TagCollector';
import { Keywords } from "../../modules/req/Keywords";
import { Import } from "../../modules/ast/Import";
/**
 * @author Thiago Delgado Pinto
 */
describe( 'TagCollectorTest', () => {

    let tc = new TagCollector(); // under test

    let lin = 1;
    
    let imp: Import = {
        keyword: Keywords.IMPORT,
        location: { line: lin++, column: 1 },
        content: "hello.world"
    };

    let tag1: Tag = {
        keyword: Keywords.TAG,
        location: { line: lin++, column: 1 },
        name: 'important',
        content: null
    };

    let tag2: Tag = {
        keyword: Keywords.TAG,
        location: { line: lin++, column: 1 },
        name: 'hello',
        content: 'world'
    };    

    let feature: Feature = {
        keyword: Keywords.FEATURE,
        name: 'My feature',
        location: { line: lin++, column: 1 },
        tags: []
    };

    beforeEach( () => {
        feature.tags = [];
    } );


    it( 'collects backward tags successfully', () => {

        let nodes: Node[] = [ imp, tag1, tag2, feature ];
        let iterator = new NodeIterator( nodes, nodes.length - 1 ); // points to the last element

        tc.addBackwardTags( iterator, feature.tags );

        expect( feature.tags ).toHaveLength( 2 );
        expect( feature.tags ).toEqual( [ tag1, tag2 ] );
    } );

    it( 'does not change the given iterator', () => {

        let nodes: Node[] = [ imp, tag1, tag2, feature ];
        let iterator = new NodeIterator( nodes, nodes.length - 1 ); // points to the last element

        let currentBefore = iterator.current();
        tc.addBackwardTags( iterator, feature.tags );
        let currentAfter = iterator.current();

        expect( currentAfter ).toEqual( currentBefore );
    } );

} );