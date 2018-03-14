import { Feature } from '../ast/Feature';
import { LocatedException } from '../req/LocatedException';
import { QueryParser } from './QueryParser';
import { Database } from '../ast/Database';
import { SemanticException } from '../semantic/SemanticException';
import { Entities } from '../nlp/Entities';
import { UIElement, UIProperty, UIValueReferenceType } from '../ast/UIElement';
import { Spec } from "../ast/Spec";
import { Constant } from '../ast/Constant';
import { Table } from '../ast/Table';
import { NameUtil } from '../util/NameUtil';

/**
 * Analyzes queries' references.
 *
 * Notes:
 * - doc.uiElements           => Global UI elements
 * - doc.feature.uiElements   => Local UI elements
 * - Queries of UI elements may reference:
 *   - UI elements from the same (current) feature.
 *   - UI elements from other features.
 *   - Global UI elements.
 *
 * >> The current version DOES NOT SUPPORT queries that reference global UI elements.
 *
 * TO-DO: check references to global UI elements.
 *
 * @author Thiago Delgado Pinto
 */
export class QueryReferenceAnalyzer {

    private readonly _queryParser = new QueryParser();
    private readonly _nameUtil = new NameUtil();

    /**
     * Check queries WITHOUT executing them. That is, it checks for referenced
     * databases, tables, constants, and ui elements.
     *
     * @returns SemanticException[]
     */
    public check( spec: Spec ): SemanticException[] {

        const allErrors: SemanticException[] = [];
        for ( let doc of spec.docs ) {

            // TO-DO: (future) check global UI elements, i.e., doc.uiElements,
            // and references to them.

            // UI elements may have queries that reference the specification.
            // So, whether no UI elements exist in the document, ignores it.
            if ( ! doc.feature || ! doc.feature.uiElements || doc.feature.uiElements.length < 1 ) {
                continue; // Just check local ui elements
            }

            // Checks queries of UI elements from the currrent feature
            const localErrors: SemanticException[] =
                this.checkQueriesOfUIElements( doc.feature.uiElements, spec, doc.feature );

            allErrors.push.apply( allErrors, localErrors );
        }
        return allErrors;
    }


    /**
     * Checks references from the given UI elements' queries.
     *
     * @param uiElements UI elements
     * @param spec Specification
     * @param currentFeature Current feature
     */
    public checkQueriesOfUIElements(
        uiElements: UIElement[],
        spec: Spec,
        currentFeature: Feature
    ): SemanticException[] {

        let errors: SemanticException[] = [];
        if ( ! uiElements ) {
            return errors;
        }

        for ( let uie of uiElements ) {
            // No items (properties) ?
            if ( ! uie.items || uie.items.length < 1 ) {
                continue;
            }
            for ( let item of uie.items ) {
                // No entities?
                if ( ! item.nlpResult || ! item.nlpResult.entities || item.nlpResult.entities.length < 0 ) {
                    continue;
                }
                for ( let e of item.nlpResult.entities ) {
                    // No query?
                    if ( e.entity != Entities.QUERY ) {
                        continue;
                    }
                    // Checks the query
                    const itemErrors: SemanticException[] =
                        this.checkQuery( e.value, item, spec, currentFeature );

                    // Adds errors found
                    errors.push.apply( errors, itemErrors );
                }
            }
        }
        return errors;
    }


    /**
     * Checks references of a single query and returns errors found.
     *
     * @param query Query to check
     * @param queryOwner UI property of a UI element that contains the query
     * @param spec Specification to check
     * @param currentFeature Current feature
     */
    public checkQuery(
        query: string,
        queryOwner: UIProperty,
        spec: Spec,
        currentFeature: Feature
    ): LocatedException[] {

        let errors: LocatedException[] = [];

        // NAMES
        const queryNames: string[] = Array.from( new Set( this._queryParser.parseAnyNames( query ) ) );
        if ( queryNames.length > 0 ) {
            const nonFeatureNames: string[] = spec.nonFeatureNames();
            const inexisting: string[] = queryNames.filter( v => nonFeatureNames.indexOf( v ) < 0 );
            if ( inexisting.length > 0 ) {
                const msg = 'Query is referencing a non-existent name: ' + inexisting.join( ', ' );
                const e = new SemanticException( msg, queryOwner.location );
                errors.push( e );
            }
        }

        // VARIABLES
        const queryVariables: string[] = Array.from( new Set( this._queryParser.parseAnyVariables( query ) ) );
        if ( queryVariables.length > 0 ) {
            // UI Elements
            for ( let qv of queryVariables ) {
                let r: UIElementSearchResult = this.searchUIElement( qv, spec, currentFeature );
                if ( ! r.success ) {
                    // Add all errors
                    errors.push.apply( errors,
                        r.errorMessages.map( msg => new SemanticException( msg, queryOwner.location ) )
                        );
                }
            }
        }

        return errors;
    }

    /**
     * Searches for a UI element and returns the search result.
     *
     * @param variable Variable in the format 'feature:variable' or 'variable'.
     * @param spec Specification where to find.
     * @param currentFeature Current feature.
     */
    public searchUIElement(
        variable: string,
        spec: Spec,
        currentFeature: Feature
    ): UIElementSearchResult {

        let r = new UIElementSearchResult();

        // Checking feature

        let featureName: string | null = this._nameUtil.extractFeatureNameOf( variable );
        let featureToCheck: Feature = null;

        if ( ! featureName ) { // No feature in the variable, then look in the current feature
            featureToCheck = currentFeature;
        } else {
            // Same feature name?
            featureToCheck = ( featureName === currentFeature.name )
                ? currentFeature // use the current feature
                : spec.featureWithName( featureName ); // search the feature

            if ( ! featureToCheck ) {
                const msg = 'Query is referencing a non-existent feature: ' + featureName;
                r.errorMessages.push( msg );
                return r; // exit !
            }
        }
        r.feature = featureToCheck;

        // Name to check

        const uieNameToCheck = this._nameUtil.extractVariableNameOf( variable );
        if ( uieNameToCheck.length < 1 ) {
            const msg = 'Query is referencing an empty UI element.';
            r.errorMessages.push( msg );
            return r;
        }

        // Checking UI element of the feature

        if ( ! featureToCheck.uiElements || featureToCheck.uiElements.length < 1 ) {
            const msg = 'Query is referencing a feature without UI elements:' + featureToCheck.name;
            r.errorMessages.push( msg );
            return r;
        }

        const uieNames: string[] = featureToCheck.uiElements.map( v => v.name );
        const uieIndex: number = uieNames.indexOf( uieNameToCheck );
        if ( uieIndex < 0 ) {
            const msg = 'Query is referencing a non-existent UI element in the feature "' +
                featureToCheck.name + '": ' + uieNameToCheck;
            r.errorMessages.push( msg );
        } else {
            r.uiElement = featureToCheck.uiElements[ uieIndex ];
        }

        if ( r.errorMessages.length < 1 ) {
            r.success = true;
        }

        return r;
    }

}


class UIElementSearchResult {
    success: boolean = false;
    errorMessages: string[] = [];
    feature: Feature = null;
    uiElement: UIElement = null;
}


class QueryCheckResult {
    constructor(
        public ownerUIElement: UIElement = null,
        public ownerUIProperty: UIProperty = null,
        public query: string = '',
        public references: QueryReference[] = []
    ) {
    }
}

class QueryReference {
    constructor(
        public name: string = '',
        public refType: UIValueReferenceType = UIValueReferenceType.NONE,
        public owner: Feature | Database | null = null,
        public ref: UIElement | Constant | Table | null = null
    ) {
    }
}