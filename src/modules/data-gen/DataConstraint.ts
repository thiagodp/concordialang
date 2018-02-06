export enum DataConstraintType {

    // value: VALUE, ELEMENT_REF, QUERY, COMPUTATION
    MIN_VALUE,
    MAX_VALUE,
    EQUAL_TO,
    NOT_EQUAL_TO,    

    // length: VALUE, ELEMENT_REF, QUERY, COMPUTATION
    MIN_LENGTH,
    MAX_LENGTH,

    // required: VALUE, ELEMENT_REF, QUERY, COMPUTATION
    REQUIRED,

    // format: VALUE, QUERY
    FORMAT,

    // set: VALUE_LIST, QUERY
    IN,
    NOT_IN,

    // computation: COMPUTATION
    COMPUTED_BY

}

export enum DataConstraintTarget {
    VALUE,
    VALUE_LIST,
    ELEMENT_REF,
    REGEX,
    QUERY,
    COMPUTATION
}

export class DataConstraint {
    type: DataConstraintType;
    target: DataConstraintTarget;
    // Value after replacements or validations. It can also be an array.
    // E.g.: query after replacements, array of strings, etc.
    value: any;
}