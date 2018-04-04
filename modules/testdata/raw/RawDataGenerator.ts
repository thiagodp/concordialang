/**
 * Raw data generator
 *
 * @author Thiago Delgado Pinto
 */
export interface RawDataGenerator< T > {

    lowest(): T;

    randomBelowMin(): T;

    justBelowMin(): T;

    min(): T;

    justAboveMin(): T;

    zero(): T;

    median(): T;

    randomBetweenMinAndMax(): T;

    justBelowMax(): T;

    max(): T;

    justAboveMax(): T;

    randomAboveMax(): T;

    greatest(): T;

}