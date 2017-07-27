import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { LocatedException } from '../LocatedException';
import { Spec } from "../ast/Spec";

/**
 * Analyzes a node.
 */
export interface NodeAnalyzer< T extends Node > {

    analyzeInDocument(
        current: T,
        doc: Document,
        errors: Array< LocatedException >,
        stopOnTheFirstError: boolean
    ): void;

    analyzeInSpec(
        current: T,
        spec: Spec,
        errors: Array< LocatedException >,
        stopOnTheFirstError: boolean
    ): void;

}