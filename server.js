const express = require('express');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const url = require('url');
const app = express();
const mongoose = require('mongoose');
const rootDir = __dirname;
//const alert = require('alert');

mongoose.set('useFindAndModify', false);

const userModel = require(rootDir + '/userModel.js');
app.use(bodyParser.urlencoded({ extended: false }))

//connecting to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(rootDir + "/public"));

// ui routes
app.use(express.static("/config"));
app.get("/welcome", function (req, res) {
    res.sendFile(rootDir + "/views/index.html");
});
/*
app.get("/", function(req, res){
  res.sendFile(rootDir + "/views/index.html"); 
});
*/
app.get("/", function (req, res) {
    fs.readFile(rootDir + "/views/index.html", function (err, content) {
        if (err) {
            res.writeHead(500);
            res.end();
        } else {
            res.writeHead(200, { 'content-type': 'text/html' });
            res.end(content, 'utf-8');
        }
    })
})

app.get("/login", function (req, res) {
    res.sendFile(rootDir + "/views/login.html");
});
app.get("/register", function (req, res) {
    res.sendFile(rootDir + "/views/newLogin.html");
});
app.get("/done", function (req, res) {
    res.sendFile(rootDir + "/views/Registered.html");
});

//app.use("/", routes);          //////////////////

// for failsafe 
app.get("/deleteAllUsers", function (req, res) {
    userModel.userDetails.deleteMany({}, function (err) {
        if (err) {
            return (err);
        }
        return res.send("delete Many operation complete!");
    });
})
app.get("/delete/:objId", function (req, res) {
    var oId = req.params.objId;
    userModel.userDetails.findByIdAndRemove(oId, function (err) {
        if (err) {
            return res.send("User does not exist!");
        }
        return res.send("User Removed successfully!");
    });
});

/*
//test user
var testUser = new userModel.userDetails({
    username : "testUser",
    email : "testUser@test",
    password : "test",
    schoolName : "testSchool"
});
testUser.save(function (err){
    if (err){
        return (err);
    }
    return console.log("Test Data Saved!");
});
*/

app.get("/viewUserDetails", function (req, res) {
    mongoose.model('userDetails').find(function (err, data) {
        if (err) {
            return err;
        }
        return res.send(data);
    });
});

//configuration
const port = 8080;
app.listen(port, function () {
    console.log("This app listens on port " + port);
});

/* post register and login old >>>
//registeration routes
app.post("/register", function (req, res) {
    
    
    
    var newUsername = req.body.username;
    var newEmail = req.body.email;
    var newPassword = req.body.password;
    var newcfmPassword = req.body.cfmPassword;
    var newSchoolName = req.body.schoolName;
    
    var newMember = new userModel.userDetails({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        schoolName: newSchoolName
    });
    if (newPassword.localeCompare(newcfmPassword) === 0) {

        userModel.userDetails.findOne({ email: newEmail }, function (err, doc) {
            if (err) {
                return res.send("Server timed out!");
            }
            if (doc){
                return res.send("User with same email already exists!");
            }
            newMember.save(function (err){
                if (err) {
                    //res.redirect("/register");
                    return console.log(err);
                }
                return res.redirect("/done");
            })
              
        });
    } else {
        //alert("Ensure that passwords in both the fields are the same");
        return res.send("Password mismatch!");
    }
});


app.post("/login", function (req, res) {

    var loginUsername = req.body.username;
    var loginPassword = req.body.password;

    userModel.userDetails.findOne({
        username: loginUsername,
        password: loginPassword
    }, function (err, doc) {
        if (err) {
            //return res.redirect("/login");
            return res.send("Server Timed Out!");
        }
        if (doc) {
            return res.send("Welcome " + doc.email);
        }
        res.send("Incorrect Username/Password!");
        //return res.redirect("/login");
    });
});
       post login and register old <<<<<< */

exports.app = app;



