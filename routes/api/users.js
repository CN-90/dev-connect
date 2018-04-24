const express = require('express');
router = express.Router();

router.get('/test', (req, res) => {
    res.json({
        hello: 'This is dank...'
    })
}) 

module.exports = router;