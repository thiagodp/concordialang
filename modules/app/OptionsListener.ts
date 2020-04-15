export interface OptionsListener {

    announceConfigurationFileSaved( filePath: string ): void;

    announceCouldNotLoadConfigurationFile( errorMessage: string ): void;

    announceConfigurationFileLoaded( filePath: string ): void;

    announceSeed( seed: string, generatedSeed: boolean ): void;

    announceRealSeed( realSeed: string ): void;

}