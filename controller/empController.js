const pool = require('../db');
const qr = require('./empQuarries');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');




const get_login = (req,res)=>{
    res.render('../views/employee/index');
    }








    const post_login = (req, res) => {
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
    
            // Compare the plaintext password with the hashed password retrieved from the database
            bcrypt.compare(password, user.emppassword, (err, isValidPassword) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).send('Error comparing passwords');
                }
    
                if (!isValidPassword) {
                
                    return res.status(401).send('<script>alert("Incorrect Password"); window.history.back();</script>');
                    
                }
    
                req.session.user1 = {
                    id: user.empid,
                    role: 'employee'
                };

    
   
                // Password is valid, render dashboard
                res.redirect('/emp/homepage');
            });
        });
    };
    








    const isAuthenticated = (req, res, next) => {
        if (!req.session.user1) {
            return  res.status(401).send('<script>alert("Time Out"); window.location.href="/emp/"; </script>');
        }
        next();
    };  
  


    const homepage = (req,res)=>{

        const id = parseInt(req.user1.id);

        pool.query(qr.empbyid, [id], (error, results) => {
            if (error) {
                console.error('Error fetching database:', error);
                return res.status(500).send('Error fetching database');
            }


            const user = results.rows[0];

            res.render('../views/employee/Homepage', { user });

        })



    }



  
    const retTable = (req, res) => {

       
        let menu=[];
        let foodArray=[];
        let tableid ='nan';
       
        const id =  parseInt(req.user1.id);
        
        pool.query(qr.gettable, (error, results) => {
            if (error) {
                console.error('Error fetching database:', error);
                return res.status(500).send('Error fetching database');
            }
            
            const tables = results.rows;
            
            res.render('../views/employee/tableManage', { tables, id, foodArray, menu ,tableid});
        });

    




    };
    


    const tablesend =(req,res)=>{

        const ti = parseInt(req.params.tid);
      
        
        const obj = { ti }; // This creates an object with properties tableid and emp
        
        
        const redirectUrl = `/emp/retDetailTable/${obj.ti}`;

        res.json({redirect:redirectUrl});







    }

    const detailtable = (req, res) => {
        const tableid = parseInt(req.params.table);
        const id = parseInt(req.user1.id);
       




    
        // Fetch all tables
        pool.query(qr.gettable, (error, results) => {
            if (error) {
                console.error('Error fetching database:', error);
                return res.status(500).send('Error fetching database');
            }
    
            const tables = results.rows;
    
            // Fetch all menu based on tableid
            pool.query(qr.menuTable, [tableid], (error, menuresults) => {
                if (error) {
                    console.error('Error fetching database:', error);
                    return res.status(500).send('Error fetching database');
                }


                if (menuresults.rows.length === 0) {
                    return res.status(404).send('<script>alert("The Customer does not order"); window.history.back();</script>');
                }
    
                const menu = menuresults.rows;


    
                // Get all food names
                const foodArray = [];
                let count = 0; // Counter to keep track of completed queries
    
                // Iterate over each menu item
                menu.forEach((menuItem, index) => {
                    pool.query(qr.foodlist, [menuItem.menuid], (error, foodresults) => {
                        if (error) {
                            console.error('Error fetching database:', error);
                            return res.status(500).send('Error fetching database');
                        }
    
                        foodArray[index] = foodresults.rows[0];
                        count++;
    
                        // Check if all queries have completed
                        if (count === menu.length) {
                            // Render the view with all data
                            res.render('../views/employee/tableManage', { tables, id, foodArray, menu,tableid });
                        }
                    });
                });
            });
        });
    };
    






    const deleteOrder = async (req,res)=>{

         
     const otherid = parseInt(req.params.t);
     const id = parseInt(req.params.eid);
     
     try {

     await pool.query(qr.deleteBill,[otherid]);
     await pool.query(qr.updatetable,[otherid]);

    
    
           
      
            
    
            
     res.redirect('/emp/custOrder')
        


   


        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal server error');
        }
   





    }

    const get_inv =(req,res)=>{

        const id = parseInt(req.user1.id);
    
        pool.query(qr.getInv, (error, results) => {
            if (error) {
                console.error('Error fetching database:', error);
                return res.status(500).send('Error fetching database');
            }
    
            const inv = results.rows;
            console.log(id);
    
            res.render('../views/employee/Invtable',{inv,id});
    
    
        })
    
    
    
    
    
    
    }


    const addItem =(req,res)=>{

    
    const id = parseInt(req.params.id);    
    res.render('../views/employee/invForm',{id});







    }



    const addingItem=(req,res)=>{
   
        const id = parseInt(req.params.id);
        
        
        const{itmname,desc,unit,price,quantity,gridRadios} = req.body;


        const qprice = parseInt(price);
        const bquanttiy = parseInt(quantity);

        pool.query(qr.insertInv,[itmname,desc,unit,qprice,bquanttiy,gridRadios,id], (error, results) => {
            if (error) {
                console.error('Error Inserting database:', error);
                return res.status(500).send('Error Inserting database');
            }


            pool.query(qr.getInv, (error, results) => {
                if (error) {
                    console.error('Error fetching database:', error);
                    return res.status(500).send('Error fetching database');
                }
        
                
        
                res.redirect('/emp/inv')
        
        
            })



        });

    }


    const deleteitem =(req,res)=>{
 
        const id = parseInt(req.params.id);
        const inv = parseInt(req.params.invid);

        
        pool.query(qr.checkReqSame, [inv], (error, results) => {
            if (error) {
                console.error('Error checking title:', error);
                res.status(500).send('Error checking title');
                return;
            }


      
            if (results.rows.length) {
              res.send('<script>alert("The Request for the Item currently in the Process "); window.history.back();</script>'); // Send a message indicating the title is already taken
                return;
            }




        pool.query(qr.deleteinv,[inv], (error, results) => {
            if (error) {
                console.error('Error Inserting database:', error);
                return res.status(500).send('Error Inserting database');
            }


            pool.query(qr.getInv, (error, results) => {
                if (error) {
                    console.error('Error fetching database:', error);
                    return res.status(500).send('Error fetching database');
                }
        
                const inv = results.rows;
                console.log(id);
        
                res.redirect('/emp/inv')
        
        
            })

        })

    })




    }


    const formupdate = (req,res)=>{

        const id = parseInt(req.params.id);
        const inv = parseInt(req.params.invid);


 pool.query(qr.retriveinve,[inv], (error, results) => {
            if (error) {
                console.error('Error retriving database:', error);
                return res.status(500).send('Error retriving database');
            }

        const items = results.rows[0];
        res.render('../views/employee/invupdate',{id,items});
        })
  
        



    }


    const updateInv =(req,res)=>{

        const id = parseInt(req.params.id);
        const inv = parseInt(req.params.invid);
 
        const{itmname,desc,unit,price,quantity,gridRadios} = req.body;


        const qprice = parseFloat(price);
        const bquanttiy = parseInt(quantity);


 pool.query(qr.updateinv,[itmname,desc,unit,qprice,bquanttiy,gridRadios,id,inv], (error, results) => {
            if (error) {
                console.error('Error Updating database:', error);
                return res.status(500).send('Error Updating database');
            }

            res.redirect('/emp/inv')


        });


    }


    const reqform = (req, res) => {
        const empid = parseInt(req.user1.id);

        pool.query(qr.allitem, (error, resultsitem) => {
            if (error) {
                console.error('Error fetching items from database:', error);
                return res.status(500).send('Error fetching items from database');
            }
    
            const items = resultsitem.rows; // Retrieve all rows
    
            pool.query(qr.allsupplier, (error, resultssupp) => {
                if (error) {
                    console.error('Error fetching suppliers from database:', error);
                    return res.status(500).send('Error fetching suppliers from database');
                }
    
                const supp = resultssupp.rows; // Retrieve all rows
    
                res.render('../views/employee/requestfrm', { items, supp,empid });
            });
        });
    };
    


    const insertRequest = (req, res) => {

        const empid = parseInt(req.user1.id);
        const{itemid,suppid,quantity} = req.body;

        const item = parseInt(itemid);
        const supp = parseInt(suppid);
        const qt = parseInt(quantity);
        console.log(empid);


        pool.query(qr.checkReqSame, [item], (error, results) => {
            if (error) {
                console.error('Error checking title:', error);
                res.status(500).send('Error checking title');
                return;
            }


      
            if (results.rows.length) {
              res.send('<script>alert("The Request for the Item currently in the Process "); window.history.back();</script>'); // Send a message indicating the title is already taken
                return;
            }

           

        pool.query(qr.insertingsupp,[qt,item,supp,empid], (error, resultsitem) => {
            if (error) {
                console.error('Error fetching items from database:', error);
                return res.status(500).send('Error fetching items from database');
            }


               
            res.send('<script>alert("Success updated"); window.history.back();</script>');
            
        });


    });




    }


         
