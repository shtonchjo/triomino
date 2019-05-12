// triomino global variables
let triominos = [];
let placedTriominos = [];
let nbTriominos = 0;
let activeTriomino;
let Tsize_player;
let Tsize_board //= TsizeInit;
let centerTriomino = [];
// board global variables
let remainingBarOnTop = true;
let remainingBarHeightRatio = .01;
let buttonHeightRatio = .05;
let playerFieldHeightRatio = .175;
let messageHeightRatio = .03
let boardHeight = 0;
// player global variables
let players = [];
let initPlayers = ["Trio", "Mino"]
let initialNbTriominos = (initPlayers.length == 2 ? 9 : 7);
let playerTsOnRow = 7; // manage display of player triominos on two rows
// interactions
let displayedSettings = false;
let typed = "";
let mousePressedPos = [];
let message = "Bienvenue à Triomino";
let passCounter = 0;
let cBtnPlayer;
let cBtnSettings;
// etoso
let config //= "DOMINO" // "default";
let colorizeValues = false;
// debug
let debug = false;
let ellipseSpot = [];
let log = "";
let offvalues = [];
// settings
let cBtn2players, cBtn3players, cBtn4players
let cBtnClassic, cBtnDomino
let cBtnColorize

function setup() {
  createCanvas(windowWidth, windowHeight);
  boardHeight = height * (1 - remainingBarHeightRatio - playerFieldHeightRatio);
  Tsize_board = min(width, boardHeight) / 10
  // create all triomino combinations
  for (var i = 0; i <= 5; i++) {
    for (var j = i; j <= 5; j++) {
      for (var k = j; k <= 5; k++) {
        t = new Triomino([i, j, k], [0, 0], 0);
        triominos.push(t)
      }
    }
  }
  nbTriominos = triominos.length;
  // initialize players
  createPlayers(initPlayers);
  // set first triomino 
  placedTriominos.push(triominos.splice(random(triominos.length), 1)[0]);
  placedTriominos[0].playedBy = "first";
  placedTriominos[0].pos = [0, 0];
  // button creation
  cBtnPlayer = new CanvasButton("⨹", "pick1st")
  cBtnSettings = new CanvasButton("☰", "settings")
  calculateTriominoSize()
  noLoop()
  // settings buttons creation
  cBtn2players = new CanvasButton("", initPlayers.length == 2)
  cBtn3players = new CanvasButton("", initPlayers.length == 3)
  cBtn4players = new CanvasButton("", initPlayers.length == 4)
  cBtnClassic = new CanvasButton("", ((config == "DEFAULT") || (config == "CLASSIC") || (config == undefined)))
  cBtnDomino = new CanvasButton("", (config == "DOMINO"))
  cBtnColorize = new CanvasButton("", colorizeValues)
}

function windowResized() {
  trace("windows resized", windowWidth, windowHeight)
  resizeCanvas(windowWidth, windowHeight);
  calculateTriominoSize();
}

function draw() {
  background(configs(config).boardColorSet.background);
  // bar indicating remaining 
  noStroke();
  fill(178)
  rect(0, 0, width, height * remainingBarHeightRatio)
  fill(configs(config).boardColorSet.remaining);
  rect(0, 1, triominos.length / nbTriominos * width, height * remainingBarHeightRatio - 3)
  // player territory
  players[0].showTerritory();
  players[0].showTriominos();
  // display neighbors of played triominos
  triangles = []
  for (let i = 0; i < placedTriominos.length; i++) {
    placedTriominos[i].setNeighborLocations();
    placedTriominos[i].showNeighborLocations();
  }
  // display already played triominos
  for (let i = 0; i < placedTriominos.length; i++) {
    placedTriominos[i].reset();
    if ((i == placedTriominos.length - 1) && (i > 0)) {
      placedTriominos[i].colorSet.borderColor = configs(config).TcolorSet.lastTileBorderColor;
    }
    placedTriominos[i].show();
  }
  // update buttons
  cBtnPlayer.show();
  cBtnSettings.show();
  // display the active triomino if it exists
  if (activeTriomino) {
    activeTriomino.coord.x = mouseX;
    activeTriomino.coord.y = mouseY;
    activeTriomino.show();
  } else {
    noLoop()
  }
  //display settings menu
  if (displayedSettings) {
    displaySettings();
  }
  textAlign(CENTER, CENTER);
  textSize((height * buttonHeightRatio) / 2)
  fill(0);
  stroke(127);
  strokeWeight(1);
  //noStroke();
  text(message, width / 2, height * (1 - playerFieldHeightRatio - messageHeightRatio - buttonHeightRatio / 2));
  //message ="";
  if (debug) {
    fill(255, 0, 0)
    noStroke()
    ellipse(ellipseSpot[0], ellipseSpot[1], 5)
    stroke(255, 0, 0)
    line(width / 2, 0, width / 2, height)
    let h = height * remainingBarHeightRatio + boardHeight / 2
    line(0, h, width, h)
    stroke(0, 255, 0)
    w = offvalues[0]
    line(w, 0, w, height)
    w = offvalues[1]
    line(w, 0, w, height)
    h = offvalues[2]
    line(0, h, width, h)
    h = offvalues[3]
    line(0, h, width, h)
  }
}

function calculateTriominoSize() {
  // calculate board height
  boardHeight = height * (1 - remainingBarHeightRatio - playerFieldHeightRatio);
  // center board triominos
  let edgeTs = edgeTriominos(); // [leftmost, rightmost, topmost, bottommost]
  let barycenterX = edgeTs[0] + (edgeTs[1] - edgeTs[0]) / 2;
  let barycenterY = edgeTs[2] + (edgeTs[3] - edgeTs[2]) / 2;
  ellipseSpot = [barycenterX, barycenterY]
  moveAllPlacedTriominos(boardCenter()[0] - barycenterX, boardCenter()[1] - barycenterY)
  // calculate board triomino size
  edgeTs = edgeTriominos(); // [leftmost, rightmost, topmost, bottommost]
  let margin = Tsize_board * 2.5
  let offLeft = margin;
  let offRight = width - margin;
  let offTop = height * remainingBarHeightRatio + margin;
  let offBottom = height * remainingBarHeightRatio + boardHeight - margin;
  offvalues = [offLeft, offRight, offTop, offBottom]; //for debug
  edgeTs = edgeTriominos(); // [leftmost, rightmost, topmost, bottommost]
  let factorX = 1
  if ((width - 2 * margin) < (edgeTs[1] - edgeTs[0])) {
    factorX = (width - 2 * margin) / (edgeTs[1] - edgeTs[0])
    trace("factorX: ", factorX)
    unzoom(min(1, factorX), boardCenter()[0], boardCenter()[1])
  }
  let factorY = 1
  if ((boardHeight - 2 * margin) < (edgeTs[3] - edgeTs[2])) {
    factorY = (boardHeight - 2 * margin) / (edgeTs[3] - edgeTs[2])
    trace("factorY: ", factorY)
    unzoom(min(1, factorY), boardCenter()[0], boardCenter()[1])
  }
  // reposition buttons
  let buttonDimensions = height * buttonHeightRatio;
  let buttonY = height * (1 - playerFieldHeightRatio - messageHeightRatio) - buttonDimensions;
  cBtnSettings.param(0, buttonY, height * buttonHeightRatio / 2)
  cBtnPlayer.param(width - buttonDimensions - 1, buttonY, height * buttonHeightRatio / 1.5)
  redraw();
}

