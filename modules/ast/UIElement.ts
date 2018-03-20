import { NLPResult, NLPEntity } from '../nlp/NLPResult';
import { HasItems, NamedNode, Node } from './Node';
import { Step } from './Step';
import { MayHaveTags } from './Tag';
import { ListItem } from './ListItem';
import { Table } from './Table';
import { Constant } from './Constant';
import { Database } from './Database';
import { Entities } from '../nlp/Entities';
import { NodeTypes } from '../req/NodeTypes';
import { Feature } from './Feature';
import { Document } from './Document';

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

    values: EntityValue[];
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
        public feature: Feature = null
    ) {
    }

    isGlobal(): boolean {
        return ! this.feature;
    }
}


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
        public value: null | string | number | boolean | any[],
        public references: Node[] = []
    ) {
    }
}