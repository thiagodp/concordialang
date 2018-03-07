import { UIElement } from "../ast/UIElement";
import { Document } from "../ast/Document";
import { Spec } from "../ast/Spec";
import { DataTestCase } from "../testdata/DataTestCase";

export class UIElementValueGenerator {

    async generate(
        tc: DataTestCase,
        uiElement: UIElement,
        doc: Document,
        spec: Spec
    ): Promise< string | number > {
        return '';
    }

}