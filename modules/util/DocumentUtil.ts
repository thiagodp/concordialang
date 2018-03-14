import { isDefined, areDefined } from "./TypeChecking";
import { Document } from '../ast/Document';
import { hasTagNamed } from "../ast/Tag";
import { ReservedTags } from "../req/ReservedTags";
import { Variant } from "../ast/Variant";
import { Scenario } from "../ast/Scenario";
import { UIElement } from "../ast/UIElement";
import { UIElementUtil } from "./UIElementUtil";

export class DocumentUtil {

    private readonly _uieUtil = new UIElementUtil();

    mapVariantsOf( doc: Document ): Map< Variant, Scenario > {

        let map = new Map< Variant, Scenario >();

        if ( ! areDefined( doc.feature, doc.feature.scenarios ) ) {
            return map;
        }

        for ( let sc of doc.feature.scenarios ) {
            for ( let v of sc.variants || [] ) {
                map.set( v, sc );
            }
        }
        return map;
    }

    /**
     * Returns a UI Element with the given name. The given name can be in the format {Name} or {Feature name|Name}.
     *
     * @param name UI Element name
     * @param doc Document
     */
    findUIElementWithName( name: string, doc: Document ): UIElement | null {

        const featureName: string | null = this._uieUtil.extractFeatureNameOf( name );

        // Returns null if features are defined and have different names
        if ( areDefined( featureName, doc.feature )
            && featureName.toLowerCase() !== doc.feature.name.toLowerCase() ) {
            return null;
        }

        const map = this.mapUIElementsVariablesOf( doc );

        // Finds the variable in the document's feature. If not found, finds it in the document.
        if ( ! isDefined( featureName ) && isDefined( doc.feature ) ) {
            const uieName: string | null = this._uieUtil.extractVariableNameOf( name );
            const fullName = this._uieUtil.makeVariableName( doc.feature.name, uieName );
            return map.get( fullName ) // In the feature
                || map.get( name ) // Global declaration in the document
                || null; // Null in case of not found
        }

        return map.get( name ) || null; // Global declaration in the document
    }

    /**
     * Creates variables from UIElements of the given document.
     * - Global UI Elements will have the format {Element name}.
     * - Feature's UI Elements will have the format {Feature name:Element name}.
     *
     * @param doc Document
     */
    mapUIElementsVariablesOf( doc: Document ): Map< string, UIElement > {
        let all = new Map< string, UIElement >();
        for ( let uie of doc.uiElements || [] ) {
            all.set(
                this._uieUtil.makeVariableName( null, uie.name ),
                uie
            );
        }
        if ( ! isDefined( doc.feature ) ) {
            return all;
        }
        for ( let uie of doc.feature.uiElements ) {
            all.set(
                this._uieUtil.makeVariableName( doc.feature.name, uie.name ),
                uie
            );
        }
        return all;
    }

}