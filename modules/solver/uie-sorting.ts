import Graph from 'graph.js/dist/graph.full.js';

import { UIElement } from '../ast/UIElement';
import { SemanticException } from '../error/SemanticException';
import { NodeTypes } from '../req/NodeTypes';
import { UIElementPropertyExtractor } from '../util/UIElementPropertyExtractor';


export function sortUIElementsByTheirDependencies(
    uiElements: UIElement[],
    problems: SemanticException[],
    dependenciesGraph?: Graph // optional
): UIElement[] {

    const graph = dependenciesGraph || makeGraphOfDependencies( uiElements );

    if ( hasCyclicReferences( graph, problems ) ) {
        return [];
    }

    const elements: UIElement[] = [];
    for ( const [ , v ] of graph.vertices_topologically() ) {
        elements.push( v );
    }

    return elements;
}


function makeGraphOfDependencies( uiElements: UIElement[] ): Graph {
    const graph = new Graph();
    for ( const uie of uiElements ) {
        graph.addVertex( uie.info.fullVariableName, uie ); // key, value
        const deps = dependenciesOfUIElements( uie );
        for ( const depUIE of deps ) {
            graph.ensureVertex( depUIE.info.fullVariableName ); // no value
            graph.ensureEdge( depUIE.info.fullVariableName, uie.info.fullVariableName ); // to, from
        }
    }
    return graph;
}


function hasCyclicReferences( graph: Graph, problems: SemanticException[] ): boolean {

    let hasError: boolean = false;

    // Let's find cyclic references and report them as errors
    for ( let it = graph.cycles(), kv; ! ( kv = it.next() ).done; ) {

        hasError = true;

        const cycle = kv.value;
        const [ firstUIEName, secondUIEName ] = cycle;
        const fullCycle = cycle.join( '" => "' ) + '" => "' + firstUIEName;

        // const firstUIE: UIElement = graph.vertexValue( firstUIEName );
        const secondUIE: UIElement = graph.vertexValue( secondUIEName );
        let loc = { line: 1, column: 1 };
        if ( secondUIE ) {
            loc = { ...secondUIE.location };
        }

        const msg = 'Cyclic reference: "' + fullCycle + '".';
        const err = new SemanticException( msg, loc );
        problems.push( err );
    }

    return hasError;
}


export function dependenciesOfUIElements( uie: UIElement ): UIElement[] {

    const propertiesMap = ( new UIElementPropertyExtractor() ).mapProperties( uie );

    const elements: UIElement[] = [];
    for ( const props of propertiesMap.values() ) {
        for ( const v of props ) {
            if ( undefined === v.value || null === v.value ) {
                continue;
            }
            for ( const reference of v.value.references || [] ) {
                if ( reference.nodeType === NodeTypes.UI_ELEMENT ) {
                    const other: UIElement = reference as UIElement;
                    elements.push( other );
                }
            }
        }
    }
    return elements;
}
