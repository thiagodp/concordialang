import { Actions } from "./Actions";
import { ActionTargets } from "./ActionTargets";

/**
 * Maps an action to its default target. This is useful in cases in which
 * a UI Element is not defined, but just a UI Literal, and the UI Element type
 * or action target must be defined.
 *
 * @author Thiago Delgado Pinto
 */
export const ACTION_TARGET_MAP = new Map< string, string >(
    [
        [ Actions.AM_ON           , ActionTargets.URL          ],
        [ Actions.APPEND          , ActionTargets.LISTBOX      ],
        [ Actions.ATTACH_FILE     , ActionTargets.DIV          ],
        [ Actions.CHECK           , ActionTargets.CHECKBOX     ],
        [ Actions.CLEAR           , ActionTargets.TEXTBOX      ],
        [ Actions.CLICK           , ActionTargets.BUTTON       ],
        [ Actions.CLOSE           , ActionTargets.WINDOW       ],
        [ Actions.DOUBLE_CLICK    , ActionTargets.IMAGE        ],
        [ Actions.DRAG            , ActionTargets.IMAGE        ],
        [ Actions.DROP            , ActionTargets.IMAGE        ],
        [ Actions.FILL            , ActionTargets.TEXTBOX      ],
        [ Actions.HIDE            , ActionTargets.TEXTBOX      ],
        [ Actions.MOVE            , ActionTargets.CURSOR       ],
        [ Actions.MOUSE_OUT       , ActionTargets.CURSOR       ],
        [ Actions.MOUSE_OVER      , ActionTargets.CURSOR       ],
        [ Actions.OPEN            , ActionTargets.URL          ],
        [ Actions.PRESS           , ActionTargets.KEY          ],
        [ Actions.REFRESH         , ActionTargets.CURRENT_PAGE ],
        [ Actions.RESIZE          , ActionTargets.WINDOW       ],
        [ Actions.RIGHT_CLICK     , ActionTargets.IMAGE        ],
        [ Actions.SAVE_SCREENSHOT , ActionTargets.NONE         ],
        [ Actions.SCROLL_TO       , ActionTargets.CURRENT_PAGE ],
        [ Actions.SEE             , ActionTargets.TEXT         ],
        [ Actions.SELECT          , ActionTargets.SELECT       ],
        [ Actions.SHOW            , ActionTargets.WINDOW       ],
        [ Actions.SWIPE           , ActionTargets.SCREEN       ],
        [ Actions.SWITCH          , ActionTargets.NATIVE       ],
        [ Actions.TAP             , ActionTargets.BUTTON       ],
        [ Actions.UNCHECK         , ActionTargets.CHECKBOX     ],
        [ Actions.WAIT            , ActionTargets.TEXT         ]
    ]
 );