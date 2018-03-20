import { SpecificationAnalyzer } from "./SpecificationAnalyzer";
import { Spec } from "../ast/Spec";
import { SemanticException } from "./SemanticException";
import { Document } from "../ast/Document";
import { isDefined } from "../util/TypeChecking";
import { UIElement, UIProperty } from "../ast/UIElement";
import { Entities } from "../nlp/Entities";
import { Location } from "../ast/Location";
import { Node } from "../ast/Node";
import { QueryParser } from "../db/QueryParser";
import Graph = require( 'graph.js/dist/graph.full.js' );
import * as deepcopy from 'deepcopy';

/**
 * Executes semantic analysis of UI Elements in a specification.
 *
 * Checkings:
 * - duplicated names of global UI Elements
 * - references to declarations
 *
 * Changes:
 * - make a cache of UI Elements for the Spec
 * - retrieve references' values
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {
        this._checker.checkDuplicatedNamedNodes( spec.uiElements(), errors, 'global UI Element' );
        this.retriveReferences( graph, spec, errors );
    }

    retriveReferences(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): void {

        // Since the graph is being traversed in topological order, according
        // to Imports declarations, the current document should only contain
        // UI elements with properties that may refer to already mapped UI Elements.
        // Otherwise, errors must are registred.

        for ( let [ key, value ] of graph.vertices_topologically() ) {
            let doc: Document = value as Document;

            // Maps documents' declarations
            spec.mapEverythingFromDocument( doc );

            // Analyzes all the references from UIProperties to UI Elements, including
            // queries, tables, databases, constants and features
            this.analyzePropertiesReferences( doc, spec, errors );
        }
    }


    analyzePropertiesReferences( doc: Document, spec: Spec, errors: SemanticException[] ): void {

        // Analyze those UI elements of the Feature, if it is declared
        if ( isDefined( doc.feature ) ) {
            for ( let uie of doc.feature.uiElements || [] ) {
                this.analyzePropertiesReferencesOf( uie, doc, spec, errors );
            }
        }

        // Analyze global UI elements
        for ( let uie of doc.uiElements || [] ) {
            this.analyzePropertiesReferencesOf( uie, doc, spec, errors );
        }
    }


    analyzePropertiesReferencesOf( uie: UIElement, doc: Document, spec: Spec, errors: SemanticException[] ) {

        for ( let uiProperty of uie.items || [] ) {

            for ( let propValue of uiProperty.values || [] ) {

                const content = propValue.value.toString();

                // We will just deal with references to declarations!
                switch ( propValue.entity ) {

                    case Entities.CONSTANT: {
                        this.analyzeConstant( content, uiProperty, doc, spec, propValue.references, errors );
                        break;
                    }

                    case Entities.UI_ELEMENT: {
                        this.analyzeUIElement( content, uiProperty, doc, spec, propValue.references, errors );
                        break;
                    }

                    case Entities.QUERY: {
                        this.analyzeQuery( content, uiProperty, doc, spec, propValue.references, errors );
                        break;
                    }

                    // No default!
                }
            }
        }
    }


    analyzeConstant( variable: string, uiProperty: UIProperty, doc: Document, spec: Spec, references: Node[], errors: Error[] ): void {
        const node = spec.constantWithName( variable );
        if ( isDefined( node ) ) {
            references.push( node );
        } else {
            const msg = 'Referenced constant not found: ' + variable;
            errors.push( this.makeError( msg, uiProperty.location, doc ) );
        }
    }


    analyzeUIElement( variable: string, uiProperty: UIProperty, doc: Document, spec: Spec, references: Node[], errors: Error[] ): void {
        const node = spec.uiElementByVariable( variable, doc );
        if ( isDefined( node ) ) {
            references.push( node );
        } else {
            const msg = 'Referenced UI Element not found: ' + variable;
            errors.push( this.makeError( msg, uiProperty.location, doc ) );
        }
    }


    analyzeQuery( query: string, uiProperty: UIProperty, doc: Document, spec: Spec, references: Node[], errors: Error[] ): void {

        const queryParser = new QueryParser(); // stateless

        // Databases, tables or constants. Their names are unique.
        const names: string[] = Array.from( new Set( queryParser.parseAnyNames( query ) ) );
        this.analyzeNames( names, uiProperty, doc, spec, references, errors );

        // UI elements
        const variables: string[] = Array.from( new Set( queryParser.parseAnyVariables( query ) ) );
        for ( let v of variables ) {
            this.analyzeUIElement( v, uiProperty, doc, spec, references, errors );
        }
    }


    analyzeNames( names: string[], uiProperty: UIProperty, doc: Document, spec: Spec, references: Node[], errors: Error[] ): void {
        for ( let name of names || [] ) {
            let node = null;

            // Constant ?
            node = spec.constantWithName( name );

            // Table ?
            if ( ! node ) {
                node = spec.tableWithName( name );
            }

            // Database ?
            if ( ! node ) {
                node = spec.databaseWithName( name );
            }

            // Not found? Error!
            if ( ! node ) {
                const msg = 'Referenced name not found: ' + name;
                errors.push( this.makeError( msg, uiProperty.location, doc ) );
            // Otherwise, adds the reference
            } else {
                references.push( node );
            }
        }
    }


    makeError( msg: string, location: Location, doc: Document ): SemanticException {
        let loc = deepcopy( location );
        if ( ! loc.filePath ) {
            loc.filePath = doc.fileInfo.path;
        }
        return new SemanticException( msg, loc );
    }

}