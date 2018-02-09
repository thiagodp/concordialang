/**
 * Limits for string values.
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class StringLimits {
    static MIN: number = 0;
    static MAX: number = 32767; // max short
    // Since MAX can produce very long strings for testing purposes, we are also defining
    // a "usual" maximum length value.
    static MAX_USUAL: number = 127; // max byte
}