function createPlayers(names = ["Trio", "Mino"]) {
  for (let i = 0; i < names.length; i++) {
    p = new Player(names[i], 0);
    p.pick(initialNbTriominos)
    players.push(p)
  }
}

function centreTriomino() { // find the triomino placed at pos=[0,0]
  for (let i = 0; i < placedTriominos.length; i++) {
    if ((placedTriominos[i].pos[0] == 0) && (placedTriominos[i].pos[1] == 0)) {
      return placedTriominos[i]
    }
  }
  return false
}

function boardCenter() {
  let boardCenterX = width / 2;
  let boardCenterY = height * remainingBarHeightRatio + boardHeight / 2;
  return [boardCenterX, boardCenterY];
}

function edgeTriominos() {
  if (placedTriominos.length == 0) { // If no placedTriomino, return false
    return false
  }
  //initialize with the first placed
  let leftmost = placedTriominos[0].coord.x;
  let rightmost = placedTriominos[0].coord.x;
  let topmost = placedTriominos[0].coord.y;
  let bottommost = placedTriominos[0].coord.y;
  for (let i = 0; i < placedTriominos.length; i++) {
    leftmost = min(leftmost, placedTriominos[i].coord.x)
    rightmost = max(rightmost, placedTriominos[i].coord.x)
    topmost = min(topmost, placedTriominos[i].coord.y)
    bottommost = max(bottommost, placedTriominos[i].coord.y)
  }
  return [leftmost, rightmost, topmost, bottommost]
}

function moveAllPlacedTriominos(dx = 0, dy = 0) { //TODO
  for (let i = 0; i < placedTriominos.length; i++) {
    placedTriominos[i].coord.x += dx;
    placedTriominos[i].coord.y += dy;
  }
  // redraw();
}

function unzoom(factor = 1, memx = -1, memy = -1) {
  trace("unzoom: ", factor, memx, memy)
  if ((factor == 0) || (factor == 0)) {
    return false
  }
  if (memx == -1) {
    memx = width / 2;
  }
  if (memy == -1) {
    memy = (boardHeight + height * remainingBarHeightRatio) / 2;
  }
  Tsize_board *= factor;
  for (let i = 0; i < placedTriominos.length; i++) {
    placedTriominos[i].Tsize *= factor;
    placedTriominos[i].coord.x = (placedTriominos[i].coord.x - memx) * factor + memx;
    placedTriominos[i].coord.y = (placedTriominos[i].coord.y - memy) * factor + memy;
  }
  redraw();
  return true
}

function checkHorizon(neighborAndLoc = []) { //check all triominos connecting to the tips - param is target triangle
  if (neighborAndLoc.length == 0) {
    return false
  }
  let neighbor = neighborAndLoc[0];
  let loc = neighborAndLoc[1];
  let posX = neighbor.pos[0] + loc;
  let posY = neighbor.pos[1] + (loc == 0 ? (neighbor.rot % 2 == 0 ? 1 : -1) : 0);
  let leftTips, rightTips, topBottomTips
  if (neighbor.rot % 2 == 0) { // corresponds to activeTriomino pointing down
    //
    // [-2,-1][-1,-1][ 0,-1][ 1,-1][ 2,-1]
    // [-2, 0][-1, 0] \ T / [ 1, 0][ 2, 0]
    //        [-1, 1][ 0, 1][ 1, 1]
    //
    //tip is [relative_position,left=0/topbottom=1/right=2]
    //
    // leftTips      = [ [[-2,-1],2],[[-1,-1],1],[[ 0,-1],0],
    //                   [[-2, 0],2],[[-1, 0],1]             ];
    // rightTips     = [ [[ 0,-1],2],[[ 1,-1],1],[[ 2,-1],0],
    //                               [[ 1, 0],1],[[ 2, 0],0] ];
    // topBottomTips = [ [[-1, 0],2],            [[ 1, 0],0],
    //                   [[-1, 1],2],[[ 0, 1],1],[[ 1, 1],0] ];
    leftTips = [
      [
        [-2, -1], 2
      ],
      [
        [-1, -1], 1
      ],
      [
        [0, -1], 0
      ],
      [
        [-2, 0], 2
      ],
      [
        [-1, 0], 1
      ]
    ];
    rightTips = [
      [
        [0, -1], 2
      ],
      [
        [1, -1], 1
      ],
      [
        [2, -1], 0
      ],
      [
        [1, 0], 1
      ],
      [
        [2, 0], 0
      ]
    ];
    topBottomTips = [
      [
        [-1, 0], 2
      ],
      [
        [1, 0], 0
      ],
      [
        [-1, 1], 2
      ],
      [
        [0, 1], 1
      ],
      [
        [1, 1], 0
      ]
    ];
  } else {
    //
    //        [-1,-1][ 0,-1][ 1,-1]
    // [-2, 0][-1, 0] / T \ [ 1, 0][ 2, 0]
    // [-2, 1][-1, 1][ 0, 1][ 1, 1][ 2, 1]
    //
    // topBottomTips = [ [[-1,-1],2],[[ 0,-1],1],[[ 1,-1],0],
    //                   [[-1, 0],2],            [[ 1, 0],0] ];
    // leftTips      = [ [[-2, 0],2],[[-1, 0],1],
    //                   [[-2, 1],2],[[-1, 1],1],[[ 0, 1],0] ];
    // rightTips     = [             [[ 1, 0],1],[[ 2, 0],0],
    //                   [[ 0, 1],2],[[ 1, 1],1],[[ 2, 1],0] ];
    topBottomTips = [
      [
        [-1, -1], 2
      ],
      [
        [0, -1], 1
      ],
      [
        [1, -1], 0
      ],
      [
        [-1, 0], 2
      ],
      [
        [1, 0], 0
      ]
    ];
    leftTips = [
      [
        [-2, 0], 2
      ],
      [
        [-1, 0], 1
      ],
      [
        [-2, 1], 2
      ],
      [
        [-1, 1], 1
      ],
      [
        [0, 1], 0
      ]
    ];
    rightTips = [
      [
        [1, 0], 1
      ],
      [
        [2, 0], 0
      ],
      [
        [0, 1], 2
      ],
      [
        [1, 1], 1
      ],
      [
        [2, 1], 0
      ]
    ];

  }
  allTips = [leftTips, topBottomTips, rightTips];
  activeTips = valuesByOrientation(activeTriomino);
  for (let t = 0; t < allTips.length; t++) {
    activeTip = activeTips[t];
    for (let i = 0; i < allTips[t].length; i++) {
      tip = [posX + allTips[t][i][0][0], posY + allTips[t][i][0][1]];
      T_atPos = triominoAtPosition(tip);
      if (T_atPos) {
        val_orient = valuesByOrientation(T_atPos)[allTips[t][i][1]];
        if (val_orient != activeTip) {
          return false
        }
      }
    }
  }
  return true
}

