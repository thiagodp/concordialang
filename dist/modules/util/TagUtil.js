"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagUtil = void 0;
/**
 * Tag utilities
 *
 * @author Thiago Delgado Pinto
 */
class TagUtil {
    isNameInKeywords(tag, keywords) {
        return keywords.indexOf(tag.name.toLowerCase()) >= 0;
    }
    tagsWithNameInKeywords(tags, keywords) {
        return tags.filter((t) => this.isNameInKeywords(t, keywords));
    }
    firstContentOf(tags) {
        return (tags.length > 0) ? tags[0].content : null;
    }
    firstNumericContentOf(tags) {
        const content = this.firstContentOf(tags);
        if (content !== null) {
            const num = parseInt(content);
            return isNaN(num) ? null : num;
        }
        return null;
    }
}
exports.TagUtil = TagUtil;
