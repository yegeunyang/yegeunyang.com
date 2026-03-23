---
title: T-SQL Fundamentals
pubDatetime: 2026-03-23T02:17:24.316Z
tags:
  - Lab
  - T-SQL
description:
  Test your knowledge with this quick lab about T-SQL Fundamentals.
---

## Note
- Using an asterisk (`*`) in the `SELECT` clause is considered a bad programming practice. Always **explicitly list all attributes you need**.
- A table has no guaranteed order of rows unless you specify an `ORDER BY` clause. Think of it like a mathematical set with duplicates allowed. For example, if you use the `TOP` filter without an `ORDER BY` clause, the result is non-deterministic, and you may get different rows each time you run the query. Note that even if you use `ORDER BY`, if there are ties in the `ORDER BY` columns, the result is still non-deterministic.
- T-SQL uses **three-valued predicate logic**, meaning that predicates can evaluate to `TRUE`, `FALSE`, or `UNKNOWN`. **When you compare anything to `NULL`, the result is `UNKNOWN`.**
- The following query is not valid.
  ```sql
  SELECT orderid, YEAR(orderdate) AS orderyear, orderyear + 1 AS nextyear
  FROM Sales.Orders;
  ```
  - You cannot refer to a column alias in the same `SELECT` clause where it was defined.
  - **SQL evaluates all expressions in the same logical phase simultaneously**, so the column alias `orderyear` is not yet available when `nextyear` is being evaluated.
- When you use `SELECT DISTINCT`, you are restricted in the `ORDER BY` list only to elements that appear in the `SELECT` list.

## Quiz
<details style="margin-bottom: 1rem; width: 100%;">
<summary>What is the order in which the query clauses are logically processed?</summary>

1. **FROM**
2. WHERE
3. GROUP BY
4. HAVING
5. **SELECT**
6. ORDER BY

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>What is the requirement for the GROUP BY clause?</summary>

- All expressions you specify in logical phases subsequent to the `GROUP BY` phase are required to return a **scalar value for each group**.

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>What does sargable query mean?</summary>

- A query is `sargable` if the database engine can **efficiently utilize indexes**. If a query is `non-sargable`, the database is forced to read every single row in the table (a "full table scan"), which can lead to poor performance.
</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>Why should you avoid using functions or applying manipulations on the columns in the WHERE clause?</summary>

- This is a classic example of a `non-sargable` query. When you apply a function to a column in the `WHERE` clause, the database engine cannot use any indexes on that column, and it has to perform a full table scan to evaluate the condition for each row. This can cause significant performance issues.
- For example, the following query is not `sargable`:
  ```sql
  SELECT transactionid, transactiondate
  FROM Finance.Transactions
  WHERE YEAR(transactiondate) = 2025 AND MONTH(transactiondate) = 5;
  ```
- Instead, you can rewrite it to this `sargable` query:
  ```sql
  SELECT transactionid, transactiondate
  FROM Finance.Transactions
  WHERE transactiondate >= '2025-05-01' AND transactiondate < '2025-06-01';
  ```

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>SQL uses different criteria for evaluating expressions in terms of the three-valued logic. Explain.</summary>

- **SQL only accepts `TRUE` for query filters and only rejects `FALSE` for `CHECK` constraints.**
- For example, the following query will return all rows where `isActive` is `TRUE`, but it will not return rows where `isActive` is `NULL`:
  ```sql
  SELECT *
  FROM Users
  WHERE isActive = TRUE;
  ```
- Another example is, if you have `WHERE Id NOT IN (1, 2, NULL)`, you will always get zero rows because the condition evaluates to `UNKNOWN` for all rows.

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>Why should you always use IS NULL for checking NULL values?</summary>

- When you compare anything to `NULL` using the equality operator (`=`), the result is always `UNKNOWN`, even if you are comparing `NULL` to `NULL`. Therefore, you should always use the `IS NULL` operator to check for `NULL` values.

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>Does T-SQL consider two NULLs equal?</summary>

- T-SQL does not consider two `NULL` values as equal for equality comparison purposes. However, for grouping and sorting purposes, T-SQL treats `NULL` values as equal. This means that when you use `GROUP BY` or `ORDER BY`, all `NULL` values will be grouped together and sorted together.

</details>

<details style="margin-bottom: 1rem; width: 100%;">
<summary>Explain the CASE expression.</summary>

- **A `CASE` expression is a scalar expression.** It is allowed whenever a scalar expression is allowed.
- There are two types of `CASE` expressions: the **simple** and the **searched**.
- The simple `CASE` expression compares an expression to a set of simple expressions to determine the result. The following is an example of a simple `CASE` expression:
  ```sql
  SELECT 
      FirstName,
      LastName,
      DepartmentID,
      CASE DepartmentID
          WHEN 1 THEN 'Human Resources'
          WHEN 2 THEN 'Information Technology'
          WHEN 3 THEN 'Finance'
          ELSE 'Unknown Department'
      END AS DepartmentName
  FROM Employees;
  ```
- The searched `CASE` expression evaluates a set of Boolean expressions to determine the result. The following is an example of a searched `CASE` expression:
  ```sql
  SELECT 
      ProductName,
      Price,
      CASE
          WHEN Price = 0 OR Price IS NULL THEN 'N/A'
          WHEN Price < 100 THEN 'Under $100'
          WHEN Price >= 100 AND Price < 500 THEN 'Between $100 and $500'
          ELSE 'Over $500'
      END AS PriceCategory
  FROM Products;
  ```
- Notice that for the simple `CASE` expression, the `CASE` keyword is followed by an expression (`DepartmentID`), and each `WHEN` clause compares that expression to simple expressions. For the searched `CASE` expression, the `CASE` keyword is not followed by an expression, and each `WHEN` clause contains a Boolean expression.

</details>

## References
- T-SQL Fundamentals 4th Edition by Itzik Ben-Gan