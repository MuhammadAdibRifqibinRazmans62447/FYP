const express = require('express');
const router = express.Router();
const controller = require('../controller/mngController');
const multer = require('multer');
const path = require('path'); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
  
const upload = multer({ storage: storage });

router.get('/',controller.get_login);
router.post('/',controller.Mngpost_login);
router.get('/requestCheck',controller.isAuthenticated,controller.getRequestable);
router.get('/deletereq/:reqid',controller.isAuthenticated,controller.deletereq);
router.get('/updatereq/:reqid/:mngid',controller.isAuthenticated,controller.updatereq);
router.get('/employees',controller.isAuthenticated,controller.getEmplyoyees);
router.get('/addEmpForm',controller.isAuthenticated,controller.getEmpForm);
router.post('/addingEmp',controller.isAuthenticated,upload.single('image'),controller.uploadEmp);
router.get('/editfrm/:empid',controller.isAuthenticated,controller.editform);
router.post('/updatingEmployee/:empid',controller.isAuthenticated,upload.single('image'), controller.updatingEmpinfo);
router.post('/testhantar',controller.isAuthenticated,upload.single('image'), controller.test);
router.get('/deleteEmp/:empid',controller.isAuthenticated,controller.deleteEmployee);
router.get('/editpass/:empid',controller.isAuthenticated,controller.passForm);
router.post('/editingPass/:empid',controller.isAuthenticated,controller.UpdatingPassForm);
router.get('/taskform/:empid',controller.isAuthenticated,controller.taskform);
router.post('/updatingTask/:empid',controller.isAuthenticated,controller.UpdatingTask);


router.get('/paymentForm',controller.isAuthenticated,controller.viewBill);
router.get('/confirmRecipt/:idorder',controller.isAuthenticated,controller.viewConfirmation);
router.post('/processCheckOut/:idorder',controller.isAuthenticated,controller.updatingPayment);


router.get('/history',controller.isAuthenticated,controller.getHistory);
router.get('/historyDetail/:billid',controller.isAuthenticated,controller.HisotryDetail);
router.get('/homepage',controller.isAuthenticated,controller.homepage);



router.get('/tablemng',controller.isAuthenticated,controller.getTableList);
router.get('/disableTable/:tableid',controller.isAuthenticated,controller.disableTable);
router.get('/enableTable/:tableid',controller.isAuthenticated,controller.enableTable);
router.get('/addTable',controller.isAuthenticated,controller.addNewTable);

router.get('/salesCheck',controller.isAuthenticated,controller.getSales);


router.get('/logOut',controller.logOut);



module.exports = router;