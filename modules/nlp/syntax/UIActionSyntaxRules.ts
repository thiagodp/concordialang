import { Actions } from '../../util/Actions';
import { Entities } from '../Entities';
import { SyntaxRule } from './SyntaxRule';

const UI_ACTION_RULE: SyntaxRule = {
    minTargets: 1,
    maxTargets: 1,
    targets: [ Entities.VALUE, Entities.UI_ELEMENT_REF, Entities.UI_LITERAL ],
    // Other action or actions that must be used together.
    // mustBeUsedWith: []
};

UI_ACTION_RULE[ Entities.UI_ELEMENT_REF ] = { min: 1, max: 999 };
UI_ACTION_RULE[ Entities.UI_LITERAL ] = { min: 1, max: 999 };
UI_ACTION_RULE[ Entities.UI_PROPERTY_REF ] = { min: 1, max: 999 };
UI_ACTION_RULE[ Entities.VALUE ] = { min: 1, max: 999 };
UI_ACTION_RULE[ Entities.NUMBER ] = { min: 1, max: 999 };
UI_ACTION_RULE[ Entities.CONSTANT ] = { min: 1, max: 999 };
UI_ACTION_RULE[ Entities.STATE ] = { min: 1, max: 1 };
UI_ACTION_RULE[ Entities.COMMAND ] = { min: 1, max: 1 };

/**
 * Default syntax rule for UI Actions.
 *
 * @author Thiago Delgado Pinto
 */
export const DEFAULT_UI_ACTION_SYNTAX_RULE: SyntaxRule = UI_ACTION_RULE;


// ACTIONS


const ACCEPT: SyntaxRule = {
    name: Actions.ACCEPT,
    minTargets: 0,
    maxTargets: 0,
};


const AM_ON: SyntaxRule = {
    name: Actions.AM_ON,
    minTargets: 1,
    maxTargets: 1,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};


const APPEND: SyntaxRule = {
    name: Actions.APPEND,
    minTargets: 1,
    maxTargets: 999,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};

APPEND[ Entities.VALUE ] = { min: 0, max: 1 };
APPEND[ Entities.NUMBER ] = { min: 0, max: 1 };
APPEND[ Entities.CONSTANT ] = { min: 0, max: 1 };
APPEND[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 1 };


const ATTACH_FILE: SyntaxRule = {
    name: Actions.ATTACH_FILE,
    minTargets: 1,
    maxTargets: 2,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        // Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};


const CANCEL: SyntaxRule = {
    name: Actions.CANCEL,
    minTargets: 0,
    maxTargets: 0,
};


const CHECK: SyntaxRule = {
    name: Actions.CHECK,
    minTargets: 1,
    maxTargets: 2,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};

CHECK[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 2 };
CHECK[ Entities.UI_LITERAL ] = { min: 0, max: 2 };
CHECK[ Entities.VALUE ] = { min: 0, max: 1 };
CHECK[ Entities.NUMBER ] = { min: 0, max: 1 };
CHECK[ Entities.CONSTANT ] = { min: 0, max: 1 };
CHECK[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 1 };


const CLEAR: SyntaxRule = {
    name: Actions.CLEAR,
    minTargets: 1,
    maxTargets: 999,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE, // when cookie
        Entities.NUMBER, // when cookie
        Entities.CONSTANT, // when cookie
        Entities.UI_PROPERTY_REF, // when cookie
    ]
};

CLEAR[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 999 };
CLEAR[ Entities.UI_LITERAL ] = { min: 0, max: 999 };
CLEAR[ Entities.VALUE ] = { min: 0, max: 1 };
CLEAR[ Entities.NUMBER ] = { min: 0, max: 1 };
CLEAR[ Entities.CONSTANT ] = { min: 0, max: 1 };
CLEAR[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 1 };


const CLICK: SyntaxRule = {
    name: Actions.CLICK,
    minTargets: 1,
    maxTargets: 999,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};

CLICK[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 999 };
CLICK[ Entities.UI_LITERAL ] = { min: 0, max: 999 };
CLICK[ Entities.VALUE ] = { min: 0, max: 1 };
CLICK[ Entities.NUMBER ] = { min: 0, max: 1 };
CLICK[ Entities.CONSTANT ] = { min: 0, max: 1 };
CLICK[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 1 };


