/**
 * Tag utilities
 *
 * @author Thiago Delgado Pinto
 */
export class TagUtil {
    isNameInKeywords(tag, keywords) {
        return keywords.indexOf(tag.name.toLowerCase()) >= 0;
    }
    tagsWithNameInKeywords(tags, keywords) {
        return tags.filter((t) => this.isNameInKeywords(t, keywords));
    }
    contentOfTheFirstTag(tags) {
        return (tags.length > 0) ? tags[0].content : null;
    }
    numericContentOfTheFirstTag(tags) {
        const content = this.contentOfTheFirstTag(tags);
        if (content !== null) {
            const num = parseInt(content);
            return isNaN(num) ? null : num;
        }
        return null;
    }
}
