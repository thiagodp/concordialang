import { NLPResult, NLPEntity } from '../nlp/NLPResult';
import { HasItems, NamedNode } from './Node';
import { Step } from './Step';
import { MayHaveTags } from './Tag';
import { ListItem } from './ListItem';
import { Table } from './Table';
import { Constant } from './Constant';
import { Database } from './Database';
import { Entities } from '../nlp/Entities';

/**
 * UI element node.
 *
 * @author Thiago Delgado Pinto
 */
export interface UIElement extends NamedNode, MayHaveTags {
    items: UIProperty[];
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

export class EntityValue {

    /**
     *
     * @param entity Entity
     * @param value Recognized value, e.g., "SELECT * FROM [MyDB].[Foo]"
     * @param references References found in the value, e.g., the database [MyDB] and the table [Foo].
     */
    constructor(
        public entity: Entities,
        public value: null | string | number | boolean | any[],
        public references: EntityRef[] = [],
    ) {
    }
}

export class EntityRef {

    /**
     *
     * @param entity Entity, e.g., database
     * @param node Referenced node, that can have references to other objects.
     */
    constructor(
        public entity: Entities, // e.g. Database
        public node: null | UIElement | Database | Constant | Table = null
    ) {
    }
}