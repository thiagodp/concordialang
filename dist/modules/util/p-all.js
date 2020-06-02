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
exports.runAllWithoutThrow = exports.pAll = void 0;
const pMap = require("p-map");
exports.pAll = (iterable, options) => pMap(iterable, (element) => element(), options);
exports.runAllWithoutThrow = (iterable, options, errors = []) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.pAll(iterable, options);
    }
    catch (err) {
        if (err['_errors']) { // AggregateError - see https://github.com/sindresorhus/aggregate-error
            for (const individualError of err['_errors']) {
                errors.push(individualError.message);
            }
        }
        else {
            errors.push(err);
        }
    }
});
