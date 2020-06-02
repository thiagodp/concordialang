"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortErrorsByLocation = void 0;
function sortErrorsByLocation(errors) {
    const compare = (a, b) => {
        if (a.location && b.location) {
            // Compare the line
            let lineDiff = a.location.line - b.location.line;
            if (0 === lineDiff) { // Same line, so let's compare the column
                return a.location.column - b.location.column;
            }
            return lineDiff;
        }
        // No location, so let's compare the error type
        // If both are warnings, they are equal
        if (a.isWarning && b.isWarning) {
            return 0;
        }
        return a.isWarning ? 1 : -1;
    };
    return Array.sort(errors, compare);
}
exports.sortErrorsByLocation = sortErrorsByLocation;
