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
    const PLUGIN_NAME = 'concordialang-fake';
    const PKG_FILENAME = 'package.json';
    const localPluginDir = path_1.join(localModulesDir, PLUGIN_NAME);
    const localPluginPackageFile = path_1.join(localPluginDir, PKG_FILENAME);
    const globalPluginDir = path_1.join(globalModulesDir, PLUGIN_NAME);
    const globalPluginPackageFile = path_1.join(globalPluginDir, PKG_FILENAME);
    const pkg = {
        name: PLUGIN_NAME,
        description: 'Fake plugin',
        version: '0.1.0',
        author: {
            name: 'Bob',
            email: 'bob@fake.com'
        },
        main: 'path/to/main.js',
        concordiaPluginData: {
            isFake: true,
            targets: ['foo', 'bar'],
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
        memfs_1.vol.mkdirpSync(localPluginDir);
        memfs_1.vol.writeFileSync(localPluginPackageFile, JSON.stringify(pkg));
        const finder = new PackageBasedPluginFinder_1.PackageBasedPluginFinder(currentDir, memfs_1.fs);
        const pluginData = yield finder.find();
        expect(pluginData).toHaveLength(1);
        const first = pluginData[0];
        expect(first.name).toEqual(pkg.name);
    }));
    it('finds in a global module', () => __awaiter(this, void 0, void 0, function* () {
        memfs_1.vol.mkdirpSync(globalPluginDir);
        memfs_1.vol.writeFileSync(globalPluginPackageFile, JSON.stringify(pkg));
        const finder = new PackageBasedPluginFinder_1.PackageBasedPluginFinder(currentDir, memfs_1.fs);
        const pluginData = yield finder.find();
        expect(pluginData).toHaveLength(1);
        const first = pluginData[0];
        expect(first.name).toEqual(pkg.name);
    }));
    it('prefers local than global', () => __awaiter(this, void 0, void 0, function* () {
        memfs_1.vol.mkdirpSync(localPluginDir); // local
        memfs_1.vol.writeFileSync(localPluginPackageFile, JSON.stringify(pkg)); // local
        const pkg2 = Object.assign({}, pkg); // copy properties
        memfs_1.vol.mkdirpSync(globalPluginDir); // global
        memfs_1.vol.writeFileSync(globalPluginPackageFile, JSON.stringify(pkg2)); // global
        const finder = new PackageBasedPluginFinder_1.PackageBasedPluginFinder(currentDir, memfs_1.fs);
        const pluginData = yield finder.find();
        expect(pluginData).toHaveLength(1);
        const first = pluginData[0];
        expect(first.name).toEqual(pkg.name);
    }));
    it('returns class file with path', () => __awaiter(this, void 0, void 0, function* () {
        memfs_1.vol.mkdirpSync(localPluginDir); // local
        memfs_1.vol.writeFileSync(localPluginPackageFile, JSON.stringify(pkg)); // local
        const pkg2 = Object.assign({}, pkg); // copy properties
        pkg2.name += '-global';
        memfs_1.vol.mkdirpSync(globalPluginDir); // global
        memfs_1.vol.writeFileSync(globalPluginPackageFile, JSON.stringify(pkg2)); // global
        const finder = new PackageBasedPluginFinder_1.PackageBasedPluginFinder(currentDir, memfs_1.fs);
        const pluginData = yield finder.find();
        expect(pluginData).toHaveLength(2);
        const first = pluginData[0];
        const content = path_1.join(localPluginDir, pkg.main);
        expect(first.file).toEqual(content);
    }));
    it('ignores a package that is not a plugin', () => __awaiter(this, void 0, void 0, function* () {
        memfs_1.vol.mkdirpSync(localPluginDir); // local
        memfs_1.vol.writeFileSync(localPluginPackageFile, JSON.stringify(pkg)); // local
        const pkg2 = Object.assign({}, pkg); // copy properties
        pkg2.name += '-non-plugin';
        pkg2.concordiaPluginData = undefined; // removes the expected property
        memfs_1.vol.mkdirpSync(path_1.join(localModulesDir, pkg2.name));
        memfs_1.vol.writeFileSync(path_1.join(localModulesDir, pkg2.name, PKG_FILENAME), JSON.stringify(pkg2));
        const finder = new PackageBasedPluginFinder_1.PackageBasedPluginFinder(currentDir, memfs_1.fs);
        const pluginData = yield finder.find();
        expect(pluginData).toHaveLength(1);
    }));
});
