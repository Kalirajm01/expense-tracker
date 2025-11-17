# Expense Tracker - Complete Test Suite

## Test Environment

- **Frontend**: React
- **Backend**: Flask
- **Database**: PostgreSQL
- **Browser**: Chrome
- **Device**: Laptop
- **OS**: Windows 11
- **Date**: 15/11/2025

## Test Status Legend

- ⬜ Not Tested
- ✅ Pass
- ❌ Fail
- 🔄 In Progress
- ⚠️ Blocked

---

## 1. Navigation Tests

### 1.1 Navbar Navigation

- **TC-NAV-001**: Verify all navigation links are present ✅
- **TC-NAV-002**: Test Home button navigation ✅
- **TC-NAV-003**: Test Categories button navigation ✅
- **TC-NAV-004**: Test Summary button navigation ✅
- **TC-NAV-005**: Verify active state for current page ✅

---

## 2. Home Page Tests

### 2.1 Total Expense Card

- **TC-HOME-001**: Verify total expense amount is displayed correctly ✅
- **TC-HOME-002**: Verify amount updates after adding/removing expenses ✅

### 2.2 Monthly Expense Graph

- **TC-HOME-003**: Verify graph displays data for current month by default ✅
- **TC-HOME-004**: Test graph updates with new expenses ✅
- **TC-HOME-005**: Verify tooltips on graph points ✅

### 2.3 Add Expense Modal

- **TC-EXP-001**: Open/Close expense modal ✅
- **TC-EXP-002**: Submit valid expense ✅
- **TC-EXP-003**: Test required field validation ✅
- **TC-EXP-004**: Test date picker functionality ✅
- **TC-EXP-005**: Test category dropdown population ✅
- **TC-EXP-006**: Test duplicate expense confirmation (same description, amount, date) ✅
- **TC-EXP-007**: Test form reset after submission ✅
- **TC-EXP-008**: Test form reset on cancel ✅

### 2.4 Recent Expenses Table

- **TC-TABLE-001**: Verify table displays recent expenses ✅
- **TC-TABLE-002**: Test pagination functionality ✅
- **TC-TABLE-003**: Verify table sorting (recent) ✅
- **TC-TABLE-004**: Test table responsiveness ✅

---

## 3. Categories Page Tests

### 3.1 Category Management

- **TC-CAT-001**: Add new category ✅
- **TC-CAT-002**: Edit existing category ✅
- **TC-CAT-003**: Delete category ✅
- **TC-CAT-004**: Test empty category validation ✅
- **TC-CAT-005**: Test duplicate category prevention ✅
- **TC-CAT-006**: Verify category is used in expense form ✅

### 3.2 Categories Table

- **TC-CAT-007**: Verify all categories are listed ✅
- **TC-CAT-008**: Test edit category in table ✅
- **TC-CAT-009**: Test delete category from table ✅
- **TC-CAT-010**: Verify delete confirmation dialog ✅

---

## 4. Summary Page Tests

### 4.1 Summary Cards

- **TC-SUM-001**: Verify total expense card ✅
- **TC-SUM-002**: Verify top categories card ✅
- **TC-SUM-003**: Verify data updates with new expenses ✅

### 4.2 Filtering

- **TC-FILTER-001**: Filter by date range ✅
- **TC-FILTER-002**: Filter by category ✅
- **TC-FILTER-003**: Combined date and category filter ✅
- **TC-FILTER-004**: Clear filters ✅

### 4.3 Recent Expenses Table

- **TC-SUM-TABLE-001**: Verify table displays filtered expenses ✅
- **TC-SUM-TABLE-002**: Test delete expense from summary ✅
- **TC-SUM-TABLE-003**: Verify delete confirmation ✅

---

## 5. Data Integrity Tests

### 5.1 Database Operations