const menuTableEdit = (req,res)=>{

    const empid = parseInt(req.user1.id);


    pool.query(qr.allfood, (error, foodResult) => {
        if (error) {
            console.error('Error fetching database:', error);
            return res.status(500).send('Error fetching database');
        }



        const listfood = foodResult.rows;


        const imglist = [];
        let count = 0;

        listfood.forEach((food, index) => {
            pool.query(qr.image, [food.menuid], (error, imgresult) => {
                if (error) {
                    console.error('Error fetching database:', error);
                    return res.status(500).send('Error fetching database');
                }

                imglist[index] = imgresult.rows[0];
                count++;

                // Check if all queries have completed
                if (count === listfood.length) {
                    // Render the view with all data
                    res.render('../views/employee/menuedit', { imglist, listfood, empid});
                }
            });
        });

    })




 







}



const menuForm = (req,res)=>{

    const empid = parseInt(req.user1.id);
   

    
    res.render('../views/employee/menuAddForm', { empid});





}
    
const addingnewMenu = async (req,res)=>{

    try {

    const empid = parseInt(req.user1.id);
    const { name, price, type } = req.body;   

    

    const imagePath = req.file ? 'menuimages/' + req.file.filename : null;  

    

    const checkName = qr.foodname;
    const userResult = await pool.query(checkName, [name]);

    

    
    if (userResult.rows.length) {
        return res.send('<script>alert("Item already exist"); window.history.back();</script>');
    }

   
      const insertMenuQuery = qr.insertMenu;
      await pool.query(insertMenuQuery, [name, type, price]);
      

        const findFoodQuery = qr.findFoodvianame;
        const idResult = await pool.query(findFoodQuery, [name]);
        const foodid = parseInt(idResult.rows[0].menuid); 

        console.log(foodid);
        console.log(empid);


    if (imagePath) {
        const insertImageQuery = qr.insertImage;
        await pool.query(insertImageQuery, [imagePath, foodid]);
    }

        // Send success response
        res.send('<script>alert("Employee added successfully"); window.location.href="/emp/editMenu";</script>');


 } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }

}




