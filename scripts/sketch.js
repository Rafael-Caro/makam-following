var extraSpaceH = 45;
var extraSpaceW = 0;
var mainSpace = 600;
var margin = 10;
var easing;
var backColor;
var frontColor;

var recordingsInfo;
var recordingsList;
var pitchSpace;
var noteList = [];
var soundList = {};
var noteRadius1 = 20;
var noteRadius2 = 17;
var noteLine = 50;
var minHz;
var maxHz;
var pitchTrack;
var trackFile;
var track;
var trackDuration;
var title;
var artist;
var link;

var makam;
var usul;

var select;
var buttonPlay;

var cursorTop;
var cursorBottom;
var cursorY = 0;
var navBoxH = 50;
var navCursor;
var navBox;
var navCursorW = 4;
var clock;

var loaded = false;
var paused = true;
var currentTime = 0;
var jump;

var looped = false;
var loopBound0;
var loopBound1;
var loopTimeStart;
var loopTimeEnd;
var firstClick = false;
var secondClick = false;

var images = [];

function preload() {
  recordingsInfo = loadJSON("files/recordingsInfo.json");
}

function setup () {
  var canvas = createCanvas(extraSpaceW+mainSpace, extraSpaceH+mainSpace);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; margin: 10px auto; position: relative;");
  canvas.parent("sketch-holder");

  background(254, 249, 231);

  ellipseMode(RADIUS);
  angleMode(DEGREES);
  imageMode(CENTER);
  // textFont("Laila");
  strokeJoin(ROUND);
  strokeCap(ROUND);

  backColor = color(240, 128, 128);
  frontColor = color(120, 0, 0);

  recordingsList = recordingsInfo["recordingsList"];

  infoLink = select("#info-link");
  infoLink.position(width-60, extraSpaceH + margin*3.5 + 30);
  select = createSelect()
    .size(150, 25)
    .position(margin, margin)
    .changed(start)
    .parent("sketch-holder");
  select.option("Select a recording");
  var noRec = select.child();
  noRec[0].setAttribute("selected", "true");
  noRec[0].setAttribute("disabled", "true");
  noRec[0].setAttribute("hidden", "true");
  noRec[0].setAttribute("style", "display: none");
  for (var i = 0; i < recordingsList.length; i++) {
    select.option(recordingsInfo[recordingsList[i]].info.option, i);
  }
  buttonPlay = createButton("Load audio")
    .size(120, 25)
    .position(width - 120 - margin, margin)
    .mouseClicked(player)
    .attribute("disabled", "true")
    .parent("sketch-holder");


  navBox = new createNavigationBox();
  navCursor = new CreateNavCursor();

  cursorTop = extraSpaceH + margin*5 + 50;
  cursorBottom = navBox.y1-margin*3;

  buttonLoop = createButton('L: Off')
    .size(50,25)
    .position(width - 120 - margin*7,margin)
    .mouseClicked(loopControl)
    .attribute("disabled", "true")
    .parent("sketch-holder");

}

function draw () {
  fill(backColor);
  noStroke();
  rect(extraSpaceW, extraSpaceH, width, height);

  textAlign(CENTER, TOP);
  textStyle(NORMAL);
  textSize(30);
  strokeWeight(5);
  stroke(frontColor);
  fill(backColor);
  text(title, extraSpaceW + mainSpace/2, extraSpaceH + margin*3);

  stroke(0, 50);
  strokeWeight(1);
  line(extraSpaceW + margin*2, extraSpaceH + margin*3 + 30, width - margin*2, extraSpaceH + margin*3 + 30);

  textAlign(CENTER, TOP);
  stroke(0, 150);
  strokeWeight(1);
  textSize(20);
  fill(0, 150);
  text(artist, extraSpaceW + mainSpace/2, extraSpaceH + margin*4 + 30);


//Makam Usul Info Display
  var makam_usul_Text = join(['(Makam: ',makam,', Usül: ',usul,')'],'');

  if(select.selected() != "Select a recording"){
    // Makam-Usul Display
    textAlign(CENTER, BOTTOM);
    textStyle(NORMAL);
    textSize(18);
    strokeWeight(3);
    stroke(frontColor);
    fill(backColor);
    text(makam_usul_Text, extraSpaceW + mainSpace/2, height-navBoxH-margin*3/2);

    // Usul Information
    //dataDir = join(['files/',usul,'.jpg'],'');
    //img = loadImage(dataDir);
    //image(img,100,100);    
   }

  // stroke("red");
  // strokeWeight(1);
  // line(0, cursorTop, width, cursorTop);
  // stroke("green");
  // strokeWeight(1);
  // line(0, cursorBottom, width, cursorBottom);

  for (var i = 0; i < noteList.length; i++) {
    noteList[i].display();
  }

  navBox.displayBack();

  if (loaded) {
    navCursor.update();
    navCursor.display();
    clock.display();

    buttonLoop.removeAttribute("disabled");
  }

  // Loop Player
  if(loaded){
    if(!paused){
      currentTime = track.currentTime();
      
      if(looped && secondClick){
        if(loopTimeEnd-currentTime < 0.01){
          track.jump(loopTimeStart);
        }   
      }    
    }
  }

  if (loaded) {
    if (!paused) {
      currentTime = track.currentTime();
    }
    var x = str(currentTime.toFixed(2));
    var p = pitchTrack[x];
    if (p != "S" && p >= minHz && p <= maxHz) {
      p = float(p);
      var targetY = map(p, minHz, maxHz, cursorBottom, cursorTop);
      cursorY += (targetY - cursorY) * easing;
      noStroke();
      fill("red");
      stroke(frontColor);
      strokeWeight(1);
      ellipse(extraSpaceW+mainSpace/2, cursorY, 5, 5);
      textAlign(RIGHT, BOTTOM);
      textSize(12);
      textStyle(NORMAL);
      noStroke();
      fill(50);
      text(str(p.toFixed(2)) + ' cents', width-margin, navBox.y1 - margin);
    }
  }
  navBox.displayFront(); 
}

