const getTable = "SELECT * FROM table_cust WHERE stat='Available' order by tableid asc";
const regCust = "UPDATE table_cust SET custname = $1, stat = 'Occupied' WHERE tableid = $2";
const allfood = "SELECT * FROM menuitem where typefood='food' AND status='available'";
const alldrink = "SELECT * FROM menuitem where typefood='drink' AND status='available'";
const allside = "SELECT * FROM menuitem where typefood='side' AND status='available'"
const insertMenu ="INSERT INTO ordermenu (quantity, status, menuid, tableid) VALUES ($1, 'pending', $2, $3)";
const images = "select * from imagemenu where menuid=$1 ";
const getOrder = "select * from ordermenu where tableid=$1  AND status = 'pending' ";
const getMenuDetail = "select * from menuitem where menuid=$1 ";
const UnregCust = "UPDATE table_cust SET custname = '', stat = 'Available' WHERE tableid = $1";
const deleteOrder ="Delete from ordermenu where tableid=$1";
const insertBill ="INSERT INTO bill (amount,tableid) values ($1,$2)";
const billid ="SELECT * FROM bill where tableid=$1"
const insertBillOrder ="UPDATE ordermenu SET billid = $1 WHERE tableid = $2   AND status = 'pending'";




module.exports={


    getTable,
    regCust,
    allfood,
    alldrink,
    allside,
    insertMenu,
    images,
    getOrder,
    getMenuDetail,
    UnregCust,
    deleteOrder,
    insertBill,
    billid,
    insertBillOrder
    
}