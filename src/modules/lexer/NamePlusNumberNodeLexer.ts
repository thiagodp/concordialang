import { KeywordBasedLexer } from './KeywordBasedLexer';
import { Feature } from '../ast/Feature';
import { LocatedException } from '../req/LocatedException';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { Expressions } from '../req/Expressions';
import { Symbols } from '../req/Symbols';
import { Node, NamedNode } from '../ast/Node';
import { LineChecker } from "../req/LineChecker";
import { LexicalException } from "../req/LexicalException";
import { NamedNodeLexer } from './NamedNodeLexer';

const XRegExp = require( 'xregexp' );

/**
 * Detects a node in the format "keyword number: name" (e.g. "variant 1: buy with credit card").
 * 
 * @author Thiago Delgado Pinto
 */
export class NamePlusNumberNodeLexer< T extends NamedNode > extends NamedNodeLexer< T > {

    constructor( _words: Array< string >, _nodeType: string ) {
        super( _words, _nodeType );
    }

    protected makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + words.join( '|' ) + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.AN_INTEGER_NUMBER + '?' // optional
            + this.separator()
            + Expressions.ANYTHING; // the name
    }
    
}