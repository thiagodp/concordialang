"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegexParser_1 = require("./RegexParser");
const ConstantParser_1 = require("./ConstantParser");
const UIPropertyParser_1 = require("./UIPropertyParser");
const DatabasePropertyParser_1 = require("./DatabasePropertyParser");
/**
 * Parses a ListItem node and decide what node type it will be.
 *
 * @author Thiago Delgado Pinto
 */
class ListItemParser {
    constructor() {
        this._nodeParsers = [];
        this._nodeParsers.push(new ConstantParser_1.ConstantParser());
        this._nodeParsers.push(new RegexParser_1.RegexParser());
        this._nodeParsers.push(new UIPropertyParser_1.UIPropertyParser());
        this._nodeParsers.push(new DatabasePropertyParser_1.DatabasePropertyParser());
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
exports.ListItemParser = ListItemParser;