const menuEditForm = (req,res)=>{

    const empid = parseInt(req.user1.id);
    const menuid = parseInt(req.params.menuid);


    pool.query(qr.foodById,[menuid], (error, foodResult) => {
        if (error) {
            console.error('Error fetching database:', error);
            return res.status(500).send('Error fetching database');
        }

    const food = foodResult.rows[0];


    pool.query(qr.image,[menuid], (error, imageResult) => {
        if (error) {
            console.error('Error fetching database:', error);
            return res.status(500).send('Error fetching database');
        }

        const imagelink = imageResult.rows[0];



    

    res.render('../views/employee/editMenuForm', { empid,food,imagelink});



    })

    })

    
    





}



const menuUpdating = async (req,res)=>{

    try {

    const menuid = parseInt(req.params.menuid);
      

    // Extracting fields from the request body
    const { name, price, type,status } = req.body; 


    const checkFoodQuery = qr.foodExcludingCurrent;
    const userResult = await pool.query(checkFoodQuery, [name, menuid]);

    if (userResult.rows.length) {
        return res.send('<script>alert("food is already exist"); window.history.back();</script>');
    }

    const updateMenuQuery = qr.updateMenu;
    const updateMenuValues = [name, price, type,status , menuid];

    await pool.query(updateMenuQuery, updateMenuValues);


    if (req.file) {
        const imagePath = `menuimages/${req.file.filename}`;
        const updateImageQuery = qr.updateImage;
        await pool.query(updateImageQuery, [imagePath, menuid]);
    }

    res.send('<script>alert("Menu updated successfully"); window.location.href="/emp/editMenu";</script>');

} catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
}

}



