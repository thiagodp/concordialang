import { Location } from "concordialang-types";
import { ContentNode } from "./Node";
import { UIPropertyTypes } from "./UIPropertyTypes";


export class UIPropertyReference implements ContentNode {

    nodeType: string = 'ui_property_ref';
    location: Location = null;
    content: string;

    uiElementName: string;
    property: UIPropertyTypes | string;

}