function checkBonuses(neighborAndLoc = []) {
  if (neighborAndLoc.length == 0) {
    return false
  }
  let neighbor = neighborAndLoc[0];
  let loc = neighborAndLoc[1];
  let posX = neighbor.pos[0] + loc;
  let posY = neighbor.pos[1] + (loc == 0 ? (neighbor.rot % 2 == 0 ? 1 : -1) : 0);
  let pos = [];
  let dir = (neighbor.rot % 2 == 0 ? 1 : -1); // 1 pointing up, -1 pointing down
  // Triomino pointing up
  //        [-1,-1] [ 0,-1] [1,-1]           [x,-1]
  // [-2,0] [-1, 0]   /T\   [1, 0] [2,0]     [x, 0]
  // [-2,1] [-1, 1] [ 0, 1] [1, 1] [2,1]     [x, 1]
  //
  // [-2,y] [-1, y]  [0, y]  [1, y] [2,y]

  // Check hexagons
  let hexes = [
    [
      [-1, 0],
      [-1, dir],
      [0, dir],
      [1, dir],
      [1, 0]
    ],
    [
      [-1, 0],
      [-2, 0],
      [-2, -dir],
      [-1, -dir],
      [0, -dir]
    ],
    [
      [1, 0],
      [2, 0],
      [2, -dir],
      [1, -dir],
      [0, -dir]
    ]
  ]
  let nbHexMade = 0;
  let hexMade;
  for (let h = 0; h < hexes.length; h++) {
    hexMade = true;
    for (i = 0; i < hexes[h].length; i++) {
      pos = [posX + hexes[h][i][0], posY + hexes[h][i][1]];
      hexMade = hexMade && (triominoAtPosition(pos) != false);
    }
    if (hexMade) {
      nbHexMade++
      //TODO draw hexagon
    }
  }
  if (nbHexMade) {
    console.log(nbHexMade + "x hexagon(s)! " + (40 + nbHexMade * 10) + " points")
    message = "\u2b21".repeat(nbHexMade) + " +" + (40 + nbHexMade * 10) + " points";
    return 40 + nbHexMade * 10
  }

  // Check bridge
  let bridgeBack = [
    [-1, 0],
    [0, -dir],
    [1, 0]
  ]; // left, topbottom, right
  let bridgeTips = [
    [
      [2, 0],
      [2, -dir],
      [1, -dir]
    ],
    [
      [-1, dir],
      [0, dir],
      [1, dir]
    ],
    [
      [-2, 0],
      [-2, -dir],
      [-1, -dir]
    ]
  ]
  let bridgeSides = [
    [
      [1, 0],
      [0, -dir]
    ],
    [
      [-1, 0],
      [1, 0]
    ],
    [
      [-1, 0],
      [0, -dir]
    ]
  ]
  for (let i = 0; i < bridgeBack.length; i++) {
    let back = triominoAtPosition([posX + bridgeBack[i][0], posY + bridgeBack[i][1]]) != false;
    let present0 = triominoAtPosition([posX + bridgeTips[i][0][0], posY + bridgeTips[i][0][1]]) != false;
    let present1 = triominoAtPosition([posX + bridgeTips[i][1][0], posY + bridgeTips[i][1][1]]) != false;
    let present2 = triominoAtPosition([posX + bridgeTips[i][2][0], posY + bridgeTips[i][2][1]]) != false;
    let empty0 = triominoAtPosition([posX + bridgeSides[i][0][0], posY + bridgeSides[i][0][1]]) != false;
    let empty1 = triominoAtPosition([posX + bridgeSides[i][1][0], posY + bridgeSides[i][1][1]]) != false;
    //console.log(back , present0 , present1, present2 , !empty0 , !empty1)
    if (back && (present0 || present1 || present2) && !empty0 && !empty1) {
      console.log("Bridge! +40 points")
      message = players[0].name + "\u{1F309} +40 points";
      // TODO display lines to show the bridge
      return 40
    }
  }
  return 0
}

function valuesByOrientation(T) {
  let val = T.nums
  let rot = T.rot; //it's got to be already checked that rotation is fine
  let leftVal = val[(2 - floor(rot / 2)) % 3]
  let topBottomVal = val[rot % 3]
  let rightVal = val[(2 - floor((rot + 3) % 6 / 2)) % 3]
  return [leftVal, topBottomVal, rightVal]
}

function triominoAtPosition(pos) { // returns the Triomino at a position, else false
  for (let i = 0; i < placedTriominos.length; i++) {
    if ((placedTriominos[i].pos[0] == pos[0]) && (placedTriominos[i].pos[1] == pos[1])) {
      return placedTriominos[i]
    }
  }
  return false
}

function cBtnPlayerPressed() {
  if (!(triominos.length > 0)) {
    cBtnPlayer.text = "⨻";
    cBtnPlayer.value = "pass"
  }
  if (cBtnPlayer.value == "pick1st") {
    passCounter = 0
    players[0].pick()
    players[0].score -= 5;
    cBtnPlayer.value = "pick2nd"
    if (!(triominos.length > 0)) {
      cBtnPlayer.text = "⨻";
      cBtnPlayer.value = "pass"
    }
    calculateTriominoSize()
    redraw()
    trace("1st pick")
    return "pick2nd"
  } else if (cBtnPlayer.value == "pick2nd") {
    passCounter = 0
    players[0].pick()
    players[0].score -= 5;
    cBtnPlayer.value = "pick3rd"
    if (!(triominos.length > 0)) {
      cBtnPlayer.text = "⨻";
      cBtnPlayer.value = "pass"
    }
    calculateTriominoSize()
    redraw()
    trace("2nd pick")
    return "pick3rd"
  } else if (cBtnPlayer.value == "pick3rd") {
    passCounter = 0
    players[0].pick()
    players[0].score -= 5;
    cBtnPlayer.text = "⨻";
    cBtnPlayer.value = "pass";
    calculateTriominoSize()
    redraw()
    trace("3rd pick")
    return "pass"
  } else if (cBtnPlayer.value == "pass") {
    passCounter++
    if (passCounter >= players.length) {
      victory()
    }
    players[0].score -= 10;
    nextPlayer()
    trace("pass")
    return "next"
  } else if (cBtnPlayer.value == "reload") {
    triominos = [];
    players = [];
    placedTriominos = [];
    activeTriomino = undefined;
    trace("all players passed -- reload")
    setup();
    trace("restart")
    return "reload"
  }
}

function reload() {
  triominos = [];
  players = [];
  placedTriominos = [];
  activeTriomino = undefined;
  trace("reload game")
  setup();
  draw();
}

function nextPlayer(turn = 1) {
  if (turn > 0) {
    for (let i = 0; i < turn; i++) {
      players.push(players.shift());
    }
  } else {
    for (let i = 0; i < -turn; i++) {
      players.unshift(players.pop());
    }
  }
  // reset the button
  if (triominos.length > 0) {
    cBtnPlayer.text = "⨹";
    cBtnPlayer.value = "pick1st";
    cBtnPlayer.show();
  } else {
    cBtnPlayer.text = "⨻";
    cBtnPlayer.value = "pass";
    cBtnPlayer.show();
  }
  // if next player is an AI, guess and try to play or next again
  if (players[0].isAI){
    AI_plays()
  } else {
    redraw();
  }
}

