import { UIProperty } from '../../ast';
import { Entities, NLPUtil } from '../../nlp';

export enum UIElementOperator {
    EQUAL_TO = 'equalTo',
    IN = 'in',
    COMPUTED_BY = 'computedBy'
}

export enum UIElementOperatorModifier {
    NOT = 'not'
}

/**
 * UI Element operator checker.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementOperatorChecker {

    private readonly nlpUtil = new NLPUtil();

    isEqualTo( uip: UIProperty ): boolean {
        return this.hasOperator( uip, UIElementOperator.EQUAL_TO ) && ! this.hasNot( uip );
    }

    isNotEqualTo( uip: UIProperty ): boolean {
        return this.hasOperator( uip, UIElementOperator.EQUAL_TO ) && this.hasNot( uip );
    }

    isIn( uip: UIProperty ): boolean {
        return this.hasOperator( uip, UIElementOperator.IN ) && ! this.hasNot( uip );
    }

    isNotIn( uip: UIProperty ): boolean {
        return this.hasOperator( uip, UIElementOperator.IN ) && this.hasNot( uip );
    }

    isComputedBy( uip: UIProperty ): boolean {
        return this.hasOperator( uip, UIElementOperator.COMPUTED_BY ) && ! this.hasNot( uip );
    }

    // Not accepted, but useful for validation
    isNotComputedBy( uip: UIProperty ): boolean {
        return this.hasOperator( uip, UIElementOperator.COMPUTED_BY ) && this.hasNot( uip );
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
