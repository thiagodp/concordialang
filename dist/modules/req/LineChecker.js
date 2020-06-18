"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Line checker
 *
 * @author Thiago Delgado Pinto
 */
class LineChecker {
    isEmpty(line) {
        return 0 === line.trim().length;
    }
    countLeftSpacesAndTabs(line) {
        let i = 0, len = line.length, found = true, ch;
        while (i < len && found) {
            ch = line.charAt(i++);
            found = (' ' == ch || "\t" == ch);
        }
        return i - 1;
    }
    caseInsensitivePositionOf(text, line) {
        return line.toLowerCase().indexOf(text.toLowerCase());
    }
    textAfterSeparator(separator, line) {
        let i = line.indexOf(separator);
        return i >= 0 && i < (line.length - 1) ? line.substr(i + 1) : '';
    }
    textBeforeSeparator(separator, line) {
        let i = line.indexOf(separator);
        return i > 0 ? line.substring(0, i) : '';
    }
}
exports.LineChecker = LineChecker;
