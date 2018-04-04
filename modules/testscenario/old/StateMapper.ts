import { Document } from "../../ast/Document";
import { Feature } from "../../ast/Feature";
import { Scenario } from "../../ast/Scenario";
import { Variant } from "../../ast/Variant";
import { Spec } from "../../ast/Spec";
import { State } from "../../ast/VariantLike";
import { Import } from "../../ast/Import";
import { TestScenario } from "./TestScenario";
import { VariantRefWithTestScenarios } from "./VariantRefWithTestScenarios";


export class StateMapper {

    private _cache = new Map< Document, VariantRefWithTestScenarios[] >();

    add( ref: VariantRefWithTestScenarios ) {
        let refs: VariantRefWithTestScenarios[] = this._cache.get( ref.doc ) || null;
        if ( null === refs ) {
            this._cache.set( ref.doc, [ ref ] );
        } else {
            refs.push( ref );
        }
    }

    stateProducersInDocument( stateName: string, doc: Document ): VariantRefWithTestScenarios[] {
        let refs: VariantRefWithTestScenarios[] = this._cache.get( doc ) || null;
        if ( null === refs ) {
            return [];
        }
        return refs.filter( sr => sr.hasPostconditionNamed( stateName ) );
    }

    stateProducersFromImports( stateName: string, imports: Import[], spec: Spec ): VariantRefWithTestScenarios[] {
        let refs: VariantRefWithTestScenarios[] = [];
        for ( let imp of imports ) {
            let importedDoc = spec.docWithPath( imp.resolvedPath );
            if ( ! importedDoc ) {
                continue;
            }
            let foundRefs = this.stateProducersInDocument( stateName, importedDoc );
            if ( foundRefs.length > 0 ) {
                refs.push.apply( refs, foundRefs );
            }
        }
        return refs;
    }

}