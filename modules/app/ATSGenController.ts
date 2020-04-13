import { AbstractTestScript } from "concordialang-plugin";
import { Document } from "../ast/Document";
import { AugmentedSpec } from "../req/AugmentedSpec";
import { AbstractTestScriptGenerator } from "../testscript/AbstractTestScriptGenerator";
import { isDefined } from "../util/TypeChecking";

/**
 * Abstract Test Script Generation Controller
 */
export class ATSGenController {

    generate( docs: Document[], spec: AugmentedSpec ): AbstractTestScript[] {

        const all: AbstractTestScript[] = [];
        const gen = new AbstractTestScriptGenerator();

        for ( const doc of docs || [] ) {

            // Only test cases allowed
            if ( ! doc.testCases || doc.testCases.length < 1 ) {
                continue;
            }

            const ats = gen.generateFromDocument( doc, spec );
            if ( isDefined( ats ) ) {
                // console.log( 'CREATED ATS from', ats.sourceFile );
                all.push( ats );
            }
        }

        return all;
    }

}