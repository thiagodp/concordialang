import { AbstractTestScript } from "concordialang-plugin";

import { AugmentedSpec } from "../req/AugmentedSpec";
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
            // Only test cases allowed
            if ( ! doc.testCases || doc.testCases.length < 1 ) {
                continue;
            }
            let ats = gen.generateFromDocument( doc, spec );
            if ( isDefined( ats ) ) {
                // console.log( 'CREATED ATS from', ats.sourceFile );
                all.push( ats );
            }
        }
        return all;
    }

}