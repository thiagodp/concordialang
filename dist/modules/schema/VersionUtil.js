"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Version utilities.
 *
 * @author Thiago Delgado Pinto
 */
class VersionUtil {
    /**
     * Returns true if the first version is compatible with the second version,
     * according to the Semantic Versioning.
     *
     * @param first First version.
     * @param second Second version.
     */
    areCompatibleVersions(first, second) {
        let [firstMajor, firstMinor] = this.extractVersionNumbers(first);
        let [secondMajor, secondMinor] = this.extractVersionNumbers(second);
        return firstMajor == secondMajor
            && firstMinor >= secondMinor;
    }
    /**
     * Returns the numbers of the given version.
     *
     * @param version Version to have its numbers extracted.
     */
    extractVersionNumbers(version) {
        return version.split('.')
            .map(s => s && /^[0-9]+$/.test(s) ? parseInt(s) : 0);
    }
}
exports.VersionUtil = VersionUtil;
//# sourceMappingURL=VersionUtil.js.map