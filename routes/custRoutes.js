const express = require('express');
const router = express.Router();
const controller = require('../controller/custController');



router.get('/',controller.get_login);
router.post('/',controller.re_custting);
router.post('/processMenu/:table',controller.menuIn);
router.get('/confirm',controller.confirmation);
router.get('/cancleOrder',controller.cancel);
router.post('/Reciept/:tableid',controller.receipt);
router.get('/ShowReciept',controller.showReciept);



module.exports = router;