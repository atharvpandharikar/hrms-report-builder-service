const pool = require("./connection");

async function seedData() {

    await pool.query(`
INSERT INTO departments(name)
VALUES ('Engineering'),('HR'),('Finance')
ON CONFLICT DO NOTHING
`);

    await pool.query(`
INSERT INTO designations(title)
VALUES ('Software Engineer'),('HR Manager'),('Accountant')
ON CONFLICT DO NOTHING
`);

    for (let i = 1; i <= 10; i++) {

        await pool.query(`
INSERT INTO employees
(employee_code,first_name,last_name,email,phone,department_id,designation_id,date_of_joining,employment_type,status)
VALUES
('EMP${i}','Employee${i}','Test','emp${i}@mail.com','999999999${i}',1,1,'2023-01-01','Full-Time','ACTIVE')
ON CONFLICT (employee_code) DO NOTHING
`);

    }

    await pool.query(`
INSERT INTO payroll(employee_id,month,year,basic_salary,hra,allowances,deductions,net_salary)
VALUES
(1,1,2026,50000,10000,5000,2000,63000),
(2,1,2026,45000,9000,4000,1500,56500)
`);

    console.log("Seed data inserted");

}

module.exports = seedData;