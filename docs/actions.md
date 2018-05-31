# Actions

> Examples of Variant sentences with actions

*An example may demonstrate different variations of the same action.*

Translations: [Português](actions-pt.md) 🌎

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

The next sentence is for *mobile* only:
```gherkin
When I close the app
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

## `hide`

The next sentence is for *mobile* only:
```gherkin
When I hide the keyboard
```

## `install`

The next sentence is for *mobile* only:
```gherkin
When I install the app "com.example.android.myapp"
```

## `maximize`

```gherkin
When I maximize the window
```

## `open`

The next sentence is for *mobile* only:
```gherkin
When I open the notifications panel
```

## `press`

```gherkin
When I press "Enter"
  and I press "Ctrl", "Alt", "Del"
```

## `pull`

The next sentence is for *mobile* only:
```gherkin
When I pull "/storage/emulated/0/DCIM/logo.png" to "some/path"
```

## `refresh`

```gherkin
When I refresh the page
```

## `remove`

The next sentence is for *mobile* only:
```gherkin
When I remove the app "com.example.android.myapp"
```

## `resize`

```gherkin
When I resize the window to 600, 400
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

The next sentence is for *mobile* only:
```gherkin
Then I see that the app "com.example.android.myapp" is installed
```

The next sentence is for *mobile* only:
```gherkin
Then I see that the app "com.example.android.myapp" is not installed
```

The next sentence is for *mobile* only:
```gherkin
Then I see that the current activity is ".HomeScreenActivity"
```

The next sentence is for *mobile* only:
```gherkin
Then I see that the device is locked
```

The next sentence is for *mobile* only:
```gherkin
Then I see that the device is unlocked
```

```gherkin
Then I see the cookie "Foo"
```

The next sentence is for *mobile* only:
```gherkin
Then I see that the orientation is landscape
```

The next sentence is for *mobile* only:
```gherkin
Then I see that the orientation is portrait
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
When I select "foo" in {Foo}
  and I select "bar" in <#bar>
```

## `shake`

The next sentence is for *mobile* only:
```gherkin
When I shake the device
  and I shake the phone
  and I shake the tablet
```

## `swipe`

The next sentence is for *mobile* only:
```gherkin
When I swipe "#io.selendroid.myapp:id/LinearLayout1" to 100, 200
```

The next sentence is for *mobile* only:
```gherkin
When I swipe "#io.selendroid.myapp:id/LinearLayout1" down
```
The next sentence is for *mobile* only:
```gherkin
When I swipe "#io.selendroid.myapp:id/LinearLayout1" left
```

The next sentence is for *mobile* only:
```gherkin
When I swipe "#io.selendroid.myapp:id/LinearLayout1" right
```

The next sentence is for *mobile* only:
```gherkin
When I swipe "#io.selendroid.myapp:id/LinearLayout1" up
```

## `switch`

The next sentence is for *mobile* only:
```gherkin
When I switch to native
```

The next sentence is for *mobile* only:
```gherkin
When I switch to web
```

## `tap`

The next sentence is for *mobile* only:
```gherkin
When I tap <~ok>
  and I tap {Confirm}
```

## `uncheck`

```gherkin
When I unckeck {Foo}
  and I uncheck <#bar>
```

## `wait`

```gherkin
When I wait 2 seconds
```

```gherkin
When I wait for {Foo}
  and I wait for <#bar> during 2 seconds
```

```gherkin
When I wait {Foo} is enabled
  and I wait <#bar> is enabled
```

```gherkin
When I wait {Foo} is invisible
  and I wait <#bar> is invisible
```

```gherkin
When I wait {Foo} is visible
  and I wait <#bar> is visible
```

```gherkin
When I wait for the text "Foo"
```

```gherkin
When I wait for the url "/foo"
  and I wait for the url "/bar" during 3 seconds
```