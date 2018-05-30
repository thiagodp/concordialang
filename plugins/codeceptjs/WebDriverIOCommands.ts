import { CmdCmp, CmdCfg } from "./CommandMapper";

/** Maps available commands. ORDER MATTERS */
export const WEB_DRIVER_IO_COMMANDS: CmdCfg[] = [
    // AM_ON
    { action: 'amOn', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'url', template: 'I.amOnPage({{{target}}});' },
    { action: 'amOn', comp: CmdCmp.ONE_VALUE, template: 'I.amOnPage({{{value}}});' },
    // APPEND
    { action: 'append', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.appendField({{{target}}}, {{{value}}});' },
    // ATTACH_FILE
    { action: 'attachFile', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.attachFile({{{target}}}, {{{value}}});' },
    // CHECK
    { action: 'check', comp: CmdCmp.ONE_TARGET, template: 'I.checkOption({{{target}}});' },
    { action: 'check', comp: CmdCmp.ONE_VALUE, template: 'I.checkOption({{{value}}});' },
    // CLEAR
    { action: 'clear', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'cookie', template: 'I.clearCookie({{{target}}});' },
    { action: 'clear', comp: CmdCmp.ONE_TARGET, template: 'I.clearField({{{target}}});' },
    // CLICK
    { action: 'click', comp: CmdCmp.ONE_TARGET, template: 'I.click({{{target}}});' },
    { action: 'click', comp: CmdCmp.ONE_VALUE, template: 'I.click({{{value}}});' },
    // CLOSE
    { action: 'close', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'currentTab', template: 'I.closeCurrentTab();' },
    { action: 'close', comp: CmdCmp.SAME_OPTION, options: [ 'currentTab' ], template: 'I.closeCurrentTab();' },

    { action: 'close', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'otherTabs', template: 'I.closeOtherTabs();' },
    { action: 'close', comp: CmdCmp.SAME_OPTION, options: [ 'otherTabs' ], template: 'I.closeOtherTabs();' },
    // DOUBLE_CLICK
    { action: 'doubleClick', comp: CmdCmp.ONE_TARGET, template: 'I.doubleClick({{{target}}});' },
    { action: 'doubleClick', comp: CmdCmp.ONE_VALUE, template: 'I.doubleClick({{{value}}});' },
    // DRAG
    { action: 'drag', comp: CmdCmp.TWO_TARGETS, template: 'I.dragAndDrop({{{target}}});' },
    // FILL
    { action: 'fill', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.fillField({{{target}}}, {{{value}}});' },
    // MOVE
    { action: 'move', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: [ 'cursor' ], template: 'I.moveCursorTo({{{target}}});' },
    // PRESS
    { action: 'press', comp: CmdCmp.ONE_VALUE_OR_ARRAY, template: 'I.pressKey({{{value}}});' },
    // RIGHT_CLICK
    { action: 'rightClick', comp: CmdCmp.ONE_TARGET, template: 'I.rightClick({{{target}}});' },
    { action: 'rightClick', comp: CmdCmp.ONE_VALUE, template: 'I.rightClick({{{value}}});' },
    // SAVE_SCREENSHOT
    { action: 'saveScreenshot', comp: CmdCmp.ONE_VALUE, template: 'I.saveScreenshot({{{value}}});' },
    // SEE
    { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textbox', template: 'I.seeInField({{{target}}}, {{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textarea', template: 'I.seeInField({{{target}}}, {{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textbox', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textarea', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },

    { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER, targetType: 'checkbox', options: [ 'checked' ], template: 'I.seeCheckboxIsChecked({{{target}}});' },
    { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER, targetType: 'checkbox', options: [ 'checked' ], modifier: 'not', template: 'I.dontSeeCheckboxIsChecked({{{target}}});' },

    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'cookie', template: 'I.seeCookie({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'cookie', modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'cookie' ], template: 'I.seeCookie({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'cookie' ], modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },

    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'title', template: 'I.seeInTitle({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'title', modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'title' ], template: 'I.seeInTitle({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'title' ], modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },

    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'url', template: 'I.seeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'url', modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'url' ], template: 'I.seeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: [ 'url' ], modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },

    { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_MODIFIER, template: 'I.seeElement({{{target}}});' },
    { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_MODIFIER, modifier: 'not', template: 'I.dontSeeElement({{{target}}});' },

    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_MODIFIER, template: 'I.see({{{value}}});' },
    { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_MODIFIER, modifier: 'not', template: 'I.dontSee({{{value}}});' },
    // SELECT
    { action: 'select', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.selectOption({{{target}}}, {{{value}}});' },
    // TAP
    { action: 'tap', comp: CmdCmp.ONE_TARGET, template: 'I.tap({{{target}}});' },
    { action: 'tap', comp: CmdCmp.ONE_VALUE, template: 'I.tap({{{value}}});' },
    // UNCHECK
    { action: 'uncheck', comp: CmdCmp.ONE_TARGET, template: 'I.uncheckOption({{{target}}});' },
    // WAIT
    { action: 'wait', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE, targetType: 'url', template: 'I.waitUrlEquals({{{value}}});' },
    { action: 'wait', comp: CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_TARGET_TYPE, targetType: 'url', valuesAsNonArray: true, template: 'I.waitUrlEquals({{{value}}});' },

    { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: [ 'visible' ], template: 'I.waitForVisible({{{target}}});' },

    { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: [ 'invisible' ], template: 'I.waitForInvisible({{{target}}});' },

    { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: [ 'enabled' ], template: 'I.waitForEnabled({{{target}}});' },

    { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'text', template: 'I.waitForText({{{target}}});' },
    { action: 'wait', comp: CmdCmp.ONE_VALUE_SAME_OPTION, options: [ 'text' ], template: 'I.waitForText({{{value}}});' },

    { action: 'wait', comp: CmdCmp.ONE_TARGET_ONE_NUMBER, template: 'I.waitForElement({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CmdCmp.ONE_TARGET, template: 'I.waitForElement({{{target}}});' },

    { action: 'wait', comp: CmdCmp.ONE_NUMBER, template: 'I.wait({{{value}}});' },
];