const Sequelize = require('sequelize');
var sequelize = new Sequelize('ddcd06iiks02sv', 'klycrcdqhepltq', 'a7154db827c5d4004805caf98218f9c531ed6dc23de53a0653f630c723cfaed1',
 {host: 'ec2-54-225-113-7.compute-1.amazonaws.com',
 dialect: 'postgres',
 port: 5432,
 dialectOptions: {
     ssl: true
    }
});

const Employee = sequelize.define("employee", {
    employeeNum: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
  });

  const Department = sequelize.define("department", {
    departmentId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    departmentName: Sequelize.STRING
  });
  Department.hasMany(Employee, { foreignKey: "department" });

module.exports.initialize = function(){
    var promise = new Promise((resolve, reject) => {
        sequelize
        .sync()
        .then(Employee => resolve("Employee model synced"))
        .then(Department => resolve("Department model synced"))
        .catch(err => reject(`Unable to sync database: ${err}`));
    })
    return promise;
};

module.exports.getAllEmployees = function () {

    var promise = new Promise((resolve, reject) => {
        Employee.findAll()
        .then(data => resolve(data)) 
    .catch(err => reject(err));
    })
    return promise;
};

module.exports.getManagers = function () {
    var promise = new Promise((resolve, reject) => {
        Employee.findAll({
            isManager: true
          })
            .then(data => resolve(data))
      .catch(err => reject(`no results returned:`));
    })
    return promise;
};

module.exports.getDepartments = function () {

    var promise = new Promise((resolve, reject) => {
        Department.findAll()
        .then(data => {
          resolve(data);
        })
        .catch(err => reject(err));
  })
     return promise;
};


module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (var prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }
        Employee.create(employeeData)
            .then(function () {
                resolve();
            })
            .catch(function (err) {
                reject("unable to create employee");
            });
    });
}
module.exports.getEmployeeByStatus = function(status){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            where: {
              status : status
            }
          })
            .then(data => resolve(data))
      .catch(err => reject(err));
    })
};
module.exports.getEmployeeByDepartment = function(department){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            where: {
              department : department
            }
          })
            .then(data => resolve(data))
      .catch(err => reject(err));
    })
};

module.exports.getEmployeeByManager = function(manager){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            where: {
              manager : manager
            }
          })
            .then(data => resolve(data))
      .catch(err => reject(err)); 
    })
};

module.exports.getEmployeeByNum = function(employeeNum){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            where: {
              employeeManagerNum : employeeNum
            }
          })
            .then(data => resolve(data))
      .catch(err => reject(err));
    })
};
module.exports.updateEmployee = function(value){
    return new Promise(function(resolve, reject){
        employeeData.isManager = employeeData.isManager ? true : false;
        for (let i in employeeData) {
          if (employeeData[i] == "") {
            employeeData[i] = null;
          }
        }
        Employee.update(employeeData, {
          where: {
            employeeNum: employeeData.employeeNum
          }
        })
          .then(data => resolve(`update success: ${data}`))
          .catch(err => resolve(`update failed: ${err}`));
    });   
}
module.exports.addDepartment = function (departmentData) {

    var promise = new Promise((resolve, reject) => {
        for (let i in departmentData) {
            if (departmentData[i] == "") {
              departmentData[i] = null;
            }
          }
          Department.create(departmentData, {
            where: {
              departmentId: departmentData.departmentId
            }
          })
            .then(department => {
              resolve(department)
            })
            .catch(err => reject(`Unable to create department`));
      })
     return promise;
};
module.exports.updateDepartment = function (departmentData) {

    for (let i in departmentData) {
        if (departmentData[i] == "") {
          departmentData[i] = null;
        }
      }
      var promise = new Promise((resolve, reject) => {
        Department.update({ departmentName: departmentData.departmentName },{ where: { departmentId: departmentData.departmentId }})
          .then(data => resolve(`Update succes: ${data}`))
          .catch(err => resolve(`Update failed: ${err}`));
    })
     return promise;
}
module.exports.getDepartmentById = function (id) {

    return new Promise(function (resolve, reject) {
        Department.findAll({
            where: { departmentId: id }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(function (err) {
            reject("no results returned");
        });
});
};
module.exports.deleteEmployeeByNum = function (empNum) {
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where: { employeeNum: empNum }
        }).then(function () {
            resolve();
        })
        .catch(function (err) {
            reject("unable to delete employee");
        });
    });
}
module.exports.deleteDepartmentById = function(departmentId) {
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(() => {
            resolve(Department.destroy({
                where:{
                    departmentId: departmentId
                }}));
        }).catch((err) => {
            reject();
        });
    });
}