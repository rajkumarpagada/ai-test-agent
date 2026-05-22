# Test Cases for SCRUM-11

TC001 - Successfully Add Product to Cart from Detail Page
  Type: Positive
  Given: User is logged in with valid credentials and is on the inventory page
  When: User clicks on a product name or image, then clicks "Add to Cart" on the product detail page
  Then: Cart badge updates to 1, reflecting the added item

TC002 - Product Detail Page Displays Correct Information
  Type: Positive
  Given: User is logged in and on the inventory page
  When: User clicks on any product name or image to open the product detail page
  Then: Product detail page displays the correct product name, description, price, and an "Add to Cart" button

TC003 - Cart Persists After Returning to Inventory Page
  Type: Positive
  Given: User has added a product to the cart from the product detail page and cart badge shows 1
  When: User clicks the "Back to Products" button
  Then: User is returned to the inventory page and the cart icon still displays a badge count of 1