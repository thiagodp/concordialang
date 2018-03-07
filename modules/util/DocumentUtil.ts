import { isDefined } from "./TypeChecking";
import { Document } from '../ast/Document';
import { hasTagNamed } from "../ast/Tag";
import { ReservedTags } from "../req/ReservedTags";
import { Variant } from "../ast/Variant";

export class DocumentUtil {

    templateVariantsOf( doc: Document ): Variant[] {
        if ( ! isDefined( doc.variants ) || doc.variants.length < 1 ) {
            return [];
        }

        let templates: Variant[];
        for ( let v of doc.variants ) {
            if ( hasTagNamed( ReservedTags.TEMPLATE, v.tags ) ) {
                templates.push( v );
            }
        }
        return templates;
    }
    
}