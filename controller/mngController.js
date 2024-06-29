const pool = require('../db');
const qr = require('./mngQuarries');
const bcrypt = require('bcryptjs');

const get_login = (req,res)=>{
    res.render('../views/manager/index');
    }
    

    
    const Mngpost_login = (req, res) => {
      const { username, password } = req.body;
  
      pool.query(qr.getusernamePass, [username], (error, results) => {
          if (error) {
              console.error('Error fetching database:', error);
              return res.status(500).send('Error fetching database');
          }
  
          const user = results.rows[0];
  
          if (!user) {
              return res.status(401).send('<script>alert("Incorrect Username"); window.history.back();</script>');
          }
  
          bcrypt.compare(password, user.mngpassword, (err, isValidPassword) => {
              if (err) {
                  console.error('Error comparing passwords:', err);
                  return res.status(500).send('Error comparing passwords');
              }
  
           
  
              if (!isValidPassword) {
                  console.error('Invalid password:', user.mngpassword);
                  return res.status(401).send('<script>alert("Incorrect Password"); window.history.back();</script>');
              }

              console.log(user.managerid);


              req.session.user2 = {
                id: user.managerid,
                role: 'manager'
            };
  
              // Password is valid, render dashboard
              res.redirect('/mng/homepage');// Pass the entire user object to the dashboard template
          });
      });
  };   
    


  const homepage = (req,res)=>{

    const id = parseInt(req.user2.id);

    pool.query(qr.mngbyid, [id], (error, results) => {
        if (error) {
            console.error('Error fetching database:', error);
            return res.status(500).send('Error fetching database');
        }


        const user = results.rows[0];

        res.render('../views/manager/Homepage', { user });

    })






  }







  const isAuthenticated = (req, res, next) => {
    if (!req.session.user2) {
        return  res.status(401).send('<script>alert("Time Out"); window.location.href="/mng/"; </script>');
    }
    next();
}; 



  const getRequestable = (req, res) => {
    const mngid = parseInt(req.user2.id);
    
    pool.query(qr.getallrequest, async (error, results) => {
        if (error) {
            console.error('Error retrieving database:', error);
            return res.status(500).send('Error retrieving database');
        }
        
        try {
            const supplyrequest = results.rows;
            const invnamePromises = [];
            const suppnamePromises = [];
            
            supplyrequest.forEach((inv, index) => {
                const invnamePromise = new Promise((resolve, reject) => {
                    pool.query(qr.getinvname, [inv.itemid], (error, resultsinv) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(resultsinv.rows[0]);
                        }
                    });
                });
                invnamePromises.push(invnamePromise);
                
                const suppnamePromise = new Promise((resolve, reject) => {
                    pool.query(qr.givename, [inv.suppid], (error, resultsnamesupp) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(resultsnamesupp.rows[0]);
                        }
                    });
                });
                suppnamePromises.push(suppnamePromise);
            });
            
            const invnames = await Promise.all(invnamePromises);
            const supppnames = await Promise.all(suppnamePromises);

            console.log(mngid)
            
            res.render('../views/manager/requestTable',{supplyrequest,invnames,supppnames,mngid})
            
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).send('Error retrieving database');
        }
    });
};

    
     
    const deletereq = (req,res)=>{
        
        
        const reqid = parseInt(req.params.reqid);

        pool.query(qr.deletereq, [reqid], (error, results) => {
            if (error) {
                console.error('Error fetching database:', error);
                return res.status(500).send('Error fetching database');
            }
        })
  
        res.redirect('/mng/requestCheck');




    }
    

    
    const updatereq = (req, res) => {
        const id = parseInt(req.params.mngid);
        const reqid = parseInt(req.params.reqid);

        console.log(reqid,id)
    
        pool.query(qr.approval, [id, reqid], (error, results) => {
            if (error) {
                console.error('Error fetching database:', error);
                return res.status(500).send('Error fetching database');
            }
    
            // Assuming you want to redirect after the query is executed
            res.redirect('/mng/requestCheck');
        });
    };
    



   const getEmplyoyees = (req,res)=>{

    const id = parseInt(req.user2.id);
    console.log(id);

       pool.query(qr.allemp, (error, empResults) => {
            if (error) {
                console.error('Error fetching database:', error);
                return res.status(500).send('Error fetching database');
            }

            const listemp = empResults.rows;

            const imglist = [];
            let count = 0;

            listemp.forEach((emp, index) => {
                pool.query(qr.image, [emp.empid], (error, imgresult) => {
                    if (error) {
                        console.error('Error fetching database:', error);
                        return res.status(500).send('Error fetching database');
                    }

                    imglist[index] = imgresult.rows[0];
                    count++;

                    // Check if all queries have completed
                    if (count === listemp.length) {
                        // Render the view with all data
                        res.render('../views/manager/emptable', { imglist, listemp, id});
                    }
                });
            });





        });


        



    



   };


  
   const getEmpForm = (req,res)=>{


   const id = parseInt(req.user2.id);

   res.render('../views/manager/empform',{id});

            



    
   }


   const uploadEmp = async (req, res) => {
    try {
        const id = parseInt(req.user2.id);
        const { username, password, desc, tel } = req.body;
        
        // Handle file upload (if applicable)
        const imagePath = req.file ? 'images/' + req.file.filename : null;

        // Check if username already exists
        const checkUserQuery = qr.empusername;
        const userResult = await pool.query(checkUserQuery, [username]);
        
        if (userResult.rows.length) {
            return res.send('<script>alert("Username is already taken"); window.history.back();</script>');
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new employee data into the database
        const insertEmpQuery = qr.insertEmp;
        await pool.query(insertEmpQuery, [username, hashedPassword, tel,  id, desc]);

        // Get the inserted employee's ID
        const findEmpidQuery = qr.findEmp;
        const idResult = await pool.query(findEmpidQuery, [username]);
        const empid = parseInt(idResult.rows[0].empid);  // Assuming `id` is the correct property name

        // Insert image path into the database
       console.log(imagePath);

       if (imagePath) {
        const insertImageQuery = qr.insertImage;
        await pool.query(insertImageQuery, [imagePath, empid]);
    }

        // Send success response
        res.send('<script>alert("Employee added successfully"); window.location.href="/mng/employees";</script>');

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};


const editform =(req,res)=>{

    const id = parseInt(req.user2.id);
    const empid = parseInt(req.params.empid);

    pool.query(qr.findEmpbyID,[empid], (error, empResults) => {
        if (error) {
            console.error('Error fetching database:', error);
            return res.status(500).send('Error fetching database');
        }

        if (empResults.rows.length === 0) {
            return res.status(404).send('Employee not found');
        }

        const emp = empResults.rows[0];




        pool.query(qr.imageid,[empid], (error, imgresult) => {
            if (error) {
                console.error('Error fetching database:', error);
                return res.status(500).send('Error fetching database');
            }


            const empiamges = imgresult.rows[0];

        res.render('../views/manager/editempform',{id,emp,empiamges});






        })


    })




}




const updatingEmpinfo = async (req, res) => {
    try {
        const empid = parseInt(req.params.empid);
      

        // Extracting fields from the request body
        const { username, desc, tel } = req.body;

     

        const checkUserQuery = qr.empusernameExcludingCurrent;
        const userResult = await pool.query(checkUserQuery, [username, empid]);

        if (userResult.rows.length) {
            return res.send('<script>alert("Username is already taken"); window.history.back();</script>');
        }

        

        const updateEmpQuery = qr.updateEmp;
        const updateEmpValues = [username, tel, desc, empid];

        await pool.query(updateEmpQuery, updateEmpValues);

        // Update image if a new one is uploaded
        if (req.file) {
            const imagePath = `images/${req.file.filename}`;
            const updateImageQuery = qr.updateImage;
            await pool.query(updateImageQuery, [imagePath, empid]);
        }

        // Send success response
        res.send('<script>alert("Employee updated successfully"); window.location.href="/mng/employees";</script>');

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};






const deleteEmployee =(req,res)=>{

    const empid = parseInt(req.params.empid);


  pool.query(qr.deleteEmp, [empid], (error, results) => {
            if (error) {
                console.error('Error fetching database:', error);
                return res.status(500).send('Error fetching database');
            }

            res.send('<script>alert("Employee deleted successfully"); window.location.href="/mng/employees";</script>');

        })
  
        




};




const passForm = (req,res)=>{


    const emp = parseInt(req.params.empid);
    const id = parseInt(req.user2.id);

    pool.query(qr.imageid,[emp], (error, imgresult) => {
        if (error) {
            console.error('Error fetching database:', error);
            return res.status(500).send('Error fetching database');
        }


        const empiamges = imgresult.rows[0];
        res.render('../views/manager/editpass',{emp,empiamges,id});

    });
    
    

}



const UpdatingPassForm = async (req,res)=>{

    const empid = parseInt(req.params.empid);
    const id = parseInt(req.user2.id);

    const { password} = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);


    await pool.query(qr.updatepass, [hashedPassword,empid]);

    res.send('<script>alert("Employee Password updated successfully"); window.location.href="/mng/employees";</script>');




}





const taskform =  (req, res) => {


    const empid = parseInt(req.params.empid);
    const id = parseInt(req.user2.id);

    pool.query(qr.imageid,[empid], (error, imgresult) => {
        if (error) {
            console.error('Error fetching database:', error);
            return res.status(500).send('Error fetching database');
        }


        const empiamges = imgresult.rows[0];
        res.render('../views/manager/taskedit',{empid,empiamges,id});

    });





}


const UpdatingTask =  (req, res) => {

    const empid = parseInt(req.params.empid);
    const { task } = req.body;

    pool.query(qr.updateTask,[task,empid], (error, imgresult) => {
        if (error) {
            console.error('Error fetching database:', error);
            return res.status(500).send('Error fetching database');
        }

        res.send('<script>alert("Employee Task updated successfully"); window.location.href="/mng/employees";</script>');

    })

}





const viewBill = (req,res)=>{

    const id = parseInt(req.user2.id);
    console.log(id)

    pool.query(qr.bill, (error, results1) => {
        if (error) {
            console.error('Error fetching order by ID:', error);
            return res.status(500).send('Error fetching order by ID');
        }
        const bill = results1.rows;

        res.render('../views/manager/billList',{bill,id})


    })








}


const viewConfirmation = async (req,res)=>{

    const orderid = parseInt(req.params.idorder);
    const id = parseInt(req.user2.id);

    try {

        const orderresult = await pool.query(qr.orderbyBill,[orderid]);
        const order = orderresult.rows;


         // Retrieve menu details (name, price)
         const menuDetails = await Promise.all(
            order.map(async (foodItem) => {
                const result = await pool.query(qr.orderinfo, [foodItem.menuid]);
                return result.rows[0]; // assuming the price is in the first row
            })
        );


        let total = 0;
        let quantity = 0;
        const realPrice = [];

        order.forEach((foodItem, index) => {
            const itemQuantity = parseInt(foodItem.quantity);
            const itemPrice = parseFloat(menuDetails[index].price);

            quantity += itemQuantity;
            total += itemQuantity * itemPrice;
            realPrice[index] = (itemQuantity * itemPrice).toFixed(2);
        });

        total = total.toFixed(2);

        const billresult = await pool.query(qr.detailbill,[orderid])
        const bill = billresult.rows[0];


        res.render('../views/manager/confirmationCheckOut', { total, menuDetails, order, id, quantity, realPrice,bill });  




    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }



}





const updatingPayment = async (req, res) => {
    const billid = parseInt(req.params.idorder); // Use billid instead of idorder
    const id = parseInt(req.user2.id); // Access the user ID correctly if req.user is an object
    const payment = parseFloat(req.body.payment);

    

    try {
        // Fetch bill details
        const billresult = await pool.query(qr.detailbill, [billid]);
        const bill = billresult.rows[0];

       

        // Fetch order details related to the bill
        const orderresult = await pool.query(qr.orderbyBill, [billid]);
        const order = orderresult.rows;

        

        // Insert bill details into bill_history
        await pool.query(qr.savebillHistory, [bill.amount, bill.tableid, payment, bill.billid]);

       

        // Insert each order item into ordermenu_history
        const saveOrderPromises = order.map(orderItem => {
            return pool.query(qr.saveOrderMenuHistory, [orderItem.quantity, orderItem.menuid, orderItem.tableid, orderItem.billid]);
        });
        await Promise.all(saveOrderPromises);

        await pool.query(qr.updatetable,[bill.tableid]);


        // Delete the original bill and associated orders
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Debug logs
        console.log(`Attempting to delete bill with ID: ${billid}`);

        // Delete the original bill and associated orders
        const deleteBillResult = await pool.query(qr.deletebill, [billid]);
        

        const deleteOrderResult = await pool.query(qr.deleteOrderbyBill, [billid]);

        req.session.user = null;
        

        res.send(`<script>alert("Payment is successfully made"); window.location.href="/mng/historyDetail/${billid}";</script>`);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
}





const getHistory =(req,res)=>{

    const id = parseInt(req.user2.id);
    

    pool.query(qr.billHistory, (error, results1) => {
        if (error) {
            console.error('Error fetching order by ID:', error);
            return res.status(500).send('Error fetching order by ID');
        }

        const bill = results1.rows;


        res.render('../views/manager/history',{bill,id})


    })

}





const HisotryDetail = async (req,res)=>{

    const id = parseInt(req.user2.id);
    const billid = parseInt(req.params.billid);


try{


    const orderresult = await pool.query(qr.orderbyBillhistory,[billid]);
    const order = orderresult.rows;

    const table = parseInt(order[0].tableid);


     // Retrieve menu details (name, price)
     const menuDetails = await Promise.all(
        order.map(async (foodItem) => {
            const result = await pool.query(qr.orderinfo, [foodItem.menuid]);
            return result.rows[0]; // assuming the price is in the first row
        })
    );


    let total = 0;
    let quantity = 0;
    const realPrice = [];

    order.forEach((foodItem, index) => {
        const itemQuantity = parseInt(foodItem.quantity);
        const itemPrice = parseFloat(menuDetails[index].price);

        quantity += itemQuantity;
        total += itemQuantity * itemPrice;
        realPrice[index] = (itemQuantity * itemPrice).toFixed(2);
    });




    total = total.toFixed(2);

    const billresult = await pool.query(qr.detailbillhistory, [billid]);
const bill = billresult.rows[0];

let pay = parseFloat(bill.pay); // Convert to float if not already
pay = pay.toFixed(2); // Convert to string with two decimal places

let net = pay - total;

    res.render('../views/manager/detail', { total, menuDetails, order, id, quantity, realPrice,bill,table,pay,net });  

}catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
}

}




const getSales = async (req, res) => {
    const id = parseInt(req.user2.id);
    const currentDate = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD

    try {
        const billHisResult = await pool.query(qr.billHistDate, [currentDate]);
        const billcust = billHisResult.rows;

        let numberofbill = 0;
        let totalofneedtopay = 0;
        let amountThatCustPay = 0;
        let netWorth = 0;

        if (billcust.length > 0) {  // Check if there are any bills
            numberofbill = billcust.length;

            billcust.forEach((bill) => {
                const needPay = parseFloat(bill.amount) || 0;  // Ensure valid number
                const actualPay = parseFloat(bill.pay) || 0;   // Ensure valid number

                totalofneedtopay += needPay;
                amountThatCustPay += actualPay;
            });

            netWorth = amountThatCustPay - totalofneedtopay;
        }

        res.render('../views/manager/report', { id, numberofbill, netWorth, totalofneedtopay, amountThatCustPay });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};










const getTableList = (req,res)=>{

    const id = parseInt(req.user2.id);


 pool.query(qr.tablelist, (error, results1) => {
        if (error) {
            console.error('Error fetching order by ID:', error);
            return res.status(500).send('Error fetching order by ID');
        }

        const tablelist = results1.rows;

    
        res.render('../views/manager/tableList',{id,tablelist});


    })



}



const disableTable = async(req,res)=>{

    const id = parseInt(req.user2.id);
    const tableid = parseInt(req.params.tableid);

    try{

    await pool.query(qr.diasblaeTable,[tableid]);



    res.send(`<script>alert("Table is succesfully disable"); window.location.href="/mng/tablemng";</script>`);


    }catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
}




}



const enableTable = async(req,res)=>{

    const id = parseInt(req.user2.id);
    const tableid = parseInt(req.params.tableid);

    try{

    await pool.query(qr.enableTable,[tableid]);



    res.send(`<script>alert("Table is succesfully Enable"); window.location.href="/mng/tablemng";</script>`);


    }catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
}




}



const addNewTable = async(req,res)=>{

    const id = parseInt(req.user2.id);


    try{

    await pool.query(qr.addTable);



    res.send(`<script>alert("Table is succesfully Added"); window.location.href="/mng/tablemng";</script>`);


    }catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
}




}








const test =  (req, res) => {


    const { username, desc, tel, role } = req.body;

    // Log extracted fields for debugging
    console.log('Extracted fields:', { username, desc, tel, role });

    res.status(400).send('TESTING field');
    

}



const logOut = (req,res)=>{


   
    req.session.user2 = null;
   
        
    // Redirect to login page or home page
    res.redirect('/mng'); // Adjust the redirect URL as needed




}





 module.exports={
    get_login,
    homepage,
    Mngpost_login,
    getRequestable,
    deletereq,
    updatereq,
    getEmplyoyees,
    getEmpForm,
    uploadEmp,
    editform,
    updatingEmpinfo,
    test,
    deleteEmployee,
    passForm,
    UpdatingPassForm,
    taskform,
    UpdatingTask,
    isAuthenticated,
    viewBill,
    viewConfirmation,
    updatingPayment,
    getHistory,
    HisotryDetail,
    getTableList,
    disableTable,
    enableTable,
    addNewTable,
    getSales,
    logOut
   
    
 }