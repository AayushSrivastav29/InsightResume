const express = require("express");
const resumeController = require("../controllers/resumeController");
const auth = require("../middlewares/auth");
// const upload = require("../middlewares/upload");
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});const router = express.Router();


router.get("/", auth, resumeController.getUserResumes);
router.get("/:id", auth, resumeController.getResumeByID);
router.post("/upload",auth,upload.single("resume"),resumeController.uploadAndParseResume);
router.delete("/delete/:id", auth, resumeController.deleteResume);
router.put("/:id/update-extracted-data", auth,resumeController.updateExtractedData);
module.exports = router;