function keyPressed() {
  // Used codes
  // ADD,NEX
  if ((keyCode == ESCAPE) || (keyCode == RETURN) || ((keyCode == BACKSPACE) && typed.length <= 1)) {
    if (keyCode == RETURN) {
      switch (typed.toUpperCase().substr(0, 3)) { //only the first three letters count
        case "ADD": // add player "ADD Player name"
          let newName = typed.split(" ")[1];
          if (newName == "") {
            newName = "Player " + floor(random(10000));
          }
          createPlayers([newName]);
          break;
        case "BACK".substr(0, 3):
          nextPlayer(-1);
          players[0].playerTriominos.push(placedTriominos.pop());
          break;
        case "CLASSIC".substr(0, 3):
          config = typed;
          break;
        case "COLOR".substr(0, 3):
          colorizeValues = !colorizeValues;
          redraw();
          break;
        case "DEBUG".substr(0, 3):
          debug = !debug;
          trace("Debug mode is on")
          break;
        case "DOMINO".substr(0, 3):
          config = typed;
          break;
        case "NEXT".substr(0, 3):
          let turn = typed.split(" ")[1];
          if (turn == "") {
            turn = 1;
          }
          nextPlayer(turn);
          break;
        case "POP".substr(0, 3): // "POP 123" will place as activeTriomino the T [1,2,3]
          let nums = typed.split(" ")[1];
          trace("Pop triomino: " + nums)
          popTriomino(nums);
          break;
        case "REMOVE".substr(0, 3):
          if (activeTriomino) {
            triominos.push(activeTriomino);
            activeTriomino = undefined;
          }
          break;
        case "ROTATE".substr(0, 3):
          rotateBoard();
          break;
        default:
          break;
      }
    }
    typed = "";
    redraw();
  } else if (keyCode == BACKSPACE) {
    typed = typed.substr(0, typed.length - 1)
    redraw();
    scrollTyping();
  } else { // typing characters
    // if (activeTriomino){
    //   backToTerritory()
    // }
    typed += key;
    //redraw();
    scrollTyping();
  }
}

function popTriomino(values) { // make as activeTriomino the T with values in the string format e.g. "123"
  if (values) {
    backToTerritory()
    trace("Pop triomino: checking placed triominos")
    for (i = 0; i < placedTriominos.length; i++) {
      check1 = "" + placedTriominos[i].nums[0] + placedTriominos[i].nums[1] + placedTriominos[i].nums[2]
      check2 = "" + placedTriominos[i].nums[1] + placedTriominos[i].nums[2] + placedTriominos[i].nums[0]
      check3 = "" + placedTriominos[i].nums[2] + placedTriominos[i].nums[0] + placedTriominos[i].nums[1]
      if ((values == check1) || (values == check2) || (values == check3)) {
        activeTriomino = placedTriominos.splice(i, 1)[0];
        loop()
        trace("Pop triomino: " + activeTriomino.nums)
        return true
      }
    }
    trace("Pop triomino: checking player triominos")
    for (p = 0; p < players.length; p++) {
      for (i = 0; i < players[p].playerTriominos.length; i++) {
        check1 = "" + players[p].playerTriominos[i].nums[0] + players[p].playerTriominos[i].nums[1] + players[p].playerTriominos[i].nums[2]
        check2 = "" + players[p].playerTriominos[i].nums[1] + players[p].playerTriominos[i].nums[2] + players[p].playerTriominos[i].nums[0]
        check3 = "" + players[p].playerTriominos[i].nums[2] + players[p].playerTriominos[i].nums[0] + players[p].playerTriominos[i].nums[1]
        if ((values == check1) || (values == check2) || (values == check3)) {
          activeTriomino = players[p].playerTriominos.splice(i, 1)[0];
          loop()
          trace("Pop triomino: " + activeTriomino.nums)
          return true
        }
      }
    }
    // trace("Pop triomino: checking other triominos")
    for (i = 0; i < triominos.length; i++) {
      check1 = "" + triominos[i].nums[0] + triominos[i].nums[1] + triominos[i].nums[2]
      check2 = "" + triominos[i].nums[1] + triominos[i].nums[2] + triominos[i].nums[0]
      check3 = "" + triominos[i].nums[2] + triominos[i].nums[0] + triominos[i].nums[1]
      if ((values == check1) || (values == check2) || (values == check3)) {
        activeTriomino = triominos.splice(i, 1)[0];
        loop()
        trace("Pop triomino: " + activeTriomino.nums)
        return true
      }
    }
  }
  trace("No Triomino to pop")
  return false
}

function scrollTyping() {
  typingScrollY = 100
  noStroke()
  fill(255, 100)
  rect(width * .1, typingScrollY, width * .8, -Tsize_board)
  stroke(255);
  strokeWeight(3)
  rect(width * .1 + 10, typingScrollY - 10, width * .8 - 20, -(Tsize_board - 20))
  noStroke()
  fill(0)
  textAlign(LEFT, CENTER)
  textSize(Tsize_board * .5)
  text(" > " + typed, width * .1 + 5, typingScrollY - Tsize_board / 2 + 5)
}

function onMouseLeave() {
  noLoop();
}

function onMouseEnter() {
  if (activeTriomino) {
    loop();
  }
}

function backToTerritory() {
  if (activeTriomino) {
    activeTriomino.reset();
    activeTriomino.rot = 0;
    players[0].playerTriominos.push(activeTriomino);
    activeTriomino = undefined;
    draw();
    noLoop();
    return true
  } else {
    return false
  }
}

function rotateBoard() { //TODO
  let tmp
  for (let i = 0; i < placedTriominos.length; i++) {
    tmp = placedTriominos[i].coord.x;
    placedTriominos[i].coord.x = placedTriominos[i].coord.y;
    placedTriominos[i].coord.y = -tmp;
    tmp = placedTriominos[i].pos[0];
    placedTriominos[i].pos[0] = placedTriominos[i].pos[1];
    placedTriominos[i].pos[1] = -tmp;
    placedTriominos[i].rot += 1;
  }
  calculateTriominoSize()
}

function mouseClicked() {
  message = "";
  if (activeTriomino) { // position the active triomino
    // place back in player territory
    if (mouseY >= height * (1 - playerFieldHeightRatio)) {
      backToTerritory();
      return "back to player"
    }
    playerPlacesOnBoard() // place on the board
    // let neighbors = [];
    // for (let i = 0; i < placedTriominos.length; i++) {
    //   if (placedTriominos[i].clickOnTriomino()) {
    //     trace("cannot click on placed triomino")
    //     return "cannot click on placed triomino"
    //   }
    //   for (let loc = -1; loc <= 1; loc++) {
    //     if (placedTriominos[i].clickOnNeighbor(loc)) {
    //       neighbors[neighbors.length] = [placedTriominos[i], loc];
    //     }
    //   }
    // }
    // if (!neighbors) {
    //   trace("triomino must be placed near other")
    //   return "triomino must be placed near other"
    // }
    // if (!checkHorizon(neighbors[0]) && !debug) {
    //   return "neighbor values must be equal"
    // }

    // if (activeTriomino.place(neighbors[0])) { 
    //   let bonus = checkBonuses(neighbors[0])
    //   players[0].score += bonus;
    //   players[0].score += activeTriomino.score()
    //   activeTriomino.reset();
    //   activeTriomino.Tsize = Tsize_board;
    //   placedTriominos.push(activeTriomino);
    //   activeTriomino = undefined;
    //   if ((players[0].playerTriominos.length > 0) && (triominos.length > 0)) {
    //     calculateTriominoSize()
    //     noLoop();
    //     nextPlayer();
    //   } else if (!(players[0].playerTriominos.length > 0)) { // no triomino left ==> WIN! 
    //     players[0].score += 25; // 25 bonus for ending first
    //     for (let i = 1; i < players.length; i++) {
    //       for (let j = 0; j < players[i].playerTriominos.length; j++) {
    //         players[0].score += players[i].playerTriominos[j].score()
    //       }
    //     }
    //     victory();
    //   } else { // no triomino left
    //     victory();
    //   }
    //   trace(placedTriominos[placedTriominos.length - 1].nums, "placed on the board, changed player")
    //   return "placed on the board, changed player";
    // }
  } else { // check clicking on player triominos 
    for (let i = 0; i < players[0].playerTriominos.length; i++) { // select one of the player's triominos
      if (players[0].playerTriominos[i].clickOnTriomino()) {
        activeTriomino = players[0].playerTriominos.splice(i, 1)[0]
        let tmp = activeTriomino.colorSet.tileColor;
        tmp.setAlpha(200);
        activeTriomino.colorSet.tileColor = tmp;
        loop();
        trace(activeTriomino.nums, "in player's hand")
        return "in player's hand"
      }
    }
  }
}