const CLOSE: SyntaxRule = {
    name: Actions.CLOSE,
    minTargets: 0
};


const CONNECT: SyntaxRule = {
    name: Actions.CONNECT,
    minTargets: 0,
    maxTargets: 1, // Concordia will transform into 2 when converting to the plugin
    targets: [
        Entities.CONSTANT
    ]
};

CONNECT[ Entities.CONSTANT ] = { min: 1, max: 1 };


const DISCONNECT: SyntaxRule = {
    name: Actions.DISCONNECT,
    minTargets: 0,
    maxTargets: 1,
    targets: [
        Entities.CONSTANT
    ]
};

DISCONNECT[ Entities.CONSTANT ] = { min: 1, max: 1 };


const DOUBLE_CLICK: SyntaxRule = {
    ...CLICK,
    name: Actions.DOUBLE_CLICK
};


const DRAG: SyntaxRule = {
    name: Actions.DRAG,
    minTargets: 2,
    maxTargets: 2,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL
    ]
};


const FILL: SyntaxRule = {
    name: Actions.FILL,
    minTargets: 1,
    maxTargets: 999,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};

FILL[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 999 };
FILL[ Entities.UI_LITERAL ] = { min: 0, max: 999 };
FILL[ Entities.VALUE ] = { min: 0, max: 1 };
FILL[ Entities.NUMBER ] = { min: 0, max: 1 };
FILL[ Entities.CONSTANT ] = { min: 0, max: 1 };
FILL[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 1 };


const HIDE: SyntaxRule = {
    name: Actions.HIDE,
    minTargets: 0,
};


const INSTALL: SyntaxRule = {
    name: Actions.INSTALL,
    minTargets: 1,
    maxTargets: 1,
    targets: [
        Entities.VALUE,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF
    ]
};


const MAXIMIZE: SyntaxRule = {
    name: Actions.MAXIMIZE,
    minTargets: 0,
};


const MOVE: SyntaxRule = {
    name: Actions.MOVE,
    minTargets: 1,
    maxTargets: 3,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};

MOVE[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 1 };
MOVE[ Entities.UI_LITERAL ] = { min: 0, max: 1 };
MOVE[ Entities.VALUE ] = { min: 0, max: 2 };
MOVE[ Entities.NUMBER ] = { min: 0, max: 2 };
MOVE[ Entities.CONSTANT ] = { min: 0, max: 2 };
MOVE[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 2 };


const MOUSE_OUT: SyntaxRule = {
    ...CLICK,
    name: Actions.MOUSE_OUT
};


const MOUSE_OVER: SyntaxRule = {
    ...CLICK,
    name: Actions.MOUSE_OVER
};


const OPEN: SyntaxRule = {
    name: Actions.OPEN,
    minTargets: 0
};


const PRESS: SyntaxRule = {
    name: Actions.PRESS,
    minTargets: 1,
    maxTargets: 6,
    targets: [
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
    ]
};


const PULL: SyntaxRule = {
    name: Actions.PULL,
    minTargets: 2,
    maxTargets: 2,
    targets: [
        Entities.VALUE,
        Entities.CONSTANT,
    ]
};


const REFRESH: SyntaxRule = {
    name: Actions.REFRESH,
    minTargets: 0
};


const REMOVE: SyntaxRule = {
    name: Actions.REMOVE,
    minTargets: 1,
    maxTargets: 1,
    targets: [
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF
    ]
};


const RESIZE: SyntaxRule = {
    name: Actions.RESIZE,
    minTargets: 2,
    maxTargets: 2,
    targets: [
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
    ]
};


const RIGHT_CLICK: SyntaxRule = {
    ...CLICK,
    name: Actions.RIGHT_CLICK
};


const ROTATE: SyntaxRule = {
    name: Actions.ROTATE,
    minTargets: 2,
    maxTargets: 2,
    targets: [
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
    ]
};


const RUN: SyntaxRule = {
    name: Actions.RUN,
    minTargets: 1,
    maxTargets: 2,
    targets: [
        Entities.VALUE,
        Entities.CONSTANT,
        Entities.COMMAND
    ]
};

RUN[ Entities.VALUE ] = { min: 0, max: 1 };
RUN[ Entities.CONSTANT ] = { min: 0, max: 1 };
RUN[ Entities.COMMAND ] = { min: 0, max: 1 };


