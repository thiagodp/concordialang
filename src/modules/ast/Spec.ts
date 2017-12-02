import { Document } from './Document';
import * as path from 'path';
/**
 * Specification
 * 
 * @author Thiago Delgado Pinto
 */
export class Spec {

    basePath: string = null;

    docs: Document[] = [];

    constructor( basePath?: string ) {
        this.basePath = basePath;
    }

    /**
     * Returns a document with the given path.
     * 
     * Both the given path and the path of available documents are 
     * normalized with relation to the base path, if the latter exists,
     * in order to increase the chances of matching.
     * 
     * @param filePath File path.
     */
    public docWithPath( filePath: string ): Document {
        const relPath = this.basePath ? path.join( this.basePath, filePath ) : filePath;
        for ( let doc of this.docs ) {
            const relDocPath = this.basePath
                ? path.join( this.basePath, doc.fileInfo.path )
                : doc.fileInfo.path;
            if ( relPath === relDocPath ) {
                return doc;
            }
        }
        return null;
    }

}