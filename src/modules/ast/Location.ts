/**
 * Location
 * 
 * @author Thiago Delgado Pinto
 */
export interface Location {
    line: number;
    column: number;
    filePath?: string; // Not needed for local declarations
}