const getusernamePass ='select managerid,mngusername,mngpassword from manager where mngusername= $1';
const mngbyid ="SELECT * FROM manager where managerid=$1";
const getallrequest ='select * from requestsupply';
const getinvname ="select itmname from inventory where itemid=$1";
const givename ="select suppname from supplier where suppid=$1";
const deletereq ="delete from requestsupply where reqid=$1";
const approval =" UPDATE requestsupply SET reqstatus='Approved', managerid=$1 WHERE reqid=$2";


const allemp ="SELECT * FROM employee";
const image = "SELECT * FROM empimages where empid=$1"
const empusername ="SELECT empusername FROM employee where empusername=$1"
const insertEmp ="INSERT INTO employee(empusername,emppassword,emptel,managerid,description) values ($1,$2,$3,$4,$5)";
const findEmp ="Select empid FROM employee where empusername=$1 ";
const insertImage ="INSERT INTO empimages (image_path, empid) VALUES ($1, $2)";
const findEmpbyID ="Select * FROM employee where empid=$1 ";
const imageid ="SELECT * FROM empimages where empid=$1";
const empusernameExcludingCurrent= 'SELECT * FROM employee WHERE empusername = $1 AND empid != $2';
const updateEmp ="UPDATE employee SET empusername=$1, emptel=$2, description=$3 WHERE empid=$4 ";
const updateImage="UPDATE empimages SET image_path=$1 where empid=$2";
const deleteEmp ="DELETE from employee where empid=$1";
const updatepass = "Update employee set emppassword=$1 where empid=$2";
const updateTask ="Update employee set task=$1 where empid=$2";




const bill = "select * from bill";
const detailbill = "select * from bill where billid=$1";
const orderbyBill = "Select * from ordermenu where billid=$1";
const orderinfo = "select * from menuitem where menuid=$1 ";
const savebillHistory ="Insert Into bill_history (amount,tableid,status,pay,billidref) values($1,$2,'paid',$3,$4)";
const saveOrderMenuHistory ="Insert into ordermenu_history (quantity,status,menuid,tableid,billid) values($1,'completed',$2,$3,$4)"
const deleteOrderbyBill = "delete from ordermenu where billid=$1"
const deletebill ="delete from bill where billid=$1"
const updatetable ="update table_cust set stat='Available', custname='' where tableid=$1"


const billHistory = "SELECT * FROM bill_history "
const detailbillhistory = "select * from bill_history where billidref=$1";
const orderbyBillhistory = "Select * from ordermenu_history where billid=$1";


const tablelist = "SELECT * FROM table_cust ORDER BY tableid ASC";
const diasblaeTable = "update table_cust set stat='unavailable' where tableid=$1";
const enableTable = "update table_cust set stat='Available' where tableid=$1";
const addTable ="INSERT INTO table_cust (stat) VALUES ('Available')";

const billHistDate ="SELECT * FROM bill_history where date=$1";



module.exports={

    mngbyid,
    getusernamePass,
    getallrequest,
    getinvname,
    givename,
    deletereq,
    approval,
    allemp,
    image,
    empusername,
    insertEmp,
    findEmp,
    insertImage,
    findEmpbyID,
    imageid,
    empusernameExcludingCurrent,
    updateEmp,
    updateImage,
    deleteEmp,
    updatepass,
    updateTask,
    bill,
    orderbyBill,
    orderinfo,
    deletebill,
    detailbill,
    savebillHistory,
    saveOrderMenuHistory,
    deleteOrderbyBill,
    updatetable,
    billHistory,
    orderbyBillhistory,
    detailbillhistory,
    tablelist,
    diasblaeTable,
    addTable,
    billHistDate,
    enableTable
  
   
   
   }


  