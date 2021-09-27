function loadStory(filename, finished) {
    fetch(filename)
    .then(response => response.text())
    .then(data => {
        var currentMoment;
        for(var i = 0; i < data.split("\n").length; i++) {
            var line = data.split("\n")[i]
            if(!currentMoment) { //new moment, write name and person
                line = line.split(" | ")
                if(line[1]) {
                    currentMoment = new Moment(line[0], line[1])
                } else {
                    currentMoment = new Moment(line[0], "inherit")
                }
            } else if(line.startsWith(" > ")) { //dialog option
                line = line.substring(3).split(" | ");
                
                currentMoment.addOption({"text" : line[0], "destination" : line[1]})
            } else if(line.startsWith("---")) {
                currentMoment.trimText();
                moments[currentMoment.name] = currentMoment;
                currentMoment = null;
            } else if(line.startsWith(">|")) {
                currentMoment.setNext(line.substr(3));
            } else if(line.startsWith("+")) {
                if(line.startsWith("+Part:")) {
                    currentMoment.addPart(line.substr(6));
                } else if(line.startsWith("+set:")) {
                    currentMoment.setVariable({"name" : line.substring(5, line.indexOf('=')), "value" : line.substr(line.indexOf('=')+1)});
                } else {
                    currentMoment.addStatus(line.substr(1));
                }
            } else if(line.startsWith("-")) {
                currentMoment.addRemoveStatus(line.substr(1));
            } else {
                currentMoment.addText(line)
            }
        }
        if(currentMoment) {
            currentMoment.trimText();
            moments[currentMoment.name] = currentMoment;
        }
        finished();
    });
}

function loadStatuses(filename, finished) {
    fetch(filename)
    .then(response => response.text())
    .then(data => {
        var currentStatus;
        for(var i = 0; i < data.split("\n").length; i++) {
            var line = data.split("\n")[i]
            if(!currentStatus && line.startsWith("---")) {
                continue;
            } else if(!currentStatus) {
                currentStatus = new Status(line.trim())

            } else if(line.startsWith("---")) {
                currentStatus.trimText();
                statuses[currentStatus.name] = currentStatus;
                currentStatus = null;
            } else {
                currentStatus.addText(line)
            }
        }
        if(currentStatus) {
            currentStatus.trimText();
            statuses[currentStatus.name.trim()] = currentStatus;
        }
        finished();
    })
};