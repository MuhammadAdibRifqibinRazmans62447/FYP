const qr = require('../controller/custQuarries');
const pool = require('../db');






const get_login = (req,res)=>{


    pool.query(qr.getTable, (error, results) => {
        if (error) {
            console.error('Error fetching database:', error);
            res.status(500).send('Error fetching database');
            return;
        }
    
        const tables = results.rows; // Renamed to "blogs"
        console.log('Successsss');
        res.render('../views/customer/custLogin', {tables}); // Passing "blogs" to the template
    });


}

const reg_cust =(req,res)=>{

   const username = req.body.username;
   const tableid = parseInt(req.body.table);
   

   pool.query(qr.regCust,[username,tableid], (error, results) => {
    if (error) {
        console.log('Username:', username);
        console.log('Table:', tableid);
        console.error('Error Updating database:', error);
        res.status(500).send('Error Updating database');
        return;
    }

    pool.query(qr.allfood,(error,foodResults)=>{
        if (error) {
          
            console.error('Error Fetching database:', error);
            res.status(500).send('Error Fetching database');
            return;

            
        }

        const foods = foodResults.rows;

        pool.query(qr.alldrink,(error,drinkresults)=>{
            if (error) {
              
                console.error('Error Fetching database:', error);
                res.status(500).send('Error Fetching database');
                return;
        
        
        }

        const drinks = drinkresults.rows;

        pool.query(qr.allside,(error,sideresults)=>{
            if (error) {
              
                console.error('Error Fetching database:', error);
                res.status(500).send('Error Fetching database');
                return;
            }

            const sides = sideresults.rows;

            req.session.user = {
                id: tableid,
                role: 'customer'
            };
            res.render('../views/customer/menu',{foods,drinks,sides,tableid});


        });
        });
    });
});




}



const re_custting = async (req, res) => {

    try {
    const username = req.body.username;
    const tableid = parseInt(req.body.table);

    await pool.query(qr.regCust, [username, tableid]);

    const foodresult = await pool.query(qr.allfood);
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


    req.session.user = {
        id: tableid,
        role: 'customer'
    };
    res.render('../views/customer/menu',{foods,drinks,sides,tableid,foodimages,drinkimages,sidesimages});





    }catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }



}





const menuIn = (req, res) => {
    // Parse tableid from request parameters
    const tableid = parseInt(req.params.table);
    
    const menuid = JSON.parse(req.body.jsonData).map(Number); 
    const quantity = JSON.parse(req.body.otherJson).map(Number); 
  

   //console.log(tableid.valueOf());
    
    
    
    menuid.forEach((menuItemId, index) => {
        const quantityValue = quantity[index];
    
        
        if (quantity.length >= index + 1) {
            pool.query(qr.insertMenu, [quantityValue, menuItemId, tableid], (error, result) => {
                if (error) {
                    console.error('Error inserting into database:', error);
                    res.status(500).send('Error inserting into database');
                    return;
                }
    
                
            });
        } else {
            console.error('Quantity array does not have enough elements');
            res.status(500).send('Quantity array does not have enough elements');
            return;
        }
    });




    
    res.redirect('/cust/confirm')
    


}



