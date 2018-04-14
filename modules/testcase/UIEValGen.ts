import { UIETestPlan } from "./UIETestPlan";
import { EntityValueType } from "../ast/UIElement";

export class UIEValGen {

    /**
     * Fills the values map according to the given plans map.
     *
     * @param plans Maps uieName => UIETestPlan
     * @param values Maps uieName => EntityValueType
     */
    async fillValues(
        plans: Map< string, UIETestPlan >,
        values: Map< string, EntityValueType >
    ): Promise< void > {

    }

}