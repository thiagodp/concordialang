import Graph from 'graph.js/dist/graph.full.js';

import { Document, UIElement, UIPropertyReference } from '../ast';
import { SemanticException } from '../error/SemanticException';
import { Entities } from '../nlp/Entities';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { NodeTypes } from '../req/NodeTypes';
import { UIElementPropertyExtractor } from '../util/UIElementPropertyExtractor';


export function sortUIElementsByTheirDependencies(
    uiElements: UIElement[],
	spec: AugmentedSpec,
	doc: Document,
    dependenciesGraph?: Graph // optional
): { uiElements: UIElement[], problems: SemanticException[] } {

    const graph = dependenciesGraph || makeGraphOfDependencies( uiElements, spec, doc );

	const problems: SemanticException[] = [];
    if ( hasCyclicReferences( graph, problems ) ) {
        return { uiElements: [], problems };
    }

    const elements: UIElement[] = [];
    for ( const [ , v ] of graph.vertices_topologically() ) {
        elements.push( v );
    }

    return { uiElements: elements, problems };
}


function makeGraphOfDependencies( uiElements: UIElement[], spec: AugmentedSpec, doc: Document ): Graph {
    const graph = new Graph();
    for ( const uie of uiElements ) {
        graph.addVertex( uie.info.fullVariableName, uie ); // key, value
        const deps = dependenciesOfUIElements( uie, spec, doc );
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


export function dependenciesOfUIElements( uie: UIElement, spec: AugmentedSpec, doc: Document ): UIElement[] {

    const propertiesMap = ( new UIElementPropertyExtractor() ).mapProperties( uie );

    const elements: UIElement[] = [];
    for ( const props of propertiesMap.values() ) {
        for ( const uiProperty of props ) {
            if ( ! uiProperty.value ) {
                continue;
            }

			// UI Property Reference in the value, e.g., `- minimum value is {Other|minvalue}`
			// TO-DO: Accept an expression, like `- minimum value is {Other|minvalue} + 1`
			if ( uiProperty.value.entity === Entities.UI_PROPERTY_REF ) {

				// Usually a single value, but let it recognize many
				for ( const ref of uiProperty.value.references || [] ) {
					const uipRef: UIPropertyReference = ref as UIPropertyReference;
					if ( ! uipRef.uiElementName ) {
						continue;
					}
					const other: UIElement = spec.uiElementByVariable( uipRef.uiElementName, doc );
					if ( other ) {
						elements.push( other );
					}
				}
				continue;
			}

            for ( const ref of uiProperty.value.references || [] ) {
                if ( ref.nodeType === NodeTypes.UI_ELEMENT ) {
                    const other: UIElement = ref as UIElement;
                    elements.push( other );
                }
            }
        }
    }
    return elements;
}
