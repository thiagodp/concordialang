import { CmdCfg, CmdCmp } from "../codeceptjs/CommandMapper";
import { WEB_DRIVER_IO_COMMANDS } from "../codeceptjs/WebDriverIOCommands";

/** Maps available commands. ORDER MATTERS */
export const APPIUM_COMMANDS: CmdCfg[] = WEB_DRIVER_IO_COMMANDS.concat( [

    // CLOSE
    { action: 'close', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'app', template: 'I.closeApp();' },
    { action: 'close', comp: CmdCmp.SAME_OPTION, options: [ 'app' ], template: 'I.closeApp();' },

    // HIDE
    { action: 'hide', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'keyboard', template: 'I.hideDeviceKeyboard();' },
    { action: 'hide', comp: CmdCmp.SAME_OPTION, options: [ 'keyboard' ], template: 'I.hideDeviceKeyboard();' },

    // INSTALL
    // { action: 'install', comp: CmdCmp.ONE_VALUE, template: 'I.checkOption({{{value}}});' },


] );