const bcrypt = require('bcryptjs')
require('dotenv').config({path: __dirname + '/../.env'})
const stripe = require('stripe')('sk_test_51KeNN1Fz6IsrEsyrQEqENjXwnFQFQiX5mgsRbDV0iH3hX5HjS0R7Bboue2XWbqhdcgNgmwUOr42ujWOyMikF6wdA00O2X4FaIH')
const {DATABASE_URL} = process.env
const Sequelize = require('sequelize')



const sequelize = new Sequelize(DATABASE_URL,{
    dialect: 'postgres', 
    dialectOptions: {
        ssl: {   
            rejectUnauthorized: false
        }
    }
})

module.exports = {
    getSoaps:(req,res)=>{
        sequelize.query(`
        SELECT * FROM products
        WHERE type = 'Soap'
        `)
        .then(dbRes=> res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))

    },
    getCds:(req,res)=>{
        sequelize.query(`
        SELECT * FROM products
        WHERE type = 'cd'
        `)
        .then(dbRes=> res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
    },
    showCart:(req,res)=>{
        const productId = req.params.id
    
        sequelize.query(`
        SELECT * FROM products
        WHERE product_id = ${productId};
        `)
        .then(dbRes=> res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
    },
    checkOut: async(req,res)=>{
       
        // console.log("this is the req.body aaaaaaaaa",req.body)
        const session = await stripe.checkout.sessions.create({
            // const products = [req.body.products] add it from the front end 
            line_items: [
                {
                  price: 'price_1KgGSGFz6IsrEsyrzcYxbfcC',
                  quantity: req.body.quantity,
                },
                // {
                //  price: 'price_1KgGVDFz6IsrEsyrimwyyxDn',
                //  quantity: 1,
                // }
              ],
              mode: 'payment',
              success_url: 'https://frescostore.herokuapp.com/Success',
              cancel_url: 'https://frescostore.herokuapp.com/cart',
           
          })
        //   console.log(session)
              res.status(200).send(session)
          
        
    },
    searchMatching: (req,res)=>{
    //    console.log(req.body.input)
       let input = req.body.input
       sequelize.query(`
       SELECT * from products
       WHERE LOWER(type) LIKE LOWER('%${input}%')
       OR LOWER(name) LIKE LOWER('%${input}%');
        `).then(dbRes=> res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
    },

    registerUser: (req,res) =>{
       const {password, username, fullName, email } = req.body
        sequelize.query(`
        INSERT INTO users(username, password, fullname, email)
        VALUES(
            '${username}',
            '${password}',
            '${fullName}',
            '${email}'
        );     
        `).then(dbRes=> res.status(200).send(req.body))
        .catch(err => console.log(err))
    },

    logInUser: (req,res) =>{
        const {password, username} = req.body
     
        sequelize.query(`
        SELECT * FROM users
        WHERE username = '${username}'
        
        `).then(dbRes=> 
            {   
                const hash = dbRes[0][0].password
                    bcrypt.compare(password, hash, (err,validationResponse)=>{
                    
                                if(validationResponse){
                                        res.status(200).send('authorized')
                                } else {
                                        console.log('not authorized')
                                        res.status(200).send('not authorized ):<')    
                                }
                            }
                        )
            }
         )
     }
}