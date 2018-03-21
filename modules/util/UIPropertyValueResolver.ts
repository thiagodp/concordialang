import { UIProperty, UIElement } from "../ast/UIElement";
import { Entities } from "../nlp/Entities";
import { Constant } from "../ast/Constant";
import { isDefined } from "./TypeChecking";
import { adjustValueToTheRightType } from "./ValueTypeDetector";
import { Spec } from "../ast/Spec";
import { Node } from "../ast/Node";


export class UIPropertyValueResolver {


    async resolve(
        prop: UIProperty,
        context: ValueGenContext,
        spec: Spec
    ): Promise< string | number | boolean | any[] | null > {

        const propValue = prop.value;
        if ( ! propValue) {
            return null;
        }

        return this.resolveEntity(
            propValue.entity,
            propValue.value,
            propValue.references[ 0 ] || null,
            context
        );
    }

    async resolveEntity(
        entity: Entities,
        value: any,
        reference: Node | null,
        context: ValueGenContext
    ): Promise< string | number | boolean | any[] | null > {

        switch ( entity ) {

            case Entities.CONSTANT: {
                const constant = reference as Constant;
                if ( isDefined( constant ) ) {
                    return adjustValueToTheRightType( constant.value );
                }
                return null;
            }

            case Entities.UI_ELEMENT: {
                const uie = reference as UIElement;
                if ( isDefined( uie ) && isDefined( uie.info ) && isDefined( uie.info.fullVariableName ) ) {
                    let value = context.uieVariableToValueMap.get( uie.info.fullVariableName ) || null;
                    if ( ! isDefined( value ) ) {
                        value = await this.generateValue( uie, context );
                    }
                    return value;
                }
                return null;
            }

            case Entities.QUERY: {

            }

            // Values - were already resolved by the UIPropertyRecognizer!
            default: {
                return value;
            }
        }
    }


    async generateValue(
        uie: UIElement,
        context: ValueGenContext
    ): Promise< string | number | boolean | any[] | null > {
        return null;
    }

}


export class ValueGenContext {

    /**
     *
     * @param uieVariableToValueMap Maps a UI Element Variable to its value
     */
    constructor(
        public uieVariableToValueMap = new Map< string, string | number | boolean | any[] >()
    ) {
    }

}