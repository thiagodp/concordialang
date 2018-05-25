"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns true if the one of the given tags has the given name.
 *
 * @param name Tag name
 * @param tags Tags where to find
 */
function hasTagNamed(name, tags) {
    return !!tags.find(tag => tag.name === name);
}
exports.hasTagNamed = hasTagNamed;
function tagsWithAnyOfTheNames(tags, names) {
    return tags.filter(t => names.indexOf(t.name.toLowerCase()) >= 0);
}
exports.tagsWithAnyOfTheNames = tagsWithAnyOfTheNames;
