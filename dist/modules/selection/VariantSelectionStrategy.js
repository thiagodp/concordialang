"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstMostImportantVariantSelectionStrategy = exports.SingleRandomVariantSelectionStrategy = exports.FirstVariantSelectionStrategy = exports.AllVariantsSelectionStrategy = void 0;
const RandomLong_1 = require("../testdata/random/RandomLong");
const Random_1 = require("../testdata/random/Random");
const TagUtil_1 = require("../util/TagUtil");
/**
 * Variant selection strategy in which all variants are selected
 *
 * @author Thiago Delgado Pinto
 */
class AllVariantsSelectionStrategy {
    select(variants) {
        return variants;
    }
}
exports.AllVariantsSelectionStrategy = AllVariantsSelectionStrategy;
/**
 * Variant selection strategy in which the first variant is selected
 *
 * @author Thiago Delgado Pinto
 */
class FirstVariantSelectionStrategy {
    select(variants) {
        return variants.length > 0 ? [variants[0]] : [];
    }
}
exports.FirstVariantSelectionStrategy = FirstVariantSelectionStrategy;
/**
 * Variant selection strategy in which a single variant is randomly selected
 *
 * @author Thiago Delgado Pinto
 */
class SingleRandomVariantSelectionStrategy {
    constructor(_seed) {
        this._seed = _seed;
    }
    select(variants) {
        const max = variants.length;
        if (max < 1) {
            return [];
        }
        const randomLong = new RandomLong_1.RandomLong(new Random_1.Random(this._seed));
        const index = randomLong.between(0, max - 1);
        return [variants[index]];
    }
}
exports.SingleRandomVariantSelectionStrategy = SingleRandomVariantSelectionStrategy;
/**
 * Variant selection strategy in which the first most important variant is selected.
 * The strategy considers the tag `importance` to get variants' importance value,
 * and assumes the default importance value when this tag is not declared.
 *
 * @author Thiago Delgado Pinto
 */
class FirstMostImportantVariantSelectionStrategy {
    constructor(_defaultImportance, _importanceKeywords) {
        this._defaultImportance = _defaultImportance;
        this._importanceKeywords = _importanceKeywords;
        this._tagUtil = new TagUtil_1.TagUtil();
    }
    select(variants) {
        let greaterImportanceValue = 0;
        let greaterImportanceIndex = -1;
        let index = -1;
        for (let v of variants || []) {
            ++index;
            let importance = this.importanceOf(v);
            if (importance > greaterImportanceValue) {
                greaterImportanceValue = importance;
                greaterImportanceIndex = index;
            }
        }
        return greaterImportanceIndex >= 0 ? [variants[greaterImportanceIndex]] : [];
    }
    importanceOf(variant) {
        const importance = this._tagUtil.firstNumericContentOf(this._tagUtil.tagsWithNameInKeywords(variant.tags, this._importanceKeywords));
        return null === importance ? this._defaultImportance : importance;
    }
}
exports.FirstMostImportantVariantSelectionStrategy = FirstMostImportantVariantSelectionStrategy;
