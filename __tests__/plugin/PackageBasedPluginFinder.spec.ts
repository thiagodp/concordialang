import { join, normalize } from 'path';
import { vol, fs } from 'memfs';
import * as globalDirs from 'global-dirs';
import { PackageBasedPluginFinder } from '../../modules/plugin/PackageBasedPluginFinder';
import { PluginData } from '../../modules/plugin/PluginData';

describe( 'PackageBasedPluginFinder', () => {

    it( 'reads plugin information correctly', async () => {

        const dir: string = normalize( process.cwd() );
        const modulesDir: string = join( dir, 'node_modules' );
        const packageDir: string = join( modulesDir, 'concordialang-fake' );
        const pkgFile: string = join( packageDir, 'package.json' );

        vol.mkdirpSync( dir, { recursive: true } ); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
        vol.mkdirpSync( modulesDir );
        vol.mkdirpSync( packageDir );

        vol.mkdirpSync( globalDirs.npm.packages ); // Global NPM packages

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
                targets: [ 'foo', 'bar' ],
                file: 'path/to/main.js',
                class: 'Main',
                install: 'npm --version',
                uninstall: 'npm --version',
                serve: 'npm --version'
            }
        };

        vol.writeFileSync( pkgFile, JSON.stringify( pkg ) );

        const finder: PackageBasedPluginFinder = new PackageBasedPluginFinder( dir, fs );
        const pluginData: PluginData[] = await finder.find();
        const first = pluginData[ 0 ];

        vol.reset(); // erase in-memory structure

        expect( first.name ).toEqual( pkg.name );
    } );

} );