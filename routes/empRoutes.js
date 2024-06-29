const express = require('express');
const router = express.Router();
const controller = require('../controller/empController');

const multer = require('multer');
const path = require('path'); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/menuimages'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });


router.get('/',controller.get_login);
router.post('/',controller.post_login);
router.get('/homepage',controller.isAuthenticated,controller.homepage)
router.get('/custOrder',controller.isAuthenticated,controller.retTable);
router.get('/retDetail/:tid',controller.isAuthenticated,controller.tablesend);
router.get('/retDetailTable/:table',controller.detailtable);
router.get('/cancleorder/:t/:eid',controller.isAuthenticated,controller.deleteOrder);
router.get('/inv',controller.isAuthenticated,controller.get_inv);
router.get('/addItem/:id',controller.addItem);
router.post('/inv/adding/:id',controller.isAuthenticated,controller.addingItem);
router.get('/delete/:id/:invid',controller.isAuthenticated,controller.deleteitem);
router.get('/updateitemForm/:id/:invid',controller.formupdate);
router.post('/updatting/:id/:invid',controller.isAuthenticated,controller.updateInv);
router.get('/suppreq',controller.reqform);
router.post('/requestingsupp',controller.isAuthenticated,controller.insertRequest);
router.get('/editMenu',controller.menuTableEdit);
router.get('/addMenuForm',controller.menuForm);
router.post('/addingMenu',controller.isAuthenticated,upload.single('image'),controller.addingnewMenu);
router.get('/editMenuDetail/:menuid',controller.menuEditForm);
router.post('/updateNewInfo/:menuid',controller.isAuthenticated,upload.single('image'),controller.menuUpdating);
router.get('/deleteMenu/:menuid',controller.isAuthenticated,controller.deleteMenu);
router.get('/editOrder/:tableid',controller.isAuthenticated,controller.editOrderTable);



router.get('/addingNewMenu/:tableid',controller.isAuthenticated,controller.newMenu);
router.post('/updatingOrder/:tableid',controller.isAuthenticated,controller.updatingCustOrder);
router.get('/updateOrderItemForm/:tableid/:idorder',controller.isAuthenticated ,controller.editOrderItem)
router.post('/updatingItemOrder/:tableid/:idorder',controller.isAuthenticated ,controller.updateOrderItem)
router.get('/deleteOrderItem/:tableid/:idorder',controller.isAuthenticated ,controller.deleteOrderItem)





router.get('/paymentForm',controller.isAuthenticated,controller.viewBill);
router.get('/confirmRecipt/:idorder',controller.isAuthenticated,controller.viewConfirmation);
router.post('/processCheckOut/:idorder',controller.isAuthenticated,controller.updatingPayment);
router.get('/historyDetail/:billid',controller.isAuthenticated,controller.HisotryDetail);



router.get('/logOut',controller.logOut);



module.exports = router;