const SAVE_SCREENSHOT: SyntaxRule = {
    name: Actions.SAVE_SCREENSHOT,
    minTargets: 1,
    maxTargets: 1,
    targets: [
        Entities.VALUE,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF
    ]
};


const SCROLL_TO: SyntaxRule = {
    name: Actions.SCROLL_TO,
    minTargets: 1,
    maxTargets: 1,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};

SCROLL_TO[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 1 };
SCROLL_TO[ Entities.UI_LITERAL ] = { min: 0, max: 1 };
SCROLL_TO[ Entities.VALUE ] = { min: 0, max: 1 };
SCROLL_TO[ Entities.NUMBER ] = { min: 0, max: 1 };
SCROLL_TO[ Entities.CONSTANT ] = { min: 0, max: 1 };
SCROLL_TO[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 1 };


const SEE: SyntaxRule = {
    name: Actions.SEE,
    minTargets: 0, // zero since it allows ui options that are not targets
    maxTargets: 3,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};

SEE[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 1 };
SEE[ Entities.UI_LITERAL ] = { min: 0, max: 1 };
SEE[ Entities.VALUE ] = { min: 0, max: 2 };
SEE[ Entities.NUMBER ] = { min: 0, max: 2 };
SEE[ Entities.CONSTANT ] = { min: 0, max: 2 };
SEE[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 1 };


const SELECT: SyntaxRule = {
    name: Actions.SELECT,
    minTargets: 1,
    maxTargets: 2,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};

SELECT[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 1 };
SELECT[ Entities.UI_LITERAL ] = { min: 0, max: 1 };
SELECT[ Entities.VALUE ] = { min: 0, max: 1 };
SELECT[ Entities.NUMBER ] = { min: 0, max: 1 };
SELECT[ Entities.CONSTANT ] = { min: 0, max: 1 };
SELECT[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 1 };


const SHAKE: SyntaxRule = {
    name: Actions.SHAKE,
    minTargets: 0
};


const SWIPE: SyntaxRule = {
    name: Actions.SWIPE,
    minTargets: 1,
    maxTargets: 5,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};

SWIPE[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 2 };
SWIPE[ Entities.UI_LITERAL ] = { min: 0, max: 2 };
SWIPE[ Entities.VALUE ] = { min: 0, max: 3 };
SWIPE[ Entities.NUMBER ] = { min: 0, max: 3 };
SWIPE[ Entities.CONSTANT ] = { min: 0, max: 3 };
SWIPE[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 3 };


const SWITCH: SyntaxRule = {
    name: Actions.SWITCH,
    minTargets: 0,
    maxTargets: 3,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ]
};

SWITCH[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 3 };
SWITCH[ Entities.UI_LITERAL ] = { min: 0, max: 3 };


const TAP: SyntaxRule = {
    ...CLICK,
    name: Actions.TAP
};


const UNCHECK: SyntaxRule = {
    ...CHECK,
    name: Actions.UNCHECK
};


const UNINSTALL: SyntaxRule = {
    ...INSTALL,
    name: Actions.UNINSTALL
};

const WAIT: SyntaxRule = {
    name: Actions.WAIT,
    minTargets: 1,
    maxTargets: 3,
    targets: [
        Entities.UI_ELEMENT_REF,
        Entities.UI_LITERAL,
        Entities.VALUE,
        Entities.NUMBER,
        Entities.CONSTANT,
        Entities.UI_PROPERTY_REF,
    ],
};

WAIT[ Entities.UI_ELEMENT_REF ] = { min: 0, max: 1 };
WAIT[ Entities.UI_LITERAL ] = { min: 0, max: 1 };
WAIT[ Entities.VALUE ] = { min: 0, max: 2 };
WAIT[ Entities.NUMBER ] = { min: 0, max: 2 };
WAIT[ Entities.CONSTANT ] = { min: 0, max: 2 };
WAIT[ Entities.UI_PROPERTY_REF ] = { min: 0, max: 2 };


/**
 * Syntax rules for the supported UI Actions.
 *
 * Every rule overwrites DEFAULT_UI_ACTION_SYNTAX_RULE.
 *
 * @author Thiago Delgado Pinto
 */
export const UI_ACTION_SYNTAX_RULES: Array< SyntaxRule > = [
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
