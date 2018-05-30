"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMapper_1 = require("./CommandMapper");
/** Maps available commands. ORDER MATTERS */
exports.WEB_DRIVER_IO_COMMANDS = [
    // AM_ON
    { action: 'amOn', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'url', template: 'I.amOnPage({{{target}}});' },
    { action: 'amOn', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.amOnPage({{{value}}});' },
    // APPEND
    { action: 'append', comp: CommandMapper_1.CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.appendField({{{target}}}, {{{value}}});' },
    // ATTACH_FILE
    { action: 'attachFile', comp: CommandMapper_1.CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.attachFile({{{target}}}, {{{value}}});' },
    // CHECK
    { action: 'check', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.checkOption({{{target}}});' },
    { action: 'check', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.checkOption({{{value}}});' },
    // CLEAR
    { action: 'clear', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'cookie', template: 'I.clearCookie({{{target}}});' },
    { action: 'clear', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.clearField({{{target}}});' },
    // CLICK
    { action: 'click', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.click({{{target}}});' },
    { action: 'click', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.click({{{value}}});' },
    // CLOSE
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE, targetType: 'currentTab', template: 'I.closeCurrentTab();' },
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['currentTab'], template: 'I.closeCurrentTab();' },
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE, targetType: 'otherTabs', template: 'I.closeOtherTabs();' },
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['otherTabs'], template: 'I.closeOtherTabs();' },
    // DOUBLE_CLICK
    { action: 'doubleClick', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.doubleClick({{{target}}});' },
    { action: 'doubleClick', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.doubleClick({{{value}}});' },
    // DRAG
    { action: 'drag', comp: CommandMapper_1.CmdCmp.TWO_TARGETS, template: 'I.dragAndDrop({{{target}}});' },
    // FILL
    { action: 'fill', comp: CommandMapper_1.CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.fillField({{{target}}}, {{{value}}});' },
    // MOVE
    { action: 'move', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_OPTION, options: ['cursor'], template: 'I.moveCursorTo({{{target}}});' },
    // PRESS
    { action: 'press', comp: CommandMapper_1.CmdCmp.ONE_VALUE_OR_ARRAY, template: 'I.pressKey({{{value}}});' },
    // RIGHT_CLICK
    { action: 'rightClick', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.rightClick({{{target}}});' },
    { action: 'rightClick', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.rightClick({{{value}}});' },
    // SAVE_SCREENSHOT
    { action: 'saveScreenshot', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.saveScreenshot({{{value}}});' },
    // SEE
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textbox', template: 'I.seeInField({{{target}}}, {{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textarea', template: 'I.seeInField({{{target}}}, {{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textbox', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textarea', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER, targetType: 'checkbox', options: ['checked'], template: 'I.seeCheckboxIsChecked({{{target}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER, targetType: 'checkbox', options: ['checked'], modifier: 'not', template: 'I.dontSeeCheckboxIsChecked({{{target}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'cookie', template: 'I.seeCookie({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'cookie', modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['cookie'], template: 'I.seeCookie({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['cookie'], modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'title', template: 'I.seeInTitle({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'title', modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['title'], template: 'I.seeInTitle({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['title'], modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'url', template: 'I.seeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'url', modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['url'], template: 'I.seeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['url'], modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_MODIFIER, template: 'I.seeElement({{{target}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_MODIFIER, modifier: 'not', template: 'I.dontSeeElement({{{target}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_MODIFIER, template: 'I.see({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_MODIFIER, modifier: 'not', template: 'I.dontSee({{{value}}});' },
    // SELECT
    { action: 'select', comp: CommandMapper_1.CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.selectOption({{{target}}}, {{{value}}});' },
    // TAP
    { action: 'tap', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.tap({{{target}}});' },
    { action: 'tap', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.tap({{{value}}});' },
    // UNCHECK
    { action: 'uncheck', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.uncheckOption({{{target}}});' },
    // WAIT
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_TARGET_TYPE, targetType: 'url', template: 'I.waitUrlEquals({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_TARGET_TYPE, targetType: 'url', valuesAsNonArray: true, template: 'I.waitUrlEquals({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_OPTION, options: ['visible'], template: 'I.waitForVisible({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_OPTION, options: ['invisible'], template: 'I.waitForInvisible({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_OPTION, options: ['enabled'], template: 'I.waitForEnabled({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'text', template: 'I.waitForText({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_VALUE_SAME_OPTION, options: ['text'], template: 'I.waitForText({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_TARGET_ONE_NUMBER, template: 'I.waitForElement({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.waitForElement({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_NUMBER, template: 'I.wait({{{value}}});' },
];
