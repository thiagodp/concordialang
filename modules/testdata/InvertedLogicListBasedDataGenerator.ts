import { ListBasedDataGenerator } from "./ListBasedDataGenerator";
import { RandomLong } from "./random/RandomLong";
import { RawDataGenerator } from "./raw/RawDataGenerator";

export class InvertedLogicListBasedDataGenerator< T > {

    private readonly _gen: ListBasedDataGenerator< T >;

    /**
     * Constructor
     *
     * @param _random Random number generator.
     * @param _rawDataGenerator Raw data generator.
     * @param _values Values.
     * @param _maxTries Max tries to generate a value that is not in the set.
     */
    constructor(
        private _random: RandomLong,
        private _rawDataGenerator: RawDataGenerator< T >,
        private _values: T[],
        private _maxTries: number = 10
    ) {
        this._gen = new ListBasedDataGenerator< T >( _random, _rawDataGenerator, _values, _maxTries );
    }

    // DATA GENERATION

    public firstElement(): T | null {
        return this.notInSet();
    }

    public secondElement(): T | null {
        return this.notInSet();
    }

    public randomElement(): T | null {
        return this.notInSet();
    }

    public penultimateElement(): T | null {
        return this.notInSet();
    }

    public lastElement(): T | null {
        return this.notInSet();
    }

    public notInSet(): T | null {
        return this.randomElement();
    }

}