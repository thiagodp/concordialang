/**
 * Reserved tags.
 *
 * @author Thiago Delgado Pinto
 */
export var ReservedTags;
(function (ReservedTags) {
    ReservedTags["GENERATED"] = "generated";
    ReservedTags["FAIL"] = "fail";
    ReservedTags["FEATURE"] = "feature";
    ReservedTags["SCENARIO"] = "scenario";
    ReservedTags["VARIANT"] = "variant";
    ReservedTags["GLOBAL"] = "global";
    ReservedTags["IGNORE"] = "ignore";
    ReservedTags["IMPORTANCE"] = "importance";
    ReservedTags["GENERATE_ONLY_VALID_VALUES"] = "generate-only-valid-values"; // example: @generate-only-valid-values
})(ReservedTags || (ReservedTags = {}));
/**
 * Returns true if the one of the given tags has the given name.
 *
 * @param name Tag name
 * @param tags Tags where to find
 */
export function hasTagNamed(name, tags) {
    return !!tags.find(tag => tag.name === name);
}
export function tagsWithAnyOfTheNames(tags, names) {
    return tags.filter(t => names.indexOf(t.name.toLowerCase()) >= 0);
}
