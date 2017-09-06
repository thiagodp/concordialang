import { Import } from '../ast/Import';
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";

/**
 * Import parser.
 * 
 * @author Thiago Delgado Pinto
 */
export class ImportParser implements NodeParser< Import > {

    /** @inheritDoc */
    analyze(
        node: Import,
        context: ParsingContext,
        it: NodeIterator,
        errors: Error[]
    ): boolean {
        return true;
    }
}