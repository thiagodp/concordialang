import { NodeIterator } from '../../modules/parser/NodeIterator';
import { Node } from '../../modules/ast/Node';
import { Tag } from '../../modules/ast/Tag';
import { Feature } from '../../modules/ast/Feature';
import { TagCollector } from '../../modules/parser/TagCollector';
import { NodeTypes } from "../../modules/req/NodeTypes";
import { Import } from "../../modules/ast/Import";
/**
 * @author Thiago Delgado Pinto
 */
describe( 'TagCollectorTest', () => {

    let tc = new TagCollector(); // under test

    let lin = 1;
    
    let importNode: Import = {
        nodeType: NodeTypes.IMPORT,
        location: { line: lin++, column: 1 },
        content: "hello.world"
    };

    let tagNode1: Tag = {
        nodeType: NodeTypes.TAG,
        location: { line: lin++, column: 1 },
        name: 'important',
        content: null
    };

    let tagNode2: Tag = {
        nodeType: NodeTypes.TAG,
        location: { line: lin++, column: 1 },
        name: 'hello',
        content: 'world'
    };    

    let featureNode: Feature = {
        nodeType: NodeTypes.FEATURE,
        name: 'My feature',
        location: { line: lin++, column: 1 },
        tags: []
    };

    beforeEach( () => {
        featureNode.tags = [];
    } );


    it( 'collects backward tags successfully', () => {

        let nodes: Node[] = [ importNode, tagNode1, tagNode2, featureNode ];
        let iterator = new NodeIterator( nodes, nodes.length - 1 ); // points to the last element

        tc.addBackwardTags( iterator, featureNode.tags );

        expect( featureNode.tags ).toHaveLength( 2 );
        expect( featureNode.tags ).toEqual( [ tagNode1, tagNode2 ] );
    } );

    
    it( 'does not change the given iterator', () => {

        let nodes: Node[] = [ importNode, tagNode1, tagNode2, featureNode ];
        let iterator = new NodeIterator( nodes, nodes.length - 1 ); // points to the last element

        let currentBefore = iterator.current();
        tc.addBackwardTags( iterator, featureNode.tags );
        let currentAfter = iterator.current();

        expect( currentAfter ).toEqual( currentBefore );
    } );

} );