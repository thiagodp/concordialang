The `lib` directory contains libraries that were not installed using `npm` (on purpose).

## Bravey
[bravey.js](https://github.com/BraveyJS/Bravey)  was adapted in order to avoid transforming the sentences to lowercase. The following transformation were made:

**a)** methods `getEntities()` (more than one) had the first line commented:
```javascript
string = Bravey.Text.clean(string)
```
 in order to avoid the text to be cleaned.

 **b)** method `test()` had the first line commented:
```javascript
text = Bravey.Text.clean(text);
```
 in order to avoid the text to be cleaned.