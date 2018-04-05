import { NLPUtil, NLPEntity } from "../nlp/NLPResult";
import { UIProperty } from "../ast/UIElement";
import { UIElementOperator, UIElementOperatorModifier } from "./UIElementOperator";
import { Entities } from "../nlp/Entities";

/**
 * UI Element operator checker.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementOperatorChecker {

    private readonly nlpUtil = new NLPUtil();

    isEqualTo( uip: UIProperty ): boolean {
        return this.hasOperator( uip, UIElementOperator.EQUAL_TO );
    }

    isNotEqualTo( uip: UIProperty ): boolean {
        return this.isEqualTo( uip ) && this.hasNot( uip );
    }

    isIn( uip: UIProperty ): boolean {
        return this.hasOperator( uip, UIElementOperator.IN );
    }

    isNotIn( uip: UIProperty ): boolean {
        return this.isIn( uip ) && this.hasNot( uip );
    }

    isComputedBy( uip: UIProperty ): boolean {
        return this.hasOperator( uip, UIElementOperator.COMPUTED_BY );
    }

    // Not accepted, but useful for validation
    isNotComputedBy( uip: UIProperty ): boolean {
        return this.isComputedBy( uip ) && this.hasNot( uip );
    }

    private hasOperator( uip: UIProperty, operator: string ): boolean {
        return this.nlpUtil.valuesOfEntitiesNamed( Entities.UI_CONNECTOR, uip.nlpResult )
            .indexOf( operator ) >= 0;
    }

    private hasNot( uip: UIProperty ): boolean {
        return this.nlpUtil.valuesOfEntitiesNamed( Entities.UI_CONNECTOR_MODIFIER, uip.nlpResult )
            .indexOf( UIElementOperatorModifier.NOT ) >= 0;
    }

}