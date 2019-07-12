import { Location } from "concordialang-types";

import { UIPropertyTypes } from "./UIPropertyTypes";
import { ContentNode } from "./Node";

export class UIPropertyReference implements ContentNode {

    nodeType: string = 'ui_property_ref';
    location: Location = null;
    content: string;

    uiElementName: string;
    property: UIPropertyTypes | string;

}