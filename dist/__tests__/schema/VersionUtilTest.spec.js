"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VersionUtil_1 = require("../../modules/schema/VersionUtil");
/**
 * @author Thiago Delgado Pinto
 */
describe('VersionUtilTest', () => {
    let vu = new VersionUtil_1.VersionUtil();
    it('always tries to detect versions as numbers', () => {
        expect(vu.extractVersionNumbers('0.1')).toEqual([0, 1]);
        expect(vu.extractVersionNumbers('1.0')).toEqual([1, 0]);
        expect(vu.extractVersionNumbers('1.2.3')).toEqual([1, 2, 3]);
        expect(vu.extractVersionNumbers('A.0')).toEqual([0, 0]);
        expect(vu.extractVersionNumbers('0.A')).toEqual([0, 0]);
        expect(vu.extractVersionNumbers('X')).toEqual([0]);
        expect(vu.extractVersionNumbers('')).toEqual([0]);
    });
    it('compares versions correctly', () => {
        expect(vu.areCompatibleVersions('1.0', '1.0')).toBeTruthy();
        expect(vu.areCompatibleVersions('1.0', '1.0.0')).toBeTruthy();
        expect(vu.areCompatibleVersions('1.0', '1.0.1')).toBeTruthy();
        expect(vu.areCompatibleVersions('1.0.0', '1.0.1')).toBeTruthy();
        expect(vu.areCompatibleVersions('1.2.0', '1.2.1')).toBeTruthy();
        expect(vu.areCompatibleVersions('1.3', '1.2.1')).toBeTruthy();
        expect(vu.areCompatibleVersions('1.3.0', '1.2.1')).toBeTruthy();
        ;
        expect(vu.areCompatibleVersions('1.0', '2.0')).toBeFalsy();
        expect(vu.areCompatibleVersions('1.0', '1.1')).toBeFalsy();
    });
});