app.post("/register", function (req, res) {

    var newUsername = req.body.username;
    var newEmail = req.body.email;
    var newPassword = req.body.password;
    var newcfmPassword = req.body.cfmPassword;
    var newSchoolName = req.body.schoolName;
    var newGameMode = req.body.mode;
    var newTeamName = req.body.teamName;
    var newUserPosition = req.body.team;
    /*
        var newMember = new userModel.userDetails({
            username : newUsername,
            email : newEmail,
            password : newPassword,
            schoolName : newSchoolName,
            gameMode : newgameMode,
            teamName : newTeamName
        });
    */
    if (newGameMode === "solo") {

        var newMember = new userModel.userDetails({
            username: newUsername,
            email: newEmail,
            password: newPassword,
            schoolName: newSchoolName,
            gameMode: newGameMode,
            teamName: null,
            existingTeamName: null,
            userPosition: newUserPosition,
            canAddUpto: 0,
            messageT: null,
            messageR: null,
            canAnswer: true,
        });
        // send to db.....
        pingToMongooseDatabase();

    }
    if (newGameMode === "duo") {
        //general schema model
        var newMember = new userModel.userDetails({
            username: newUsername,
            email: newEmail,
            password: newPassword,
            schoolName: newSchoolName,
            gameMode: newGameMode,
            teamName: null, //
            existingTeamName: null,
            userPosition: null,
            canAddUpto: 0,  //
            messageT: null,
            messageR: null,
            canAnswer: false //
        });

        if (newUserPosition === "teamLeader") {

            var newCanAddUpto = 1;
            var newCanAnswer = true;

            userModel.userDetails.findOne({
                teamName: newTeamName
            }, function (err, doc) {
                if (err) {
                    return res.send("Server Timed Out");
                }
                if (doc) {
                    return res.status(404).send("Team name already taken.");
                }
                else {
                    newMember.teamName = newTeamName;
                    newMember.canAddUpto = newCanAddUpto;
                    newMember.canAnswer = newCanAnswer;
                    newMember.userPosition = newUserPosition;
                    //send to db.....
                    pingToMongooseDatabase();
                }

            });


        } else if (newUserPosition === "teamMember") {
            var newCanAddUpto = 0;
            var newCanAnswer = false;
            var membersPresent = 0
            userModel.userDetails.findOne({
                teamName: newTeamName
            }, function (err, doc) {
                if (err) {
                    return res.status(400).send("Bad Request");
                }
                if (doc) {
                    // test for 272 310 in server
                    userModel.userDetails.findOne(
                        {
                            teamName: newTeamName,
                            userPosition: "teamLeader",
                            gameMode: newGameMode
                        },
                        function (err, doc) {
                            if (err) {
                                return res.status(404).send("Bad request");
                            }
                            if (doc) {
                                if (doc.canAddUpto > 0) {
                                    var updateCanAddUpto = doc.canAddUpto;
                                    updateCanAddUpto = updateCanAddUpto - 1;
                                    userModel.userDetails.findOneAndUpdate(
                                        {
                                            teamName: newTeamName,
                                            userPosition: "teamLeader",
                                            gameMode: newGameMode
                                        },
                                        {
                                            canAddUpto: updateCanAddUpto
                                        },
                                        function (err, againDoc) {
                                            if (err) {
                                                return res.status(400).send("Bad request.");
                                            }
                                            if (againDoc) {
                                                newMember.userPosition = newUserPosition;
                                                newMember.canAddUpto = 0;
                                                newMember.canAnswer = newCanAnswer;
                                                newMember.teamName = newTeamName;
                                                pingToMongooseDatabase();
                                            } else {
                                                return res.status(400).send("Team Not Found");
                                            }
                                        }
                                    );
                                } else {
                                    return res.status(400).send("Team is full!");
                                }
                            } else {
                                return res.status(400).send("team not found.")
                            }
                        }
                    );
                    // test code ends here
                } else {
                    return res.status(404).send("Please enter a valid team name.");
                    ///
                }

            });

        }

    }

    if (newGameMode === "squad") {

        var newMember = new userModel.userDetails({
            username: newUsername,
            email: newEmail,
            password: newPassword,
            schoolName: newSchoolName,
            gameMode: newGameMode,
            teamName: null, //
            existingTeamName: null,
            userPosition: null,
            canAddUpto: 0,  //
            messageT: null,
            messageR: null,
            canAnswer: false //
        });

        if (newUserPosition === "teamLeader") {

            var newCanAddUpto = 3;
            var newCanAnswer = true;
            userModel.userDetails.findOne({
                teamName: newTeamName
            }, function (err, doc) {
                if (err) {
                    return res.send("Server Timed Out");
                }
                if (doc) {
                    return res.send("Team name already taken.");
                }
                newMember.teamName = newTeamName;
            });
            newMember.canAddUpto = newCanAddUpto;
            newMember.canAnswer = newCanAnswer;
            newMember.userPosition = newUserPosition;
            //send to db.....
            pingToMongooseDatabase();

        } else if (newUserPosition === "teamMember") {
            var newCanAddUpto = 0;
            var newCanAnswer = false;
            userModel.userDetails.findOne(
                {
                    teamName: newTeamName,
                    userPosition: "teamLeader",
                    gameMode: newGameMode
                },
                function (err, doc) {
                    if (err) {
                        return res.status(404).send("Bad request");
                    }
                    if (doc) {
                        if (doc.canAddUpto > 0) {
                            var updateCanAddUpto = doc.canAddUpto;
                            updateCanAddUpto = updateCanAddUpto - 1;
                            userModel.userDetails.findOneAndUpdate(
                                {
                                    teamName: newTeamName,
                                    userPosition: "teamLeader",
                                    gameMode: newGameMode
                                },
                                {
                                    canAddUpto: updateCanAddUpto
                                },
                                function (err, againDoc) {
                                    if (err) {
                                        return res.status(400).send("Bad request.");
                                    }
                                    if (againDoc) {
                                        newMember.userPosition = newUserPosition;
                                        newMember.canAddUpto = 0;
                                        newMember.canAnswer = newCanAnswer;
                                        newMember.teamName = newTeamName;
                                        pingToMongooseDatabase();
                                    } else {
                                        return res.status(400).send("Team Not Found");
                                    }
                                }
                            );

                        } else {
                            return res.send("Team is full !");
                        }

                    }
                });
        }

    }

    function pingToMongooseDatabase() {

        if (newPassword.localeCompare(newcfmPassword) === 0) {

            userModel.userDetails.findOne({ email: newEmail }, function (err, doc) {
                if (err) {
                    return res.send("Server timed out!");
                }
                if (doc) {
                    return res.send("User with same email already exists!");
                }
                //below should be within username existance check!//
                newMember.save(function (err) {
                    if (err) {
                        //res.redirect("/register");
                        return console.log(err);
                    }
                    return res.redirect("/done");
                })

            });
        } else {
            //alert("Ensure that passwords in both the fields are the same");
            return res.send("Password mismatch!");
        }

    }

});