const deleteMenu = async (req, res) => {
    try {
        const menuid = parseInt(req.params.menuid);

        // Check if there are any orders associated with the menu item
        const checkResult = await pool.query(qr.checkOrder, [menuid]);

        if (checkResult.rows.length) {
            return res.send('<script>alert("Cannot Delete Menu while Order in Progress"); window.history.back();</script>');
        }

        // Delete the menu item
        await pool.query(qr.deleteMenu, [menuid]);

        res.send('<script>alert("Menu deleted successfully"); window.location.href="/emp/editMenu";</script>');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('<script>alert("Internal server error"); window.history.back();</script>');
    }
};




const editOrderTable = (req,res)=>{

    const tableid = parseInt(req.params.tableid); 
    const id = parseInt(req.user1.id);

    //fetch order

pool.query(qr.menuTable,[tableid], (error, menuresults) => {
        if (error) {
            console.error('Error fetching database:', error);
            return res.status(500).send('Error fetching database');
        }

        const menu = menuresults.rows;


    
        // Get all food names
        const foodArray = [];
        let count = 0; // Counter to keep track of completed queries

        // Iterate over each menu item
        menu.forEach((menuItem, index) => {
            pool.query(qr.foodlist, [menuItem.menuid], (error, foodresults) => {
                if (error) {
                    console.error('Error fetching database:', error);
                    return res.status(500).send('Error fetching database');
                }

                foodArray[index] = foodresults.rows[0];
                count++;

                // Check if all queries have completed
                if (count === menu.length) {
                    // Render the view with all data
                    res.render('../views/employee/editOrder', { tableid,menu,  foodArray, menu,id});
                }
            });

        })
    })

}



const newMenu = async (req,res)=>{


    const tableid = parseInt(req.params.tableid); 
    const id = parseInt(req.user1.id);

    try {
       
    
       
    
        const foodresult = await pool.query(qr.allfoodMenu);
        const drinkresults = await pool.query(qr.alldrink);
        const sideresults = await pool.query(qr.allside);
    
        const foods = foodresult.rows;
        const drinks = drinkresults.rows;
        const sides = sideresults.rows;
    
        const foodlinkpromise = [];
        const drinklinkpromise = [];
        const sidelinkpromise = [];
    
    
    
        foods.forEach((inv) => {
            const promise = new Promise((resolve, reject) => {
                pool.query(qr.images, [inv.menuid], (error, resultsinv) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(resultsinv.rows[0]);
                    }
                });
            });
            foodlinkpromise.push(promise);
        });
    
        const foodimages = await Promise.all(foodlinkpromise);
    
        drinks.forEach((inv) => {
            const promise = new Promise((resolve, reject) => {
                pool.query(qr.images, [inv.menuid], (error, resultsinv) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(resultsinv.rows[0]);
                    }
                });
            });
            drinklinkpromise.push(promise);
        });
    
        const drinkimages = await Promise.all(drinklinkpromise);
    
        sides.forEach((inv) => {
            const promise = new Promise((resolve, reject) => {
                pool.query(qr.images, [inv.menuid], (error, resultsinv) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(resultsinv.rows[0]);
                    }
                });
            });
            sidelinkpromise.push(promise);
        });
    
        const sidesimages = await Promise.all(sidelinkpromise);
    
    
       
        res.render('../views/employee/MenuOrder',{foods,drinks,sides,tableid,foodimages,drinkimages,sidesimages,id});
    
    
    
    
    
        }catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal server error');
        }
    





}



