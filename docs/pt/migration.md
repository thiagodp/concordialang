# Guia de Migração <!-- omit in toc -->

- [Versão `0.x` para `1.x`](#vers%C3%A3o-0x-para-1x)
- [Saiba mais](#saiba-mais)

## Versão `0.x` para `1.x`

1. **Atualize seu arquivo de configuração, caso necessário**

    1. Caso seu projeto possua o arquivo de configuração `.concordiarc`, abra-o com um editor de texto.
    2. Se no arquivo houver a propriedade `"plugin"` com o valor `"codeceptjs"`, você deve atualizar o valor para `"codeceptjs-webdriverio"`.

2. **Instale o novo plug-in**

    Você pode instalar um dos [plug-ins disponíveis](./plugins.md), atualmente `codeceptjs-webdriverio` ou `codeceptjs-appium`.

    Exemplo:
    ```bash
    concordia --plugin-install codeceptjs-webdriverio
    ```
    👉 No **Linux** ou no **MacOS**, é necessário usar `sudo`. Exemplo:
    ```bash
    sudo concordia --plugin-install codeceptjs-webdriverio
    ```

## Saiba mais

- [Quais foram as quebras de compatibilidade](breaking-changes.md)
- [Como o projeto Concordia numera suas versões](versioning.md)