function createNavigationBox () {
  this.x1 = extraSpaceW + margin;
  this.x2 = width - margin;
  this.y1 = height - margin - navBoxH;
  this.y2 = height - margin;
  this.w = this.x2 - this.x1;

  this.displayBack = function () {
    fill(0, 50);
    noStroke();
    rect(this.x1, this.y1, this.w, navBoxH);
  }

  this.displayFront = function () {
    stroke(0, 150);
    strokeWeight(2);
    line(this.x1+1, this.y1, this.x2, this.y1);
    line(this.x2, this.y1, this.x2, this.y2);
    strokeWeight(1);
    line(this.x1, this.y1, this.x1, this.y2);
    line(this.x1, this.y2, this.x2, this.y2);
  }

  

  this.clicked = function () {

    // Click Validation
    var click = (mouseX > this.x1 && mouseX < this.x2 && mouseY > this.y1 && mouseY < this.y2);
    var dummy;
    if(!looped){
      // if the loop button is off jump normally
      if(click) {
        jump = map(mouseX, this.x1, this.x2, 0, trackDuration);
        if (paused) {
          currentTime = jump;
        } else {
          track.jump(jump);
          jump = undefined;
        }
      }
    } else {
      // if the loop button is on take time inputs
      if(firstClick && click){
        secondClick = true;
        loopBound1 = mouseX;
        if(loopBound0 > loopBound1){
          dummy = loopBound0;
          loopBound0 = loopBound1;
          loopBound1 = dummy;
          loopTimeStart = map(loopBound0, this.x1, this.x2, 0, trackDuration).toFixed(2);      
        }
        loopTimeEnd = map(loopBound1, this.x1, this.x2, 0, trackDuration).toFixed(2);
        firstClick = false;         
      }else if ((!firstClick) && click) {
        firstClick = true;
        loopBound0 = mouseX;
        loopTimeStart = map(loopBound0, this.x1, this.x2, 0, trackDuration).toFixed(2);
        secondClick = false;
      }
    }      
  }
}

function CreateNavCursor () {
  this.x = navBox.x1 + navCursorW/2;

  this.update = function () {
    this.x = map(currentTime, 0, trackDuration, navBox.x1+navCursorW/2, navBox.x2-navCursorW/2);
    if (navBox.x2 - navCursorW/2 - this.x < 0.005) {
      buttonPlay.html("Play!");
      track.stop();
      paused = true;
      currentTime = 0;
    }
  }

  this.display = function () {
    stroke(frontColor);
    strokeWeight(navCursorW);
    line(this.x, navBox.y1+navCursorW/2, this.x, navBox.y2-navCursorW/2);

    if(looped){
      stroke(0, 150);
      strokeWeight(navCursorW/1.5);
      line(loopBound0, navBox.y1+navCursorW/2, loopBound0, navBox.y2-navCursorW/2);

      stroke(0, 150);
      strokeWeight(navCursorW/1.5);
      line(loopBound1, navBox.y1+navCursorW/2, loopBound1, navBox.y2-navCursorW/2);
    }
  }
}

