"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI_ACTION_SYNTAX_RULES = exports.DEFAULT_UI_ACTION_SYNTAX_RULE = void 0;
const Actions_1 = require("../../util/Actions");
const Entities_1 = require("../Entities");
const UI_ACTION_RULE = {
    minTargets: 1,
    maxTargets: 1,
    targets: [Entities_1.Entities.VALUE, Entities_1.Entities.UI_ELEMENT_REF, Entities_1.Entities.UI_LITERAL],
};
UI_ACTION_RULE[Entities_1.Entities.UI_ELEMENT_REF] = { min: 1, max: 999 };
UI_ACTION_RULE[Entities_1.Entities.UI_LITERAL] = { min: 1, max: 999 };
UI_ACTION_RULE[Entities_1.Entities.UI_PROPERTY_REF] = { min: 1, max: 999 };
UI_ACTION_RULE[Entities_1.Entities.VALUE] = { min: 1, max: 999 };
UI_ACTION_RULE[Entities_1.Entities.NUMBER] = { min: 1, max: 999 };
UI_ACTION_RULE[Entities_1.Entities.CONSTANT] = { min: 1, max: 999 };
UI_ACTION_RULE[Entities_1.Entities.STATE] = { min: 1, max: 1 };
UI_ACTION_RULE[Entities_1.Entities.COMMAND] = { min: 1, max: 1 };
/**
 * Default syntax rule for UI Actions.
 *
 * @author Thiago Delgado Pinto
 */
