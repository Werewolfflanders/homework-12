var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port
  port: 3306,

  user: "root",

  password: "yourRootPassword",
  database: "employeetrackerdb"
});

connection.connect(function(err) {
  if (err) throw err;
  runSearch();
});

function runSearch() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all employees",
        "View all employees by department",
        "View all employees by manager",
        "Add an employee",
        "Remove employee",
        "Update employee role",
        "Update employee manager",
        "View all roles"
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
      case "View all employees":
        employeeSearch();
        break;

      case "View all employees by department":
        departmentSearch();
        break;

      case "View all employees by manager":
        managerSearch();
        break;

      case "Add an employee":
        addEmployee();
        break;

      case "Remove employee":
        removeEmployee();
        break;
      
      case "Update employee role":
        updateEmployee()
        break;

      case "Update employee manager":
          updateEmployeeManager()
        break;
       
      case "View all roles":
          viewAllRoles()
          break;
      }
    });
}

function employeeSearch() {
  const query = `
  SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary
  FROM employee 
  INNER JOIN role ON employee.role_id = role.id
  INNER JOIN department ON role.department_id = department.id;
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table("ALL EMPLOYEES", res);
        runSearch();
      });
    
}

function departmentSearch() {
  const query = `
  SELECT name AS Departments 
  FROM department;
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table("ALL DEPARTMENTS", res);
    runSearch();
  });
}

function managerSearch() {
  inquirer
    .prompt([
      {
        name: "start",
        type: "input",
        message: "Enter starting position: ",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "end",
        type: "input",
        message: "Enter ending position: ",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      var query = "SELECT position,song,artist,year FROM top5000 WHERE position BETWEEN ? AND ?";
      connection.query(query, [answer.start, answer.end], function(err, res) {
        for (var i = 0; i < res.length; i++) {
          console.log(
            "Position: " +
              res[i].position +
              " || Song: " +
              res[i].song +
              " || Artist: " +
              res[i].artist +
              " || Year: " +
              res[i].year
          );
        }
        runSearch();
      });
    });
}

function addEmployee() {
  inquirer
    .prompt({
      name: "song",
      type: "input",
      message: "What song would you like to look for?"
    })
    .then(function(answer) {
      console.log(answer.song);
      connection.query("SELECT * FROM top5000 WHERE ?", { song: answer.song }, function(err, res) {
        console.log(
          "Position: " +
            res[0].position +
            " || Song: " +
            res[0].song +
            " || Artist: " +
            res[0].artist +
            " || Year: " +
            res[0].year
        );
        runSearch();
      });
    });
}

function removeEmployee() {
  inquirer
    .prompt({
      name: "artist",
      type: "input",
      message: "What artist would you like to search for?"
    })
    .then(function(answer) {
      var query = "SELECT top_albums.year, top_albums.album, top_albums.position, top5000.song, top5000.artist ";
      query += "FROM top_albums INNER JOIN top5000 ON (top_albums.artist = top5000.artist AND top_albums.year ";
      query += "= top5000.year) WHERE (top_albums.artist = ? AND top5000.artist = ?) ORDER BY top_albums.year, top_albums.position";

      connection.query(query, [answer.artist, answer.artist], function(err, res) {
        console.log(res.length + " matches found!");
        for (var i = 0; i < res.length; i++) {
          console.log(
            i+1 + ".) " +
              "Year: " +
              res[i].year +
              " Album Position: " +
              res[i].position +
              " || Artist: " +
              res[i].artist +
              " || Song: " +
              res[i].song +
              " || Album: " +
              res[i].album
          );
        }

        runSearch();
      });
    });
}
