import { AbstractTestScript } from "concordialang-types/testscript";
import { AugmentedSpec } from "../ast/AugmentedSpec";
import { AbstractTestScriptGenerator } from "../testscript/AbstractTestScriptGenerator";
import { isDefined } from "../util/TypeChecking";

/**
 * Abstract Test Script Generation Controller
 */
export class ATSGenController {

    generate( spec: AugmentedSpec ): AbstractTestScript[] {
        let all: AbstractTestScript[] = [];
        const gen = new AbstractTestScriptGenerator();
        for ( let doc of spec.docs || [] ) {
            let ats = gen.generateFromDocument( doc, spec );
            if ( isDefined( ats ) ) {
                all.push( ats );
            }
        }
        return all;
    }

}