exports.DEFAULT_UI_ACTION_SYNTAX_RULE = UI_ACTION_RULE;
// ACTIONS
const ACCEPT = {
    name: Actions_1.Actions.ACCEPT,
    minTargets: 0,
    maxTargets: 0,
};
const AM_ON = {
    name: Actions_1.Actions.AM_ON,
    minTargets: 1,
    maxTargets: 1,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
const APPEND = {
    name: Actions_1.Actions.APPEND,
    minTargets: 1,
    maxTargets: 999,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
APPEND[Entities_1.Entities.VALUE] = { min: 0, max: 1 };
APPEND[Entities_1.Entities.NUMBER] = { min: 0, max: 1 };
APPEND[Entities_1.Entities.CONSTANT] = { min: 0, max: 1 };
APPEND[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 1 };
const ATTACH_FILE = {
    name: Actions_1.Actions.ATTACH_FILE,
    minTargets: 1,
    maxTargets: 2,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        // Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
const CANCEL = {
    name: Actions_1.Actions.CANCEL,
    minTargets: 0,
    maxTargets: 0,
};
const CHECK = {
    name: Actions_1.Actions.CHECK,
    minTargets: 1,
    maxTargets: 2,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
CHECK[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 2 };
CHECK[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 2 };
CHECK[Entities_1.Entities.VALUE] = { min: 0, max: 1 };
CHECK[Entities_1.Entities.NUMBER] = { min: 0, max: 1 };
CHECK[Entities_1.Entities.CONSTANT] = { min: 0, max: 1 };
CHECK[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 1 };
const CLEAR = {
    name: Actions_1.Actions.CLEAR,
    minTargets: 1,
    maxTargets: 999,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
CLEAR[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 999 };
CLEAR[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 999 };
CLEAR[Entities_1.Entities.VALUE] = { min: 0, max: 1 };
CLEAR[Entities_1.Entities.NUMBER] = { min: 0, max: 1 };
CLEAR[Entities_1.Entities.CONSTANT] = { min: 0, max: 1 };
CLEAR[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 1 };
const CLICK = {
    name: Actions_1.Actions.CLICK,
    minTargets: 1,
    maxTargets: 999,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
CLICK[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 999 };
CLICK[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 999 };
CLICK[Entities_1.Entities.VALUE] = { min: 0, max: 1 };
CLICK[Entities_1.Entities.NUMBER] = { min: 0, max: 1 };
CLICK[Entities_1.Entities.CONSTANT] = { min: 0, max: 1 };
CLICK[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 1 };
const CLOSE = {
    name: Actions_1.Actions.CLOSE,
    minTargets: 0
};
const CONNECT = {
    name: Actions_1.Actions.CONNECT,
    minTargets: 0,
    maxTargets: 1,
    targets: [
        Entities_1.Entities.CONSTANT
    ]
};
CONNECT[Entities_1.Entities.CONSTANT] = { min: 1, max: 1 };
const DISCONNECT = {
    name: Actions_1.Actions.DISCONNECT,
    minTargets: 0,
    maxTargets: 1,
    targets: [
        Entities_1.Entities.CONSTANT
    ]
};
DISCONNECT[Entities_1.Entities.CONSTANT] = { min: 1, max: 1 };
const DOUBLE_CLICK = Object.assign(Object.assign({}, CLICK), { name: Actions_1.Actions.DOUBLE_CLICK });
const DRAG = {
    name: Actions_1.Actions.DRAG,
    minTargets: 2,
    maxTargets: 2,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL
    ]
};
const FILL = {
    name: Actions_1.Actions.FILL,
    minTargets: 1,
    maxTargets: 999,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
FILL[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 999 };
FILL[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 999 };
FILL[Entities_1.Entities.VALUE] = { min: 0, max: 1 };
FILL[Entities_1.Entities.NUMBER] = { min: 0, max: 1 };
FILL[Entities_1.Entities.CONSTANT] = { min: 0, max: 1 };
FILL[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 1 };
const HIDE = {
    name: Actions_1.Actions.HIDE,
    minTargets: 0,
};
const INSTALL = {
    name: Actions_1.Actions.INSTALL,
    minTargets: 1,
    maxTargets: 1,
    targets: [
        Entities_1.Entities.VALUE,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF
    ]
};
const MAXIMIZE = {
    name: Actions_1.Actions.MAXIMIZE,
    minTargets: 0,
};
const MOVE = {
    name: Actions_1.Actions.MOVE,
    minTargets: 1,
    maxTargets: 3,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
MOVE[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 1 };
MOVE[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 1 };
MOVE[Entities_1.Entities.VALUE] = { min: 0, max: 2 };
MOVE[Entities_1.Entities.NUMBER] = { min: 0, max: 2 };
MOVE[Entities_1.Entities.CONSTANT] = { min: 0, max: 2 };
MOVE[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 2 };
const MOUSE_OUT = Object.assign(Object.assign({}, CLICK), { name: Actions_1.Actions.MOUSE_OUT });
const MOUSE_OVER = Object.assign(Object.assign({}, CLICK), { name: Actions_1.Actions.MOUSE_OVER });
const OPEN = {
    name: Actions_1.Actions.OPEN,
    minTargets: 0
};
const PRESS = {
    name: Actions_1.Actions.PRESS,
    minTargets: 1,
    maxTargets: 6,
    targets: [
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
    ]
};
const PULL = {
    name: Actions_1.Actions.PULL,
    minTargets: 2,
    maxTargets: 2,
    targets: [
        Entities_1.Entities.VALUE,
        Entities_1.Entities.CONSTANT,
    ]
};
const REFRESH = {
    name: Actions_1.Actions.REFRESH,
    minTargets: 0
};
const REMOVE = {
    name: Actions_1.Actions.REMOVE,
    minTargets: 1,
    maxTargets: 1,
    targets: [
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF
    ]
};
const RESIZE = {
    name: Actions_1.Actions.RESIZE,
    minTargets: 2,
    maxTargets: 2,
    targets: [
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
    ]
};
const RIGHT_CLICK = Object.assign(Object.assign({}, CLICK), { name: Actions_1.Actions.RIGHT_CLICK });
const ROTATE = {
    name: Actions_1.Actions.ROTATE,
    minTargets: 2,
    maxTargets: 2,
    targets: [
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
    ]
};
const RUN = {
    name: Actions_1.Actions.RUN,
    minTargets: 1,
    maxTargets: 2,
    targets: [
        Entities_1.Entities.VALUE,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.COMMAND
    ]
};
RUN[Entities_1.Entities.VALUE] = { min: 0, max: 1 };
RUN[Entities_1.Entities.CONSTANT] = { min: 0, max: 1 };
RUN[Entities_1.Entities.COMMAND] = { min: 0, max: 1 };
const SAVE_SCREENSHOT = {
    name: Actions_1.Actions.SAVE_SCREENSHOT,
    minTargets: 1,
    maxTargets: 1,
    targets: [
        Entities_1.Entities.VALUE,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF
    ]
};
const SCROLL_TO = {
    name: Actions_1.Actions.SCROLL_TO,
    minTargets: 1,
    maxTargets: 1,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
SCROLL_TO[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 1 };
SCROLL_TO[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 1 };
SCROLL_TO[Entities_1.Entities.VALUE] = { min: 0, max: 1 };
SCROLL_TO[Entities_1.Entities.NUMBER] = { min: 0, max: 1 };
SCROLL_TO[Entities_1.Entities.CONSTANT] = { min: 0, max: 1 };
SCROLL_TO[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 1 };
const SEE = {
    name: Actions_1.Actions.SEE,
    minTargets: 0,
    maxTargets: 3,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
SEE[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 1 };
SEE[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 1 };
SEE[Entities_1.Entities.VALUE] = { min: 0, max: 2 };
SEE[Entities_1.Entities.NUMBER] = { min: 0, max: 2 };
SEE[Entities_1.Entities.CONSTANT] = { min: 0, max: 2 };
SEE[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 1 };
const SELECT = {
    name: Actions_1.Actions.SELECT,
    minTargets: 1,
    maxTargets: 2,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
SELECT[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 1 };
SELECT[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 1 };
SELECT[Entities_1.Entities.VALUE] = { min: 0, max: 1 };
SELECT[Entities_1.Entities.NUMBER] = { min: 0, max: 1 };
SELECT[Entities_1.Entities.CONSTANT] = { min: 0, max: 1 };
SELECT[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 1 };
const SHAKE = {
    name: Actions_1.Actions.SHAKE,
    minTargets: 0
};
const SWIPE = {
    name: Actions_1.Actions.SWIPE,
    minTargets: 1,
    maxTargets: 5,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
SWIPE[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 2 };
SWIPE[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 2 };
SWIPE[Entities_1.Entities.VALUE] = { min: 0, max: 3 };
SWIPE[Entities_1.Entities.NUMBER] = { min: 0, max: 3 };
SWIPE[Entities_1.Entities.CONSTANT] = { min: 0, max: 3 };
SWIPE[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 3 };
const SWITCH = {
    name: Actions_1.Actions.SWITCH,
    minTargets: 0,
    maxTargets: 3,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ]
};
SWITCH[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 3 };
SWITCH[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 3 };
const TAP = Object.assign(Object.assign({}, CLICK), { name: Actions_1.Actions.TAP });
const UNCHECK = Object.assign(Object.assign({}, CHECK), { name: Actions_1.Actions.UNCHECK });
const UNINSTALL = Object.assign(Object.assign({}, INSTALL), { name: Actions_1.Actions.UNINSTALL });
const WAIT = {
    name: Actions_1.Actions.WAIT,
    minTargets: 1,
    maxTargets: 3,
    targets: [
        Entities_1.Entities.UI_ELEMENT_REF,
        Entities_1.Entities.UI_LITERAL,
        Entities_1.Entities.VALUE,
        Entities_1.Entities.NUMBER,
        Entities_1.Entities.CONSTANT,
        Entities_1.Entities.UI_PROPERTY_REF,
    ],
};
WAIT[Entities_1.Entities.UI_ELEMENT_REF] = { min: 0, max: 1 };
WAIT[Entities_1.Entities.UI_LITERAL] = { min: 0, max: 1 };
WAIT[Entities_1.Entities.VALUE] = { min: 0, max: 2 };
WAIT[Entities_1.Entities.NUMBER] = { min: 0, max: 2 };
WAIT[Entities_1.Entities.CONSTANT] = { min: 0, max: 2 };
WAIT[Entities_1.Entities.UI_PROPERTY_REF] = { min: 0, max: 2 };
/**
 * Syntax rules for the supported UI Actions.
 *
 * Every rule overwrites DEFAULT_UI_ACTION_SYNTAX_RULE.
 *
 * @author Thiago Delgado Pinto
 */
exports.UI_ACTION_SYNTAX_RULES = [
    ACCEPT,
    AM_ON,
    APPEND,
    ATTACH_FILE,
    CANCEL,
    CHECK,
    CLEAR,
    CLICK,
    CLOSE,
    CONNECT,
    DISCONNECT,
    DOUBLE_CLICK,
    DRAG,
    FILL,
    HIDE,
    INSTALL,
    MAXIMIZE,
    MOVE,
    MOUSE_OUT,
    MOUSE_OVER,
    OPEN,
    PRESS,
    PULL,
    REFRESH,
    REMOVE,
    RESIZE,
    RIGHT_CLICK,
    ROTATE,
    RUN,
    SAVE_SCREENSHOT,
    SCROLL_TO,
    SEE,
    SELECT,
    SHAKE,
    SWIPE,
    SWITCH,
    TAP,
    UNCHECK,
    UNINSTALL,
    WAIT,
];
