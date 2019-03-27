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
    it('reads plugin information correctly', () => __awaiter(this, void 0, void 0, function* () {
        const dir = path_1.normalize(process.cwd());
        const modulesDir = path_1.join(dir, 'node_modules');
        const packageDir = path_1.join(modulesDir, 'concordialang-fake');
        const pkgFile = path_1.join(packageDir, 'package.json');
        memfs_1.vol.mkdirpSync(dir, { recursive: true }); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
        memfs_1.vol.mkdirpSync(modulesDir);
        memfs_1.vol.mkdirpSync(packageDir);
        memfs_1.vol.mkdirpSync(globalDirs.npm.packages); // Global NPM packages
        const pkg = {
            name: 'concordialang-fake',
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
        memfs_1.vol.writeFileSync(pkgFile, JSON.stringify(pkg));
        const finder = new PackageBasedPluginFinder_1.PackageBasedPluginFinder(dir, memfs_1.fs);
        const pluginData = yield finder.find();
        const first = pluginData[0];
        memfs_1.vol.reset(); // erase in-memory structure
        expect(first.name).toEqual(pkg.name);
    }));
});
