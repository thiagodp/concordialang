// TO-DO: see FunTester rules

export interface RuleCond {

    operator:
          'eq'   // equal
        | 'neq'  // not equal
        | 'lt'   // less than
        | 'lte'  // less than or equal to
        | 'gt'   // greater than
        | 'gte'  // greater than or equal to
        | 'bw'   // between
        | 'nbw'  // not between
        | 'in'   // in
        | 'nin'  // not in
        | 'lk'   // like
        | 'nlk'  // not like
        | 'st'   // starting with
        | 'nst'  // not starting with
        | 'en'   // ending with
        | 'nen'  // not ending with
        | 'co'   // containing
        | 'nco'  // not containing
        ;

    target:
          'val' // value
        | 'uie' // name of a user interface element
        | 'qry' // name of a query
        | 'rex' // regular expression
        | 'ren' // name of a regular expression
        ;

    content: string | number | Array< string | number >; // e.g. 50, [ 2, 60 ], "name", [ "bob", "suzan", "joe" ]

    // Only when target = 'uie'
    property?: string; // e.g. "length", "value", "format" (regex), "color", "fgcolor", "bgcolor", ...

    // Only when target = 'qry'
    targetColumn?: string; // e.g. "city"

    // Conditions are OR'ed
    // e.g.: bw val [ 1, 5 ]  OR bw val [ 10, 15 ]  OR eq uie "total" value
    or: Array< RuleCond >;
}

export interface RuleDef {
    property: string; // e.g. "length", "value", "format" (regex), "color", "fgcolor", "bgcolor", ...
    condition: RuleCond;
}

export interface SharedRule {
    name: string; // e.g. "person name"
    defs: Array< RuleDef >;
}

// Rule sample 1: (incomplete)
// ```
// Rules:
//   - "name" length must be between 2 and 60, otherwise < steps ??? >
//   - "name" color must be "yellow" on enter
//   - "name" color must be "white" on leave
//   - "dateOfBirth" value must be less than or equal to eighteen years ago
// ```
export interface Rule {

    uiElementName: string; // e.g. "name"

    // The use of "defs" and "sharedRule" is exclusive (xor)
    defs?: Array< RuleDef >;
    sharedRule?: SharedRule;
}