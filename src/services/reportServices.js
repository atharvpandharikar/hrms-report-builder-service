const pool = require("../db/connection");
const { toCSV, toExcel } = require("../utils/exportUtils");

exports.createReport = async(data)=>{
    const result = await pool.query(
        `INSERT INTO report_configs
        (name, tables, fields, filters, sorting, grouping)
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            data.name,
            JSON.stringify(data.tables || []),
            JSON.stringify(data.fields || []),
            JSON.stringify(data.filters || []),
            JSON.stringify(data.sorting || []),
            JSON.stringify(data.grouping || [])
        ]
    );
    return result.rows[0];
};

exports.listReports = async()=>{
    const result = await pool.query(
        `SELECT id, name, created_at, last_executed 
        FROM report_configs`
    );
    return result.rows;
};

exports.executeReport = async(id, query)=>{
    const report = await pool.query(
        `SELECT * FROM report_configs 
        WHERE id=$1`, [id]
    );
    
    if (!report.rows || report.rows.length === 0) {
        throw new Error("Report not found");
    }

    const config = report.rows[0];
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const tables = config.tables || [];
    const fields = config.fields || [];
    const filters = config.filters || [];
    
    let selectClause = "*";
    if (fields.length > 0) {
        selectClause = fields.map(f => {
            let fieldPart = f;
            let alias = "";
            if (f.toLowerCase().includes(" as ")) {
                const parts = f.split(/ as /i);
                fieldPart = parts[0].trim();
                alias = ` AS "${parts[1].trim()}"`;
            }
            if (fieldPart.includes('.')) {
                const parts = fieldPart.split('.');
                return `"${parts[0]}"."${parts[1]}"${alias}`;
            }
            return `"${fieldPart}"${alias}`;
        }).join(', ');
    }

    let fromClause = `"employees"`;
    let joins = [];
    
    if (tables.includes('departments')) {
        joins.push(`LEFT JOIN "departments" ON "employees"."department_id" = "departments"."id"`);
    }
    if (tables.includes('designations')) {
        joins.push(`LEFT JOIN "designations" ON "employees"."designation_id" = "designations"."id"`);
    }
    if (tables.includes('attendance')) {
        joins.push(`LEFT JOIN "attendance" ON "employees"."id" = "attendance"."employee_id"`);
    }
    if (tables.includes('payroll')) {
        joins.push(`LEFT JOIN "payroll" ON "employees"."id" = "payroll"."employee_id"`);
    }

    let whereClause = "";
    let params = [];
    let paramCounter = 1;

    if (filters.length > 0) {
        const conditions = filters.map(f => {
            params.push(f.value);
            if (f.field.includes('.')) {
                const parts = f.field.split('.');
                return `"${parts[0]}"."${parts[1]}" ${f.operator} $${paramCounter++}`;
            }
            return `"${f.field}" ${f.operator} $${paramCounter++}`;
        });
        whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    let baseQuery = `SELECT ${selectClause} FROM ${fromClause} ${joins.join(' ')} ${whereClause}`;

    const reqFormat = (query.format || query.export || '').toLowerCase();
    if (reqFormat === 'csv' || reqFormat === 'excel') {
        const exportResult = await pool.query(baseQuery, params);
        if (reqFormat === 'csv') {
            return { type: 'csv', data: toCSV(exportResult.rows) };
        } else {
            return { type: 'excel', data: await toExcel(exportResult.rows) };
        }
    }

    const countQuery = `SELECT COUNT(*) FROM ${fromClause} ${joins.join(' ')} ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const totalRecords = parseInt(countResult.rows[0].count);

    baseQuery += ` LIMIT $${paramCounter++} OFFSET $${paramCounter++}`;
    params.push(limit, offset);

    const result = await pool.query(baseQuery, params);

    await pool.query(`UPDATE report_configs SET last_executed = NOW() WHERE id = $1`, [id]);

    return {
        data: result.rows,
        pagination: {
            totalRecords,
            page,
            limit,
            totalPages: Math.ceil(totalRecords / limit)
        }
    };
};