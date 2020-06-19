"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInBatch = exports.runCommand = void 0;
const childProcess = require("child_process");
/**
 * Run a command in the terminal/console. Returns the exit code.
 *
 * @param command Command to run.
 * @return Exit code.
 */
function runCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            // detached: true, // main process can terminate
            // stdio: 'ignore', // ignore stdio since detach is active
            shell: true,
        };
        // Splits the command into pieces to pass to the process;
        //  mapping function simply removes quotes from each piece
        let cmds = command.match(/[^"\s]+|"(?:\\"|[^"])+"/g)
            .map(expr => {
            return expr.charAt(0) === '"' && expr.charAt(expr.length - 1) === '"' ? expr.slice(1, -1) : expr;
        });
        const runCMD = cmds[0];
        cmds.shift();
        return new Promise((resolve, reject) => {
            const child = childProcess.spawn(runCMD, cmds, options);
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', (chunk) => {
                console.log(chunk.toString());
            });
            child.stderr.on('data', (chunk) => {
                console.warn(chunk.toString());
            });
            child.on('exit', (code) => {
                resolve(code);
            });
        });
    });
}
exports.runCommand = runCommand;
/**
 * Run the given commands in batch.
 *
 * Aborts when a command fails. Returns the result code.
 *
 * @param commands Commands to run.
 */
function runInBatch(commands) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const cmd of commands) {
            const code = yield runCommand(cmd);
            if (code != 0) {
                return code;
            }
        }
        return 0;
    });
}
exports.runInBatch = runInBatch;