const confirmation = async (req, res) => {
    const id = parseInt(req.user.id);

    try {
        // Retrieve order details (quantity, status, menuid, tableid, date)
        await new Promise(resolve => setTimeout(resolve, 3000));

        const food = await pool.query(qr.getOrder, [id]);
        const foodOrder = food.rows;

        

        // Retrieve menu details (name, price)
        const menuDetails = await Promise.all(
            foodOrder.map(async (foodItem) => {
                const result = await pool.query(qr.getMenuDetail, [foodItem.menuid]);
                return result.rows[0]; // assuming the price is in the first row
            })
        );

        

        let total = 0;
        let quantity = 0;
        const realPrice = [];

        foodOrder.forEach((foodItem, index) => {
            const itemQuantity = parseInt(foodItem.quantity);
            const itemPrice = parseFloat(menuDetails[index].price);

            quantity += itemQuantity;
            total += itemQuantity * itemPrice;
            realPrice[index] = (itemQuantity * itemPrice).toFixed(2);
        });

        total = total.toFixed(2);

        res.render('../views/customer/confirmation', { total, menuDetails, foodOrder, id, quantity, realPrice });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};






const cancel = async (req, res) => {
    const tableid = parseInt(req.user);

    try {
        // Delete the order
        await pool.query(qr.deleteOrder, [tableid]);

        // Unregister the customer
        await pool.query(qr.UnregCust, [tableid]);

        res.send('<script>alert("Order deleted successfully"); window.location.href="/cust";</script>');
    } catch (error) {
        console.error('Error updating database:', error);
        res.status(500).send('Error updating database');
    }
};




const receipt = async (req, res) => {
    const id = parseInt(req.user.id);

    try {
        // Retrieve order details (quantity, status, menuid, tableid, date)
        const food = await pool.query(qr.getOrder, [id]);
        const foodOrder = food.rows;

        

        // Retrieve menu details (name, price)
        const menuDetails = await Promise.all(
            foodOrder.map(async (foodItem) => {
                const result = await pool.query(qr.getMenuDetail, [foodItem.menuid]);
                return result.rows[0]; // assuming the price is in the first row
            })
        );

        

        let total = 0;
        let quantity = 0;
        const realPrice = [];

        foodOrder.forEach((foodItem, index) => {
            const itemQuantity = parseInt(foodItem.quantity);
            const itemPrice = parseFloat(menuDetails[index].price);

            quantity += itemQuantity;
            total += itemQuantity * itemPrice;
            realPrice[index] = (itemQuantity * itemPrice).toFixed(2);
        });

        total = total.toFixed(2);

        // Insert the total bill into the database
        await pool.query(qr.insertBill, [total, id]);

        const billResult = await pool.query(qr.billid, [id]);
        const billDetail = billResult.rows[0];

        await pool.query(qr.insertBillOrder, [billDetail.billid,id]);


        
      

        // Render the receipt view with the necessary data
        res.redirect('/cust/ShowReciept')
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};



const showReciept = async (req,res) =>{

    if (!req.user) {
        return res.redirect('/');
    }

    const id = parseInt(req.user.id);

 


    try {

         // Retrieve order details (quantity, status, menuid, tableid, date)
         const food = await pool.query(qr.getOrder, [id]);
         const foodOrder = food.rows;
 
        
 
         // Retrieve menu details (name, price)
         const menuDetails = await Promise.all(
             foodOrder.map(async (foodItem) => {
                 const result = await pool.query(qr.getMenuDetail, [foodItem.menuid]);
                 return result.rows[0]; // assuming the price is in the first row
             })
         );
 
         
 
         let total = 0;
         let quantity = 0;
         const realPrice = [];
 
         foodOrder.forEach((foodItem, index) => {
             const itemQuantity = parseInt(foodItem.quantity);
             const itemPrice = parseFloat(menuDetails[index].price);
 
             quantity += itemQuantity;
             total += itemQuantity * itemPrice;
             realPrice[index] = (itemQuantity * itemPrice).toFixed(2);
         });
 
         total = total.toFixed(2);

        // Insert the total bill into the database
      

        // Retrieve the bill ID
        const billResult = await pool.query(qr.billid, [id]);
        const billDetail = billResult.rows[0];



       res.render('../views/customer/receipt', { total, menuDetails, foodOrder, id, quantity, realPrice, billDetail });    


       



} catch (error) {

    console.error('Error:', error);
        res.status(500).send('Internal server error');

}
}

module.exports={
get_login,
reg_cust,
menuIn,
re_custting,
confirmation,
cancel,
receipt,
showReciept

}