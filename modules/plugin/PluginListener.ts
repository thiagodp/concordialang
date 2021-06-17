import { PluginData } from "./PluginData";

export interface PluginListener {

	warn( message: string ): void;


    drawPluginList( plugins: PluginData[] ): void;

    drawSinglePlugin( p: PluginData ): void;

    showMessagePluginNotFound( name: string ): void;

    showMessagePluginAlreadyInstalled( name: string ): void;

    showMessageCouldNoFindInstalledPlugin( name: string ): void;

    showMessagePackageFileNotFound( file: string ): void;

    warnAboutOldPluginVersion(): void;

    showPluginServeUndefined( name: string ): void;

    showPluginServeStart( name: string ): void;

    showCommandStarted( command: string ): void;

    showCommandFinished( code: number ): void;

    showError( e: Error ): void;

}
