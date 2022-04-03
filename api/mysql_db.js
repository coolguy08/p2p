const mysql=require('mysql');


const con=mysql.createConnection({
	host:process.env.MYSQL_HOST,
	user:process.env.MYSQL_USER,
	password:process.env.MYSQL_PASSWORD,
	database:process.env.MYSQL_DATABASE,
    ssl: {
        rejectUnauthorized: true,
        ca: null
    }
	
});


function connect(){
    con.connect((err)=>{
        if(err){console.log(err);}
        else
            {console.log('connected');}
    });
}




module.exports={connect,con};

