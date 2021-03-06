var moments = {};
var statuses = {};

var activeStatuses = [];

var startScene = "1"

function hideTitle() {
    document.getElementById("titlescreen").parentNode.removeChild(document.getElementById("titlescreen"))
}

function startGame() {
    loadStory("about.story", () => {
        moments[startScene].showMoment();
    });
}

class Status {
    constructor(name) {
        this.name = name;
        this.text = "";
    }
    addText(val) {
        this.text += val + '\n';
    }
    trimText() {
        if(this.text.endsWith('\n')) {
            this.text = this.text.substring(0, this.text.length-1)
        }
    }
    show() {
        activeStatuses.push(this.name);
        
        var base = document.getElementById("basestatus");
        base.classList.remove("hidden")
        var newstatus = base.cloneNode(true)
        newstatus.removeAttribute('id');
        newstatus.firstElementChild.innerHTML = this.name;

        var body = this.text;
        
        if(body.includes("[+1 Sanity]")) {
            body = body.replace("[+1 Sanity]", "<span class='highlightg'>[+1 Sanity]</span>")
            sanity.val += 1;
        }
        if(body.includes("[-1 Sanity]")) {
            body = body.replace("[-1 Sanity]", "<span class='highlightr'>[-1 Sanity]</span>")
            sanity.val -= 1;
        }
        newstatus.lastElementChild.innerHTML = body;

        base.parentElement.appendChild(newstatus)
        base.classList.add("hidden");
        setTimeout(() => {
            newstatus.remove();
        }, 9500);
    }
    remove() {
        activeStatuses.splice(activeStatuses.indexOf(this.name), 1);

        var base = document.getElementById("baseremovestatus");
        base.classList.remove("hidden")
        var newstatus = base.cloneNode(true)
        newstatus.removeAttribute('id');
        newstatus.firstElementChild.innerHTML = "removed status: " + this.name;

        base.parentElement.appendChild(newstatus)
        base.classList.add("hidden");
        setTimeout(() => {
            newstatus.remove();
        }, 9500);
    }
}

class Moment {
    constructor(name, person) {
        this.name = name;
        this.person = person;
        this.text = "";
        this.options = []
        this.next = null;
        this.statuses = [];
        this.parts = [];
        this.statusRemoves = [];
        this.variableSets = [];
    }
    addOption(val) {
        this.options.push(val)
    }
    addText(val) {
        this.text += val + '\n';
    }
    setNext(val) {
        this.next = val;
    }
    addStatus(val) {
        this.statuses.push(val);
    }
    addPart(val) {
        this.parts.push(val);
    }
    setVariable(val) {
        this.variableSets.push(val);
    }
    addRemoveStatus(val) {
        this.statusRemoves.push(val);
    }
    trimText() {
        if(this.text.endsWith('\n')) {
            this.text = this.text.substring(0, this.text.length-1)
        }
    }

    showMoment() {
        console.log("showing moment " + this.name);
        currentMoment = this;

        hunger.val -= 1;

        if(window["On"+this.name]) {
            window["On"+this.name]();
        }

        for(var i = 0; i < this.statuses.length; i++) {
            statuses[this.statuses[i]].show();
        }
        for(var i = 0; i < this.statusRemoves.length; i++) {
            if(activeStatuses.includes(this.statusRemoves[i]))
            statuses[this.statusRemoves[i]].remove();
        }

        for(var i = 0; i < this.variableSets.length; i++) {
            window[this.variableSets[i].name] = this.variableSets[i].value;
            console.log("setting variable " + this.variableSets[i].name + " to " + this.variableSets[i].value);
        }

        clearOptions();

        if(this.options.length == 0) {
            // document.getElementById("playerinfo").classList.add("invis");
        }
        document.getElementById("textbox").onclick = finishWriting;
        document.getElementById("textbox").classList.add("clickable");

        if(this.person == "self" || this.person == "inherit" && document.getElementById('textbox').classList.contains('thought')) {
            document.getElementById("personinfo").classList.add("invis");
            // document.getElementById("playerinfo").classList.add("invis");
            // document.getElementById("playerinfo").classList.remove("invis");
            document.getElementById('textbox').classList.add('thought')
            document.getElementById('speechmark').classList.add('hidden');
            for (let i = 0; i < document.getElementsByClassName('bubble').length; i++) {
                document.getElementsByClassName('bubble')[i].classList.remove("hidden");
                document.getElementsByClassName('bubble')[i].setAttribute('style', 'animation: popin 0.3s forwards; animation-delay: ' + i/4 + "s; transform: scale(0);")
            }
        } else {
            document.getElementById('textbox').classList.remove('thought')
            document.getElementById('speechmark').classList.remove('hidden');
            for (let i = 0; i < document.getElementsByClassName('bubble').length; i++) {
                document.getElementsByClassName('bubble')[i].classList.add("hidden");
            }
        }
        if(this.person != "inherit" && people[this.person]) {
            document.getElementById("personname").innerHTML = people[this.person].name;
            document.getElementById("personimg").src = people[this.person].image;
            document.getElementById("personinfo").classList.remove("invis");
            document.getElementById("playerinfo").classList.remove("invis");
        }
        

        writeText(document.getElementById("textbox"), this.text, () => {
            for(var i = 0; i < this.options.length; i++) {
                showDialogOption(this.options[i], i)
            }
            if(this.options.length > 0) {
                // document.getElementById("playerinfo").classList.remove("invis");
                document.getElementById("textbox").classList.remove("clickable");
                document.getElementById("textbox").onclick = "";
            } else {
                document.getElementById("textbox").onclick = textboxclicked;
            }
        });
        
    }
}

