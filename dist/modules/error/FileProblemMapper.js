"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProblemMapper = void 0;
const path_transformer_1 = require("../util/file/path-transformer");
const ProblemMapper_1 = require("./ProblemMapper");
/**
 * Maps file paths to errors.
 */
class FileProblemMapper extends ProblemMapper_1.ProblemMapper {
    constructor() {
        super(true);
    }
    /** @inheritDoc */
    convertKey(key) {
        return ProblemMapper_1.GENERIC_ERROR_KEY === key ? key : path_transformer_1.toUnixPath(key);
    }
}
exports.FileProblemMapper = FileProblemMapper;
