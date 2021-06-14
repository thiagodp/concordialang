/**
 * Specification
 *
 * @author Thiago Delgado Pinto
 */
export class Spec {
    constructor(basePath) {
        this.basePath = null;
        this.docs = [];
        this.basePath = basePath || process.cwd();
    }
}