function playerPlacesOnBoard(pos = "") {
  let neighbors = [];
  if (pos == "") {
    pos = [mouseX, mouseY]
  }
  for (let i = 0; i < placedTriominos.length; i++) {
    if (placedTriominos[i].clickOnTriomino()) {
      return false
    }
    for (let loc = -1; loc <= 1; loc++) {
      if (placedTriominos[i].clickOnNeighbor(loc, pos)) {
        neighbors[neighbors.length] = [placedTriominos[i], loc];
      }
    }
  }
  if (!neighbors) {
    return false
  }
  if (!checkHorizon(neighbors[0]) && !debug) {
    return false
  }

  if (activeTriomino.place(neighbors[0])) {
    let bonus = checkBonuses(neighbors[0])
    players[0].score += bonus;
    players[0].score += activeTriomino.score()
    activeTriomino.reset();
    activeTriomino.Tsize = Tsize_board;
    placedTriominos.push(activeTriomino);
    activeTriomino = undefined;
    if ((players[0].playerTriominos.length > 0) && (triominos.length > 0)) {
      calculateTriominoSize()
      noLoop();
      nextPlayer();
    } else if (!(players[0].playerTriominos.length > 0)) { // no triomino left ==> WIN! 
      players[0].score += 25; // 25 bonus for ending first
      for (let i = 1; i < players.length; i++) {
        for (let j = 0; j < players[i].playerTriominos.length; j++) {
          players[0].score += players[i].playerTriominos[j].score()
        }
      }
      victory();
    } else { // no triomino left
      victory();
    }
    trace(placedTriominos[placedTriominos.length - 1].nums, "placed on the board, changed player")
    return true;
  }
}

function victory() {
  let happies = ["\u{1f603}", "\u{1f604}", "\u{1f605}", "\u{1f606}", "\u{1f60a}", "\u{1f619}", "\u{1f60d}", "\u{1f638}", "\u{1f64c}", "\u{1f594}", "\u{1f44d}", "\u{1f44f}", "\u{1f31f}", "\u2728"]
  let happy = happies[floor(random(happies.length))]
  players.sort((a, b) => b.score - a.score)
  for (let i = 0; i < players.length; i++) {
    message = message + (i == 0 ? happy : "") + players[i].name + " : " + players[i].score + " ₧" + (i == 0 ? " ❗" : "") + "\n";
  }
  cBtnPlayer.value = "reload";
  cBtnPlayer.text = "⮌";
  cBtnPlayer.show();
}

function mousePressed() {
  if (cBtnPlayer.click()) {
    cBtnPlayer.show();
  }
  if (cBtnSettings.click()) {
    cBtnSettings.show();
    displayedSettings = !displayedSettings;
    redraw();
  }
  if (cBtn2players.click()) {
    cBtn2players.show();
    initPlayers = ["Trio", "Mino"]
    initialNbTriominos = (initPlayers.length == 2 ? 9 : 7);
    cBtn2players.value = true
    cBtn3players.value = false
    cBtn4players.value = false
    displayedSettings = false
    reload()
  }
  if (cBtn3players.click()) {
    cBtn3players.show();
    initPlayers = ["Trio", "Mino", "Alice"]
    initialNbTriominos = (initPlayers.length == 2 ? 9 : 7);
    cBtn2players.value = false
    cBtn3players.value = true
    cBtn4players.value = false
    displayedSettings = false
    reload()
  }
  if (cBtn4players.click()) {
    cBtn4players.show();
    initPlayers = ["Trio", "Mino", "Alice", "Bob"]
    initialNbTriominos = (initPlayers.length == 2 ? 9 : 7);
    cBtn2players.value = false
    cBtn3players.value = false
    cBtn4players.value = true
    displayedSettings = false
    reload()
  }
  if (cBtnClassic.click()) {
    cBtnClassic.show();
    config = "CLASSIC"
    cBtnClassic.value = true
    cBtnDomino.value = false
    displayedSettings = false
    redraw()
  }
  if (cBtnDomino.click()) {
    cBtnDomino.show();
    config = "DOMINO"
    cBtnDomino.value = true
    cBtnClassic.value = false
    displayedSettings = false
    redraw()
  }
  if (cBtnColorize.click()) {
    cBtnColorize.show();
    cBtnColorize.value = !cBtnColorize.value
    colorizeValues = !colorizeValues
    colorizeValues.value = !colorizeValues.value
    // if (colorizeValues) {
    //   config = "CLASSIC"
    // }
    displayedSettings = false
    redraw()
  }
}

function mouseReleased() {
  if (cBtnPlayer.click()) {
    displayedSettings = false;
    cBtnPlayerPressed();
  }
  cBtnPlayer.clicked = false;
  cBtnPlayer.show();
  cBtnSettings.clicked = false;
  cBtnSettings.show();
}

function settingsPressed() {
  displayedSettings = !displayedSettings;
  backToTerritory();
  redraw();
}

function displaySettings() {
  fill(255, 200)
  stroke(255)
  strokeWeight(4);
  let gold = (1 + sqrt(5)) / 2
  let s = height * buttonHeightRatio
  let h = height * (1 - playerFieldHeightRatio - buttonHeightRatio - messageHeightRatio) - 2 * s
  let w = width - 3 * s
  let dy = max(0, h - gold * w)
  let x1 = s
  let y1 = s + dy
  let y2 = h + s - dy
  let x2 = min(w + s, h / gold + s)
  rect(x1, y1, x2, y2, s / 2, s / 2, s / 2, 0);
  // TODO settings
  let x = x1 + (x2 - x1) / 12
  let y = y1 + (x2 - x1) / 12
  let b = (x2 - x1) / 8
  textAlign(LEFT, CENTER)
  noStroke()
  fill(0)
  textSize(b * .75)
  text("Deux joueurs", x + 1.5 * b, y + b / 2)
  cBtn2players.param(x, y, b, b, b);
  cBtn2players.show()
  textSize(b * .75)
  textAlign(LEFT, CENTER)
  text("Trois joueurs", x + 1.5 * b, y + b / 2 + b)
  cBtn3players.param(x, y + b, b, b, b);
  cBtn3players.show()
  textSize(b * .75)
  textAlign(LEFT, CENTER)
  text("Quatre joueurs", x + 1.5 * b, y + b / 2 + 2 * b)
  cBtn4players.param(x, y + 2 * b, b, b, b);
  cBtn4players.show()
  textSize(b * .75)
  textAlign(LEFT, CENTER)
  text("Style : Classic", x + 1.5 * b, y + b / 2 + 4 * b)
  cBtnClassic.param(x, y + 4 * b, b, b, b);
  cBtnClassic.show()
  textSize(b * .75)
  textAlign(LEFT, CENTER)
  text("Style : Domino", x + 1.5 * b, y + b / 2 + 5 * b)
  cBtnDomino.param(x, y + 5 * b, b, b, b);
  cBtnDomino.show()
  textSize(b * .75)
  textAlign(LEFT, CENTER)
  text("Couleurs", x + 1.5 * b, y + b / 2 + 7 * b)
  cBtnColorize.param(x, y + 7 * b, b, b, b);
  cBtnColorize.show()
}

