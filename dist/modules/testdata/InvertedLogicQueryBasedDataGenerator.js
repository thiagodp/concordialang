export class InvertedLogicQueryBasedDataGenerator {
    constructor(_gen) {
        this._gen = _gen;
    }
    // DATA GENERATION
    async firstElement() {
        return await this._gen.notInSet();
    }
    async secondElement() {
        return await this._gen.notInSet();
    }
    async randomElement() {
        return await this._gen.notInSet();
    }
    async penultimateElement() {
        return await this._gen.notInSet();
    }
    async lastElement() {
        return await this._gen.notInSet();
    }
    async notInSet() {
        return await this._gen.randomElement();
    }
}
