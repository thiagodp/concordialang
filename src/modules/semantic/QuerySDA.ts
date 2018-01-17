import { Feature } from '../ast/Feature';
import { LocatedException } from '../req/LocatedException';
import { QueryParser } from '../db/QueryParser';
import { Database } from '../ast/Database';
import { SemanticException } from './SemanticException';
import { Entities } from '../nlp/Entities';
import { UIElement, UIProperty } from '../ast/UIElement';
import { Spec } from "../ast/Spec";

//
// A scenario may reference more than one feature.
//
// A query of a UI element may reference a UI element of another feature.
//   -> So, the referenced element must contain the feature name
//   -> e.g.: {{Feature Name}}.${UI Element Name}
//
// {{whatever}} should denote UNIQUE names.
//
// When referencing a UI Element WITHOUT the feature name, it is 
// assumed the feature of the current document.
//
// Spec must be able to retrieve a feature by name.

/**
 * Query SDA
 * 
 * @author Thiago Delgado Pinto
 */
export class QuerySDA {

    public readonly FEATURE_SEPARATOR: string = ':';

    /**
     * Check queries WITHOUT executing them. That is, it checks for referenced
     * databases, tables, constants, and ui elements.
     * 
     * @returns Promise< SemanticException[] >
     */
    check = async ( spec: Spec ): Promise< SemanticException[] > => {

        //
        // Just to remember:
        // - doc.uiElements           => Global UI elements
        // - doc.feature.uiElements   => Local UI elements
        //
        // However, queries of local UI elements may reference global UI elements.
        //
        // This version of the Concordia Compiler DO NOT SUPPORT queries that 
        // reference global UI elements yet.
        //
        // TO-DO: check references to global UI elements.
        //
        
        const allErrors: SemanticException[] = [];
        for ( const doc of spec.docs ) {

            // UI elements may have queries that reference the specification.
            // So, whether no UI elements exist in the document, ignores it.
            if ( ! doc.feature || ! doc.feature.uiElements || doc.feature.uiElements.length < 1 ) {
                continue; // Just check local ui elements
            }

            // Checks queries of UI elements from the currrent feature
            const localErrors: SemanticException[] = 
                await this.checkQueriesOfUIElements( doc.feature.uiElements, spec, doc.feature );
                
            allErrors.push.apply( allErrors, localErrors );
        }
        return allErrors;
    };


    checkQueriesOfUIElements = async (
        uiElements: UIElement[],
        spec: Spec,
        feature: Feature
    ): Promise< SemanticException[] > => {

        let errors: SemanticException[] = [];
        if ( ! uiElements ) {
            return errors;
        }

        for ( const uie of uiElements ) {
            // No items?
            if ( ! uie.items || uie.items.length < 1 ) {
                continue;
            }
            for ( const item of uie.items ) {
                // No entities?
                if ( ! item.nlpResult || ! item.nlpResult.entities || item.nlpResult.entities.length < 0 ) {
                    continue;
                }
                for ( const e of item.nlpResult.entities ) {
                    // No query?
                    if ( e.entity != Entities.QUERY ) {
                        continue;
                    }
                    // Checks the query
                    const itemErrors: SemanticException[] =
                        this.checkQuery( e.value, item, spec, feature );
                        
                    // Adds errors found
                    errors.push.apply( errors, itemErrors );
                }
            }
        }
        return errors;
    };


    checkQuery = (
        query: string,
        item: UIProperty,
        spec: Spec,
        feature: Feature
    ): LocatedException[] => {

        let errors: LocatedException[] = [];
        const parser: QueryParser = new QueryParser();

        // NAMES        
        const queryNames: string[] = Array.from( new Set( parser.parseAnyNames( query ) ) );
        if ( queryNames.length > 0 ) {
            const nonFeatureNames: string[] = spec.nonFeatureNames();
            const inexisting: string[] = queryNames.filter( v => nonFeatureNames.indexOf( v ) < 0 );
            if ( inexisting.length > 0 ) {
                const msg = 'Query is referencing a non-existent name: ' + inexisting.join( ', ' );
                const e = new SemanticException( msg, item.location );
                errors.push( e );
            }
        }
        
        // VARIABLES
        const queryVariables: string[] = Array.from( new Set( parser.parseAnyVariables( query ) ) );
        if ( queryVariables.length > 0 ) {

            // UI Elements
            for ( let qv of queryVariables ) {

                let r: UIElementSearchResult = this.findUIElement( qv, spec, feature );
                if ( ! r.success ) {
                    // Add all errors
                    errors.push.apply( errors,
                        r.errorsMessages.map( msg => new SemanticException( msg, item.location ) )
                        );
                }
            }
        }

        return errors;
    };

    featureNameOfVariable = ( v: string ): string | null => {
        const index = v.indexOf( this.FEATURE_SEPARATOR );
        if ( index < 0 ) {
            return null;
        }
        return v.substring( 0, index );
    };

    variableOf = ( v: string ): string => {
        const index = v.indexOf( this.FEATURE_SEPARATOR );
        if ( index < 0 ) {
            return v;
        }
        if ( 1 === v.length ) {
            return '';
        }
        return v.split( this.FEATURE_SEPARATOR )[ 1 ];
    };



    findUIElement = ( variable: string, spec: Spec, feature: Feature ): UIElementSearchResult => {

        let r = new UIElementSearchResult();

        // Checking feature

        let featureName: string | null = this.featureNameOfVariable( variable );
        let featureToCheck: Feature = null;

        if ( ! featureName ) {
            featureToCheck = feature;
        } else {
            // Same feature name?
            featureToCheck = ( featureName === feature.name )
                ? feature // use the current feature
                : spec.featureWithName( featureName ); // search the feature

            if ( ! featureToCheck ) {
                const msg = 'Query is referencing a non-existent feature: ' + featureName;
                r.errorsMessages.push( msg );
                return r; // exit !
            }                        
        }

        // Name to check

        const uieNameToCheck = this.variableOf( variable );
        if ( uieNameToCheck.length < 1 ) {
            const msg = 'Query is referencing an empty UI element.';
            r.errorsMessages.push( msg );
        }                

        // Checking UI element of the feature

        if ( ! featureToCheck.uiElements || featureToCheck.uiElements.length < 1 ) {
            const msg = 'Query is referencing a feature without UI elements:' + featureToCheck.name;
            r.errorsMessages.push( msg );
        }

        const uieNames: string[] = featureToCheck.uiElements.map( v => v.name );
        if ( uieNames.indexOf( uieNameToCheck ) < 0 ) {
            const msg = 'Query is referencing a non-existent UI element in the feature "' +
                featureToCheck.name + '": ' + uieNameToCheck;
            r.errorsMessages.push( msg );
        }

        if ( r.errorsMessages.length < 1 ) {
            r.success = true;
        }

        return r;
    };



    

    
}


class UIElementSearchResult {
    success: boolean = false;
    errorsMessages: string[] = [];
    feature: Feature = null;
    uiElement: UIElement = null;
}