function CreateNote (note) {
  this.x1 = extraSpaceW + mainSpace/2;
  this.cent = note.cent;
  this.y = map(this.cent, minHz, maxHz, cursorBottom, cursorTop);
  this.name = note.perdeName;
  this.key = note.key;
  this.function = note.function;
  this.txtExtraX = 10;
  if (this.function == "tonic") {
    this.extraX = this.txtExtraX;
    this.lineW = 4;
    this.txtSize = 14;
    this.txtStyle = BOLD;
  } else if (this.function == "dominant") {
    this.extraX = 5;
    this.lineW = 2;
    this.txtSize = 12;
    this.txtStyle = BOLD;
  } else if (this.function == "samvadi") {
    this.extraX = 0;
    this.lineW = 2;
    this.txtSize = 12;
    this.txtStyle = NORMAL;
  } else {
    this.extraX = 0;
    this.lineW = 1;
    this.txtSize = 12;
    this.txtStyle = NORMAL;
  }

  this.lineX1 = this.x1 - noteLine/2 - this.extraX;
  this.lineX2 = this.x1 + noteLine/2 + this.extraX;
  this.txtX1 = this.x1 + noteLine/2 + this.txtExtraX + margin;
  this.txtX2 = this.x1 - noteLine/2 - this.txtExtraX - margin;

  this.display = function () {
    stroke(frontColor);
    strokeWeight(this.lineW);
    line(this.lineX1, this.y, this.lineX2, this.y)

    textAlign(LEFT, CENTER);
    noStroke();
    textSize(this.txtSize);//this.radius*0.9);
    textStyle(this.txtStyle);//this.txtStyle);
    fill(frontColor);
    if (this.name != '') {
      text(str(this.cent) + ' (' + this.name + ')', this.txtX1, this.y);
    } else {
      text(str(this.cent), this.txtX1, this.y);
    }
    textAlign(RIGHT, CENTER);
    textSize(this.txtSize*0.9);
    text(this.key, this.txtX2, this.y);
  }
}

function createSound (note) {
  this.pitch = note.pitch;
  this.key = note.key;
  this.osc = new p5.Oscillator();
  this.osc.setType("sawtooth");
  this.osc.freq(this.pitch);
  soundList[this.key] = this.osc;
}

function start () {
  if (loaded) {
    track.stop();
  }
  loaded = false;
  paused = true;
  currentTime = 0;
  var currentRecording = recordingsInfo[recordingsList[select.value()]];
  easing = currentRecording.info.easing;
  trackFile = currentRecording.info.trackFile;
  title = currentRecording.info.title;
  artist = currentRecording.info.artist;
  makam = currentRecording.info.makam
  usul = currentRecording.info.usul
  link = currentRecording.info.link;
  infoLink.attribute("href", link)
    .html("+info");
  trackDuration = currentRecording.info.duration;
  pitchSpace = currentRecording.melody.pitchSpace;
  minHz = pitchSpace[0].cent - 100;
  maxHz = pitchSpace[pitchSpace.length-1].cent + 100;
  noteList = [];
  soundList = {};
  for (var i = 0; i < pitchSpace.length; i++) {
    var note = new CreateNote(pitchSpace[i]);
    createSound(pitchSpace[i]);
    noteList.push(note);
  }
  pitchTrack = currentRecording.melody.pitchTrack;
  clock = new CreateClock;
  buttonPlay.html("Load audio");
  buttonPlay.removeAttribute("disabled");
}

function CreateClock () {
  this.clock;
  this.total = niceTime(trackDuration);
  this.now;
  this.display = function () {
    this.now = niceTime(currentTime);
    this.clock = this.now + " / " + this.total;
    textAlign(LEFT, BOTTOM);
    textSize(12);
    textStyle(NORMAL);
    noStroke();
    fill(50);
    text(this.clock, extraSpaceW + margin, navBox.y1 - margin);
  }
}

function player () {
  if (loaded) {
    if (paused) {
      paused = false;     
      if (jump == undefined) {
      track.play();
      } else {
        track.play();
        track.jump(jump);
        jump = undefined;
      }
      buttonPlay.html("Pause");
    } else {
      paused = true;
      currentTime = track.currentTime();
      track.pause();
      buttonPlay.html("Play");
    }
  } else {
    initLoading = millis();
    buttonPlay.html("Loading...");
    buttonPlay.attribute("disabled", "true");
    select.attribute("disabled", "true");
    track = loadSound("tracks/" + trackFile, soundLoaded, failedLoad);
  }
}

function soundLoaded () {
  buttonPlay.html("Play!");
  buttonPlay.removeAttribute("disabled");
  select.removeAttribute("disabled");
  loaded = true;
  var endLoading = millis();
  print("Track loaded in " + (endLoading-initLoading)/1000 + " seconds");
}

function failedLoad () {
  print("Loading failed");
}

function mouseClicked () {
  if (loaded) {
    navBox.clicked();
  }
}

function keyPressed () {
  var rewind = 5; 
  if(keyCode == LEFT_ARROW && loaded && (!paused) ){
    rewindd(rewind);
  }else if(keyCode == RIGHT_ARROW && loaded && (!paused)){
    proceed(rewind);
  }
  soundList[key.toLowerCase()].start();
}

function rewindd(r){
  // The name rewind() does not work somehow
  if(currentTime >= r){
    jump = currentTime - r;
  } else {
    jump = 0;
  }
  track.jump(jump);
}

function proceed(r){
  if(currentTime <= trackDuration-r){
    jump = currentTime + r;
  } else {
    jump = trackDuration;
  }
  track.jump(jump);
}

function loopControl(){
  looped = !looped;

  if(looped){
    buttonLoop.html('L: On');
  } else {
    buttonLoop.html('L: Off');
  }
}

function keyReleased () {
  soundList[key.toLowerCase()].stop();
}

// Play/ Pause with the spacebar
function keyTyped() {
  if (key === ' ' && loaded) {
    player();  
  }
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}