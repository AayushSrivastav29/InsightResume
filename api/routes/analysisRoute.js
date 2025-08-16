const express = require("express");
const analysisController = require("../controllers/analysisController");
const auth = require("../middlewares/auth");

const router = express.Router();


router.post('/analyze', auth, analysisController.analyseResume);
router.get('/:resumeId', auth, analysisController.getAnalysisHistory);
router.get('/detail/:analysisId', auth, analysisController.getAnalysisHistoryById);
router.delete('/:analysisId', auth,analysisController.deleteAnalysis);

module.exports = router;
