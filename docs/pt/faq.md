# Frequently Asked Questions (FAQ)

> Esse arquivo necessita de tradução para Português.

### *Why Concordia?*

Concordia [is a roman goddess](https://www.britannica.com/topic/Concordia-Roman-goddess) who was the personification of *"concord"* or *"agreement"*. The idea is that the language may help users, stakeholders, and the software team to discuss and to reach an agreement about the software requirements. This shared understanding is essencial to the software construction.


### *How to generate test cases or test scripts for a single file?*

Just inform the parameter `--files` with the desired file. For example:
```console
concordia --files="myfile.feature" ...
```
However, whether your file imports other files, you need to include them too:

```console
concordia --files="myfile.feature,other.feature" ...
```

### *How to execute a single test script?*

This is yet not supported by Concordia. However, you can use your testing tool directly. For example, this will execute the test `myfile.js` with CodeceptJS:
```console
codeceptjs run --steps myfile.js
```
