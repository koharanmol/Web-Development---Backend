/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Anmol Singh Student ID: 147528178 Date: 12, april,2019
*
*
********************************************************************************/
var path = require("path");
var exphbs = require("express-handlebars")
var fs = require("fs");
var bodyParser = require("body-parser");
var multer = require ("multer");
var express = require("express");
var app = express();
app.use(express.static(__dirname));
var HTTP_PORT = process.env.PORT || 8080;
var dataSrv = require("./data-service.js");
var dataServiceAuth = require('./data-service-auth');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
function onHttpStart() {
  console.log("Express http server listening on port " + HTTP_PORT);
}

app.get("/", function(req,res){
     res.render("home");
    });

app.get("/about", function(req,res){
    res.render("about");
  });

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  // tell multer to use the diskStorage function for naming files instead of the default.
  const upload = multer({ storage: storage });
  app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.send("register");
  });
  
  app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
   });

   app.get("/employees/add", (req, res) => {
    dataSrv.getDepartments(req.body).then((data) => {
       res.render("addEmployee", {departments: data}); 
   }).catch((err) => {
       res.render("addEmployee", {departments: []});  
   });
 });

app.get("/departments/add", function(req,res){
    res.render("addDepartment");
});
app.get("/images/add", function(req,res){
    res.render("addImage");
   

});
 
app.get("/images", function(req,res){
    fs.readdir("./public/images/uploaded", function(err, imageFile){
        res.render("images",  { data: imageFile, title: "Images" });
    })
});

app.post("/departments/add", (req, res) => {
    dataSrv.addDepartment(req.body).then((data) => {
        res.redirect("/departments");
    }).catch((err) => {
        console.log(err);
    });
 });
 app.post("/department/update", function(req, res){
    dataSrv.updateDepartment(req.body).then(() =>
    res.redirect("/departments")).catch((err) => {
        console.log(err);
        res.json(err);
    })
});
app.get("/department/:departmentId", function(req, res){
    dataSrv.getDepartmentById(req.params.departmentId).then((data) => {
        res.render("department",{department:data})
    }).catch(() => {
        res.render("department",{message:"no results"})
    })
})

app.post("/employees/add", (req, res) => {
    dataSrv.addEmployee(req.body).then(() => {
      res.redirect("/employees");
    })
    .catch(() => {
        console.log("unable to proceed!!!");
    });
  });


app.get("/employee/delete/:empNum",(req, res) => {
    dataSrv.deleteEmployeeByNum(req.params.empNum).then(() => {
        res.redirect("/employees");
    }).catch((errorMessage) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});
 
 app.get("/employees", function(req,res){
    if (req.query.status){
        dataSrv.getEmployeeByStatus(req.query.status).then((data) => {
            res.render("employees",{employees:data})
        }).catch(() => {
            res.render("employees",{message: "no results"})
        })
    }
    else if (req.query.department){
        dataSrv.getEmployhereeByDepartment(req.query.department).then((data) => {
            res.render("employees",{employees:data})
        }).catch(() => {
            res.render("employees",{message: "no results"})
        })
    }
    else if (req.query.manager){
        dataSrv.getEmployeeByManager(req.query.manager).then((data) => {
            res.render("employees",{employees:data})
        }).catch(() => {
            res.render("employees",{message: "no results"})
        })
    }
    else{
        dataSrv.getAllEmployees().then((data) => {
            res.render("employees",{employees:data})
        }).catch(() => {
            res.render("employees",{message: "no results"})
        })
    }
});

app.get("/employee/:employeeNum", function(req, res){
    dataSrv.getEmployeeByNum(req.params.employeeNum).then((data) => {
        res.render("employee",{employee:data})
    }).catch(() => {
        res.render("employee",{message:"no results"})
    })
})

app.post("/employee/update", function(req, res){
    dataSrv.updateEmployee(req.body).then(() =>
    res.redirect("/employees")).catch((err) => {
        console.log(err);
        res.json(err);
    })
});
app.get("/employee/:empNum", (req, res) => {
    // initialize an empty object to store the valueslet
     viewData = {};
     dataService.getEmployeeByNum(req.params.empNum)
     .then((data) => {
         viewData.data = data; //store employee data in the "viewData" object as "data"
        }).catch(()=>{
            viewData.data= null; // set employee to null if there was an error 
        }).then(dataService.getDepartments)
        .then((data) => {viewData.departments = data; // store department data in the "viewData" object as "departments"
        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching 
        // viewData.departments object
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.data.department) {
                viewData.departments[i].selected = true;
            }
        }
    }).catch(()=>{
        viewData.departments=[]; // set departments to empty if there was an error
    }).then(()=>{
        if(viewData.data == null){ // if no employee -return an error
            res.status(404).send("Employee Not Found");}
            else{
                res.render("employee", {
                     viewData: viewData }); // render the "employee" view
                    }});});

app.get("/departments", function(req,res){

    dataSrv.getDepartments()
    .then((data) => {
        res.render("departments", {departments: data});
    })
    .catch((err) => {
        console.log(err);
        res.json(err);
    })
});
app.get("/employee/delete/:empNum", function (req, res) {
    dataSrv.deleteEmployeeByNum(req.params.empNum)
        .then((data) => {
          res.redirect("/employees");
        })
        .catch((msgerr) => {
          res.status(500).send("Unable to Remove Employee / Employee not found"); 
        })
 });
 
 
 app.get("/department/delete/:departmentId", function (req, res) {
    dataSrv.deleteDepartmentById(req.params.departmentId)
        .then((data) => {
          res.redirect("/departments");
        })
        .catch((msgerr) => {
          res.status(500).send("Unable to Remove Department / Department not found"); 
        })
 });

app.use((req,res)=>{

    res.status(404).send("Page Not Found");

});

app.engine('.hbs', exphbs({
     extname: '.hbs',
     defaultLayout: 'main',
    helpers:{
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
           },
           equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handleba+rs Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
           }
           
    } }));
app.set('view engine', '.hbs');

dataSrv.initialize()
    .then(() => {
    app.listen(HTTP_PORT, onHttpStart);  //start the server 
})
    .catch(err => {
    console.log(err);
})

router.get('/login', (req, res) => {
    res.render('login');
  });
  
  router.get('/register', (req, res) => {
    res.render('register');
  });
  
  router.post('/register', (req, res) => {
    dataServiceAuth.registerUser(req.body)
      .then(() => res.render('register', { successMessage: 'User created' }))
      .catch(err => res.render('register', { errorMessage: err, userName: req.body.userName }));
  });
  
  router.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
      .then(user => {
        req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory
        }
        res.redirect('/employees');
      })
      .catch(err => {
        res.render('login', { errorMessage: err, userName: req.body.userName });
      });
  });
  
  router.get('/logout', (req, res) =>{
    req.session.reset();
    res.redirect('/');
  });
  
  router.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory')
  });
  
  router.get("*", (req, res) => {
    res.status(`The page does not exist`);
    res.sendStatus(404);
  });
  
  module.exports = router;