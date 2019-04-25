# 🧠 How it works

![Process](../../media/process.png)

1. It reads your `.feature` and `.testcase` files, and uses a [lexer](https://en.wikipedia.org/wiki/Lexical_analysis) and a [parser](https://en.wikipedia.org/wiki/Parsing#Computer_languages) to identify and check documents' structure.

2. It uses [Natural Language Processing](https://en.wikipedia.org/wiki/Natural-language_processing) (NLP) to identify sentences' [intent](http://mrbot.ai/blog/natural-language-processing/understanding-intent-classification/). This increases the chances of recognizing sentences written in different styles.

3. It performs [semantic analysis](https://en.wikipedia.org/wiki/Semantic_analysis_(compilers)) to check recognized declarations.

4. It uses the specification to infer the most suitable *test cases*, *test data*, and *test oracles*, and then generates `.testcase` files in Concordia Language.

5. It transforms all the test cases into test scripts (that is, source code) using a plug-in.

6. It executes the test scripts with the plug-in. These test scripts will check your application's behavior through its user interface.

7. It reads and presents execution results. These results relate failing tests to the specification, in order to help you understanding the possible reasons of a failure.


👉 See the [set of generated test cases](docs/test-cases.md).
