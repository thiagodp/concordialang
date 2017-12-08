
Feature: Login
  ...

@importance( 8 )
Scenario: Successful login
  ...

Template: Usual login
  Given that I am on the Login Page
  When I fill Username
    And I fill Password
    And I click on Enter
  Then I have the state "logged in"
    And I see the text ${welcomeText}
    And I see a button "Logout"
    And I am on the Root Page

Scenario: ...

...    


# "Low-level" declarations

State: logged in

Constants:
  - "welcomeText" is "Welcome, %s"
  - "msg_min_len" is "{name} must have at least {min_length} characters."
  - "invalid_username_password" is "Invalid username or password."
  - "msg_password_too_weak" is "The given password is too weak."


UI Element: Login Page
  - type is url
  - value is "/login"
	
UI Element: Username
  - type is textbox
  - id is "username"
  - data type is string
  - minimal length is 2,
    otherwise I must see the message ${msg_min_len}
  - maximum length is 30
  - value is queried by 'SELECT username FROM users',  
    otherwise I must see ${invalid_username_password}
	
UI Element: Password
  - type is textbox
  - id is "password"  
  - minimal length is 6,
    otherwise I must see the message "Password is too short."
	    and I must see the color be changed to "red"
	    and I must see the color of Username be changed to "red"
  - value is queried by 'SELECT password FROM users WHERE username = ${Username}',
    otherwise I must see ${invalid_username_password}
	
UI Element: Enter
  - type is button
  - id is "enter"