"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMapper_1 = require("../codeceptjs/CommandMapper");
const WebDriverIOCommands_1 = require("../codeceptjs/WebDriverIOCommands");
/** Maps available commands. ORDER MATTERS */
exports.APPIUM_COMMANDS = WebDriverIOCommands_1.WEB_DRIVER_IO_COMMANDS.concat([
    // CLOSE
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE, targetType: 'app', template: 'I.closeApp();' },
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['app'], template: 'I.closeApp();' },
    // HIDE
    { action: 'hide', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE, targetType: 'keyboard', template: 'I.hideDeviceKeyboard();' },
    { action: 'hide', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['keyboard'], template: 'I.hideDeviceKeyboard();' },
]);
