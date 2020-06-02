"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDuplicated = void 0;
/**
 * Remove duplicated items from contiguous arrays with same type.
 *
 * @author Thiago Delgado Pinto
 */
function removeDuplicated(arr, areEqual = (a, b) => a === b) {
    let removeCount = 0;
    for (let end = arr.length; end >= 0; --end) {
        const down = arr[end];
        if (undefined === down) {
            continue;
        }
        for (let d = end - 1; d >= 0; --d) {
            const prior = arr[d];
            if (prior !== undefined && areEqual(down, prior)) {
                arr.splice(end, 1);
                ++removeCount;
                break;
            }
        }
    }
    return removeCount;
}
exports.removeDuplicated = removeDuplicated;
