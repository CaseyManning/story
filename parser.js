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