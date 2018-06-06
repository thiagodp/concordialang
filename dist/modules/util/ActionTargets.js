"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Actions targets
 *
 * @author Thiago Delgado Pinto
 */
var ActionTargets;
(function (ActionTargets) {
    ActionTargets["NONE"] = "none";
    ActionTargets["APP"] = "app";
    ActionTargets["BUTTON"] = "button";
    ActionTargets["CHECKBOX"] = "checkbox";
    ActionTargets["COOKIE"] = "cookie";
    ActionTargets["CURRENT_PAGE"] = "currentPage";
    ActionTargets["CURRENT_TAG"] = "currentTab";
    ActionTargets["CURSOR"] = "cursor";
    ActionTargets["DATABASE"] = "database";
    ActionTargets["DIV"] = "div";
    ActionTargets["FILE_INPUT"] = "fileInput";
    ActionTargets["IMAGE"] = "image";
    ActionTargets["KEY"] = "key";
    ActionTargets["KEYBOARD"] = "keyboard";
    ActionTargets["LABEL"] = "label";
    ActionTargets["LI"] = "li";
    ActionTargets["LINK"] = "link";
    ActionTargets["LISTBOX"] = "listbox";
    ActionTargets["OTHER_TABS"] = "otherTabs";
    ActionTargets["PARAGRAPH"] = "paragraph";
    ActionTargets["NATIVE"] = "native";
    ActionTargets["NEW_TAB"] = "newTab";
    ActionTargets["RADIO"] = "radio";
    ActionTargets["SCREEN"] = "screen";
    ActionTargets["SELECT"] = "select";
    ActionTargets["SLIDER"] = "slider";
    ActionTargets["SPAN"] = "span";
    ActionTargets["TABLE"] = "table";
    ActionTargets["TEXT"] = "text";
    ActionTargets["TEXTBOX"] = "textbox";
    ActionTargets["TEXTAREA"] = "textarea";
    ActionTargets["TITLE"] = "title";
    ActionTargets["WEB"] = "web";
    ActionTargets["WINDOW"] = "window";
    ActionTargets["UL"] = "ul";
    ActionTargets["URL"] = "url"; // web, mobile web
})(ActionTargets = exports.ActionTargets || (exports.ActionTargets = {}));
/**
 * Editable actions targets
 *
 * @author Thiago Delgado Pinto
 */
var EditableActionTargets;
(function (EditableActionTargets) {
    EditableActionTargets["CHECKBOX"] = "checkbox";
    EditableActionTargets["FILE_INPUT"] = "fileInput";
    EditableActionTargets["SELECT"] = "select";
    EditableActionTargets["TABLE"] = "table";
    EditableActionTargets["TEXTBOX"] = "textbox";
    EditableActionTargets["TEXTAREA"] = "textarea";
})(EditableActionTargets = exports.EditableActionTargets || (exports.EditableActionTargets = {}));
