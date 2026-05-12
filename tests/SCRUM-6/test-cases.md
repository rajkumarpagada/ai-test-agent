# Test Cases for SCRUM-6

TC001 - Successful Login with Valid Credentials
  Type: Positive
  Given: User is on the login page
  When: User enters valid email and password, then submits the form
  Then: Login succeeds and user is redirected to the "Who's Watching" screen

TC002 - Create New Profile with Avatar and Name
  Type: Positive
  Given: User is on the "Who's Watching" screen
  When: User clicks "Create Profile", selects an avatar, enters a valid profile name, and clicks Continue
  Then: New profile is saved and displayed on the "Who's Watching" screen

TC003 - Full End-to-End Login and Profile Creation Flow
  Type: Positive
  Given: User has a valid account and no existing profile created
  When: User logs in with valid credentials, clicks "Create Profile", selects an avatar, enters a profile name, and clicks Continue
  Then: User is successfully logged in, new profile is created and visible on the "Who's Watching" screen