const updatingCustOrder = async (req, res) => {
    const tableid = parseInt(req.params.tableid);

    const menuid = JSON.parse(req.body.jsonData).map(Number); 
    const quantity = JSON.parse(req.body.otherJson).map(Number);

   



    try {
        const menuresult = await pool.query(qr.menuTable, [tableid]);
        const menu = menuresult.rows;

        const billResult = await pool.query(qr.billid, [tableid]);
        const billDetail = billResult.rows[0];



        for (let index = 0; index < menuid.length; index++) {
            const existingMenuItem = menu.find(menuItem => menuItem.menuid === menuid[index]);

            if (existingMenuItem) {
                const newquantity = existingMenuItem.quantity + quantity[index];
                await pool.query(qr.UpdateExistOrder, [newquantity, existingMenuItem.idorder, tableid]);
            } else {
                await pool.query(qr.insertMenuOrder, [quantity[index], menuid[index], tableid]);
                await pool.query(qr.insertBillOrder,[billDetail.billid,tableid])
            }
        }

        console.log('update successs');
        // Retrieve order details (quantity, status, menuid, tableid, date)
        const food = await pool.query(qr.getOrder, [tableid,billDetail.billid]);
        const foodOrder = food.rows;

        // Retrieve menu details (name, price)
        const menuDetails = await Promise.all(
            foodOrder.map(async (foodItem) => {
                const result = await pool.query(qr.getMenuDetail, [foodItem.menuid]);
                return result.rows[0]; // assuming the price is in the first row
            })
        );

        console.log('cp 1');

        let total = 0;
        let quantitydb = 0;
        const realPrice = [];

        foodOrder.forEach((foodItem, index) => {
            const itemQuantity = parseInt(foodItem.quantity);
            const itemPrice = parseFloat(menuDetails[index].price);

            quantitydb += itemQuantity;
            total += itemQuantity * itemPrice;
            realPrice[index] = (itemQuantity * itemPrice).toFixed(2);
        });

        total = total.toFixed(2);

        console.log(total);

        // Update the total amount bill into the database




        await pool.query(qr.updatebill, [total, tableid]);

        res.send(`<script>alert("Order Updated successfully"); window.location.href="/emp/editOrder/${tableid}";</script>`);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).send('Internal server error');
    }
};



const editOrderItem = (req, res) => {
    const tableid = parseInt(req.params.tableid);
    const idorder = parseInt(req.params.idorder);
    const id = parseInt(req.user1.id);

    console.log(idorder);
    

    pool.query(qr.orderid, [idorder], (error, results1) => {
        if (error) {
            console.error('Error fetching order by ID:', error);
            return res.status(500).send('Error fetching order by ID');
        }

        const order = results1.rows[0];

        pool.query(qr.foodById, [order.menuid], (error, results2) => {
            if (error) {
                console.error('Error fetching food by ID:', error);
                return res.status(500).send('Error fetching food by ID');
            }

            const foodname = results2.rows[0];

            

            res.render('../views/employee/orderitemform', {
                tableid,
                idorder,
                order,
                foodname,
                id
            });
        });
    });
}



