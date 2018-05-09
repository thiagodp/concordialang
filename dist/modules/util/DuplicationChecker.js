"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SemanticException_1 = require("../semantic/SemanticException");
// TO-DO: remove the following dependencies:
const chalk_1 = require("chalk");
const logSymbols = require("log-symbols");
/**
 * Duplication checker.
 *
 * @author Thiago Delgado Pinto
 */
class DuplicationChecker {
    /**
     * Returns true whether the given items have the given property duplicated.
     *
     * @param items Items to check
     * @param propertyToCompare Property to compare
     */
    hasDuplication(items, propertyToCompare) {
        let size = (new Set(items.map((item) => { return item[propertyToCompare]; }))).size;
        return items.length > size;
    }
    /**
     * Returns the duplicated items.
     *
     * @param items Items to check
     */
    duplicates(items) {
        let flags = {};
        let dup = [];
        for (let e of items) {
            if (!flags[e]) {
                flags[e] = true;
            }
            else {
                dup.push(e);
            }
        }
        return dup;
    }
    /**
     * Returns the items with the given duplicated property.
     *
     * @param items Items to check
     * @param propertyToCompare Property to compare
     */
    withDuplicatedProperty(items, propertyToCompare) {
        let flags = {};
        let dup = [];
        for (let item of items) {
            if (!item[propertyToCompare]) {
                continue;
            }
            let prop = item[propertyToCompare];
            if (!flags[prop]) {
                flags[prop] = true;
            }
            else {
                dup.push(item);
            }
        }
        return dup;
    }
    /**
     * Returns a map containg the value of the property to compare as a key and
     * the duplicated items as an array.
     *
     * Example: `[ { id: 1, name: 'foo' }, { id: 2, name: 'foo' } ], { id: 3, name: 'bar' } ]`
     *
     * will return `{ 'foo': [ { id: 1, name: 'foo' }, { id: 2, name: 'foo' } ] }`.
     *
     * @param items Items to compare
     * @param propertyToCompare Property to compare
     * @return map
     */
    mapDuplicates(items, propertyToCompare) {
        let map = {};
        for (let item of items) {
            if (!item[propertyToCompare]) {
                continue;
            }
            let value = item[propertyToCompare];
            if (!map[value]) {
                map[value] = [item];
            }
            else {
                map[value].push(item);
            }
        }
        // Removing not duplicated ones
        for (let prop in map) {
            if (map[prop].length < 2) {
                delete map[prop];
            }
        }
        return map;
    }
    /**
     * Check nodes with duplicated names, adding exceptions to the given array when
     * they are found.
     *
     * @param nodes Nodes to check.
     * @param errors Errors found.
     * @param nodeName Node name to compose the exception message.
     * @returns A object map in the format returned by `mapDuplicates()`
     */
    checkDuplicatedNamedNodes(nodes, errors, nodeName) {
        if (nodes.length < 1) {
            return;
        }
        let makeNodeLocationStr = function (node) {
            return "\n  " + logSymbols.error + " (" + node.location.line + ',' + node.location.column + ') ' +
                node.location.filePath || '';
        };
        const map = this.mapDuplicates(nodes, 'name');
        for (let prop in map) {
            let duplicatedNodes = map[prop];
            let msg = 'Duplicated ' + nodeName + ' "' + prop + '" in: ' +
                chalk_1.default.white(duplicatedNodes.map(node => makeNodeLocationStr(node)).join(', '));
            let err = new SemanticException_1.SemanticException(msg);
            errors.push(err);
        }
        return map;
    }
}
exports.DuplicationChecker = DuplicationChecker;
//# sourceMappingURL=DuplicationChecker.js.map