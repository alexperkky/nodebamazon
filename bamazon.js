var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "indy1993",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw (err);
    console.log("connection successful!")
    makeTable();
})

var makeTable = function() {
    connection.query("SELECT * FROM products", function(err, res){
        for(var i=0; i<res.length; i++) {
            console.log(res[i].itemid+" || "+res[i].productname+" || "+res[i].departmentname+" || "+res[i].price+" || "+res[i].stockquantity+"\n")
        }
        promptCustomer(res);
    })
}

var promptCustomer = function(res){
    inquirer.prompt([{
        type: 'input',
        name: 'choice',
        message: "What would you like to purchase? [Quit with Q]"
    }]).then(function(answer){
        var correct = false;
        if(answer.choice.toUpperCase()=="Q"){
            process.exit();
        }
        for(var i=0; i<res.length; i++) {
            if(res[i].productname==answer.choice){
                correct=true;
                var product=answer.choice;
                var id=i;
                inquirer.prompt({
                    type: "input",
                    name: "quant",
                    message:"How many would you like to buy?",
                    validate: function(value) {
                        if(isNaN(value)==false){
                            return true;
                        } else {
                            return false;
                        }
                    }
                }).then(function(answer){
                    if((res[id].stockquantity-answer.quant)>0){
                        connection.query("UPDATE products SET stockquantity='"+(res[id].stockquantity-answer.quant)+"' WHERE productname='"+product+"'", function(err, res2){
                            console.log("Product Purchased!");
                            makeTable();
                        })
                    } else {
                        console.log("Not a valid selection!");
                        promptCustomer(res);
                    }
                })
            }
        }
        if(i==res.length && correct==false) {
            console.log("Not a valid selection!");
            promptCustomer(res);
        }
    })
}