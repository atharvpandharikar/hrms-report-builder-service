const reportService = require("../services/reportServices");

exports.createReport = async(req, res)=>{
    try {
        const result = await reportService.createReport(req.body);
        res.status(201).json(result);
    } catch(error) {
        console.error("Error creating report:", error);
        res.status(500).json({ error: "Failed to create report", details: error.message });
    }
};

exports.listreports = async(req, res)=>{
    try {
        const result = await reportService.listReports();
        res.json(result);
    } catch(error) {
        console.error("Error listing reports:", error);
        res.status(500).json({ error: "Failed to list reports", details: error.message });
    }
};

exports.executeReport = async(req, res)=>{
    try {
        const result = await reportService.executeReport(req.params.id, req.query);
        
        if (result.type === 'csv') {
            res.header('Content-Type', 'text/csv');
            res.attachment('report.csv');
            return res.send(result.data);
        }
        
        if (result.type === 'excel') {
            res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.attachment('report.xlsx');
            await result.data.xlsx.write(res);
            return res.end();
        }

        res.json(result);
    } catch(error) {
        console.error("Error executing report:", error);
        res.status(500).json({ error: "Failed to execute report", details: error.message });
    }
};