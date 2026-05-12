# Test Cases for SCRUM-5

TC001 - Successful Login with Valid Credentials
  Type: Positive
  Given: User is on the login page with a registered account
  When: User enters valid username and password, then clicks Login
  Then: User is redirected to the dashboard and sees a welcome message

TC002 - Successful Login with Remember Me Option
  Type: Positive
  Given: User is on the login page with a registered account
  When: User enters valid credentials, checks "Remember Me", and clicks Login
  Then: User is logged in and session persists after browser is closed/reopened

TC003 - Login Fails with Invalid Password
  Type: Negative
  Given: User is on the login page with a registered account
  When: User enters a valid username but incorrect password and clicks Login
  Then: An error message is displayed and user remains on the login page

TC004 - Login Fails with Unregistered Email
  Type: Negative
  Given: User is on the login page
  When: User enters an email that does not exist in the system and clicks Login
  Then: An error message is displayed indicating invalid credentials

TC005 - Login Fails with Empty Fields
  Type: Negative
  Given: User is on the login page
  When: User leaves username and password fields empty and clicks Login
  Then: Validation error messages are shown for both required fields

TC006 - Login with Maximum Length Credentials
  Type: Edge Case
  Given: User is on the login page with an account using max-length username/password
  When: User enters credentials at the maximum allowed character limit and clicks Login
  Then: User is logged in successfully without any errors

TC007 - Login with SQL Injection Input
  Type: Edge Case
  Given: User is on the login page
  When: User enters SQL injection string (e.g., `' OR '1'='1`) in the username field
  Then: Login is rejected and no unauthorized access is granted

TC008 - Login After Multiple Failed Attempts (Account Lockout)
  Type: Edge Case
  Given: User has already failed the maximum allowed number of login attempts
  When: User tries to login again with any credentials
  Then: Account is locked and an appropriate lockout message is displayed