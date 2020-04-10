"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Defaults_1 = require("../app/Defaults");
const Tag_1 = require("../ast/Tag");
const TagUtil_1 = require("../util/TagUtil");
const TypeChecking_1 = require("../util/TypeChecking");
const FilterCriterion_1 = require("./FilterCriterion");
class CriteriaMatcher {
    constructor(_ignoreKeywords = [Tag_1.ReservedTags.IGNORE], _importanceKeywords = [Tag_1.ReservedTags.IMPORTANCE], _defaultImportanceValue = (new Defaults_1.Defaults()).IMPORTANCE) {
        this._ignoreKeywords = _ignoreKeywords;
        this._importanceKeywords = _importanceKeywords;
        this._defaultImportanceValue = _defaultImportanceValue;
        this._tagUtil = new TagUtil_1.TagUtil();
    }
    /**
     * Returns true whether the given criteria are match.
     *
     * @param criteria Criteria to be applied.
     * @param nodeTags Node tags.
     * @param nodeName Node name, e.g., feature name, scenario name, variant name, etc.
     */
    matches(criteria, nodeTags, nodeName) {
        // No filter ? Matches.
        if (0 === criteria.size) {
            return true;
        }
        const hasTags = nodeTags.length > 0;
        // An Importance value is considered even if the node has no Importance tag defined.
        // The node assumes a default Importance value.
        let tagImportanceValue = hasTags
            ? this.importanceValue(nodeTags) || this._defaultImportanceValue
            : this._defaultImportanceValue;
        // Whether the criterion is established, ignore those with @ignore
        if (hasTags
            && criteria.has(FilterCriterion_1.FilterCriterion.IGNORE_TAG_NOT_DECLARED)
            && this.hasIgnoreTag(nodeTags)) {
            return false; // Does not match, i.e., has ignore tag
        }
        const importanceCriterionPrefix = 'importance';
        for (let [criterion, value] of criteria) {
            // Importance
            const criterionIsAboutImportance = criterion.toString().startsWith(importanceCriterionPrefix);
            if (criterionIsAboutImportance) {
                const val = TypeChecking_1.isString(value) ? parseInt(value.toString()) : Number(value);
                switch (criterion) {
                    case FilterCriterion_1.FilterCriterion.IMPORTANCE_GTE: return tagImportanceValue >= val;
                    case FilterCriterion_1.FilterCriterion.IMPORTANCE_LTE: return tagImportanceValue <= val;
                    case FilterCriterion_1.FilterCriterion.IMPORTANCE_EQ: return tagImportanceValue == val;
                }
            }
            if (hasTags) {
                // Tag keyword
                switch (criterion) {
                    case FilterCriterion_1.FilterCriterion.TAG_EQ:
                        return this._tagUtil.tagsWithNameInKeywords(nodeTags, [value.toString()]).length > 0;
                    case FilterCriterion_1.FilterCriterion.TAG_NEQ:
                        return 0 === this._tagUtil.tagsWithNameInKeywords(nodeTags, [value.toString()]).length;
                    case FilterCriterion_1.FilterCriterion.TAG_IN:
                        return this._tagUtil.tagsWithNameInKeywords(nodeTags, value).length > 0;
                    case FilterCriterion_1.FilterCriterion.TAG_NOT_IN:
                        return this._tagUtil.tagsWithNameInKeywords(nodeTags, value).length < 1;
                }
            }
            // Node name
            switch (criterion) {
                case FilterCriterion_1.FilterCriterion.NAME_EQ:
                    return nodeName.toLowerCase() === value.toString().toLowerCase();
                case FilterCriterion_1.FilterCriterion.NAME_STARTING_WITH:
                    return nodeName.toLowerCase().startsWith(value.toString().toLowerCase());
                case FilterCriterion_1.FilterCriterion.NAME_ENDING_WITH:
                    return nodeName.toLowerCase().endsWith(value.toString().toLowerCase());
                case FilterCriterion_1.FilterCriterion.NAME_CONTAINING:
                    return nodeName.toLowerCase().indexOf(value.toString().toLowerCase()) >= 0;
            }
        }
        return false;
    }
    importanceValue(tags) {
        return this._tagUtil.firstNumericContentOf(this._tagUtil.tagsWithNameInKeywords(tags, this._importanceKeywords));
    }
    hasIgnoreTag(tags) {
        const filtered = this._tagUtil.tagsWithNameInKeywords(tags, this._ignoreKeywords);
        return filtered.length > 0;
    }
}
exports.CriteriaMatcher = CriteriaMatcher;
