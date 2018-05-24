# Actions

> Examples of Variant sentences with actions


## `amOn`

```gherkin
Given that I am on "http://concordialang.org"
```

## `append`

```gherkin
When I append "Bar" to {Foo}
  and I append 100 to {Bar}
  and I append "Bar" to <#foo>
  and I append 100 to <#foo>
```

## `attachFile`

```gherkin
When I attach the file "/path/to/file" to {Foo}
  and I attach the file "/path/to/file" to <#bar>
```

## `check`

```gherkin
When I check {Foo}
  and I check <#bar>
```

## `clear`

```gherkin
When I clear the cookie "foo"
```
```gherkin
When I clear {Foo}
  and I clear <#bar>
```

## `click`

```gherkin
When I click {Foo}
  and I click <#bar>
```

## `close`

```gherkin
When I close the current tab
```
```gherkin
When I close the other tabs
```

## `doubleClick`

```gherkin
When I double click {Foo}
  and I double click <#bar>
```

## `drag`

```gherkin
When I drag {Foo} to <#bar>
```

## `fill`

```gherkin
When I fill {Foo}
  and I inform {Foo}
  and I enter {Foo}
  and I fill {Foo} with "foo"
  and I fill {Foo} with 100
  and I fill <#bar> with "bar"
  and I fill <#bar> with 3.1415
  and I type "bar" in {Foo}
  and I type "foo" in <#bar>
```

## `press`

```gherkin
When I press "Enter"
  and I press "Ctrl", "Alt", "Del"
```

## `rightClick`

```gherkin
When I right click {Foo}
  and I right click <#bar>
```

## `saveScreenshot`

```gherkin
When I save a screenshot to "foo.png"
  and I take a photo to "bar.png"
```

## `see`

```gherkin
Then I do not see "Foo Bar"
  and I don't see "Foo"
```

```gherkin
Then I do not see {Foo} is checked
  and I don't see <#bar> is checked
```

```gherkin
Then I do not see the cookie "foo"
  and I don't see the cookie "bar"
```

```gherkin
Then I do not see the url "/foo"
  and I don't see the url "/bar"
```

```gherkin
Then I do not see {Foo} with "foo"
  and I don't see <#bar> with "bar"
```

```gherkin
Then I do not see "foo" in the title
  and I don't see the title with "bar"
```

```gherkin
Then I do not see {Foo}
  and I don't see <#bar>
```

```gherkin
Then I see "Foo Bar"
```

```gherkin
Then I see {Foo} is checked
  and I see <#bar> is checked
```

```gherkin
Then I see the cookie "Foo"
```

```gherkin
Then I see the url "/foo"
```

```gherkin
Then I see {Foo} with "foo"
  and I see <#bar> with "bar"
```

```gherkin
Then I see "foo" in the title
  and I see the title with "bar"
```

```gherkin
Then I see {Foo} is enabled
  and I see <#bar> is enabled
```

## `select`

```gherkin
Then I select "foo" in {Foo}
  and I select "bar" in <#bar>
```

## `uncheck`

```gherkin
Then I unckeck {Foo}
  and I uncheck <#bar>
```

## `wait`

```gherkin
Then I wait 2 seconds
```

```gherkin
Then I wait for {Foo}
  and I wait for <#bar> during 2 seconds
```

```gherkin
Then I wait {Foo} is enabled
  and I wait <#bar> is enabled
```

```gherkin
Then I wait {Foo} is invisible
  and I wait <#bar> is invisible
```

```gherkin
Then I wait {Foo} is visible
  and I wait <#bar> is visible
```

```gherkin
Then I wait for the text "Foo"
```

```gherkin
Then I wait for the url "/foo"
  and I wait for the url "/bar" during 3 seconds
```
