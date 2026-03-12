const pool = require("./connection");

async function initDb() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS departments(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS designations(
        id SERIAL PRIMARY KEY,
        title VARCHAR(100)
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS employees(
        id SERIAL PRIMARY KEY,
        employee_code VARCHAR(50) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        department_id INT,
        designation_id INT,
        date_of_joining DATE,
        employment_type VARCHAR(50),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS attendance(
        id SERIAL PRIMARY KEY,
        employee_id INT,
        attendance_date DATE,
        clock_in TIMESTAMP,
        clock_out TIMESTAMP,
        working_minutes INT,
        status VARCHAR(50)
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS payroll(
        id SERIAL PRIMARY KEY,
        employee_id INT,
        month INT,
        year INT,
        basic_salary NUMERIC,
        hra NUMERIC,
        allowances NUMERIC,
        deductions NUMERIC,
        net_salary NUMERIC
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS report_configs(
        id SERIAL PRIMARY KEY,
        name VARCHAR(200),
        tables JSONB,
        fields JSONB,
        filters JSONB,
        sorting JSONB,
        grouping JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        last_executed TIMESTAMP
        );
    `);

    console.log("Tables created");

}

module.exports = initDb;