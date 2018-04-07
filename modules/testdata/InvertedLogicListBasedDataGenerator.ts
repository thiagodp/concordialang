import { ListBasedDataGenerator } from "./ListBasedDataGenerator";

export class InvertedLogicListBasedDataGenerator< T > {

    /**
     * Constructor
     *
     * @param _gen List-based data generator
     */
    constructor(
        private readonly _gen: ListBasedDataGenerator< T >
    ) {
    }

    // DATA GENERATION

    public firstElement(): T | null {
        return this._gen.notInSet();
    }

    public secondElement(): T | null {
        return this._gen.notInSet();
    }

    public randomElement(): T | null {
        return this._gen.notInSet();
    }

    public penultimateElement(): T | null {
        return this._gen.notInSet();
    }

    public lastElement(): T | null {
        return this._gen.notInSet();
    }

    public notInSet(): T | null {
        return this._gen.randomElement();
    }

}