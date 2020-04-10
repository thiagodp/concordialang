import Graph = require('graph.js/dist/graph.full.js');
import { Location } from 'concordialang-types';
import * as deepcopy from 'deepcopy';
import { Document, Node, UIElement, UIProperty } from '../ast';
import { QueryParser } from '../db/QueryParser';
import { ProblemMapper } from '../error/ProblemMapper';
import { SemanticException } from '../error/SemanticException';
import { Entities } from '../nlp/Entities';
import { AugmentedSpec } from "../req/AugmentedSpec";
import { isDefined } from '../util/TypeChecking';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';

/**
 * Analyze UI Elements in a specification.
 *
 * It checks for:
 * - duplicated names of GLOBAL UI Elements
 * - references to declarations
 *
 * It changes:
 * - make a cache of UI Elements for the Spec
 * - retrieve references' values
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        problems: ProblemMapper,
        spec: AugmentedSpec,
        graph: Graph,
    ): Promise< boolean > {

        const errors1: SemanticException[] = [];
        this._checker.checkDuplicatedNamedNodes(
            spec.uiElements(), errors1, 'global UI Element' );
        const ok1 = 0 === errors1.length;
        if ( ! ok1 ) {
            problems.addGenericError( ...errors1 );
        }

        const ok2 = this.analyzeReferences( problems, spec, graph );

        return ok1 && ok2;
    }

    analyzeReferences(
        problems: ProblemMapper,
        spec: AugmentedSpec,
        graph: Graph
    ): boolean {

        // Since the graph is being traversed in topological order,
        // the current document should only contain UI elements with
        // properties that refer already mapped UI Elements.

        let hasError: boolean = false;

        for ( let [ /* key */, value ] of graph.vertices_topologically() ) {

            let doc: Document = value as Document;
            if ( ! doc ) {
                continue;
            }

            // Maps documents' declarations
            // spec.mapEverythingFromDocument( doc );

            // Analyzes all the references from UIProperties to UI Elements, including
            // queries, tables, databases, constants and features
            const ok = this.analyzePropertiesReferences( doc, spec, problems );
            if ( ! ok ) {
                hasError = true;
            }
        }

        return ! hasError;
    }


    analyzePropertiesReferences(
        doc: Document,
        spec: AugmentedSpec,
        problems: ProblemMapper
    ): boolean {

        let errors: Error[] = [];

        // Analyze UI elements from the Feature, when declared
        if ( isDefined( doc.feature ) ) {
            for ( let uie of doc.feature.uiElements || [] ) {
                this.analyzePropertiesReferencesOf( uie, doc, spec, errors );
            }
        }

        // Analyze GLOBAL UI elements
        for ( let uie of doc.uiElements || [] ) {
            this.analyzePropertiesReferencesOf( uie, doc, spec, errors );
        }

        if ( errors.length > 0 ) {
            problems.addError( doc.fileInfo.path, ...errors );
            return false;
        }
        return true;
    }


    analyzePropertiesReferencesOf(
        uie: UIElement,
        doc: Document,
        spec: AugmentedSpec,
        errors: Error[]
    ) {

        for ( let uiProperty of uie.items || [] ) {

            if ( ! uiProperty ) {
                continue;
            }

            const propValue = uiProperty.value;
            if ( ! propValue ) {
                continue;
            }

            const content = propValue.value.toString();

            // We will just deal with references to declarations!
            switch ( propValue.entity ) {

                case Entities.CONSTANT: {
                    this.analyzeConstant( content, uiProperty, doc, spec, propValue.references, errors );
                    break;
                }

                case Entities.UI_ELEMENT_REF: {
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


    analyzeConstant(
        variable: string,
        uiProperty: UIProperty,
        doc: Document,
        spec: AugmentedSpec,
        references: Node[],
        errors: Error[]
    ): void {
        const node = spec.constantWithName( variable );
        if ( isDefined( node ) ) {
            references.push( node );
        } else {
            const msg = 'Referenced constant not found: ' + variable;
            errors.push( this.makeError( msg, uiProperty.location, doc ) );
        }
    }


    analyzeUIElement(
        variable: string,
        uiProperty: UIProperty,
        doc: Document,
        spec: AugmentedSpec,
        references: Node[],
        errors: Error[]
    ): void {
        const node = spec.uiElementByVariable( variable, doc );
        if ( isDefined( node ) ) {
            references.push( node );
        } else {
            const msg = 'Referenced UI Element not found: ' + variable;
            errors.push( this.makeError( msg, uiProperty.location, doc ) );
        }
    }


    analyzeQuery(
        query: string,
        uiProperty: UIProperty,
        doc: Document,
        spec: AugmentedSpec,
        references: Node[],
        errors: Error[]
    ): void {

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


    analyzeNames(
        names: string[],
        uiProperty: UIProperty,
        doc: Document,
        spec: AugmentedSpec,
        references: Node[],
        errors: Error[]
    ): void {
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