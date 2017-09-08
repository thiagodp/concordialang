import { Node } from '../../ast/Node';
import { Document } from '../../ast/Document';
import { LocatedException } from '../LocatedException';
import { Spec } from "./Spec";
import { SemanticException } from "./SemanticException";
import { Keywords } from "../Keywords";

/**
 * Analyzes a node.
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class NodeAnalyzer< T extends Node > {

    /// Controls declarations for keywords
    protected _hasDeclared = {}; // e.g.: _hasDeclared[ "keyword" ] = true

    constructor() {
        // Init _hasDeclared with all the keywords
        let keywords = Keywords.all();
        for ( let k of keywords ) {
            this._hasDeclared[ k ] = false;
        }
    }

    public abstract analyzeNodes(
        nodes: Array< Node >,
        stopAtFirstError: boolean
    ): Array< LocatedException >;


    public abstract analyzeDocuments(
        documents: Array< Node >,
        stopAtFirstError: boolean
    ): Array< LocatedException >;


    protected abstract forbiddenPriorKeywords(): string[];

    protected firstForbiddenPriorDeclaration( forbiddenPriorKeywords: Array< string > ): string | null {
        for ( let k of forbiddenPriorKeywords ) {
            if ( this._hasDeclared[ k ] ) {
                return k;
            }
        }
        return null;
    }

    protected detectForbiddenPriorDeclarations( keyword: string, errors: Array< LocatedException > ): void {
        let forbiddenPriorKeywords = this.forbiddenPriorKeywords();
        let firstKeyword = this.firstForbiddenPriorDeclaration( forbiddenPriorKeywords );
        if ( firstKeyword ) {
            let msg = 'A ' + keyword + ' must be declared before a ' + firstKeyword + '.';
            errors.push( new SemanticException( msg ) );
        }
    }
   
    
    protected analyzePosition< T extends Node >(
        current: T,
        nodes: Array< Node >,
        errors: Array< LocatedException >,
        stopAtFirstError: boolean
    ) {
        if ( stopAtFirstError && errors.length > 0 ) {
            return;
        }
        let err = this.detectInvalidPosition( current, nodes );
        if ( err ) {
            errors.push( err );
        }
    }


    protected detectInvalidPosition< T extends Node >( current: T, nodes: Array< Node > ): SemanticException {
        let keywords = this.forbiddenPriorKeywords().sort();
        for ( let node of nodes ) {
            if ( ! keywords.includes( node.keyword ) && node.location.line < current.location.line ) {
                let msg = 'A ' + current.keyword + ' must be declared before a ' + node.keyword + '.';
                return new SemanticException( msg, current.location );
            }
        }
        return null;
    }


    protected filterNodesByKeyword( nodes: Array< Node >, keyword: string ): Array< Node > {
        return nodes.filter( ( node ) => {
            return node.keyword === keyword;
        } );
    }

    protected filterNodesAboveTheLine( nodes: Array< Node >, line: number ): Array< Node > {
        return nodes.filter( ( node ) => {
            return node.location.line < line;
        } );
    }    


    protected hasDuplication( nodes: Array< Node >, propertyToCompare: string ): boolean {
        let size = // size of a set containing only the values of the property to compare
            ( new Set( nodes.map( ( node ) => { return node[ propertyToCompare ]; } ) ) ).size;
        return nodes.length > size;
    }

    protected duplicates( elements: any[] ): any[] {
        let flags = {};
        let dup = [];
        for ( let e of elements ) {
            if ( ! flags[ e ] ) {
                flags[ e ] = true;
            } else {
                dup.push( e );
            }
        }
        return dup;
    }

}