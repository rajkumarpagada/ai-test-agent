# Test Cases for SCRUM-8

TC001 - Successful Login and Sort Products by Price Low to High
  Type: Positive
  Given: User is on the login page
  When: User enters valid credentials and logs in, then selects "Price Low to High" sort option
  Then: Products are displayed in ascending price order

TC002 - Product Order Persists After Sorting
  Type: Positive
  Given: User is logged in and on the products page
  When: User selects "Price Low to High" from the sort dropdown
  Then: All products are reordered with the lowest priced item first and highest priced item last

TC003 - Sort Applied Across Multiple Products
  Type: Positive
  Given: User is logged in and the product page contains multiple items with varying prices
  When: User selects "Price Low to High" sort option
  Then: Every product is displayed in correct ascending price sequence with no items out of order