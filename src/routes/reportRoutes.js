const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportControllers");

router.post("/", reportController.createReport);
router.get("/", reportController.listreports);
router.get("/:id/execute", reportController.executeReport);

module.exports = router;