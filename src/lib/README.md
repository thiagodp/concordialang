The `lib` directory contains libraries that were not installed using `npm` (on purpose).

## Bravey

**WARNING: Do not overwrite `bravey.js` with a newer version without adapting it.** See the following notes.

[bravey.js](https://github.com/BraveyJS/Bravey)  was adapted in order to avoid transforming the sentences to lowercase. The following transformation were made:

**a)** methods `getEntities()` had the first line commented, in more than one place, in order to avoid the text to be cleaned:
```javascript
string = Bravey.Text.clean(string)
```

 **b)** method `test()` had the first line commented, in order to avoid the text to be cleaned:
```javascript
text = Bravey.Text.clean(text);
```