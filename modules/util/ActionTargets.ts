/**
 * Actions targets
 *
 * @author Thiago Delgado Pinto
 */
export enum ActionTargets {

    NONE         = "none"        , // web, mobile web, mobile native, desktop

    BUTTON       = "button"      , // web, mobile web, mobile native, desktop
    CHECKBOX     = "checkbox"    , // web, mobile web, mobile native, desktop
    COOKIE       = "cookie"      , // web, mobile web
    CURRENT_PAGE = "currentPage",  // web, mobile web
    CURRENT_TAG  = "currentTab"  , // web, mobile web, mobile native, desktop
    CURSOR       = "cursor"      , // web, mobile web, mobile native, desktop
    DIV          = "div"         , // web, mobile web
    FILE_INPUT   = "fileInput"   , // web, mobile web
    IMAGE        = "image"       , // web, mobile web, mobile native, desktop
    KEY          = "key"         , // web, mobile web, mobile native, desktop
    KEYBOARD     = "keyboard"    , // mobile web, mobile native
    LABEL        = "label"       , // web, mobile web, mobile native, desktop
    LI           = "li"          , // web, mobile web
    LINK         = "link"        , // web, mobile web, mobile native, desktop
    LISTBOX      = 'listbox'     , // web, mobile web, mobile native, desktop
    OTHER_TABS   = "otherTabs"   , // web, mobile web, mobile native, desktop
    PARAGRAPH    = "paragraph"   , // web, mobile web
    NATIVE       = "native"      , // mobile web, mobile native
    NEW_TAB      = "newTab"      , // web, mobile web, mobile native, desktop
    RADIO        = "radio"       , // web, mobile web, mobile native, desktop
    SCREEN       = "screen"      , // mobile web, mobile native, desktop
    SELECT       = "select"      , // web, mobile web, mobile native, desktop
    SLIDER       = "slider"      , // web, mobile web, mobile native, desktop
    SPAN         = "span"        , // web, mobile web
    TABLE        = "table"       , // web, mobile web, mobile native, desktop
    TEXT         = "text"        , // web, mobile web
    TEXTBOX      = "textbox"     , // web, mobile web, mobile native, desktop
    TEXTAREA     = "textarea"    , // web, mobile web, mobile native, desktop
    WEB          = "web"         , // mobile web, mobile native
    WINDOW       = "window"      , // web, mobile web, desktop
    UL           = "ul"          , // web, mobile web
    URL          = "url"           // web, mobile web
}

/**
 * Editable actions targets
 *
 * @author Thiago Delgado Pinto
 */
export enum EditableActionTargets {
    CHECKBOX   = "checkbox",
    FILE_INPUT = "fileInput",
    SELECT     = "select",
    TABLE      = "table",
    TEXTBOX    = "textbox",
    TEXTAREA   = "textarea"
}