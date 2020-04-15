import { PluginData } from "./PluginData";

export interface PluginListener {


    drawPluginList( plugins: PluginData[] ): void;

    drawSinglePlugin( p: PluginData ): void;

    showMessagePluginNotFound( name: string ): void;

    showMessagePluginAlreadyInstalled( name: string ): void;

    showMessageTryingToInstall( name: string, tool: string ): void;

    showMessageTryingToUninstall( name: string, tool: string ): void;

    showMessageCouldNoFindInstalledPlugin( name: string ): void;

    showMessagePackageFileNotFound( file: string ): void;

    showPluginServeStart( name: string ): void;

    showCommandStarted( command: string ): void;

    showCommandFinished(): void;

    showCommandCode( code: number, showIfSuccess: boolean ): void;

    showError( e: Error ): void;

}