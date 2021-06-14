import { ConstantParser } from './ConstantParser';
import { DatabasePropertyParser } from './DatabasePropertyParser';
import { RegexParser } from './RegexParser';
import { UIPropertyParser } from './UIPropertyParser';
/**
 * Parses a ListItem node and decide what node type it will be.
 *
 * @author Thiago Delgado Pinto
 */
export class ListItemParser {
    constructor() {
        this._nodeParsers = [];
        this._nodeParsers.push(new ConstantParser());
        this._nodeParsers.push(new RegexParser());
        this._nodeParsers.push(new UIPropertyParser());
        this._nodeParsers.push(new DatabasePropertyParser());
    }
    analyze(node, context, it, errors) {
        if (!it.hasPrior()) {
            return false; // Nothing to do here
        }
        for (let p of this._nodeParsers) {
            if (p.isAccepted(node, it)) {
                p.handle(node, context, it, errors);
            }
        }
        // Stay as a ListItem
        return true;
    }
}
