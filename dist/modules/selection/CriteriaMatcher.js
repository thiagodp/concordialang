import { DEFAULT_IMPORTANCE } from '../app/default-options';
import { ReservedTags } from '../ast/Tag';
import { TagUtil } from './TagUtil';
import { isString } from '../util/type-checking';
import { FilterCriterion } from './FilterCriterion';
export class CriteriaMatcher {
    constructor(_ignoreKeywords = [ReservedTags.IGNORE], _importanceKeywords = [ReservedTags.IMPORTANCE], _defaultImportanceValue = DEFAULT_IMPORTANCE) {
        this._ignoreKeywords = _ignoreKeywords;
        this._importanceKeywords = _importanceKeywords;
        this._defaultImportanceValue = _defaultImportanceValue;
        this._tagUtil = new TagUtil();
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
            && criteria.has(FilterCriterion.IGNORE_TAG_NOT_DECLARED)
            && this.hasIgnoreTag(nodeTags)) {
            return false; // Does not match, i.e., has ignore tag
        }
        const importanceCriterionPrefix = 'importance';
        for (let [criterion, value] of criteria) {
            // Importance
            const criterionIsAboutImportance = criterion.toString().startsWith(importanceCriterionPrefix);
            if (criterionIsAboutImportance) {
                const val = isString(value) ? parseInt(value.toString()) : Number(value);
                switch (criterion) {
                    case FilterCriterion.IMPORTANCE_GTE: return tagImportanceValue >= val;
                    case FilterCriterion.IMPORTANCE_LTE: return tagImportanceValue <= val;
                    case FilterCriterion.IMPORTANCE_EQ: return tagImportanceValue == val;
                }
            }
            if (hasTags) {
                // Tag keyword
                switch (criterion) {
                    case FilterCriterion.TAG_EQ:
                        return this._tagUtil.tagsWithNameInKeywords(nodeTags, [value.toString()]).length > 0;
                    case FilterCriterion.TAG_NEQ:
                        return 0 === this._tagUtil.tagsWithNameInKeywords(nodeTags, [value.toString()]).length;
                    case FilterCriterion.TAG_IN:
                        return this._tagUtil.tagsWithNameInKeywords(nodeTags, value).length > 0;
                    case FilterCriterion.TAG_NOT_IN:
                        return this._tagUtil.tagsWithNameInKeywords(nodeTags, value).length < 1;
                }
            }
            // Node name
            switch (criterion) {
                case FilterCriterion.NAME_EQ:
                    return nodeName.toLowerCase() === value.toString().toLowerCase();
                case FilterCriterion.NAME_STARTING_WITH:
                    return nodeName.toLowerCase().startsWith(value.toString().toLowerCase());
                case FilterCriterion.NAME_ENDING_WITH:
                    return nodeName.toLowerCase().endsWith(value.toString().toLowerCase());
                case FilterCriterion.NAME_CONTAINING:
                    return nodeName.toLowerCase().indexOf(value.toString().toLowerCase()) >= 0;
            }
        }
        return false;
    }
    importanceValue(tags) {
        return this._tagUtil.numericContentOfTheFirstTag(this._tagUtil.tagsWithNameInKeywords(tags, this._importanceKeywords));
    }
    hasIgnoreTag(tags) {
        const filtered = this._tagUtil.tagsWithNameInKeywords(tags, this._ignoreKeywords);
        return filtered.length > 0;
    }
}
