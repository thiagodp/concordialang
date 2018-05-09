"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvertedLogicListBasedDataGenerator {
    /**
     * Constructor
     *
     * @param _gen List-based data generator
     */
    constructor(_gen) {
        this._gen = _gen;
    }
    // DATA GENERATION
    firstElement() {
        return this._gen.notInSet();
    }
    secondElement() {
        return this._gen.notInSet();
    }
    randomElement() {
        return this._gen.notInSet();
    }
    penultimateElement() {
        return this._gen.notInSet();
    }
    lastElement() {
        return this._gen.notInSet();
    }
    notInSet() {
        return this._gen.randomElement();
    }
}
exports.InvertedLogicListBasedDataGenerator = InvertedLogicListBasedDataGenerator;
//# sourceMappingURL=InvertedLogicListBasedDataGenerator.js.map