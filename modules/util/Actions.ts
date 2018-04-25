/**
 * Actions
 *
 * @author Thiago Delgado Pinto
 */
export enum Actions {
    AM_IN           = "amIn"          , // web, mobile web
    APPEND          = "append"        , // web, mobile web, mobile native, desktop
    ATTACH_FILE     = "attachFile"    , // web, mobile web
    CHECK           = "check"         , // web, mobile web, mobile native, desktop
    CLEAR           = "clear"         , // web, mobile web, mobile native, desktop
    CLICK           = "click"         , // web, mobile web, mobile native, desktop
    CLOSE           = "close"         , // web, mobile web, mobile native, desktop
    DOUBLE_CLICK    = "doubleClick"   , // web, mobile web, mobile native, desktop
    DRAG            = "drag"          , // web, mobile web, mobile native, desktop
    DROP            = "drop"          , // web, mobile web, mobile native, desktop
    FILL            = "fill"          , // web, mobile web, mobile native, desktop
    HIDE            = "hide"          , // web, mobile web, mobile native, desktop
    MOVE            = "move"          , // web, mobile web, mobile native, desktop
    MOUSE_OUT       = "mouseOut"      , // web, mobile web, desktop
    MOUSE_OVER      = "mouseOver"     , // web, mobile web, desktop
    OPEN            = "open"          , // web, mobile web, mobile native, desktop
    PRESS           = "press"         , // web, mobile web, mobile native, desktop
    REFRESH         = "refresh"       , // web, mobile web
    RESIZE          = "resize"        , // web, mobile web, mobile native, desktop
    RIGHT_CLICK     = "rightClick"    , // web, mobile web, desktop
    SAVE_SCREENSHOT = "saveScreenshot", // web, mobile web, mobile native, desktop
    SCROLL_TO       = "scrollTo"      , // web, mobile web, mobile native, desktop
    SEE             = "see"           , // web, mobile web, mobile native, desktop
    SELECT          = "select"        , // web, mobile web, mobile native, desktop
    SHOW            = "show"          , // web, mobile web, mobile native, desktop
    SWIPE           = "swipe"         , // mobile web, mobile native
    SWITCH          = "switch"        , // mobile web, mobile native
    TAP             = "tap"           , // mobile web, mobile native
    UNCHECK         = "uncheck"       , // web, mobile web, mobile native, desktop
    WAIT            = "wait"            // web, mobile web, mobile native, desktop
}