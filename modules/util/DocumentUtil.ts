import { isDefined, areDefined } from "./TypeChecking";
import { Document } from '../ast/Document';
import { hasTagNamed } from "../ast/Tag";
import { ReservedTags } from "../req/ReservedTags";
import { Variant } from "../ast/Variant";
import { Scenario } from "../ast/Scenario";

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

}