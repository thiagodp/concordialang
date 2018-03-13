# CodeceptJS

Actions:

- I [ dont ] see "text"
- I [ dont ] see element with { text | id | name | xpath | css } "value"
    - default is `name`
- I [ dont ] see in current url "/path"
- I see in field with { text | id | name | xpath | css } "value"
- I [ dont ] see that "name" is checked
- I wait [ 1 second ] [ for { element | enabled | invisible | visible | staleness } "name" ]
- I wait [ 1 second ] for text "text"
- I fill field "name" with "value"
- I append field "name" with "value"
- I select option "name" with "value"
- I check option "name"
- I clear field "name"
- I press key "key" [, "key2", "key3", ...]
- I move cursor to "name" [ position "x,y" ]

Browser-only actions:
- I am on page "url"
- I clear cookie [ "name" ]
- I set cookie "name" with "value"
- I [ dont ] see cookie "name"
- I see in title "value"
- I resize window to "800x600" `<< width x height `
- I attach file "path" to "name"

Mobile-only actions:
- I tap "text"
- I { show | hide } device keyboard
- I swipe { up | down | left | right } "name"
- I switch to web
- I switch to native

Element filters, when used without the `with` keyword :
  - `#element` = id
  - `element` = id
  - `@element` = name
  - `.element` = css
  - `//element` = xpath
  - `~element` = mobile name `<< MOBILE ONLY`