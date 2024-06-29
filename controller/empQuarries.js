const getusernamePass ='select empid,empusername,emppassword,task from employee where empusername= $1';
const empbyid="select * from employee where empid=$1"
const gettable ="select * from table_cust where stat='Occupied'";
const menuTable ="select * from ordermenu where tableid=$1 order by idorder asc" ;
const foodlist = 'select foodname from menuitem where menuid=$1';
const deletetable ='delete from ordermenu where tableid=$1';
const updatetable ="update table_cust set stat='Available',custname='' where tableid=$1"
const getInv ="select * from inventory";
const insertInv = "INSERT INTO inventory (itmname, itemdesc, unit, itmprice, itmquantity, itm_stat,category, empid) VALUES ($1, $2, $3, $4, $5,'Available' ,$6, $7)";
const deleteinv ='delete from inventory where itemid=$1';
const retriveinve ="select * from inventory where itemid=$1";
const updateinv ='update inventory set itmname=$1,itemdesc=$2,unit=$3,itmprice=$4,itmquantity=$5,category=$6,empid=$7 where itemid=$8';
const allitem ="select * from inventory ";
const allsupplier = "select * from supplier";
const insertingsupp ="Insert Into requestsupply (supplyqty,itemid,suppid,empid) values($1,$2,$3,$4)";
const checkReqSame ="select s from requestsupply s where s.itemid=$1 and s.reqstatus='pending'"
const allfood = "SELECT * FROM menuitem ORDER BY typefood ASC";
const image ="select * from imagemenu where menuid=$1";
const foodname ="SELECT foodname FROM menuitem WHERE foodname = $1";
const insertMenu ="Insert into menuitem (foodname,typefood,price) values ($1,$2,$3)";
const findFoodvianame ="select menuid from menuitem where foodname=$1";
const insertImage ="Insert Into imagemenu (imagepath,menuid) values ($1,$2) ";
const foodById ="SELECT * FROM menuitem WHERE menuid = $1";
const foodExcludingCurrent= 'SELECT * FROM menuitem WHERE foodname = $1 AND menuid != $2';
const updateMenu = 'update menuitem set foodname=$1, price=$2, typefood=$3, status=$4 where menuid=$5';
const updateImage = 'update imagemenu set imagepath=$1 where menuid=$2';
const deleteMenu ="delete from menuitem where menuid=$1 ";
const deleteOrder ="DELETE from ordermenu where tableid=$1";
const deleteBill = "DELETE from bill where tableid=$1";



const allfoodMenu = "SELECT * FROM menuitem where typefood='food' AND status='available'";
const alldrink = "SELECT * FROM menuitem where typefood='drink' AND status='available'";
const allside = "SELECT * FROM menuitem where typefood='side' AND status='available'"
const images = "select * from imagemenu where menuid=$1 ";
const insertMenuOrder ="INSERT INTO ordermenu (quantity, status, menuid, tableid) VALUES ($1, 'pending', $2, $3)";
const UpdateExistOrder ="Update ordermenu set quantity=$1 where idorder=$2 and tableid=$3";
const billid ="SELECT * FROM bill where tableid=$1"
const getOrder = "select * from ordermenu where tableid=$1 and billid=$2 ";
const getMenuDetail = "select * from menuitem where menuid=$1 ";
const updatebill ="update bill set amount=$1 where tableid=$2";
const insertBillOrder = "UPDATE ordermenu SET billid = $1 WHERE tableid = $2 AND billid IS NULL";
const orderid ="select * from ordermenu where idorder=$1" ;
const UpdateExistOrder2 ="Update ordermenu set quantity=$1,status=$2 where idorder=$3 and tableid=$4";
const updatebill2 ="update bill set amount=$1 where billid=$2";
const deleteOrderById ="DELETE FROM ordermenu WHERE idorder = $1";
const checkOrder ="select * from ordermenu where menuid=$1";



// payment module

const bill = "select * from bill";
const detailbill = "select * from bill where billid=$1";
const orderbyBill = "Select * from ordermenu where billid=$1";
const orderinfo = "select * from menuitem where menuid=$1 ";
const savebillHistory ="Insert Into bill_history (amount,tableid,status,pay,billidref) values($1,$2,'paid',$3,$4)";
const saveOrderMenuHistory ="Insert into ordermenu_history (quantity,status,menuid,tableid,billid) values($1,'completed',$2,$3,$4)"
const deleteOrderbyBill = "delete from ordermenu where billid=$1"
const deletebill ="DELETE FROM bill WHERE billid = $1";


const billHistory = "SELECT * FROM bill_history "
const detailbillhistory = "select * from bill_history where billidref=$1";
const orderbyBillhistory = "Select * from ordermenu_history where billid=$1";






module.exports={


 getusernamePass,
 empbyid,
 gettable,
 menuTable,
 foodlist,
 deletetable,
 updatetable,
 getInv,
 insertInv,
 deleteinv,
 retriveinve,
 updateinv,
 allitem,
 allsupplier,
 insertingsupp,
 checkReqSame,
 allfood,
 image,
 foodname,
 insertMenu,
 findFoodvianame,
 insertImage,
 foodById,
 foodExcludingCurrent,
 updateMenu,
 updateImage,
 deleteMenu,
 deleteOrder,
 deleteBill,
 allfoodMenu,
 alldrink,
 allside,
 images,
 insertMenuOrder,
 UpdateExistOrder,
 billid,
 getOrder,
 getMenuDetail,
 updatebill,
 insertBillOrder,
 orderid,
 UpdateExistOrder2,
 updatebill2,
 deleteOrderById,
 checkOrder,
 bill,
 orderbyBill,
 orderinfo,
 detailbill,
 savebillHistory,
 saveOrderMenuHistory,
 deleteOrderbyBill,
 deletebill,
 billHistory,
 detailbillhistory,
 orderbyBillhistory
 
 


}