const express = require('express');
const app = express();
const userModel = require(__dirname + '/userModel.js');

app.use(express.urlencoded({ extended: false }));

app.post("/register", function (req, res) {

    var newUsername = req.body.username;
    var newEmail = req.body.email;
    var newPassword = req.body.password;
    var newcfmPassword = req.body.cfmPassword;
    var newSchoolName = req.body.schoolName;
    var newgameMode = req.body.mode;
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
            gameMode: newgameMode,
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
            gameMode: newgameMode,
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
            var newCanAnser = false;
            var membersPresent = 0

            userModel.userDetails.count({
                teamName: newTeamName
            }, function (err, count) {
                if (err) {
                    return res.send("Server Timed Out");
                }
                if (count) {
                    membersPresent = count;
                    if (membersPresent > 0 && membersPresent < 2) {

                        userModel.userDetails.findOne({
                            teamName: newTeamName,
                            userPosition: "teamLeader"
                        }, function (err, doc) {
                            if (err) {
                                return res.send("Server Timed Out");
                            }
                            if (doc) {
                                if (doc.gameMode === "duo") {
                                    doc.canAddUpto = doc.canAddUpto - 1;
                                    //send to db......
                                    newMember.userPosition = newUserPosition;
                                    newMember.canAddUpto = 0;
                                    newMember.canAnswer = newCanAnswer;
                                    pingToMongooseDatabase();

                                } else {
                                    return res.send("The team you requested is of other game mode.");
                                }


                            }
                        });

                    } else {
                        return res.send("Team is full !");
                    }

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
            gameMode: newgameMode,
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
            var membersPresent = 0
            userModel.userDetails.count({
                teamName: newTeamName
            }, function (err, count) {
                if (err) {
                    return res.send("Server Timed Out");
                }
                if (count) {
                    membersPresent = count;
                    if (membersPresent > 0 && membersPresent < 4) {

                        userModel.userDetails.findOne({
                            teamName: newTeamName,
                            userPosition: "teamLeader"
                        }, function (err, doc) {
                            if (err) {
                                return res.send("Server Timed Out");
                            }
                            if (doc) {
                                if (doc.gameMode === "squad") {
                                    doc.canAddUpto = doc.canAddUpto - 1;
                                    //send to db......
                                    newMember.canAddUpto = newCanAddUpto;
                                    newMember.canAnswer = newCanAnswer;
                                    newMember.userPosition = newUserPosition;
                                    pingToMongooseDatabase();

                                } else {
                                    return res.send("The team you requested is of other game mode.");
                                }


                            }
                        });

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

{  //replacement for 272 to 310 in the server.
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
                    userModel.userDetails.findOneAndUpdate(
                        {
                            teamName: newTeamName,
                            userPosition: "teamLeader",
                            gameMode: newGamemode
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
}

{ //old 272 310 with canAddUpto bug..
    userModel.userDetails.countDocuments({
        teamName: newTeamName
    }, function (err, count) {
        if (err) {
            return res.send("Server Timed Out");
        }
        if (count) {
            membersPresent = count;
            if (membersPresent > 0 && membersPresent < 2) {

                userModel.userDetails.findOne({
                    teamName: newTeamName,
                    userPosition: "teamLeader",
                    gameMode: newGameMode
                }, function (err, doc) {
                    if (err) {
                        return res.send("Server Timed Out");
                    }
                    if (doc) {

                        doc.canAddUpto = doc.canAddUpto - 1;
                        //send to db......
                        newMember.userPosition = newUserPosition;
                        newMember.canAddUpto = 0;
                        newMember.canAnswer = newCanAnswer;
                        newMember.teamName = newTeamName;
                        pingToMongooseDatabase();

                    } else {
                        return res.status(404).send("Team Not found");
                    }
                });

            } else {
                return res.send("Team is full !");
            }

        }
    });
}