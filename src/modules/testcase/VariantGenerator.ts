import { Variant, Template } from "../ast/Variant";
import { Spec } from "../ast/Spec";
import { LocatedException } from "../req/LocatedException";

/**
 * Generates Variants from a Template.
 * 
 * @author Thiago Delgado Pinto
 */
export class VariantGenerator {

    /**
     * Generates Variants from a Template.
     * 
     * @param template Template
     * @param spec Entire specification
     */
    public generate = async ( template: Template, spec: Spec ): Promise< VariantGenerationResult[] > => {

        const tags: string[] = [
            '@generated',
            '@template( ' + template.name + ' )'
        ];

        let variantCount = 0;

        let templateCopy = this.replaceAllReferences( template, spec );

        return [];
    };


    public replaceAllReferences = ( template: Template, spec: Spec ): Template => {

        for ( let sentence of template.sentences ) {
            // ...
            
        }

        return null;
    };

}

/**
 * Variant generation result
 * 
 * @author Thiago Delgado Pinto
 */
export class VariantGenerationResult {

    constructor(
        public variant: Variant,
        public errors: LocatedException[],
        public warnings: LocatedException[]
    ) {
    }
}