const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");

exports.toCSV = (data) => {
    if (!data || data.length === 0) {
        return "";
    }
    const parser = new Parser();
    return parser.parse(data);
};

exports.toExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");
    
    if (data && data.length > 0) {
        sheet.columns = Object.keys(data[0]).map(key => ({
            header: key,
            key: key
        }));
        sheet.addRows(data);
    }
    
    return workbook;
};