const updateOrderItem = async (req, res) => {
    const tableid = parseInt(req.params.tableid);
    const idorder = parseInt(req.params.idorder);
    const { quantity, status } = req.body;
    console.log(quantity)

    try {
        // Fetch bill id
        const billResult = await pool.query(qr.billid, [tableid]);
        const billDetail = billResult.rows[0];
        const billId = billDetail.billid;

        const newQuantity = parseInt(quantity);

        // Update the new quantity and status
        await pool.query(qr.UpdateExistOrder2, [newQuantity, status, idorder, tableid]);

        // Retrieve order details (quantity, status, menuid, tableid, date)
        const food = await pool.query(qr.getOrder, [tableid, billId]);
        const foodOrder = food.rows;

        // Retrieve menu details (name, price)
        const menuDetails = await Promise.all(
            foodOrder.map(async (foodItem) => {
                const result = await pool.query(qr.getMenuDetail, [foodItem.menuid]);
                return result.rows[0];
            })
        );

        let total = 0;
        foodOrder.forEach((foodItem, index) => {
            const itemQuantity = parseInt(foodItem.quantity);
            const itemPrice = parseFloat(menuDetails[index].price);
            total += itemQuantity * itemPrice;
        });

        total = total.toFixed(2);

        // Update the total amount in the bill
        await pool.query(qr.updatebill, [total, tableid]);

        res.send(`<script>alert("Order Updated successfully"); window.location.href="/emp/editOrder/${tableid}";</script>`);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};


const deleteOrderItem = async(req,res)=>{

    const tableid = parseInt(req.params.tableid);
    const idorder = parseInt(req.params.idorder);


    try {



        const billResult = await pool.query(qr.billid, [tableid]);
        const billDetail = billResult.rows[0];
        const billId = billDetail.billid;
         console.log('cp1')

        const orderResult = await pool.query(qr.orderid,[idorder]);
        const order = orderResult.rows[0];
        console.log('cp2')
        console.log(order)

        const foodResult = await pool.query(qr.foodById,[order.menuid]);
        const fooddetail = foodResult.rows[0];
        console.log('cp3')
        console.log(fooddetail)

        const pricefordeletedfood = parseFloat(fooddetail.price);
        const quantityfordeletedfood = parseInt(order.quantity);
        const temp = pricefordeletedfood * quantityfordeletedfood;
        console.log('cp3')
        console.log(pricefordeletedfood)
        console.log(quantityfordeletedfood)



        const food = await pool.query(qr.getOrder, [tableid, billId]);
        const foodOrder = food.rows;
        console.log('cp4')
        // Retrieve menu details (name, price)
        const menuDetails = await Promise.all(
            foodOrder.map(async (foodItem) => {
                const result = await pool.query(qr.getMenuDetail, [foodItem.menuid]);
                return result.rows[0];
            })
        );

        console.log('cp5')

        let total = 0;
        foodOrder.forEach((foodItem, index) => {
            const itemQuantity = parseInt(foodItem.quantity);
            const itemPrice = parseFloat(menuDetails[index].price);
            total += itemQuantity * itemPrice;
        });

        console.log('cp6')
        console.log(total);

        total = total.toFixed(2);
        total = total - temp;

        console.log('cp7')
        console.log(total);

        await pool.query(qr.updatebill2, [total, billId]);

        await pool.query(qr.deleteOrderById,[idorder]);


        res.send(`<script>alert("Order Deleted successfully"); window.location.href="/emp/editOrder/${tableid}";</script>`);



    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }

}




const viewBill = (req,res)=>{

    const id = parseInt(req.user1.id);
    console.log(id)

    pool.query(qr.bill, (error, results1) => {
        if (error) {
            console.error('Error fetching order by ID:', error);
            return res.status(500).send('Error fetching order by ID');
        }
        const bill = results1.rows;

        res.render('../views/employee/billList',{bill,id})


    })



}



const viewConfirmation = async (req,res)=>{

    const orderid = parseInt(req.params.idorder);
    const id = parseInt(req.user1.id);

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
        
        


        res.render('../views/employee/confirmationCheckOut', { total, menuDetails, order, id, quantity, realPrice,bill });  




    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }



}

const updatingPayment = async (req, res) => {
    const billid = parseInt(req.params.idorder); // Use billid instead of idorder
    const id = parseInt(req.user1.id); // Access the user ID correctly if req.user is an object
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
        

        res.send(`<script>alert("Payment is successfully made"); window.location.href="/emp/historyDetail/${billid}";</script>`);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
}





const HisotryDetail = async (req,res)=>{

    const id = parseInt(req.user1.id);
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

    res.render('../views/employee/detail', { total, menuDetails, order, id, quantity, realPrice,bill,table,pay,net });  

}catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
}

}











const logOut = (req,res)=>{



        req.session.user1 = null;
   
        
        // Redirect to login page or home page
        res.redirect('/emp'); // Adjust the redirect URL as needed
    





}





 module.exports={
    get_login,
    post_login,
    homepage,
    retTable,
    tablesend,
    detailtable,
    deleteOrder,
    addingItem,
    get_inv,
    addItem,
    deleteitem,
    formupdate,
    updateInv,
    reqform,
    insertRequest,
    menuTableEdit,
    menuForm,
    addingnewMenu,
    menuEditForm,
    menuUpdating,
    deleteMenu,
    isAuthenticated,
    editOrderTable,
    newMenu,
    updatingCustOrder,
    editOrderItem,
    updateOrderItem,
    deleteOrderItem,
    viewBill,
    viewConfirmation,
    updatingPayment,
    HisotryDetail,
    logOut
    
    
    
        
   }