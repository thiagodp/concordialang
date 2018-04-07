import { QueryBasedDataGenerator } from "./QueryBasedDataGenerator";

export class InvertedLogicQueryBasedDataGenerator< T > {

    constructor(
        private readonly _gen: QueryBasedDataGenerator< T >
    ) {
    }

    // DATA GENERATION

    public async firstElement(): Promise< T | null > {
        return await this._gen.notInSet();
    }

    public async secondElement(): Promise< T | null > {
        return await this._gen.notInSet();
    }

    public async randomElement(): Promise< T | null > {
        return await this._gen.notInSet();
    }

    public async penultimateElement(): Promise< T | null > {
        return await this._gen.notInSet();
    }

    public async lastElement(): Promise< T | null > {
        return await this._gen.notInSet();
    }

    public async notInSet(): Promise< T | null > {
        return await this._gen.randomElement();
    }

}