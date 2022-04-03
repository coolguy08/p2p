const express = require('express');
const jwt=require('jsonwebtoken');

const router = express.Router();

const crypto = require("crypto");

const {con}=require('../mysql_db');



function hash(password){
    const hashval = crypto.createHmac('sha256', process.env.HASH_SECRET)
                    .update(password)
                    .digest('hex');
    return hashval;
}


function isEmail(email){

    if(email.indexOf('@')==-1){
        return false;
    }
    else if(email.indexOf('@')!==email.lastIndexOf('@')){
        return false;
    }
    else if(email.split('@')[1].length<=2){
                return false;
    }
    else if(email.split('@')[1].indexOf('.')==-1){
        return false;
    }
    else if(email.split('@')[1].split('.')[1].length<2){
        return false;
    }
    return true;
}


router.post('/login', (req, res) => {
    
    const {email,password}=req.body;

    if(!isEmail(email)){
        res.json({status:false,msg:"Invalid Email"});
        return;
    }

    //console.log(req.query);

    const hashval=hash(password);

    const data=[email,hashval];

    let sql="select * from users where email=? and password=?";

    

    con.query(sql,data,(err,data,fields)=>{
        
        if (err){
            res.json({status:false,msg:"incorrect email or password"});
            return;
        };

        

        if(data && data.length>0){

            const [tmp]=data;

            let user={
                name:tmp.name,
                profileImg:tmp.profileImg,
                email:tmp.email
            }

            console.log(user);

            let token=jwt.sign(user,
            process.env.SECRET,
            {
                expiresIn:"3h"
            });

            res.json({status:true,msg:'success',user:user,token:token});
        }
        else
        {
            res.json({status:false,msg:"incorrect email or password"});
        }

        
    });
     


  
});

router.post('/register',(req,res)=>{

    const {email,password,name}=req.body;

    if(!email || !password || !name){
        res.json({status:false,msg:"Invalid arguments"});
        return;
    }

    if(!isEmail(email)){
        res.json({status:false,msg:"Invalid Email"});
        return;
    }

    if(password.length<6){
        res.json({status:false,msg:"password too small. should be of minimum 6 characters"});
        return;
    }

    const hashval=hash(password);

    //console.log(hashval);
    

    let data=[name,email,hashval];

    if(!isEmail(email)){
        res.json({status:false,msg:"Invalid Email"});
        return;
    }

    //console.log(req.body);

    let sql=`insert into  users (name,email,password) values(?,?,?);`;
    
    con.query(sql,data,(err,data)=>{
        if(err){
            if(err.code==='ER_DUP_ENTRY'){
                res.json({status:false,msg:"Already Registered User"});
                
            }
            else{
                res.json({status:false,msg:"Server Error"});
                console.log(err);
            }

            return;
        }

        
        res.json({status:true,msg:"Registered!"});
    })
    



})

module.exports = router;