function mouseWheel(event) {
  if (activeTriomino) {
    let d = (event.delta > 0 ? 1 : 5); // adding 5 to avoid negative rotation value
    activeTriomino.rot = (activeTriomino.rot + d) % 6;
  } else {
    let d = (event.delta > 0 ? .9 : 1.1);
    unzoom(d, mouseX, mouseY);
  }
  return false;
}

function doubleClicked() {
  if (activeTriomino) {
    activeTriomino.rot += 1;
  }
  return false;
}
class Triomino {
  constructor(nums = [0, 0, 0], coord = [0, 0], rot = 0) {
    this.nums = nums;
    this.coord = createVector(coord[0], coord[1]);
    this.pos = [];
    this.rot = rot; // 0..5, always >0
    this.colorSet = configs(config).TcolorSet;
    this.Tsize = Tsize_board;
    this.turnValues = true; //TODO : forbids text to rotate
    this.playedBy = "";
  }
  show() {
    push()
    translate(this.coord.x, this.coord.y);
    rotate(TWO_PI / 6 * this.rot);
    //triangle with round corner  
    fill(this.colorSet.tileColor);
    stroke(this.colorSet.borderColor);
    strokeWeight(this.Tsize / 30);
    beginShape();
    let rad = this.Tsize / 6; //round corner size 
    let dtheta = TWO_PI / 3 / rad;
    let theta0, theta1, x, y;
    theta0 = 7 * PI / 6;
    theta1 = theta0 + TWO_PI / 3;
    x = 0;
    y = -this.Tsize;
    for (let theta = theta0; theta <= theta1; theta += dtheta) {
      vertex(x + rad * cos(theta), y + rad * sin(theta)); // draw round corner
    }
    theta0 = 11 * PI / 6;
    theta1 = theta0 + TWO_PI / 3;
    x = this.Tsize * sin(TWO_PI / 3);
    y = -this.Tsize * cos(TWO_PI / 3);
    // y = -this.Tsize * sin(HALF_PI - TWO_PI / 3);
    for (let theta = theta0; theta <= theta1; theta += dtheta) {
      vertex(x + rad * cos(theta), y + rad * sin(theta));
    }
    theta0 = 3 * PI / 6;
    theta1 = theta0 + TWO_PI / 3;
    x = this.Tsize * sin(-TWO_PI / 3);
    y = -this.Tsize * cos(-TWO_PI / 3);
    for (let theta = theta0; theta <= theta1; theta += dtheta) {
      vertex(x + rad * cos(theta), y + rad * sin(theta));
    }
    endShape(CLOSE);
    // central dot
    fill(this.colorSet.dotColor);
    noStroke();
    ellipse(0, 0, rad);
    // values
    textAlign(CENTER, CENTER)
    textSize(this.Tsize * .7)
    noStroke();
    //strokeWeight(this.Tsize / 30)
    let color0 = this.colorSet.textColor;
    let color1 = this.colorSet.textColor;
    let color2 = this.colorSet.textColor;
    if (colorizeValues) { // if colorize then change each value color
      let conf = configs(config).TvalueSet;
      for (let i = 0; i < conf.length; i++) {
        if (conf[i] == this.nums[0]) {
          color0 = configs(config).TvalueColors[i];
        }
        if (conf[i] == this.nums[1]) {
          color1 = configs(config).TvalueColors[i]
        }
        if (conf[i] == this.nums[2]) {
          color2 = configs(config).TvalueColors[i]
        }
      }
    }
    let letters = configs(config).TvalueSet
    fill(color0);
    rotate(PI);
    text(letters[this.nums[0]], 0, this.Tsize * .6);
    fill(color1);
    rotate(TWO_PI / 3);
    text(letters[this.nums[1]], 0, this.Tsize * .6);
    fill(color2);
    rotate(TWO_PI / 3);
    text(letters[this.nums[2]], 0, this.Tsize * .6);
    pop()
  }
  showNeighborLocations() {
    let loc = [];
    stroke(configs(config).TcolorSet.neighborBorder);
    strokeWeight(1);
    fill(configs(config).TcolorSet.neighborFill);
    for (let i = -1; i <= 1; i++) {
      loc = this.neighbor(i)
      triangle(loc[0], loc[1], loc[2], loc[3], loc[4], loc[5])
    }
  }
  setNeighborLocations() {
    function alreadyTriominoHere(pos) {
      for (let t = 0; t < placedTriominos.length; t++) {
        if (pos[0] == placedTriominos[t].pos[0] && pos[1] == placedTriominos[t].pos[1]) {
          return true
        }
      }
      return false
    }

    function alreadyTriangleHere(pos) {
      for (let t = 0; t < triangles.length; t++) {
        if (pos[0] == triangles[t][0][0] && pos[1] == triangles[t][0][1]) {
          return true
        }
      }
      return false
    }
    for (let loc = -1; loc <= 1; loc++) {
      let p = (loc == 0 ? (this.rot % 2 == 0 ? 1 : -1) : 0)
      let tx = this.pos[0] + loc
      let ty = this.pos[1] + p
      let x = this.coord.x + (4 / 3 * this.Tsize) * cos(loc * TWO_PI / 3 - PI / 2);
      let y = this.coord.y + pow(-1, this.rot) * (4 / 3 * this.Tsize) * sin(loc * TWO_PI / 3 + PI / 2);
      if (!alreadyTriominoHere([tx, ty]) && !alreadyTriangleHere([tx, ty]))
        triangles.push([[tx, ty],[x,y]])
    }
  }
  neighbor(loc = -1) { //-1 left neighbor, 1 right neighbor, 0 top/bottom neighbor
    if ([-1, 0, 1].includes(loc)) {
      let x = this.coord.x + (4 / 3 * this.Tsize) * cos(loc * TWO_PI / 3 - PI / 2);
      let y = this.coord.y + pow(-1, this.rot) * (4 / 3 * this.Tsize) * sin(loc * TWO_PI / 3 + PI / 2);
      return this.vertices(x, y, this.rot + 1, this.Tsize * .9);
    } else {
      return false
    }
  }
  place(neighborAndLoc = []) {
    if (neighborAndLoc.length == 0) {
      return false
    }
    let neighbor = neighborAndLoc[0];
    let loc = neighborAndLoc[1];
    if (neighbor.rot % 2 == this.rot % 2) { // neighbors cannot have the same rotation
      return false
    }
    let col = neighbor.pos[0] + loc;
    let row = neighbor.pos[1] + ((loc == 0) ? (neighbor.rot % 2 == 0 ? 1 : -1) : 0)
    this.pos = [col, row]
    this.Tsize = Tsize_board;
    if (players[0]) {
      this.playedBy = players[0].name;
    }
    this.coord.x = neighbor.coord.x + (4 / 3 * this.Tsize) * cos(loc * TWO_PI / 3 - PI / 2);
    this.coord.y = neighbor.coord.y - pow(-1, this.rot) * (4 / 3 * this.Tsize) * sin(loc * TWO_PI / 3 + PI / 2);
    return true
  }
  reset() {
    this.colorSet = configs(config).TcolorSet;
  }
  clickOnTriomino() {
    let returning = this.inTriangle(mouseX, mouseY, this.vertices(this.coord.x, this.coord.y, this.rot, this.Tsize))
    if (returning) {
      displayedSettings = false;
    }
    return returning
  }
  clickOnNeighbor(loc = -1, xy = "") {
    if (xy == "") {
      xy = [mouseX, mouseY]
    }
    let neighborTriangle = this.neighbor(loc);
    if (neighborTriangle) {
      return this.inTriangle(xy[0], xy[1], neighborTriangle)
    }
    return false
  }
  inTriangle(x, y, l) { // is [x,y] in the triangle l=[x1,y1,x2,y2,x3,y3]
    let l1 = (x - l[0]) * (l[5] - l[1]) - (y - l[1]) * (l[4] - l[0]);
    let l2 = (x - l[2]) * (l[1] - l[3]) - (y - l[3]) * (l[0] - l[2]);
    let l3 = (x - l[4]) * (l[3] - l[5]) - (y - l[5]) * (l[2] - l[4]);
    return (l1 > 0 && l2 > 0 && l3 > 0) || (l1 < 0 && l2 < 0 && l3 < 0);
  }
  vertices(x = this.coord.x, y = this.coord.y, rot = this.rot, size = this.Tsize) {
    let vert = [];
    for (let theta = HALF_PI + rot * PI; theta < HALF_PI + TWO_PI + rot * PI; theta += TWO_PI / 3) {
      vert.push(x - 7 / 6 * size * cos(theta));
      vert.push(y - 7 / 6 * size * sin(theta));
    }
    return vert
  }
  score() {
    trace("score: ", this.nums[0], this.nums[1], this.nums[2])
    return this.nums[0] + this.nums[1] + this.nums[2];
  }
}
class Player {
  constructor(name, index) {
    this.index = (index ? index : players.length);
    this.playerTriominos = [];
    this.name = name;
    this.score = 0;
    this.isAI = false;
  }
  pick(nb = 1) {
    for (let i = 0; i < nb; i++) {
      if (triominos.length > 0) {
        this.playerTriominos.push(triominos.splice(random(triominos.length), 1)[0]);
      }
    }
  }
  showTerritory() {
    // show player field
    fill(configs(config).playerStyles[this.index].playerSide)
    rect(0, height, width, -height * (playerFieldHeightRatio + messageHeightRatio))
    // show name and score
    stroke(configs(config).playerStyles[this.index].nameBorderColor);
    strokeWeight(configs(config).playerStyles[this.index].nameBorderWeight)
    fill(configs(config).playerStyles[this.index].nameTextColor);
    textSize(height * messageHeightRatio);
    textAlign(LEFT, BASELINE)
    text(" " + this.name, 0, height * (1 - playerFieldHeightRatio - messageHeightRatio) + textSize()); // name
    textAlign(RIGHT, BASELINE)
    text(this.score + " ", width, height * (1 - playerFieldHeightRatio - messageHeightRatio) + textSize()); // score
  }
  showTriominos() {
    let rows, row1, row2, row3, y1, y2, y3, i
    let counter = 0

    for (rows = 1; rows < 3; rows++) {
      row1 = ceil(this.playerTriominos.length / rows);
      Tsize_player = height * playerFieldHeightRatio / 2.15 / rows;
      if ((row1 * Tsize_player * 2.15) / width < 1) {
        break;
      }
    }

    row1 = ceil(this.playerTriominos.length / rows);
    row2 = ceil((this.playerTriominos.length - row1) / (rows - 1));
    row3 = this.playerTriominos.length - row1 - row2;
    Tsize_player = min(displayHeight / 20, height * playerFieldHeightRatio / 2.15 / rows)
    y1 = height * (1 - playerFieldHeightRatio * .4 / rows)
    y2 = y1 - Tsize_player * 2.15
    y3 = y2 - Tsize_player * 2.15
    for (i = 0; i < row1; i++) {
      this.showTriomino(i, row1, y1, counter)
      counter++
    }
    for (i = 0; i < row2; i++) {
      this.showTriomino(i, row2, y2, counter)
      counter++
    }
    for (i = 0; i < row3; i++) {
      this.showTriomino(i, row3, y3, counter)
      counter++
    }
  }
  showTriomino(i, len, y, counter) {
    this.playerTriominos[counter].coord.x = width / 2 + Tsize_player * 2.15 * (i + .5 - len / 2);
    this.playerTriominos[counter].coord.y = y;
    this.playerTriominos[counter].Tsize = Tsize_player;
    this.playerTriominos[counter].show();
  }
}
class CanvasButton {
  constructor(text, value = false) {
    this.value = value;
    this.text = text;
    this.textSize = 10;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.clicked = false;
    this.colorSet = configs(config).boardColorSet;
    this.c1 = this.colorSet.buttonColor1;
    this.c2 = this.colorSet.buttonColor2;
    this.borderColor = this.colorSet.buttonBorder;
    this.axis = this.colorSet.buttonGradient;
    this.textColor = this.colorSet.buttonTextColor;
  }
  param(x, y, textSize = 0, w = 0, h = 0) {
    this.x = x;
    this.y = y;
    this.w = (w == 0 ? height * buttonHeightRatio : w);
    this.h = (h == 0 ? height * buttonHeightRatio : h);
    this.textSize = textSize;
  }
  show() {
    this.setGradient();
    stroke(this.borderColor);
    strokeWeight(1);
    line(this.x + 1, this.y, this.x + this.w - 1, this.y);
    line(this.x, this.y + 1, this.x, this.y + this.h - 1);
    line(this.x + 1, this.y + this.h, this.x + this.w - 1, this.y + this.h);
    line(this.x + this.w, this.y + 1, this.x + this.w, this.y + this.h - 1);
    noStroke();
    fill(this.textColor);
    textSize(this.textSize);
    textAlign(CENTER, CENTER);
    if (this.value === true) {
      this.text = "\u2713"
    }
    if (this.value === false) {
      this.text = ""
    }
    if (this.value === "AI") {
      this.text = "\u2699" //=cog ; "\{1f4bb}" = PC
    }
    text(this.text, this.x + this.w / 2, this.y + this.h / 2);
  }
  click() {
    let checkX = (mouseX >= this.x) && (mouseX <= this.x + this.w);
    let checkY = (mouseY >= this.y) && (mouseY <= this.y + this.h);
    if (checkX && checkY) {
      this.clicked = true;
      return true
    }
    return false
  }