var maxSanity = 10;

sanity = {
    aInternal: 8,
    aListener: function(val) {},
    set val(val) {
      this.aInternal = val;
      this.aListener(val);
    },
    get val() {
      return this.aInternal;
    },
    registerListener: function(listener) {
      this.aListener = listener;
    }
}

var maxHunger = 50;

hunger = {
    aInternal: maxHunger,
    aListener: function(val) {},
    set val(val) {
      this.aInternal = val;
      this.aListener(val);
    },
    get val() {
      return this.aInternal;
    },
    registerListener: function(listener) {
      this.aListener = listener;
    }
}
hunger.registerListener(function(val) {
    updateSlider(val);
});

function updateSlider(val) {
    var bar = document.getElementById("sanitybar");
    bar.style.width = (val/maxHunger * 100) + "%";
    if(val == 1) {
        bar.style.backgroundColor = "#d43030";
    } else {
        bar.style.backgroundColor = "";
    }
}

function finishWriting() {
    finishedWriting = true;
}

var currentMoment;

var finishedWriting = false;

function textboxclicked() {
    moments[currentMoment.next].showMoment();
}

var people = {};

function Onend() {
    document.getElementById("titlescreen").style.display = "block";
    setTimeout(() => {
        document.getElementById("titleimg").style.opacity = 1;
    }, 5);
    setTimeout(() => {
        document.getElementById("titletext").style.opacity = 1;
    }, 1500);
}

class Person {
    constructor(name, image) {
        this.name = name;
        this.image = image;
        people[name] = this;
    }
}
new Person(" ", "icon1.png")
new Person("Sand Express", "dots2.png")
new Person("Signboard", "dots2.png")
new Person("Employee", "employeeicon.png")

function writeText(element, text, finished) {

    element = element.firstElementChild;
    console.log(currentMoment.text)
    // var newtext
    element.innerHTML = text;
    // setTimeout(() => {
        element.parentElement.setAttribute('style', 'height: ' + element.getBoundingClientRect().height + "px");
        element.innerHTML = "";
        finishedWriting = false;
        if(element.classList.contains("thought")) {
            element.style.animation = "popin 0.5s";
        } else {
            element.style.animation = "";
        }
        var writechar = () => {
            var delay = 12;
            if(text[0] === '\n') {
                if(text[1] === '\n') {
                    delay = 800;
                }
            }
            element.innerHTML += text[0];
            
            text = text.substring(1);
            if(finishedWriting) {
                console.log("adding the rest")
                element.innerHTML += text.replace('\n\n', '<br /><br />').replace('\n', '<br/>');
            }
            if(text.length == 0 || finishedWriting) {
                finishedWriting = true;
                finished();
            } else {
                setTimeout(() => {
                    writechar()
                }, delay);
            }
        }
        writechar();
    // }, 0);
}

function clearOptions() {
    for (let i = document.getElementsByClassName("dialogoption").length-1; i >= 0; i--) {
        const element = document.getElementsByClassName("dialogoption")[i];
        if(element.id != "baseoption") {
            element.remove();
        } 
    }
}

var selectedOption;

function showDialogOption(option, i) {
    var base = document.getElementById("baseoption");
    base.classList.remove("hidden")
    var newoption = base.cloneNode(true)
    if(!option.destination || !moments[option.destination]) {
        newoption.classList.add("unavailable");
    }
    newoption.removeAttribute('id');
    newoption.firstElementChild.innerHTML = option.text;
    newoption.setAttribute('style', 'animation-delay: ' + (i/4) + "s;");



    base.parentElement.appendChild(newoption)
    base.classList.add("hidden");


    newoption.onclick = function(e) {
        moments[option.destination].showMoment();
        if(e.target.classList.contains("dialogoption")) {
            selectedOption = e.target;
        } else {
            selectedOption = e.target.parentElement;
        }
    }
}

var breadNames = {
    "fluffyroll" : "a fluffy roll",
    "italiansandwich" : "an italian sandwich roll",
    "crackerroll" : "an animal cracker roll",
    "dinnerroll" : "a dinner roll"
}

function Onbreadreroll() {
    currentMoment.text = currentMoment.text.replace("[bread]", breadNames[breadtype]);
}