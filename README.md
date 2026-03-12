# HRMS Report Builder Service

A backend service built with Node.js, Express, and PostgreSQL that allows administrators to dynamically generate custom reports from HRMS data.

## Features
- Configure and save dynamic reports
- Export reports in JSON, CSV, and XLSX formats

## Setup Instructions

### Environment Variables

For convenience, the `.env` file is already included in the root of the project with the following properties (so you do not need to create it manually):

```env
PORT=5000

DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=hrms
```

### Running with Docker

This project comes configured with a `Dockerfile` and `docker-compose.yml` to simplify running the backend and the database together.

1. **Start the services:**
   Open a terminal in the root direction and run:
   ```bash
   docker compose up -d
   ```

2. **Stop the services:**
   To shut everything down, run:
   ```bash
   docker compose down
   ```

### Running Locally

This project relies on a containerized PostgreSQL database and should strictly be run using Docker Compose as described above. Running the Node server outside of Docker is not supported.

## Postman Testing Guide (API Endpoints)

Use the following requests in Postman to test the HRMS Report Builder Endpoints. Since the app runs on `http://localhost:5000` (by default mapping port 5000), use the URLs specified below.

### 1. Create a Report
**Description:** Configure a custom report with specific tables, fields, filters, aggregations, and sorting rules, and save it.
- **URL:** `http://localhost:5000/reports`
- **Method:** `POST`
- **Headers:** 
  - `Content-Type`: `application/json`
- **Body (`raw` -> `JSON`) Examples:**

**Example 1: Basic Employee Attendance Report**
```json
{
  "name": "Employee Attendance Report",
  "tables": ["departments", "attendance"],
  "fields": ["employees.name", "departments.name", "attendance.status", "attendance.date"],
  "filters": [
    { "field": "attendance.status", "operator": "=", "value": "Present" }
  ],
  "sorting": [],
  "grouping": []
}
```

**Example 2: Payroll Register (Join across multiple tables & alias support)**
```json
{
  "name": "January 2026 Payroll Register",
  "tables": ["payroll", "departments", "designations"],
  "fields": [
    "employees.employee_code",
    "employees.first_name",
    "employees.last_name",
    "departments.name as department_name",
    "designations.title as designation_title",
    "payroll.basic_salary",
    "payroll.net_salary"
  ],
  "filters": [
    { "field": "payroll.month", "value": 1, "operator": "=" },
    { "field": "payroll.year", "value": 2026, "operator": "=" }
  ],
  "sorting": [
    { "field": "payroll.net_salary", "order": "DESC" }
  ],
  "grouping": []
}
```

**Example 3: Active Full-Time Employees**
```json
{
  "name": "Active Full-Time Employees",
  "tables": ["departments"],
  "fields": [
    "employees.id",
    "employees.first_name",
    "employees.email",
    "departments.name as department",
    "employees.date_of_joining"
  ],
  "filters": [
    { "field": "employees.status", "value": "ACTIVE", "operator": "=" },
    { "field": "employees.employment_type", "value": "Full-Time", "operator": "=" }
  ],
  "sorting": [
    { "field": "employees.date_of_joining", "order": "ASC" }
  ],
  "grouping": []
}
```

### 2. List All Reports
**Description:** Fetch a list of all previously created and saved reports.
- **URL:** `http://localhost:5000/reports`
- **Method:** `GET`
- **Headers:** No special headers required.
- **Body:** None

### 3. Execute a Report
**Description:** Run a specific report and return the data. We can paginate data and choose the export format (`csv` or `excel`). 
- **URL:** `http://localhost:5000/reports/:id/execute` (Replace `:id` with your created report's ID, e.g. `1`)
- **Query Parameters:** (Optional)
  - `page`: Page number (e.g., `1`)
  - `limit`: Items per page (e.g., `10`)
  - `format`: Export format (e.g., `csv`, `excel`). Omit to receive JSON. 
- **Method:** `GET`
- **Headers:** No special headers required.
- **Body:** None

#### Example Queries:
- **Execute returning JSON (default):**
  - **URL:** `http://localhost:5000/reports/1/execute?page=1&limit=10`
- **Execute returning CSV file:**
  - **URL:** `http://localhost:5000/reports/1/execute?format=csv`
  - *Postman Tip: Select **"Send and Download"** to save the `.csv` file.*
- **Execute returning Excel (.xlsx) file:**
  - **URL:** `http://localhost:5000/reports/1/execute?format=excel`
  - *Postman Tip: Select **"Send and Download"** to save the `.xlsx` document.*
