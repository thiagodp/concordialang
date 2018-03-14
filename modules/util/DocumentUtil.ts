import { isDefined, areDefined } from "./TypeChecking";
import { Document } from '../ast/Document';
import { hasTagNamed } from "../ast/Tag";
import { ReservedTags } from "../req/ReservedTags";
import { Variant } from "../ast/Variant";
import { Scenario } from "../ast/Scenario";
import { UIElement } from "../ast/UIElement";
import { UIElementUtil } from "./UIElementUtil";

export class DocumentUtil {

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
        const util = new UIElementUtil();
        const featureName: string | null = util.extractFeatureNameOf( name );
        const uieName: string | null = util.extractVariableNameOf( name );

        // Returns null if features have different names
        if ( areDefined( featureName, doc.feature ) && featureName != doc.feature.name ) {
            return null;
        }


        if ( isDefined( featureName ) ) {

            doc.uiElements
        }

        return null;
    }

}