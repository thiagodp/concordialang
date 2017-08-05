/**
 * Token
 * 
 * @author Thiago Delgado Pinto
 */
export interface Token {
    type: string,
    value: string,
    line: number,
    deferred: boolean,

    keyword?: string,
    ident?: number,
    tags?: string[],

    // additional information to steps
    keywordType?: string,
    text?: string,

    // table
    columns?: string[]
}