require("dotenv").config();
const { Pool } = require("pg");
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const User = require("../models/User");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ============================================================
// POSTGRESQL SEED - Creates tables and inserts sample data
// ============================================================
const seedPostgres = async () => {
  const client = await pool.connect();
  console.log("🌱 Seeding PostgreSQL...");

  try {
    await client.query("BEGIN");

    // Drop existing tables if re-seeding
    await client.query(`
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS employees CASCADE;
      DROP TABLE IF EXISTS departments CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
      DROP TABLE IF EXISTS courses CASCADE;
      DROP TABLE IF EXISTS enrollments CASCADE;
    `);

    // --- EMPLOYEES & DEPARTMENTS ---
    await client.query(`
      CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(100),
        budget NUMERIC(15, 2)
      );

      CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        department_id INT REFERENCES departments(id),
        salary NUMERIC(10, 2),
        hire_date DATE,
        job_title VARCHAR(100),
        manager_id INT REFERENCES employees(id)
      );
    `);

    await client.query(`
      INSERT INTO departments (name, location, budget) VALUES
        ('Engineering', 'New York', 1500000),
        ('Marketing', 'Los Angeles', 800000),
        ('Sales', 'Chicago', 1200000),
        ('HR', 'New York', 500000),
        ('Finance', 'Chicago', 900000);
    `);

    await client.query(`
      INSERT INTO employees (first_name, last_name, email, department_id, salary, hire_date, job_title, manager_id) VALUES
        ('Alice', 'Johnson', 'alice@company.com', 1, 95000, '2019-03-15', 'Senior Engineer', NULL),
        ('Bob', 'Smith', 'bob@company.com', 1, 78000, '2020-07-22', 'Engineer', 1),
        ('Carol', 'Williams', 'carol@company.com', 2, 65000, '2021-01-10', 'Marketing Manager', NULL),
        ('David', 'Brown', 'david@company.com', 3, 72000, '2018-11-05', 'Sales Lead', NULL),
        ('Eva', 'Davis', 'eva@company.com', 1, 88000, '2020-04-18', 'Senior Engineer', 1),
        ('Frank', 'Miller', 'frank@company.com', 3, 55000, '2022-06-30', 'Sales Rep', 4),
        ('Grace', 'Wilson', 'grace@company.com', 4, 60000, '2021-09-12', 'HR Specialist', NULL),
        ('Henry', 'Moore', 'henry@company.com', 5, 82000, '2019-12-01', 'Financial Analyst', NULL),
        ('Iris', 'Taylor', 'iris@company.com', 2, 58000, '2022-02-14', 'Marketing Analyst', 3),
        ('Jack', 'Anderson', 'jack@company.com', 1, 70000, '2021-08-03', 'Engineer', 1),
        ('Karen', 'Thomas', 'karen@company.com', 5, 90000, '2018-05-22', 'Finance Manager', NULL),
        ('Leo', 'Jackson', 'leo@company.com', 3, 61000, '2023-01-16', 'Sales Rep', 4);
    `);

    // --- CUSTOMERS, PRODUCTS, ORDERS ---
    await client.query(`
      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        city VARCHAR(100),
        country VARCHAR(50),
        joined_date DATE
      );

      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        price NUMERIC(10, 2),
        stock_quantity INT,
        supplier VARCHAR(100)
      );

      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(id),
        order_date DATE,
        status VARCHAR(20) DEFAULT 'pending',
        total_amount NUMERIC(10, 2)
      );

      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id),
        product_id INT REFERENCES products(id),
        quantity INT,
        unit_price NUMERIC(10, 2)
      );
    `);

    await client.query(`
      INSERT INTO customers (name, email, city, country, joined_date) VALUES
        ('Liam Brown', 'liam@email.com', 'New York', 'USA', '2020-01-15'),
        ('Emma Wilson', 'emma@email.com', 'London', 'UK', '2020-03-22'),
        ('Noah Garcia', 'noah@email.com', 'Madrid', 'Spain', '2021-07-10'),
        ('Olivia Martinez', 'olivia@email.com', 'New York', 'USA', '2019-11-05'),
        ('William Lee', 'william@email.com', 'Seoul', 'South Korea', '2022-02-28'),
        ('Sophia Hernandez', 'sophia@email.com', 'Mexico City', 'Mexico', '2021-05-17'),
        ('James Wang', 'james@email.com', 'Shanghai', 'China', '2020-08-03'),
        ('Isabella Clark', 'isabella@email.com', 'Sydney', 'Australia', '2022-04-12'),
        ('Benjamin Lewis', 'ben@email.com', 'Toronto', 'Canada', '2019-06-30'),
        ('Mia Robinson', 'mia@email.com', 'Paris', 'France', '2023-01-08');
    `);

    await client.query(`
      INSERT INTO products (name, category, price, stock_quantity, supplier) VALUES
        ('Laptop Pro 15', 'Electronics', 1299.99, 50, 'TechCorp'),
        ('Wireless Headphones', 'Electronics', 79.99, 200, 'AudioMax'),
        ('Running Shoes', 'Sports', 89.99, 150, 'SportsFit'),
        ('Coffee Maker', 'Kitchen', 49.99, 80, 'HomeGoods'),
        ('SQL Mastery Book', 'Books', 39.99, 300, 'EduPress'),
        ('Yoga Mat', 'Sports', 29.99, 120, 'SportsFit'),
        ('Standing Desk', 'Furniture', 449.99, 30, 'OfficePro'),
        ('Web Cam HD', 'Electronics', 59.99, 90, 'TechCorp'),
        ('Protein Powder', 'Health', 34.99, 200, 'NutriLife'),
        ('Mechanical Keyboard', 'Electronics', 129.99, 75, 'TechCorp');
    `);

    await client.query(`
      INSERT INTO orders (customer_id, order_date, status, total_amount) VALUES
        (1, '2023-01-05', 'completed', 1379.98),
        (2, '2023-01-12', 'completed', 109.98),
        (3, '2023-02-03', 'completed', 89.99),
        (1, '2023-02-20', 'completed', 49.99),
        (4, '2023-03-01', 'pending', 129.99),
        (5, '2023-03-15', 'completed', 519.98),
        (2, '2023-04-02', 'completed', 79.99),
        (6, '2023-04-18', 'shipped', 74.98),
        (7, '2023-05-09', 'completed', 449.99),
        (1, '2023-05-22', 'completed', 34.99),
        (8, '2023-06-01', 'pending', 199.98),
        (9, '2023-06-14', 'completed', 1299.99);
    `);

    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
        (1, 1, 1, 1299.99), (1, 2, 1, 79.99),
        (2, 2, 1, 79.99), (2, 6, 1, 29.99),
        (3, 3, 1, 89.99),
        (4, 4, 1, 49.99),
        (5, 10, 1, 129.99),
        (6, 7, 1, 449.99), (6, 8, 1, 59.99),
        (7, 2, 1, 79.99),
        (8, 6, 1, 29.99), (8, 9, 1, 34.99),
        (9, 7, 1, 449.99),
        (10, 9, 1, 34.99),
        (11, 10, 1, 129.99), (11, 8, 1, 59.99),
        (12, 1, 1, 1299.99);
    `);

    // --- STUDENTS & COURSES ---
    await client.query(`
      CREATE TABLE students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        gpa NUMERIC(3, 2),
        major VARCHAR(100),
        enrollment_year INT
      );

      CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        course_code VARCHAR(20) UNIQUE NOT NULL,
        title VARCHAR(150) NOT NULL,
        credits INT,
        department VARCHAR(100),
        instructor VARCHAR(100)
      );

      CREATE TABLE enrollments (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES students(id),
        course_id INT REFERENCES courses(id),
        semester VARCHAR(20),
        grade VARCHAR(5),
        UNIQUE(student_id, course_id, semester)
      );
    `);

    await client.query(`
      INSERT INTO students (name, email, gpa, major, enrollment_year) VALUES
        ('Alex Carter', 'alex@uni.edu', 3.8, 'Computer Science', 2021),
        ('Bella Ford', 'bella@uni.edu', 3.5, 'Mathematics', 2020),
        ('Charlie Green', 'charlie@uni.edu', 2.9, 'Physics', 2022),
        ('Diana Hall', 'diana@uni.edu', 3.9, 'Computer Science', 2021),
        ('Ethan Irwin', 'ethan@uni.edu', 3.2, 'Business', 2020),
        ('Fiona James', 'fiona@uni.edu', 3.7, 'Computer Science', 2022),
        ('George King', 'george@uni.edu', 2.7, 'Physics', 2021);

      INSERT INTO courses (course_code, title, credits, department, instructor) VALUES
        ('CS101', 'Introduction to Programming', 3, 'CS', 'Prof. Smith'),
        ('CS201', 'Data Structures', 3, 'CS', 'Prof. Johnson'),
        ('CS301', 'Database Systems', 3, 'CS', 'Prof. Williams'),
        ('MATH101', 'Calculus I', 4, 'Math', 'Prof. Brown'),
        ('MATH201', 'Linear Algebra', 3, 'Math', 'Prof. Davis'),
        ('PHYS101', 'Physics I', 4, 'Physics', 'Prof. Wilson'),
        ('BUS101', 'Business Fundamentals', 3, 'Business', 'Prof. Moore');

      INSERT INTO enrollments (student_id, course_id, semester, grade) VALUES
        (1, 1, 'Fall 2021', 'A'), (1, 2, 'Spring 2022', 'A-'), (1, 3, 'Fall 2022', 'B+'),
        (2, 4, 'Fall 2020', 'A'), (2, 5, 'Spring 2021', 'B+'), (2, 1, 'Fall 2020', 'A-'),
        (3, 6, 'Fall 2022', 'B'), (3, 1, 'Fall 2022', 'C+'),
        (4, 1, 'Fall 2021', 'A'), (4, 2, 'Spring 2022', 'A'), (4, 3, 'Fall 2022', 'A'),
        (5, 7, 'Fall 2020', 'B+'), (5, 1, 'Fall 2020', 'B'),
        (6, 1, 'Fall 2022', 'A-'), (6, 3, 'Spring 2023', 'B+'),
        (7, 6, 'Fall 2021', 'C'), (7, 4, 'Spring 2022', 'B');
    `);

    await client.query("COMMIT");
    console.log("✅ PostgreSQL seeded successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ PostgreSQL seeding error:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================
// MONGODB SEED - Creates assignment documents
// ============================================================
const seedMongoDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("🌱 Seeding MongoDB...");

  await Assignment.deleteMany({});

  const assignments = [
    {
      title: "Find High-Earning Employees",
      description:
        "Practice basic filtering with WHERE clause on numeric conditions.",
      difficulty: "Easy",
      category: "SELECT",
      question:
        "Retrieve the first_name, last_name, and salary of all employees who earn more than $75,000. Order results by salary in descending order.",
      expectedOutputDescription:
        "A list of employees with salaries above 75000, sorted highest first.",
      tables: [
        {
          tableName: "employees",
          description:
            "Contains employee information including names, salaries, and department assignments.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            {
              name: "first_name",
              type: "VARCHAR(50)",
              constraints: "NOT NULL",
            },
            { name: "last_name", type: "VARCHAR(50)", constraints: "NOT NULL" },
            { name: "email", type: "VARCHAR(100)", constraints: "UNIQUE" },
            {
              name: "department_id",
              type: "INT",
              constraints: "FK → departments.id",
            },
            { name: "salary", type: "NUMERIC(10,2)", constraints: "" },
            { name: "hire_date", type: "DATE", constraints: "" },
            { name: "job_title", type: "VARCHAR(100)", constraints: "" },
          ],
        },
      ],
      tags: ["WHERE", "ORDER BY", "numeric filter"],
      order: 1,
    },
    {
      title: "Count Employees Per Department",
      description: "Use GROUP BY and aggregate functions to summarize data.",
      difficulty: "Easy",
      category: "Aggregation",
      question:
        "Write a query to find the number of employees in each department. Show the department name and the employee count. Only include departments that have at least 2 employees.",
      expectedOutputDescription:
        "Department names paired with their employee count, filtered to departments with 2+ employees.",
      tables: [
        {
          tableName: "employees",
          description: "Employee records with department assignments.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            { name: "first_name", type: "VARCHAR(50)", constraints: "" },
            { name: "last_name", type: "VARCHAR(50)", constraints: "" },
            {
              name: "department_id",
              type: "INT",
              constraints: "FK → departments.id",
            },
            { name: "salary", type: "NUMERIC(10,2)", constraints: "" },
          ],
        },
        {
          tableName: "departments",
          description: "Department information.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            { name: "name", type: "VARCHAR(100)", constraints: "" },
            { name: "location", type: "VARCHAR(100)", constraints: "" },
          ],
        },
      ],
      tags: ["GROUP BY", "HAVING", "COUNT", "JOIN"],
      order: 2,
    },
    {
      title: "Top Customers by Total Spending",
      description:
        "Join multiple tables and rank customers by their total order amounts.",
      difficulty: "Medium",
      category: "JOIN",
      question:
        "Find the top 5 customers by total amount spent on completed orders. Display the customer name, their city, the number of orders they placed, and their total spending. Sort by total spending descending.",
      expectedOutputDescription:
        "Top 5 customers with order count and total spending, sorted by spending.",
      tables: [
        {
          tableName: "customers",
          description: "Customer information.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            { name: "name", type: "VARCHAR(100)", constraints: "" },
            { name: "email", type: "VARCHAR(100)", constraints: "" },
            { name: "city", type: "VARCHAR(100)", constraints: "" },
            { name: "country", type: "VARCHAR(50)", constraints: "" },
          ],
        },
        {
          tableName: "orders",
          description: "Order records linked to customers.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            {
              name: "customer_id",
              type: "INT",
              constraints: "FK → customers.id",
            },
            { name: "order_date", type: "DATE", constraints: "" },
            { name: "status", type: "VARCHAR(20)", constraints: "" },
            { name: "total_amount", type: "NUMERIC(10,2)", constraints: "" },
          ],
        },
      ],
      tags: ["JOIN", "GROUP BY", "SUM", "ORDER BY", "LIMIT"],
      order: 3,
    },
    {
      title: "Products Never Ordered",
      description:
        "Use LEFT JOIN or subquery to find records with no matches in another table.",
      difficulty: "Medium",
      category: "Subquery",
      question:
        "Find all products that have never been ordered. Display the product name, category, and price. These are products that don't appear in the order_items table at all.",
      expectedOutputDescription: "Products with no entries in order_items.",
      tables: [
        {
          tableName: "products",
          description: "Product catalog.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            { name: "name", type: "VARCHAR(100)", constraints: "" },
            { name: "category", type: "VARCHAR(50)", constraints: "" },
            { name: "price", type: "NUMERIC(10,2)", constraints: "" },
            { name: "stock_quantity", type: "INT", constraints: "" },
          ],
        },
        {
          tableName: "order_items",
          description: "Line items for each order.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            { name: "order_id", type: "INT", constraints: "FK → orders.id" },
            {
              name: "product_id",
              type: "INT",
              constraints: "FK → products.id",
            },
            { name: "quantity", type: "INT", constraints: "" },
            { name: "unit_price", type: "NUMERIC(10,2)", constraints: "" },
          ],
        },
      ],
      tags: ["LEFT JOIN", "NOT IN", "subquery", "NULL check"],
      order: 4,
    },
    {
      title: "Average Salary by Department (With Filter)",
      description:
        "Combine JOINs with GROUP BY and HAVING to find departments with high average salaries.",
      difficulty: "Medium",
      category: "Aggregation",
      question:
        "Calculate the average salary for each department. Show only departments where the average salary exceeds $70,000. Display the department name, average salary (rounded to 2 decimal places), and the highest salary in that department.",
      expectedOutputDescription:
        "Departments with average salary > 70000, showing avg and max salary.",
      tables: [
        {
          tableName: "employees",
          description: "Employee salaries and department assignments.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            { name: "first_name", type: "VARCHAR(50)", constraints: "" },
            { name: "last_name", type: "VARCHAR(50)", constraints: "" },
            {
              name: "department_id",
              type: "INT",
              constraints: "FK → departments.id",
            },
            { name: "salary", type: "NUMERIC(10,2)", constraints: "" },
          ],
        },
        {
          tableName: "departments",
          description: "Department details.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            { name: "name", type: "VARCHAR(100)", constraints: "" },
            { name: "location", type: "VARCHAR(100)", constraints: "" },
          ],
        },
      ],
      tags: ["AVG", "MAX", "ROUND", "HAVING", "GROUP BY"],
      order: 5,
    },
    {
      title: "Students With All CS Courses Completed",
      description:
        "Complex subquery to find students meeting multiple enrollment conditions.",
      difficulty: "Hard",
      category: "Subquery",
      question:
        "Find students who are enrolled in at least 3 courses and have a GPA above 3.5. For each such student, show their name, major, GPA, and the number of courses they're enrolled in. Sort by GPA descending.",
      expectedOutputDescription: "High-GPA students enrolled in 3+ courses.",
      tables: [
        {
          tableName: "students",
          description: "Student records.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            { name: "name", type: "VARCHAR(100)", constraints: "" },
            { name: "email", type: "VARCHAR(100)", constraints: "" },
            { name: "gpa", type: "NUMERIC(3,2)", constraints: "" },
            { name: "major", type: "VARCHAR(100)", constraints: "" },
            { name: "enrollment_year", type: "INT", constraints: "" },
          ],
        },
        {
          tableName: "enrollments",
          description: "Course enrollments per student.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            {
              name: "student_id",
              type: "INT",
              constraints: "FK → students.id",
            },
            { name: "course_id", type: "INT", constraints: "FK → courses.id" },
            { name: "semester", type: "VARCHAR(20)", constraints: "" },
            { name: "grade", type: "VARCHAR(5)", constraints: "" },
          ],
        },
        {
          tableName: "courses",
          description: "Available courses.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            { name: "course_code", type: "VARCHAR(20)", constraints: "" },
            { name: "title", type: "VARCHAR(150)", constraints: "" },
            { name: "credits", type: "INT", constraints: "" },
            { name: "department", type: "VARCHAR(100)", constraints: "" },
          ],
        },
      ],
      tags: ["JOIN", "GROUP BY", "HAVING", "COUNT", "subquery"],
      order: 6,
    },
    {
      title: "Monthly Revenue Report",
      description: "Use date functions to aggregate sales data by month.",
      difficulty: "Hard",
      category: "Aggregation",
      question:
        "Generate a monthly revenue report for 2023. For each month, show: the month name (e.g., 'January'), total number of orders, total revenue from completed orders, and average order value. Order by month chronologically.",
      expectedOutputDescription:
        "Monthly breakdown of orders and revenue for 2023.",
      tables: [
        {
          tableName: "orders",
          description: "All order records with dates and amounts.",
          columns: [
            { name: "id", type: "INT", constraints: "PRIMARY KEY" },
            {
              name: "customer_id",
              type: "INT",
              constraints: "FK → customers.id",
            },
            { name: "order_date", type: "DATE", constraints: "" },
            { name: "status", type: "VARCHAR(20)", constraints: "" },
            { name: "total_amount", type: "NUMERIC(10,2)", constraints: "" },
          ],
        },
      ],
      tags: ["DATE functions", "TO_CHAR", "GROUP BY", "SUM", "AVG", "EXTRACT"],
      order: 7,
    },
  ];

  await Assignment.insertMany(assignments);
  console.log(`✅ MongoDB seeded with ${assignments.length} assignments!`);

  // Create a default admin user
  const existingAdmin = await User.findOne({ email: "admin@ciphersql.com" });
  if (!existingAdmin) {
    await User.create({
      username: "admin",
      email: "admin@ciphersql.com",
      password: "admin123456",
      role: "admin",
    });
    console.log("✅ Admin user created: admin@ciphersql.com / admin123456");
  }
};

// Run seeder
const runSeed = async () => {
  try {
    await seedPostgres();
    await seedMongoDB();
    console.log("\n🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await pool.end();
    await mongoose.disconnect();
    process.exit(0);
  }
};

runSeed();
