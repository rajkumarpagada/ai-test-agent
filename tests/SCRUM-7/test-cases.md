# Test Cases for SCRUM-7

TC001 - Successful Login with Valid Credentials
  Type: Positive
  Given: User is on the login page
  When: User enters valid username and password and clicks Login
  Then: Login succeeds and the inventory page is displayed

TC002 - Add Product to Cart and Verify
  Type: Positive
  Given: User is logged in and on the inventory page
  When: User clicks "Add to Cart" on a product and navigates to the cart
  Then: The correct product is displayed in the cart

TC003 - Complete Checkout and Confirm Order
  Type: Positive
  Given: User has a product in the cart and proceeds to checkout
  When: User enters valid shipping details and submits the order
  Then: Order is confirmed successfully