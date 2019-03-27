import { join, normalize } from 'path';
import { vol, fs } from 'memfs';
import * as globalDirs from 'global-dirs';
import { PackageBasedPluginFinder } from '../../modules/plugin/PackageBasedPluginFinder';
import { PluginData } from '../../modules/plugin/PluginData';

describe( 'PackageBasedPluginFinder', () => {

    const currentDir: string = normalize( process.cwd() );
    const localModulesDir: string = join( currentDir, 'node_modules' );
    const globalModulesDir: string = globalDirs.npm.packages;

    const PKG_NAME: string = 'concordialang-fake';
    const PKG_FILENAME: string = 'package.json';

    const localPackageDir: string = join( localModulesDir, PKG_NAME );
    const localPackageFile: string = join( localPackageDir, PKG_FILENAME );
    const globalPackageDir: string = join( globalModulesDir, PKG_NAME );
    const globalPackageFile: string = join( globalPackageDir, PKG_FILENAME );

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
            targets: [ 'foo', 'bar' ],
            file: 'path/to/main.js',
            class: 'Main',
            install: 'npm --version',
            uninstall: 'npm --version',
            serve: 'npm --version'
        }
    };

    beforeEach( () => {
        vol.mkdirpSync( currentDir, { recursive: true } ); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
        vol.mkdirpSync( localModulesDir );
        vol.mkdirpSync( globalModulesDir ); // Global modules directory
    } );

    afterEach( () => {
        vol.reset(); // erase in-memory structure
    } );

    it( 'finds in a local module', async () => {

        vol.mkdirpSync( localPackageDir );
        vol.writeFileSync( localPackageFile, JSON.stringify( pkg ) );

        const finder: PackageBasedPluginFinder = new PackageBasedPluginFinder( currentDir, fs );
        const pluginData: PluginData[] = await finder.find();
        const first = pluginData[ 0 ];

        expect( first.name ).toEqual( pkg.name );
    } );


    it( 'finds in a global module', async () => {

        vol.mkdirpSync( globalPackageDir );
        vol.writeFileSync( globalPackageFile, JSON.stringify( pkg ) );

        const finder: PackageBasedPluginFinder = new PackageBasedPluginFinder( currentDir, fs );
        const pluginData: PluginData[] = await finder.find();
        const first = pluginData[ 0 ];

        expect( first.name ).toEqual( pkg.name );
    } );


    it( 'prefers local than global',async () => {

        vol.mkdirpSync( localPackageDir ); // local
        vol.writeFileSync( localPackageFile, JSON.stringify( pkg ) ); // local

        const pkg2 = { ... pkg }; // copy properties
        pkg2.name += '-global';

        vol.mkdirpSync( globalPackageDir ); // global
        vol.writeFileSync( globalPackageFile, JSON.stringify( pkg2 ) ); // global

        const finder: PackageBasedPluginFinder = new PackageBasedPluginFinder( currentDir, fs );
        const pluginData: PluginData[] = await finder.find();
        const first = pluginData[ 0 ];

        expect( first.name ).toEqual( pkg.name );
    } );

} );