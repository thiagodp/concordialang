# Actions

> Examples of Variant sentences with actions

*An example may demonstrate different variations of the same action.*

Translations: [Português](actions-pt.md) 🌎

## `amOn`

### amOn + value
```gherkin
Given that I am on "http://concordialang.org"
```

## `append`

### append + number + target
```gherkin
When I append "Foo" to {Foo}
  and I append "Bar" to <#foo>
```

### append + value + target
```gherkin
When I append 100 to {Bar}
  and I append 200 to <#foo>
```

## `attachFile`

### attach + file + value + target
```gherkin
When I attach the file "/path/to/file" to {Foo}
  and I attach the file "/path/to/file" to <#bar>
```

## `check`

### check + target
```gherkin
When I check {Foo}
  and I check <#bar>
```

## `clear`

### clear + target
```gherkin
When I clear {Foo}
  and I clear <#bar>
```

### clear + cookie + value
```gherkin
When I clear the cookie "foo"
```

## `click`

### click + target
```gherkin
When I click {Foo}
  and I click <#bar>
```

### click + value
```gherkin
When I click "Foo"
```

## `close`

### close + current tab
```gherkin
When I close the current tab
```

### close + other tabs
```gherkin
When I close the other tabs
```

### close + app
The next sentence is for *mobile* only:
```gherkin
When I close the app
```

## `connect`

### connect + database
```
When I connect to the database [TestDB]
```

## `disconnect`

### disconnect + database
```
When I disconnect from the database [TestDB]
```

## `doubleClick`

### doubleClick + target
```gherkin
When I double click {Foo}
  and I double click <#bar>
```

### doubleClick + value
```gherkin
When I double click "Foo"
```

## `drag`

### drag + target + target
```gherkin
When I drag {Foo} to <#bar>
```

## `fill`

### fill + target
```gherkin
When I fill {Foo}
  and I inform {Foo}
  and I enter {Foo}
  and I type {Foo}
```

### fill + target + with + value or number
```gherkin
When I fill {Foo} with "foo"
  and I fill <#bar> with "bar"
  and I fill <#bar> with 3.1415
```

### fill + value + inside + target
```gherkin
When I type "bar" in {Foo}
  and I type "foo" in <#bar>
```

## `hide`

### hide + keyboard
The next sentence is for *mobile* only:
```gherkin
When I hide the keyboard
```

## `install`

### install + app + value
The next sentence is for *mobile* only:
```gherkin
When I install the app "com.example.android.myapp"
```

## `maximize`

### maximize + window
```gherkin
When I maximize the window
```

## `move`

### move + cursor + target
```gherkin
When I move the cursor to {Foo}
  and I move the cursor to <#bar>
```

### move + cursor + target + number + number
```gherkin
When I move the cursor to {Foo} at 100, 200
```

## `open`

### open + notificationsPanel
The next sentence is for *mobile* only:
```gherkin
When I open the notifications panel
```

## `press`

### press + value
```gherkin
When I press "Enter"
  and I press "Ctrl", "Alt", "Del"
```

## `pull`

### pull + value + value
The next sentence is for *mobile* only:
```gherkin
When I pull "/storage/emulated/0/DCIM/logo.png" to "some/path"
```

## `refresh`

### refresh + currentPage
```gherkin
When I refresh the current page
```

### refresh + url
```gherkin
When I refresh the url
```

## `remove`

### remove + app + value
The next sentence is for *mobile* only:
```gherkin
When I remove the app "com.example.android.myapp"
```

## `resize`

### resize + window + value + value
```gherkin
When I resize the window to 600, 400
```

## `rightClick`

### rightClick + target
```gherkin
When I right click {Foo}
  and I right click <#bar>
```

### rightClick + value
```gherkin
When I right click "Foo"
```

## `run`

### run + command

*Run command in the console/terminal*

👉 *Commands should be declared between single quotes (`'`) and must stay in a single line*

```gherkin
When I run the command 'rmdir foo'
  and I run the command './script.sh'
```

### run + script

*Run SQL commands in a database*

