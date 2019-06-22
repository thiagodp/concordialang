import { Document } from './Document';

/**
 * Specification
 *
 * @author Thiago Delgado Pinto
 */
export class Spec {

    public basePath: string = null;

    public docs: Document[] = [];

    constructor( basePath?: string ) {
        this.basePath = basePath || process.cwd();
    }

}