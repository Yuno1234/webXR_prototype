/*
TO BEGIN:

1. download the web xr emulator plugin for firefox/chrome:
   * https://addons.mozilla.org/en-US/firefox/addon/webxr-api-emulator/
   * https://chrome.google.com/webstore/detail/webxr-api-emulator/
     mjddjgeghkdijejnciaefnkjmkafnnje

2. run an https web server using servez: https://greggman.github.io/servez/

3. preview your html scene; open the a-frame inspector using: ctrl + alt + i

note that a-frame uses an e.c.s (entity-component system) architecture,
providing a declarative, composable, reusable entity-component structure --
anything that's related to vanilla js (and other js libraries), dom-scripting,
or three.js can be mixed into your a-frame code

more on a-frame's e.c.s architecture:
https://aframe.io/docs/#.#.#/introduction/entity-component-system.html
(replace #'s with ver number)
*/



// 1. A FEW A-FRAME SNIPPETS/CONCEPTS TO BEGIN
// for more on a-frame, refer to: https://aframe.io/docs/#.#.#/introduction/

// use george's 'george' attribute to register a component
AFRAME.registerComponent('george', {
  init: function() {
    // init is called once at the beginning of the component's lifecycle
    console.log('a drifting cube named george is born');
  },
  update: function() {
    // do something when component's data is updated
  },
  remove: function() {
    // do something the component or its entity is removed
  },
  tick: function(time, timeDelta) {
    // the tick functions runs ~90 per second
  }
});

// use the drifter attribute to move any entity that has it (just george here)
AFRAME.registerComponent('drifter', {
  schema: {
    // assign george's drifter attributes to the schema
    speed: {type: 'number'},
    message: {type: 'string'},
    direction: {type: 'string', default: 'up'}
  },

  init: function() {
    // log the schema data
    console.log(this.data);
    console.log(this.data.message);
  },

  tick: function(time, timeDelta) {
    let el = this.el;
    let position = el.getAttribute('position');
    // move entity up each frame
    if (this.data.direction === 'up') {
      position.y += this.data.speed;
    }
    // change entity color to red when reaches an elevation of 2
    if (position.y > 2) {
      el.setAttribute('color', '#F00');
    }
    // remove entity when it reaches an elevation of 3
    if (position.y > 3) {
      el.remove();
    }
  },

  update: function() {
    // this is triggered when the entity color changes to red
    console.log('the drifter just turned red');
  },

  remove: function() {
    // this is triggered when the entity is removed
    console.log('the drifter has disappeared');
  },
});







// 2. CREATE A PROCEDURALLY-GENERATED DUNGEON MAP
// inspired by ahmad abdolsaheb's dungeon generator algorithm:
// https://www.freecodecamp.org/news/author/ahmad/
// for more on the drunkard walk algorithm and more, check out:
// http://pcg.wikidot.com/category-pcg-algorithms

function randInt(max) {
  // utility function for picking random integers (note: rounds down)
  return Math.floor(Math.random() * max);
}

let map = [],                   // 2-dimensional array comprising 1's and 0's
    maxtunnels = 10,            // max turns while drunkenly wandering the map
    maxlength = 10,             // max length of any given tunnel
    cols = 20,                  // width of the map
    rows = 15,                  // height of the map
    currentcol = randInt(cols), // random starting column position
    currentrow = randInt(rows); // random starting row position

let directions = [[-1, 0], [1, 0], [0, -1], [0, 1]], // west, east, north, south
    lastdir = [], // save the last direction the drunk went
    randdir; // holds a random value from the directions array (assigned soon)

// generate an empty map (all 1's for solid walls)
for (let i = 0; i < rows; i++) {
  map.push([]);
  for (let j = 0; j < cols; j++) {
    map[i].push(1);
  }
}