```gherkin
When I run the script 'INSERT INTO [MyDB].product ( name, price ) VALUES ( "Soda", 1.50 )'
  and I run the script 'INSERT INTO [MyDB].Users( UserName, UserSex, UserAge ) VALUES ( "Newton", "Male", 25 )'
  and I run the script 'INSERT INTO [MyDB].`my long table name`( 'long column`, `another long column`) VALUES ("Foo", 10)'
```

```gherkin
When I run the script 'UPDATE [MyDB].Users SET UserAge=26, UserStatus="online" WHERE UserName="Newton"'
  and I run the script 'UPDATE [MyDB].`my long table name` SET `long column` = "Bar" WHERE `another long column` = 70'
```

```gherkin
When I run the script 'DELETE FROM [MyDB].Users WHERE UserName="Newton"'
  and I run the script 'DELETE FROM [MyDB].`my long table name` WHERE `another long column` = 70'
```

👉 *Scripts should be declared between single quotes (`'`) and must stay in a single line*

👉 *Always include the reference to the database*

👉 *SQL commands may depend on the used database*

Concordia uses [database-js](https://github.com/mlaanderson/database-js) to access databases and files through a SQL-based interface. The supported SQL syntax may vary from one database to another. In case of problems, please see the [documentation of the corresponding driver](https://github.com/mlaanderson/database-js#drivers).

#### MySQL, PostgreSQL, and ADO databases

Normal syntax, like the aforementioned. Access through ADO currently works only on Windows.

#### JSON and CSV databases

- INSERT accepts only JSON objects or arrays as values
  - Example:
    ```gherkin
    When I run the script 'INSERT INTO [MyDB] VALUES { "name": "Mary", "surname": "Jane", "age": 21 }'
    ```

#### Excel and Firebase databases

Syntax similar to [JSON and CSV databases](json-and-csv-databases). However, it has some limitations, as pointed out in [its documentation](https://github.com/mlaanderson/database-js-firebase) :

> *SQL commands are limited to SELECT, UPDATE, INSERT and DELETE. WHERE works well. JOINs are not allowed. GROUP BY is not supported. LIMIT and OFFSET are combined into a single LIMIT syntax: LIMIT [offset,]number*

#### INI databases

- INSERT
  - Not supported yet by [database-js-ini](https://github.com/mlaanderson/database-js-ini)

- DELETE
  - Not supported yet by [database-js-ini](https://github.com/mlaanderson/database-js-ini)

- UPDATE
  - Example:
    ```gherkin
    When I run the script 'UPDATE [MyDB] SET age = 22 WHERE name = "Mary"'
    ```

#### SQLite databases

Currently [database-js-sqlite](https://github.com/mlaanderson/database-js-sqlite) uses [sql.js](https://github.com/kripken/sql.js) that **doesn't persist the changes made to the database**.


## `saveScreenshot`

### saveScreenshot + value
```gherkin
When I save a screenshot to "foo.png"
  and I take a photo to "bar.png"
```

## `see`

### see + value
```gherkin
Then I see "Foo Bar"
```

### see + not + value
```gherkin
Then I do not see "foo"
  and I don't see "bar"
```

### see + app + value + installed
The next sentence is for *mobile* only:
```gherkin
Then I see that the app "com.example.android.myapp" is installed
```

### see + app + value + not + installed
The next sentence is for *mobile* only:
```gherkin
Then I see that the app "com.example.android.myapp" is not installed
```

### see + currentActivity + value
The next sentence is for *mobile* only:
```gherkin
Then I see that the current activity is ".HomeScreenActivity"
```

### see + device + locked
The next sentence is for *mobile* only:
```gherkin
Then I see that the device is locked
```

### see + device + unlocked
The next sentence is for *mobile* only:
```gherkin
Then I see that the device is unlocked
```

### see + value + inside + target
```gherkin
Then I see "hello" in {foo}
  and I see "world" in <bar>
```

### see + value + not + inside + target
```gherkin
Then I don't see "hello" in {foo}
  and I don't see "world" in <bar>
```

### see + target + with + value
```gherkin
Then I see "hello" in {foo}
  and I see "world" in <bar>
```

### see + not + target + with + value
```gherkin
Then I do not see {Foo} with "hello"
  and I don't see <bar> with "world"
```

### see + not + value
```gherkin
Then I do not see "Foo Bar"
  and I don't see "Foo"
```

### see + target + checked
```gherkin
Then I see {Foo} is checked
  and I see <#bar> is checked
```

### see + not + target + checked
```gherkin
Then I do not see {Foo} is checked
  and I don't see <#bar> is checked
```

### see + cookie + value
```gherkin
Then I see the cookie "foo"
```

### see + not + cookie + value
```gherkin
Then I do not see the cookie "foo"
  and I don't see the cookie "bar"
```

### see + url + value
```gherkin
Then I see the url "/foo"
```

### see + not + url + value
```gherkin
Then I do not see the url "/foo"
  and I don't see the url "/bar"
```

### see + value + inside + title
```gherkin
Then I see "foo" in the title
```

### see + not + value + inside + title
```gherkin
Then I do not see "foo" in the title
  and I don't see "bar" in the title
```

### see + title + with + value
```gherkin
Then I see the title with "foo"
```

### see + not + title + with + value
```gherkin
Then I do not see the title with "foo"
  and I don't see the title with "bar"
```

### see + target
```gherkin
Then I see {Foo}
  and I see <#bar>
```

### see + not + target
```gherkin
Then I do not see {Foo}
  and I don't see <#bar>
```

### see + target + checked
```gherkin
Then I see {Foo} is checked
  and I see <#bar> is checked
```

### see + not + target + checked
```gherkin
Then I do not see {Foo} is checked
  and I don't see <#bar> is checked
```

### see + orientation + landscape
The next sentence is for *mobile* only:
```gherkin
Then I see that the orientation is landscape
```

### see + orientation + portrait
The next sentence is for *mobile* only:
```gherkin
Then I see that the orientation is portrait
```

### see + url + value
```gherkin
Then I see the url "/foo"
```

### see + target + enabled
```gherkin
Then I see {Foo} is enabled
  and I see <#bar> is enabled
```

## `select`

### select + value + inside + target
```gherkin
When I select "foo" in {Foo}
  and I select "bar" in <#bar>
```

## `shake`

### shake + device
The next sentence is for *mobile* only:
```gherkin
When I shake the device
  and I shake the phone
  and I shake the tablet
```

## `swipe`

### swipe + value + number + number
The next sentence is for *mobile* only:
```gherkin
When I swipe "#io.selendroid.myapp:id/LinearLayout1" to 100, 200
```

### swipe + value + down
The next sentence is for *mobile* only:
```gherkin
When I swipe "#io.selendroid.myapp:id/LinearLayout1" down
```

### swipe + value + left
The next sentence is for *mobile* only:
```gherkin
When I swipe "#io.selendroid.myapp:id/LinearLayout1" left
```

### swipe + value + right
The next sentence is for *mobile* only:
```gherkin
When I swipe "#io.selendroid.myapp:id/LinearLayout1" right
```

### swipe + value + up
The next sentence is for *mobile* only:
```gherkin
When I swipe "#io.selendroid.myapp:id/LinearLayout1" up
```

## `switch`

### switch + native
The next sentence is for *mobile* only:
```gherkin
When I switch to native
```

### switch + web
The next sentence is for *mobile* only:
```gherkin
When I switch to web
```

## `tap`

### tap + target
The next sentence is for *mobile* only:
```gherkin
When I tap <~ok>
  and I tap {Confirm}
```

## `uncheck`

### uncheck + target
```gherkin
When I unckeck {Foo}
  and I uncheck <#bar>
```

## `wait`

### wait + seconds
```gherkin
When I wait 2 seconds
```

### wait + target
```gherkin
When I wait for {Foo}
  and I wait for <#bar>
```

### wait + target + seconds
```gherkin
When I wait for {Foo} during 2 seconds
  and I wait for <#bar> during 3 seconds
```

### wait + target + enabled
```gherkin
When I wait {Foo} is enabled
  and I wait <#bar> is enabled
```

### wait + target + invisible
```gherkin
When I wait {Foo} is invisible
  and I wait <#bar> is invisible
```

### wait + target + visible
```gherkin
When I wait {Foo} is visible
  and I wait <#bar> is visible
```

### wait + text + value
```gherkin
When I wait for the text "Foo"
```

### wait + url + value
```gherkin
When I wait for the url "/foo"
```

### wait + url + value + seconds
```gherkin
When I wait for the url "/bar" during 3 seconds
```