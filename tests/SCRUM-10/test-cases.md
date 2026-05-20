# Test Cases for SCRUM-10

TC001 - Successful Login and Navigation to Inventory Page
  Type: Positive
  Given: User is on the login page with valid credentials available
  When: User enters valid username and password and clicks Login
  Then: Login succeeds and the inventory page is displayed

TC002 - Add Two Products to Cart
  Type: Positive
  Given: User is logged in and on the inventory page
  When: User adds the first product to the cart, then adds the second product to the cart
  Then: The cart badge displays 2 items

TC003 - Remove Item, Proceed to Checkout and Confirm Order
  Type: Positive
  Given: User has 2 items in the cart and has opened the cart page
  When: User removes the first product, then proceeds to checkout and completes the order
  Then: The cart shows 1 remaining item during removal and the order confirmation page is displayed after checkout