// drunkard walk algorithm
while (maxtunnels && maxlength) {
  // request a random direction, until it's a perpendicular to the lastdir
  // if the lastdir equals left/right the newdir must be up/down, and vice versa
  do {
    randdir = directions[randInt(directions.length)];
  } while ( randdir[0] === -lastdir[0] && randdir[1] === -lastdir[1] ||
            randdir[0] ===  lastdir[0] && randdir[1] ===  lastdir[1] );
            // note that && precedes || in js, so no parens required

  let randomlen = randInt(maxlength + 1), // length of the next tunnel
      tunnellen = 0; // current length of tunnel (must reach randomlen)

  // loop until the tunnel is long enough or the drunkard hits an edge
  while (tunnellen < randomlen) {
    // break the loop if it's reaching beyond the boundaries of the map
    if ( currentrow === 0 && randdir[0] === -1     ||
         currentcol === 0 && randdir[1] === -1     ||
         currentrow === rows-1 && randdir[0] === 1 ||
         currentcol === cols-1 && randdir[1] === 1 ){
      break;
    }
    else {
      map[currentrow][currentcol] = 0; // index was a block, now it's a tunnel
      // step to new location and update row/col index
      currentrow += randdir[0]; 
      currentcol += randdir[1];

      tunnellen++; // tunnel length is one longer, so increment that variable
    }
  }

  // update the variables if there's still tunnel to lay
  if (tunnellen) {
    lastdir = randdir; // to recall the last drunken step for the next iteration
    maxtunnels--; // another turn is done, so decrement the total tunnels
  }
}



// 5. GENERATE MAP FROM ARRAY
// here is code to add a single box -- you'll do this dynamically using map

// add a yellow box
window.onload = () => { // wait for everything to load first
  // display the map grid in the hud
  //map.forEach(e => document.getElementById('hud').innerHTML += e+'<br />');
  
  // add a single box 
  /*let box = document.createElement('a-box');
  box.setAttribute('color', '#FF0');
  box.setAttribute('position', {x:1, y:0, z:-2});
  document.querySelector('#map').appendChild(box);
  */
  //{x:-10 + i, y:-10, z:-7 + j}
  

  // ADD YOUR CODE TO DRAW A MAP BLOCK HERE <<=================================

  let box;

  for (j = 0; j < rows; j++) {
    for (i = 0; i < cols; i++) {
      if (map[j][i] === 1) {
        box = document.createElement('a-box');
        box.setAttribute('color', '#754');
        box.setAttribute('position', {x:0 + i, y:0, z:-16 + j});
        document.querySelector('#map').appendChild(box); 
      }
    }
  }
};


// 3. ADD ROTATION READER
// to tell which cardinal direction the camera is facing

AFRAME.registerComponent('rotation-reader', {
  tick: function () {
    let camrot = this.el.getAttribute('rotation').y % 360;
    // determine if the player is facing N, S, W, E
    if (camrot >= 0) {
      if (camrot < 45) cardinal = 'S';
      else if (camrot < 135) cardinal = 'E';
      else if (camrot < 225) cardinal = 'N';
      else if (camrot < 360) cardinal = 'W';
      else cardinal = camrot; // fall-through case logs rotation in degrees
    }
    else {
      if (camrot > -45) cardinal = 'S';
      else if (camrot > -135) cardinal = 'W';
      else if (camrot > -225) cardinal = 'N';
      else if (camrot > -360) cardinal = 'E';
      else cardinal = camrot; // fall-through case logs rotation in degrees
    }

    //console.log(cardinal);
  }
});

let xpos = 0;
let zpos = 0;

// 4. ADD CONTOLLER INPUT

function advanceOne() {
  
  // ADD YOUR CODE TO MOVE THE PLAYER ONE STEP HERE <<=========================
  switch (cardinal) {
    case 'N': zpos -= 1 ; break;
    case 'S': zpos += 1 ; break;
    case 'W': xpos -= 1 ; break;
    case 'E': xpos += 1 ; break;
    default : console.log('error: invalid cardinal point');
  }
  document.getElementById('camera').setAttribute('position', {x:-xpos, y:0, z:-zpos});
  console.log(xpos, zpos)
}

// listen for trigger operations
AFRAME.registerComponent('triggerlistener', {
  init: function () {
    // add triggerup (on release) listener to advance
    this.el.addEventListener('triggerup', e => {
      advanceOne();
    });
  }
});
// and a keyboard alternative for the trigger (the enter key)
this.addEventListener('keypress', e => {
  if (e.keyCode == 13) {
    advanceOne();
  }
});

