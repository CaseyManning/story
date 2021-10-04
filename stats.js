var db;

function initFirestore() {

    firebase.initializeApp({
        apiKey: "AIzaSyBYmTkWj9SKKs8R35xaIg-1J1T36nzf9IQ",
        authDomain: "sand-wich-game.firebaseapp.com",
        projectId: "sand-wich-game"
      });
      
    
    db = firebase.firestore();
}

var breadNames = {
    "fluffyroll" : "fluffy roll",
    "italiansandwich" : "italian sandwich roll",
    "crackerroll" : "animal cracker roll",
    "dinnerroll" : "dinner roll",
    "bagel" : "bagel"
}

var usageData = {
    "total-start" : 0,
    "total-end" : 0,
    "total-about" : 0,
    "average-time" : 0
};

var sessions = {};

function readUsageData() {
    db.collection("usage").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            var data = doc.data();
            usageData["total-" + data.action] += 1;

            if(!sessions[data.id]) {
                sessions[data.id] = {id : data.id};
            }
            if(data.action == "start") {
                sessions[data.id].startTime = data.time;
            }
            if(data.action == "end") {
                sessions[data.id].endTime = data.time;
                sessions[data.id].breadType = data.breadRecieved;
            }
        });
        var breadCounts = {};
        var averageTime = 0;
        var validsessions = 0;
        console.log(averageTime)
        for(const s in sessions) {
            if(sessions[s].endTime) { //session finished
                console.log(averageTime)
                averageTime += sessions[s].endTime - sessions[s].startTime;
                validsessions += 1;

                if(!breadCounts[sessions[s].breadType]) {
                    breadCounts[sessions[s].breadType] = 0;
                }
                breadCounts[sessions[s].breadType] += 1;
            }
        }
        averageTime /= validsessions;

        var maxBread = "none";
        var maxCount = 0;
        for(const bread in breadCounts) {
            if(breadCounts[bread] > maxCount && bread != "undefined") {
                maxCount = breadCounts[bread];
                maxBread = bread;
            }
        }

        document.getElementById("playslabel").innerHTML = "Total Plays: " + usageData["total-start"] 
        document.getElementById("completionlabel").innerHTML = "Completion Rate: " + Math.round((usageData["total-end"] /usageData["total-start"])*100) + "%";
        document.getElementById("playtimelabel").innerHTML = "Average Playtime: " + Math.round(averageTime / 60) + "m" + Math.round(averageTime % 60) + "s";
        document.getElementById("sandwichlabel").innerHTML = "Most Common Sandwich: " + breadNames[maxBread];
        document.getElementById("aboutlabel").innerHTML = "About Page Visits: " + usageData["total-about"];
    });
    
}

initFirestore();
readUsageData();