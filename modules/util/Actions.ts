/**
 * Actions
 *
 * @author Thiago Delgado Pinto
 */
export enum Actions {
    AM_ON           = "amOn"          , // web, mobile web
    APPEND          = "append"        , // web, mobile web, mobile native, desktop
    ATTACH_FILE     = "attachFile"    , // web, mobile web
    CHECK           = "check"         , // web, mobile web, mobile native, desktop
    CLEAR           = "clear"         , // web, mobile web, mobile native, desktop
    CLICK           = "click"         , // web, mobile web, mobile native, desktop
    CLOSE           = "close"         , // web, mobile web, mobile native, desktop
    CONNECT         = "connect"       , // any -> test event
    DISCONNECT      = "disconnect"    , // any -> test event
    DOUBLE_CLICK    = "doubleClick"   , // web, mobile web, mobile native, desktop
    DRAG            = "drag"          , // web, mobile web, mobile native, desktop
    FILL            = "fill"          , // web, mobile web, mobile native, desktop
    HIDE            = "hide"          , // web, mobile web, mobile native, desktop
    MAXIMIZE        = "maximize"      , // web, desktop
    MOVE            = "move"          , // web, mobile web, mobile native, desktop
    MOUSE_OUT       = "mouseOut"      , // web, mobile web, desktop
    MOUSE_OVER      = "mouseOver"     , // web, mobile web, desktop
    OPEN            = "open"          , // web, mobile web, mobile native, desktop
    PRESS           = "press"         , // web, mobile web, mobile native, desktop
    PULL            = "pull"          , // mobile web, mobile native
    REFRESH         = "refresh"       , // web, mobile web
    REMOVE          = "remove"        , // web, mobile web, mobile native
    RESIZE          = "resize"        , // web, mobile web, mobile native, desktop
    ROTATE          = "remove"        , // mobile web, mobile native
    RIGHT_CLICK     = "rightClick"    , // web, mobile web, desktop
    SAVE_SCREENSHOT = "saveScreenshot", // web, mobile web, mobile native, desktop
    SCROLL_TO       = "scrollTo"      , // web, mobile web, mobile native, desktop
    RUN             = "run"           , // mobile web, mobile native
    SEE             = "see"           , // web, mobile web, mobile native, desktop
    SELECT          = "select"        , // web, mobile web, mobile native, desktop
    SHAKE           = 'shake'         , // mobile web, mobile native
    SHOW            = "show"          , // web, mobile web, mobile native, desktop
    SWIPE           = "swipe"         , // mobile web, mobile native
    SWITCH          = "switch"        , // mobile web, mobile native
    TAP             = "tap"           , // mobile web, mobile native
    UNCHECK         = "uncheck"       , // web, mobile web, mobile native, desktop
    WAIT            = "wait"            // web, mobile web, mobile native, desktop
}