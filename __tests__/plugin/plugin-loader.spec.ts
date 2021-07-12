import { OldPluginData, PluginData } from "../../modules/plugin/PluginData";
import { loadPlugin } from "../../modules/plugin/plugin-loader";

describe( 'plugin-loader', () => {

	it( 'does not load with an empty plugin data', async () => {
		const pluginData = {
		} as PluginData;
		await expect( loadPlugin( pluginData ) ).rejects.toThrowError();
	} );

	it( 'tries to load with an old plugin structure', async () => {

		const pluginData = {
			name: 'foo',
			description: '...',
			version: '1.0',
			authors: [],
			main: undefined,
			class: 'FooClass',
			file: 'old.js'
		} as OldPluginData;

		await expect( loadPlugin( pluginData ) ).rejects.toThrowError( /^Cannot find module 'old.js'/ );
	} );

	it( 'tries to load with new plugin structure', async () => {

		const pluginData = {
			name: 'bar',
			description: '...',
			version: '1.0',
			authors: [],
			main: 'new.js'
		} as PluginData;

		await expect( loadPlugin( pluginData ) ).rejects.toThrowError( /^Cannot find module 'new.js'/ );
	} );

} );