  setGradient() {
    let col1 = (this.clicked ? this.c1 : this.c2);
    let col2 = (this.clicked ? this.c2 : this.c1);
    noFill();
    if (this.axis) {
      // Top to bottom gradient
      for (let i = this.y; i <= this.y + this.h; i++) {
        let inter = map(i, this.y, this.y + this.h, 0, 1);
        let c = lerpColor(col1, col2, inter);
        stroke(c);
        line(this.x, i, this.x + this.w, i);
      }
    } else {
      // Left to right gradient
      for (let i = this.x; i <= this.x + this.w; i++) {
        let inter = map(i, this.x, this.x + this.w, 0, 1);
        let c = lerpColor(col1, col2, inter);
        stroke(c);
        line(i, this.y, i, this.y + this.h);
      }
    }
  }
}

//TODO program AI
//TODO save on a Firebase, retrieve with a code, to play online - generate link in settings with parameter corresponding to the game played
//TODO zoom takes into account actual extension of triomino with extending triangles

function configs(configuration = "DEFAULT") {
  if (configuration == "DEFAULT") { // configuration must be in capital letters
    // vivid yellow #DCDCC8 
    return {
      TcolorSet: {
        borderColor: color('#000000'), //color(0, 0, 0),
        tileColor: color(220, 220, 200),
        dotColor: color(80, 80, 80),
        textColor: color(0, 0, 0),
        neighborBorder: color(250, 0, 150, 40),
        neighborFill: color(255, 255, 255, 40),
        lastTileBorderColor: color(250, 0, 150)
      },
      TvalueSet: [0, 1, 2, 3, 4, 5],
      TvalueColors: [
        color(0, 180, 180),
        color(255, 0, 0),
        color(0, 0, 255),
        color(0, 130, 0),
        color(100, 0, 150),
        color(255, 130, 0)
      ],
      boardColorSet: {
        background: color(200),
        remaining: color(250, 0, 150),
        buttonBorder: color(80),
        buttonColor1: color(200),
        buttonColor2: color(250),
        buttonGradient: true, // true = vertical, false = horizontal
        buttonTextColor: color(20)
      },
      playerStyles: [{
          nameTextColor: color("yellow"),
          nameBorderColor: color(100, 100, 0),
          nameBorderWeight: 2,
          playerSide: color(200, 200, 0)
        },
        {
          nameTextColor: color(255, 0, 255),
          nameBorderColor: color(100, 0, 100),
          nameBorderWeight: 2,
          playerSide: color(170, 0, 170)
        }, {
          nameTextColor: color("white"),
          nameBorderColor: color("black"),
          nameBorderWeight: 2,
          playerSide: color(220)
        }, {
          nameTextColor: color("white"),
          nameBorderColor: color("black"),
          nameBorderWeight: 2,
          playerSide: color(220)
        }
      ]
    }
  } else if (configuration == "DOMINO") {
    // blue  #5F8CDB 95 ,140,219
    // green #5F8CDB 114,143,40
    // light #D6DBC8 214,219,200
    // red   #A8230D 168,35 ,13
    // grey  #91817E 145,129,126 
    return {
      TcolorSet: {
        borderColor: color('#000000'),
        tileColor: color('#D6DBC8'),
        dotColor: color(80, 80, 80),
        textColor: color(0, 0, 0),
        neighborBorder: color("#A8230D40"),
        neighborFill: color(255, 255, 255, 40),
        lastTileBorderColor: color("#A8230D")
      },
      // with dice characters
      // ⚀⚁⚂⚃⚄⚅
      // TvalueSet: ["\u2680", "\u2681", "\u2682", "\u2683", "\u2684", "\u2685"], 
      // roman characters
      // TvalueSet: ["","I","II","III","IV","V"],
      // with braille : ⠂⠅⠇⠭⠾
      // TvalueSet : ["","\u2802","\u2805","\u2807","\u282D","\u283E","\u283F"],
      // Multiple dot ·︰⠇⁘⁙
      // TvalueSet : ["",".","\uFE30","\u2807","\u2058","\u2059"],
      // aegan 𐄇	𐄈	𐄉	𐄊	𐄋	𐄌	
      // TvalueSet : [\u{10107}","\u{10108}","\u{10109}","\u{1010A}","\u{1010B}","\u{1010C}"],
      // aegan tens 𐄐	𐄑	𐄒	𐄓	𐄔	
      // TvalueSet : ["","\u{10110}","\u{10111}","\u{10112}","\u{10113}","\u{10114}"],
      // aegan hundreds 𐄙	𐄚	𐄛	𐄜	𐄝
      // TvalueSet: ["", "\u{10119}", "\u{1011A}", "\u{1011B}", "\u{1011C}", "\u{1011D}"],
      // simple "",".",":",".:","::",":.:"
      TvalueSet: ["", ".", ":", ".:", "::", ":.:"],
      TvalueColors: [
        color(0, 180, 180),
        color(180, 0, 0),
        color(0, 0, 180),
        color(0, 180, 0),
        color(180, 0, 180),
        color(180, 100, 0)
      ],
      boardColorSet: {
        background: color("#5F8CDB"),
        remaining: color("#A8230D"),
        buttonBorder: color(80),
        buttonColor1: color(200),
        buttonColor2: color(250),
        buttonGradient: true, // true = vertical, false = horizontal
        buttonTextColor: color(20)
      },
      playerStyles: [{
          nameTextColor: color("white"),
          nameBorderColor: color("black"),
          nameBorderWeight: 2,
          playerSide: color("#91817E")
        },
        {
          nameTextColor: color("black"),
          nameBorderColor: color("white"),
          nameBorderWeight: 2,
          playerSide: color("#91817E")
        }, {
          nameTextColor: color("white"),
          nameBorderColor: color("black"),
          nameBorderWeight: 2,
          playerSide: color("#91817E")
        }, {
          nameTextColor: color("white"),
          nameBorderColor: color("black"),
          nameBorderWeight: 2,
          playerSide: color("#91817E")
        }
      ]
    }
  } else {
    return configs("DEFAULT")
  }
}

function trace(...arguments) {
  mess = arguments.join(" ")
  if (debug) {
    console.log(mess)
  }
  log += "\n" + mess
}

function AI_guess() {
  console.log("AI guessing")
  for (let i = players[0].playerTriominos.length-1;i>=0; i--) {
    activeTriomino = players[0].playerTriominos.splice(i, 1)[0]
    for (let rot = 0; rot <= 5; rot++) {
      activeTriomino.rot = rot
      for (let t = 0; t < triangles.length; t++) {
        let pos = triangles[t][1]
        activeTriomino.pos = triangles[t][0]
        activeTriomino.coord = createVector(triangles[t][1][0], triangles[t][1][1]);
        activeTriomino.Tsize = Tsize_board
        if (playerPlacesOnBoard(pos)){
          redraw()
          return true
        }
      }
      activeTriomino.rot =0
    }
    players[0].playerTriominos.splice(i, 0,activeTriomino)
  }
  activeTriomino= undefined
  return false
}

function AI_plays(){
  for (let drawn = 0 ; drawn < 3;drawn++){
    if (AI_guess()){
      trace(players[players.length-1].name + " has played as AI")
      return true
    }
    players[0].pick()
  } 
  nextPlayer()
  return false
}