app.post("/login", function (req, res) {

    var loginUsername = req.body.username;
    var loginPassword = req.body.password;

    userModel.userDetails.findOne({
        username: loginUsername,
        password: loginPassword
    }, function (err, doc) {
        if (err) {
            alert("Incorrect Username/Password!");
            return res.redirect("/login");
        }
        if (doc) {
            return res.send("Welcome " + doc.email);
        }
        alert("Incorrect Username/Password!");
        return res.redirect("/login");
    });
});




//////////////////////////////////////////////////

//mongoose connection 

//mongodb connection 
/*
function connectDB(uri) {
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(function (err) {
        if (err) {
            console.log("Connection to the server has timed out");
        }
        const collection = client.db(dbProperties.database).collection(dbProperties.collection);
        console.log("Connected to the database Successfully.");
        client.close();
    });
}

connectDB(uri);
*/

/////////////////////////////////////////////////

/*http.createServer(function (req, res){
    var urlProperties = url.parse(req.url, true);
    var filename = "." + urlProperties.pathname;
    fs.readFile(filename, function(err, data){
        if (err){
            res.writeHead(404, {'content-type' : 'text/html'});
            return res.end("404 - File not found");
        }
        res.writeHead(200, {'content-type' : 'text/html'});
        res.write(data);
        return res.end();
    });
}).listen(8080);
*/