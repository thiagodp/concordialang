import * as globalDirs from 'global-dirs';
import { fs, vol } from 'memfs';
import { join, normalize } from 'path';
import { FSFileHandler } from '../../modules/util/file/FSFileHandler';
import { PackageBasedPluginFinder } from '../../modules/plugin/PackageBasedPluginFinder';
import { PluginData, PLUGIN_PROPERTY } from '../../modules/plugin/PluginData';
import { FSDirSearcher } from '../../modules/util/file/FSDirSearcher';


describe( 'PackageBasedPluginFinder', () => {

    const currentDir: string = normalize( process.cwd() );
    const localModulesDir: string = join( currentDir, 'node_modules' );
    const globalModulesDir: string = globalDirs.npm.packages;

    const PLUGIN_NAME: string = 'concordialang-fake';
    const PKG_FILENAME: string = 'package.json';

    const localPluginDir: string = join( localModulesDir, PLUGIN_NAME );
    const localPluginPackageFile: string = join( localPluginDir, PKG_FILENAME );
    const globalPluginDir: string = join( globalModulesDir, PLUGIN_NAME );
    const globalPluginPackageFile: string = join( globalPluginDir, PKG_FILENAME );

    let pkg = {
        name: PLUGIN_NAME,
        description: 'Fake plugin',
        version: '0.1.0',
        author: {
            name: 'Bob',
            email: 'bob@fake.com'
        }
    };

    pkg[ PLUGIN_PROPERTY ] = {
        isFake: true,
        targets: [ 'foo', 'bar' ],
        file: 'path/to/main.js',
        class: 'Main',
        serve: 'npm --version'
    } as PluginData;

    const makeFinder = () => {
        const fileReader = new FSFileHandler( fs );
        const dirSearcher = new FSDirSearcher( fs );

        const finder: PackageBasedPluginFinder = new PackageBasedPluginFinder(
            currentDir, fileReader, dirSearcher );

        return finder;
    };


    beforeEach( () => {
        vol.mkdirpSync( currentDir, { recursive: true } as any ); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
        vol.mkdirpSync( localModulesDir );
        vol.mkdirpSync( globalModulesDir ); // Global modules directory
    } );

    afterEach( () => {
        vol.reset(); // erase in-memory structure
    } );

    it( 'finds in a local module', async () => {

        vol.mkdirpSync( localPluginDir );
        vol.writeFileSync( localPluginPackageFile, JSON.stringify( pkg ) );

        const finder: PackageBasedPluginFinder = makeFinder();
        const pluginData: PluginData[] = await finder.find();
        expect( pluginData ).toHaveLength( 1 );

        const first = pluginData[ 0 ];
        expect( first.name ).toEqual( pkg.name );
    } );


    it( 'finds in a global module', async () => {

        vol.mkdirpSync( globalPluginDir );
        vol.writeFileSync( globalPluginPackageFile, JSON.stringify( pkg ) );

        const finder: PackageBasedPluginFinder = makeFinder();

        const pluginData: PluginData[] = await finder.find();
        expect( pluginData ).toHaveLength( 1 );

        const first = pluginData[ 0 ];
        expect( first.name ).toEqual( pkg.name );
    } );


    it( 'prefers local than global', async () => {

        vol.mkdirpSync( localPluginDir ); // local
        vol.writeFileSync( localPluginPackageFile, JSON.stringify( pkg ) ); // local

        const pkg2 = { ... pkg }; // copy properties

        vol.mkdirpSync( globalPluginDir ); // global
        vol.writeFileSync( globalPluginPackageFile, JSON.stringify( pkg2 ) ); // global

        const finder: PackageBasedPluginFinder = makeFinder();
        const pluginData: PluginData[] = await finder.find();
        expect( pluginData ).toHaveLength( 1 );

        const first = pluginData[ 0 ];

        expect( first.name ).toEqual( pkg.name );
    } );


    it( 'returns class file with path', async () => {

        vol.mkdirpSync( localPluginDir ); // local
        vol.writeFileSync( localPluginPackageFile, JSON.stringify( pkg ) ); // local

        const pkg2 = { ... pkg }; // copy properties
        pkg2.name += '-global';

        vol.mkdirpSync( globalPluginDir ); // global
        vol.writeFileSync( globalPluginPackageFile, JSON.stringify( pkg2 ) ); // global

        const finder: PackageBasedPluginFinder = makeFinder();
        const pluginData: PluginData[] = await finder.find();
        expect( pluginData ).toHaveLength( 2 );

        const first = pluginData[ 0 ];

        expect( first.file ).toContain( localPluginDir );
    } );


    it( 'ignores a package that is not a plugin', async () => {

        vol.mkdirpSync( localPluginDir ); // local
        vol.writeFileSync( localPluginPackageFile, JSON.stringify( pkg ) ); // local

        const pkg2 = { ... pkg }; // copy properties
        pkg2.name += '-non-plugin';
        pkg2[ PLUGIN_PROPERTY ] = undefined; // removes the expected property

        vol.mkdirpSync( join( localModulesDir, pkg2.name ) );
        vol.writeFileSync( join( localModulesDir, pkg2.name, PKG_FILENAME ), JSON.stringify( pkg2 ) );

        const finder: PackageBasedPluginFinder = makeFinder();
        const pluginData: PluginData[] = await finder.find();
        expect( pluginData ).toHaveLength( 1 );
    } );

} );