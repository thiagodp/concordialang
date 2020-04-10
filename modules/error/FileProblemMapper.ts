import { toUnixPath } from '../util/file/path-transformer';
import { ProblemMapper, GENERIC_ERROR_KEY } from './ProblemMapper';

/**
 * Maps file paths to errors.
 */
export class FileProblemMapper extends ProblemMapper {

    constructor() {
        super( true );
    }

    /** @inheritDoc */
    protected convertKey( key: string ): string {
        return GENERIC_ERROR_KEY === key ? key : toUnixPath( key );
    }
}