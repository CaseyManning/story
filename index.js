class Moment {
    constructor(name, person) {
        this.name = name;
        this.person = person;
        this.text = "";
        this.options = []
        this.next = null;
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
    trimText() {
        if(this.text.endsWith('\n')) {
            this.text = this.text.substring(0, this.text.length-1)
        }
    }

    showMoment() {
        console.log("showing moment " + this.name);
        currentMoment = this;

        if(window["On"+this.name]) {
            window["On"+this.name]();
        }

        clearOptions();

        if(this.options.length == 0) {
            document.getElementById("playerinfo").classList.add("invis");
        }
        document.getElementById("textbox").onclick = finishWriting;
            document.getElementById("textbox").classList.add("clickable");

        if(this.person != "inherit") {
            document.getElementById("personname").innerHTML = people[this.person].name;
            document.getElementById("personimg").src = people[this.person].image
        }

        writeText(document.getElementById("textbox"), this.text, () => {
            for(var i = 0; i < this.options.length; i++) {
                showDialogOption(this.options[i], i)
            }
            if(this.options.length > 0) {
                document.getElementById("playerinfo").classList.remove("invis");
                document.getElementById("textbox").classList.remove("clickable");
                document.getElementById("textbox").onclick = "";
            } else {
                document.getElementById("textbox").onclick = textboxclicked;
            }
        });
        
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

class Person {
    constructor(name, image) {
        this.name = name;
        this.image = image;
        people[name] = this;
    }
}
new Person("Mr. Dialogue", "dots1.png")
new Person("Mr. Alignment", "dots2.png")

function writeText(element, text, finished) {
    element = element.firstElementChild;
    element.innerHTML = "";
    finishedWriting = false;
    var writechar = () => {
        var delay = 15;
        if(text[0] === '\n') {
            element.innerHTML += "<br />";
            if(text[1] === '\n') {
                delay = 200;
            }
        } else {
            element.innerHTML += text[0];
        }
        text = text.substring(1);

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

var moments = {};

var startScene = "start"

function startGame() {
    loadStory("main.story   ", () => {
        moments[startScene].showMoment();
    });
}