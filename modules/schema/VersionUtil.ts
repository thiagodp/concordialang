/**
 * Version utilities.
 * 
 * @author Thiago Delgado Pinto
 */
export class VersionUtil {

    /**
     * Returns true if the first version is compatible with the second version,
     * according to the Semantic Versioning.
     * 
     * @param first First version.
     * @param second Second version.
     */
    public areCompatibleVersions( first: string, second: string ): boolean {
        let [ firstMajor, firstMinor ] = this.extractVersionNumbers( first );
        let [ secondMajor, secondMinor ] = this.extractVersionNumbers( second );
        return firstMajor == secondMajor
            && firstMinor >= secondMinor;
    }

    /**
     * Returns the numbers of the given version.
     * 
     * @param version Version to have its numbers extracted.
     */
    public extractVersionNumbers( version: string ): number[] {
        return version.split( '.' )
            .map( s => s && /^[0-9]+$/.test( s ) ? parseInt( s ) : 0 );
    }

}