- **TC-DB-001**: Add expense and verify in database ✅
- **TC-DB-002**: Edit expense and verify update ✅
- **TC-DB-003**: Delete expense and verify removal ✅
- **TC-DB-004**: Add category and verify in database ✅
- **TC-DB-005**: Delete category and verify cascade ✅

### 5.2 Form Validation

- **TC-VAL-001**: Test all required fields ✅
- **TC-VAL-002**: Test amount validation (positive numbers only) ✅
- **TC-VAL-003**: Test date format validation ✅
- **TC-VAL-004**: Test category selection validation ✅

---

## 6. UI/UX Tests

### 6.1 Responsiveness

- **TC-UI-001**: Test on mobile view ✅
- **TC-UI-002**: Test on tablet view ✅
- **TC-UI-003**: Test on desktop view ✅

### 6.2 User Feedback

- **TC-FEEDBACK-001**: Verify success messages ✅
- **TC-FEEDBACK-002**: Verify error messages ✅
- **TC-FEEDBACK-003**: Verify loading states ✅

---

## Detailed Test Scenarios

### 1. Expense Creation Scenarios

#### Basic Validation

1. **Empty Form Submission**

   - Leave all fields blank and submit ✅
   - Expected: Show validation errors for all required fields
   - Related TC: TC-VAL-001, TC-EXP-003

2. **Minimum Valid Entry**

   - Enter only required fields (amount, description, date, category) ✅
   - Expected: Expense is saved successfully
   - Related TC: TC-EXP-002

3. **Special Characters in Description**

   - Use special characters in description: `!@#$%^&*()` ✅
   - Expected: Handles special characters correctly
   - Related TC: TC-VAL-001

#### Amount Field

5. **Negative Amount**

   - Enter negative amount (-100) ✅
   - Expected: Shows validation error
   - Related TC: TC-VAL-002

6. **Zero Amount**

   - Enter 0 as amount ✅
   - Expected: Shows validation error
   - Related TC: TC-VAL-002

7. **Large Amount**

   - Enter amount with many digits (e.g., 999999999999.99) ✅
   - Expected: Handles large numbers correctly
   - Related TC: TC-VAL-002

8. **Decimal Values**
   - Enter amount with 3+ decimal places ✅
   - Expected: Rounds to 2 decimal places
   - Related TC: TC-VAL-002

### 2. Duplicate Expense Scenarios

9. **Exact Duplicate**

   - Same description, amount, and date as existing expense ✅
   - Expected: Shows confirmation dialog
   - Related TC: TC-EXP-006

10. **Similar but Different**

    - Same description and amount, different date ✅
    - Expected: Saves as new expense
    - Related TC: TC-EXP-002

11. **Different Case Description**

    - Same text but different case in Category name (e.g., "Lunch" vs "lunch") ✅
    - Expected: May be treated as duplicate based on case sensitivity
    - Related TC: TC-EXP-006

12. **Leading/Trailing Spaces**
    - Same text with extra spaces in Category name (" Lunch " vs "Lunch") ✅
    - Expected: May be treated as duplicate
    - Related TC: TC-EXP-006

### 3. Category Management Scenarios

13. **Add Empty Category**

    - Try to add a category with just spaces ✅
    - Expected: Shows validation error
    - Related TC: TC-CAT-004

14. **Duplicate Category**

    - Try to add a category that already exists ✅
    - Expected: Shows duplicate error
    - Related TC: TC-CAT-005

15. **Edit Category in Use**

    - Edit a category that's being used by expenses ✅
    - Expected: Updates all references
    - Related TC: TC-CAT-002, TC-DB-002

16. **Delete Category in Use**
    - Try to delete a category with expenses ✅
    - Expected: Shows warning/prevents deletion
    - Related TC: TC-CAT-003, TC-CAT-010

## Test Summary

- **Total Test Cases**: 72
- **Passed**: 72
- **Failed**: 0
- **Not Started**: 0
- **In Progress**: 0
- **Blocked**: 0
