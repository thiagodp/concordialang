# 🧠 Como o Compilador Concordia funciona

![Process](../../media/process.png)

1. Lê arquivos `.feature` e `.testcase` e usa um [lexer](https://pt.wikipedia.org/wiki/An%C3%A1lise_l%C3%A9xica) e um [parser](https://pt.wikipedia.org/wiki/An%C3%A1lise_sint%C3%A1tica_(computa%C3%A7%C3%A3o)) para identificar e verificar a estrutura dos documentos.

2. Usa [processamento de linguagem natural](https://pt.wikipedia.org/wiki/Processamento_de_linguagem_natural) para identificar a [intenção](http://mrbot.ai/blog/natural-language-processing/understanding-intent-classification/) das sentenças. Isso aumenta as changes de reconhecer sentenças em diferentes estilos de escrita.

3. Realiza uma [análise semântica](https://pt.wikipedia.org/wiki/An%C3%A1lise_sem%C3%A2ntica) para checar as declarações reconhecidas.

4. Usa a especificação para inferir os casos de teste, dados de teste e oráculos de teste e gera arquivos `.testcase` em Linguagem Concordia.

5. Transforma todos os casos de teste em scripts de teste (isso é, código-fonte) usando um plug-in.

6. Executa os scripts de teste através do mesmo plug-in. Esses scripts irão verificar o comportamento da aplicação através de sua interface de usuário.

7. Lê e apresenta os resultados da execução. Esses resultados relacionam testes que falharam com a especificação, de forma a ajudar a você a decidir as possíveis razões.


> 👉 Veja também os [tipos de casos de teste gerados](test-cases.md).