import { Entities } from '../nlp/Entities';
import { NLPResult } from '../nlp/NLPResult';
import { Document } from './Document';
import { Feature } from './Feature';
import { ListItem } from './ListItem';
import { NamedNode, Node } from './Node';
import { Step } from './Step';
import { MayHaveTags } from './Tag';

/**
 * UI element node.
 *
 * @author Thiago Delgado Pinto
 */
export interface UIElement extends NamedNode, MayHaveTags {
    items: UIProperty[];

    info?: UIElementInfo; // information added during the semantic analyzis
}

/**
 * UI property node.
 *
 * @author Thiago Delgado Pinto
 */
export interface UIProperty extends ListItem {

    otherwiseSentences: Step[];

    //
    // Recognized after NLP
    //

    nlpResult: NLPResult; // Raw NLP result

    property: string; // UI Property, e.g., min value comes from "SELECT ..." --> minvalue

    //valueTarget: UIValueTarget; // Target, e.g., min value comes from "SELECT ..." --> query

    // Each UIProperty is in the format <property> ... <entity>, so just one value is expected.
    value: EntityValue;
}


/**
 * Additional information about an UI element.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementInfo {

    /**
     *
     * @param document Document in which the UI element was declared
     * @param uiLiteral Literal
     * @param feature Feature where the UI Element was declared. A `null` value denotes a *global* UI Element.
     */
    constructor(
        public document: Document = null,
        public uiLiteral: string = null,
        public feature: Feature = null,
        public fullVariableName: string = null
    ) {
    }

    isGlobal(): boolean {
        return ! this.feature;
    }
}

export type EntityValueType = null | string | number | boolean | any[];

/**
 * Recognized value of an entity.
 *
 * @author Thiago Delgado Pinto
 */
export class EntityValue {

    /**
     *
     * @param entity Entity
     * @param value Recognized value, e.g., "SELECT * FROM [MyDB].[Foo]"
     * @param references References nodes, e.g., the database [MyDB] and the table [Foo].
     */
    constructor(
        public entity: Entities,
        public value: EntityValueType,
        public references: Node[] = []
    ) {
    }
}