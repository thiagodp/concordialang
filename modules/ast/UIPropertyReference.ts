import { UIPropertyTypes } from "./UIPropertyTypes";
import { ContentNode } from "./Node";

export class UIPropertyReference implements ContentNode {

    nodeType = 'ui_property_ref';
    location = null;
    content: string;

    uiElementName: string;
    property: UIPropertyTypes;
    propertyValue?: string | number | boolean; // possibly dynamic
}