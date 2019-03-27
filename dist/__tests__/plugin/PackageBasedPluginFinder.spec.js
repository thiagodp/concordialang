"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const memfs_1 = require("memfs");
const globalDirs = require("global-dirs");
const PackageBasedPluginFinder_1 = require("../../modules/plugin/PackageBasedPluginFinder");
describe('PackageBasedPluginFinder', () => {
    const currentDir = path_1.normalize(process.cwd());
    const localModulesDir = path_1.join(currentDir, 'node_modules');
    const globalModulesDir = globalDirs.npm.packages;
    const PKG_NAME = 'concordialang-fake';
    const PKG_FILENAME = 'package.json';
    const localPackageDir = path_1.join(localModulesDir, PKG_NAME);
    const localPackageFile = path_1.join(localPackageDir, PKG_FILENAME);
    const globalPackageDir = path_1.join(globalModulesDir, PKG_NAME);
    const globalPackageFile = path_1.join(globalPackageDir, PKG_FILENAME);
    const pkg = {
        name: PKG_NAME,
        description: 'Fake plugin',
        version: '0.1.0',
        author: {
            name: 'Bob',
            email: 'bob@fake.com'
        },
        concordiaPluginData: {
            isFake: true,
            targets: ['foo', 'bar'],
            file: 'path/to/main.js',
            class: 'Main',
            install: 'npm --version',
            uninstall: 'npm --version',
            serve: 'npm --version'
        }
    };
    beforeEach(() => {
        memfs_1.vol.mkdirpSync(currentDir, { recursive: true }); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
        memfs_1.vol.mkdirpSync(localModulesDir);
        memfs_1.vol.mkdirpSync(globalModulesDir); // Global modules directory
    });
    afterEach(() => {
        memfs_1.vol.reset(); // erase in-memory structure
    });
    it('finds in a local module', () => __awaiter(this, void 0, void 0, function* () {
        memfs_1.vol.mkdirpSync(localPackageDir);
        memfs_1.vol.writeFileSync(localPackageFile, JSON.stringify(pkg));
        const finder = new PackageBasedPluginFinder_1.PackageBasedPluginFinder(currentDir, memfs_1.fs);
        const pluginData = yield finder.find();
        const first = pluginData[0];
        expect(first.name).toEqual(pkg.name);
    }));
    it('finds in a global module', () => __awaiter(this, void 0, void 0, function* () {
        memfs_1.vol.mkdirpSync(globalPackageDir);
        memfs_1.vol.writeFileSync(globalPackageFile, JSON.stringify(pkg));
        const finder = new PackageBasedPluginFinder_1.PackageBasedPluginFinder(currentDir, memfs_1.fs);
        const pluginData = yield finder.find();
        const first = pluginData[0];
        expect(first.name).toEqual(pkg.name);
    }));
    it('prefers local than global', () => __awaiter(this, void 0, void 0, function* () {
        memfs_1.vol.mkdirpSync(localPackageDir); // local
        memfs_1.vol.writeFileSync(localPackageFile, JSON.stringify(pkg)); // local
        const pkg2 = Object.assign({}, pkg); // copy properties
        pkg2.name += '-global';
        memfs_1.vol.mkdirpSync(globalPackageDir); // global
        memfs_1.vol.writeFileSync(globalPackageFile, JSON.stringify(pkg2)); // global
        const finder = new PackageBasedPluginFinder_1.PackageBasedPluginFinder(currentDir, memfs_1.fs);
        const pluginData = yield finder.find();
        const first = pluginData[0];
        expect(first.name).toEqual(pkg.name);
    }));
});
