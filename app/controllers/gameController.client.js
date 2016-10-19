"use strict";

/* TODO
* 1) refactor variable scope.  There is some "cheating" with how variables are shared between scopes.  Lots of globals where there don't need to be.
* 2) similar to #1, refactor the React controller design.  Several anti-patterns involved, especially controllers using global variables
*/

//*****GLOBAL CONSTRUCTORS*****//
//*****************************//

function Tile(texture, entityTexture) {
  //tile constructor.  Pass the texture (floor/ceiling) and, if exists, the entity (weapon, enemy, player) that is on the tile
  this.texture = texture;
  this.entityTexture = entityTexture;
  this.entity = "";
}
function Entity() {
  //TODO make a parent class for entities with common characteristics and methods
}
function LivingThing() {
  //TODO parent class for entities with health and stuff, like player, enemy, boss
}

function Player(){
  this.alive = true;
  this.x = 0;
  this.y = 0;
  this.level = 1;
  this.exp = 0;
  this.expNextLevel = 100;
  this.HP = 15;
  this.AP = 3;
  this.weapon = weapons[0];
  this.dmg = this.AP * this.weapon.dmg;
  this.texture = "blue";
  //methods
  this.addHP = function(h){
    this.HP += h;
  }
  this.loseHP = function(h){
    this.HP -= h;
  }
  this.upgradeWeapon = function(w){
    this.weapon = w;
    this.dmg = this.AP * this.weapon.dmg;
  }
  this.checkForDeath = function(){
    if (this.HP <= 0){
      this.alive = false;
      return true;
    }
    else
      return false;
  }
  this.addExp = function(e){
    this.exp += e;
    this.expNextLevel = 100 - this.exp;
  }
  this.checkForLevelUp = function(e){
    if (this.expNextLevel <= 0){
      this.levelUp();
      console.log('leveled!')
      this.exp = 0;
    }
  }
  this.levelUp = function(){
    this.level++;
    this.HP += this.level * 15;
    this.AP = this.level * 3;
    this.dmg = this.AP * this.weapon.dmg;
  }
}
function Enemy(level){
  this.alive = true;
  this.HP = 12*(level);
  this.dmg = 6*level;
  this.texture = "red";
  //methods
  this.powerUp = function(level){
    this.HP = 10*level;
    this.dmg = 5*level;
  }
  this.loseHP = function(h){
    this.HP -= h;
  }
  this.checkForDeath = function(){
    if (this.HP <= 0){
      this.alive = false;
      return true;
    }
    else
      return false;
  }
}
function Boss(){
  this.alive = true;
  this.HP = 500;
  this.dmg = 25;
  this.texture = "red";
  //methods
  this.loseHP = function(h){
    this.HP -= h;
  }
  this.checkForDeath = function(){
    if (this.HP <= 0){
      this.alive = false;
      return true;
    }
    else
      return false;
  }
}
//*****GLOBAL FUNCTIONS*****//
//**************************//
function buildDungeon(){
  var dungeonMaps = [];

    dungeonMaps = generateMap();

  return dungeonMaps;
}
function generateMap(){
  //procedurally generate the Map multidimensional arrays, including creation //of the tile objects
  //TODO after some play testing.  There is tons of opportunity to improve //this algorithm and make the maps have a more "realistic" distribution of //rooms and more efficient and "random looking" corridors
  
  //MAP CONFIG - BEGIN
  var map = [];
  var mapWidth = 100;
  var mapHeight = 100;
  var rooms = [];
  var numRoomsToBuild = 20;
  var numEnemies = 10;
  var numHealthPotions = 5;
  //MAP CONFIG - END

  //MAP BUILDING FUNCTIONS - START
  //these functions are all "pure".  They do not affect any variables except those within their scope.
  function initializeMap(curMap){
    for (let i = 0; i < mapHeight; i++){
    curMap[i] = [];
      for (let j = 0; j < mapWidth; j++){
        let temp = new Tile();
        temp.texture = "wall";
        curMap[i].push(temp);
      }
    }
    return curMap;
  }
  function placeRooms(curMap, curRooms){
    var numRoomsBuilt = 0;
    for (let i = 0; i < numRoomsToBuild; i++){
      curRooms.push(generateRoom(numRoomsBuilt));
      curMap = addRoom(curMap, curRooms[i]);
      numRoomsBuilt++;
    }
    return {map: curMap, rooms: curRooms};
  }
  function generateRoom(numRoomsBuilt){
    var maxRoomWidth = 25;
    var minRoomWidth = 5;
    var maxRoomHeight = 25;
    var minRoomHeight = 5;
    var roomSpec = {};
    roomSpec.index = numRoomsBuilt;
    roomSpec.x = Math.floor(Math.random() * 94 + 1); // TODO remove hardcoded numbers
    roomSpec.y = Math.floor(Math.random() * 94 + 1); // TODO remove hardcoded numbers
    if ((mapWidth - roomSpec.x) < (maxRoomWidth + minRoomWidth)){
      roomSpec.width = Math.floor(Math.random() * (mapWidth - roomSpec.x - 1));
    }
    else {
      roomSpec.width = Math.floor((Math.random() * maxRoomWidth) + minRoomWidth);
    }
    if ((mapHeight - roomSpec.y) < (maxRoomHeight + minRoomHeight)){
      roomSpec.height = Math.floor(Math.random() * (mapHeight - roomSpec.y-1));
    }
    else {
      roomSpec.height = Math.floor((Math.random() * maxRoomHeight) + minRoomHeight);
    }
    //console.log(roomSpec);
    return roomSpec;
  }
  function addRoom(curMap, roomSpec){
    for (var i = roomSpec.y; i < roomSpec.y+roomSpec.height; i++){
      
      for (var j = roomSpec.x; j < roomSpec.x+roomSpec.width; j++){
        curMap[i][j].texture = "floor";
      }
    }
    return curMap;
  }
  function findPathingStart(curMap){
    for (let i = 0; i < 100; i++){
      for (let j = 0; j < 100; j++){
         if (curMap[i][j].texture == "floor"){
                
           return {x: j, y: i};
         }
  
      }
    }
  }
  function connectRooms(curMap, curRooms){
    for (var i = 0; i < rooms.length; i++){
        var nextX;
        var nextRoom;
        if (i < curRooms.length-1){
          nextRoom = curRooms[i+1];
        }
        else {
          nextRoom = curRooms[0];
        }
        var distanceX = nextRoom.x - curRooms[i].x;
        if(distanceX > 0)
          nextX = curRooms[i].x+1;
        else {
          nextX = curRooms[i].x-1;
        }
        for (let j = 0; j < Math.abs(distanceX); j++){
          curMap[curRooms[i].y][nextX].texture = "floor";
          if(distanceX > 0)
            nextX++;
          else {
            nextX--;
          }
        }
        if(distanceX > 0)
          nextX--;
        else {
          nextX++;
        }
        var nextY;
        var distanceY = nextRoom.y - curRooms[i].y;
        if(distanceY > 0)
          nextY = curRooms[i].y+1;
        else {
          nextY = curRooms[i].y-1;
        }
        for (let j = 0; j < Math.abs(distanceY); j++){
          curMap[nextY][nextX].texture = "floor";
          if(distanceY > 0)
            nextY++;
          else {
            nextY--;
          }
        }
    }
    return {map: curMap, rooms: curRooms};
  }
  function placeEntities(curMap, curRooms, numEnemies){
    //place player, enemies, weapons, stairs.  The for loop runs for the amount of enemies + 1 for the player.  The first iteration places the player.
    var playerSpot;
    var bossSpot;
    var enemySpots = [];
    //player and enemies
    for (var i = 0; i < (numEnemies+1); i++){
      var curX;
      var curY; 
      do {
        curX = (Math.floor(Math.random() * (curRooms[i].width-1)))+curRooms[i].x;
        curY = (Math.floor(Math.random() * (curRooms[i].height-1)))+curRooms[i].y;
      } while (curMap[curY][curX].entityTexture !== undefined || curMap[curY][curX].texture == "wall");
      
      if (i === 0){ //player
        curMap[curY][curX].entityTexture = "blue";
        playerSpot = {x:curX,y:curY};
      }
      else if (i === 1 && dungeon.currentMap === 4){ //boss
        let bossRoom = i;
        while (curRooms[bossRoom].width < 3 || curRooms[bossRoom].height < 3){
          bossRoom++;
        }

        var bossY = curRooms[bossRoom].y+1;
        var bossX = curRooms[bossRoom].x+1;
        curMap[bossY][bossX].entityTexture = "red";
        curMap[bossY][bossX+1].entityTexture = "red";
        curMap[bossY+1][bossX].entityTexture = "red";
        curMap[bossY+1][bossX+1].entityTexture = "red";
        bossSpot = [
          {x:bossX, y:bossY},
          {x:bossX, y:bossY+1},
          {x:bossX+1, y:bossY},
          {x:bossX+1, y:bossY+1}
        ];
      }
      else { //enemy
        curMap[curY][curX].entityTexture = "red";
        curMap[curY][curX].entity = new Enemy(dungeon.currentMap+1);
      }  
    }
    //put weapon upgrade in random room
    var ranWepRoom;
    var ranWepX;
    var ranWepY;
    do {
      ranWepRoom = Math.floor(Math.random() * (curRooms.length-1));
      //console.log(curRooms[ranWepRoom]);
      ranWepX = (Math.floor(Math.random() * (curRooms[ranWepRoom].width-1)))+curRooms[ranWepRoom].x
      ranWepY = (Math.floor(Math.random() * (curRooms[ranWepRoom].height-1)))+curRooms[ranWepRoom].y
    } while (curMap[ranWepY][ranWepX].entityTexture !== undefined || curMap[ranWepY][ranWepX].texture == "wall");
    
    curMap[ranWepY][ranWepX].entityTexture = "gold";
    
    //put staircase in random room if map less than 4
    if (dungeon.currentMap < 4){
      var ranStairRoom
      var ranStairX
      var ranStairY
      do {
        ranStairRoom = Math.floor(Math.random() * (curRooms.length-1));
        //console.log(ranStairRoom +' '+curRooms[ranStairRoom]);
        ranStairX = (Math.floor(Math.random() * (curRooms[ranStairRoom].width-1)))+curRooms[ranStairRoom].x
        ranStairY = (Math.floor(Math.random() * (curRooms[ranStairRoom].height-1)))+curRooms[ranStairRoom].y
      } while (curMap[ranStairY][ranStairX].entityTexture !== undefined || curMap[ranWepY][ranWepX].texture == "wall");
      curMap[ranStairY][ranStairX].entityTexture = "purple";
    }
    
    
    //put health items in random rooms
    var ranHealthRoom;
    var ranHealthX;
    var ranHealthY;
    
    for (let i = 0; i < numHealthPotions; i++){
      
      do {
        ranHealthRoom = Math.floor((Math.random() * (curRooms.length-1)));
        //console.log(ranHealthRoom +' '+curRooms[ranHealthRoom]);
        ranHealthX = (Math.floor(Math.random() * (curRooms[ranHealthRoom].width-1)))+curRooms[ranHealthRoom].x
        ranHealthY = (Math.floor(Math.random() * (curRooms[ranHealthRoom].height-1)))+curRooms[ranHealthRoom].y
      } while (curMap[ranHealthY][ranHealthX].entityTexture !== undefined || curMap[ranHealthY][ranHealthX].texture == "wall");
      
      curMap[ranHealthY][ranHealthX].entityTexture = "green"; 
    }
    
    
    return {newMap:curMap, player: playerSpot, boss: bossSpot};
  }
  //MAP BUILDING FUNCTIONS - END
  
  map = initializeMap(map);
  var roomsPlaced = placeRooms(map, rooms);
  map = roomsPlaced.map;
  rooms = roomsPlaced.rooms;
  var startPosition = findPathingStart(map);
  var counter = 0;
  var roomsConnected = connectRooms(map, rooms);
  map = roomsConnected.map;
  rooms = roomsConnected.rooms;
  var entitiesPlaced = placeEntities(map, rooms, numEnemies);
  map = entitiesPlaced.newMap;
  var playerSpot = entitiesPlaced.player;
  var bossSpot = entitiesPlaced.boss;
  return {newMaps: map, newRooms: rooms, playerStart: playerSpot, bossSpot: bossSpot};
  
}
//**Deprecated Recursive array flattening function.  Uses recursion to deal with the nested array structure of the map.  If the value to be reduced is an array, it calls itself.  It'll do that that until the value is not longer an array type and then concat that value to the ongoing reduced variable, which is eventually returned from this function.
//function flattenMap(map){
//  return map.reduce(function(flattenedArr, arrToFlatten){
//    return flattenedArr.concat(Array.isArray(arrToFlatten) ? flattenMap(arrToFlatten) : arrToFlatten);
//  }, []);
//}

function stairs(){
  dungeon.currentMap++;
  var d = buildDungeon();
  dungeon.maps = d.newMaps;
  dungeon.rooms = d.newRooms;
  dungeon.playerStart = d.playerStart;
  dungeon.bossSpot = d.bossSpot;
  
  dungeon.boss = new Boss();
  dungeon.maps[dungeon.playerStart.y][dungeon.playerStart.x].entity = dungeon.player;
}
function health(playerX, playerY, healthX, healthY){
  dungeon.maps[healthY][healthX].entityTexture = "";
  dungeon.player.addHP(10);
}
function weapon(playerX, playerY, weaponX, weaponY){
  dungeon.maps[weaponY][weaponX].entityTexture = "";
  dungeon.player.upgradeWeapon(weapons[dungeon.currentMap+1]);
}
function combat(playerX, playerY, enemyX, enemyY){
  function assessPlayerDmg(boss){
    var dmg;     
    if (bossCheck){
      dmg = Math.floor(Math.random()*dungeon.boss.dmg);
      if (dmg === 0){
      dmg = 10;
      }
    }
    else {
      dmg = Math.floor(Math.random()*dungeon.maps[enemyY][enemyX].entity.dmg);
      if (dmg === 0){
      dmg = 2;
      }
    }
    
    
    dungeon.player.loseHP(dmg);
    if (dungeon.player.checkForDeath()){
      console.log(dungeon.player.alive);
      console.log(`player is now DEAD`);

    }
  }
  
  
  var enemyDmgTaken; 
  var bossCheck = false;
  if (dungeon.currentMap === 4){
    for (let i = 0; i < dungeon.bossSpot.length; i++){
      if (enemyX === dungeon.bossSpot[i].x && enemyY === dungeon.bossSpot[i].y){
        bossCheck = true;
      }
    }
  }
  

  enemyDmgTaken = Math.floor(Math.random()*dungeon.player.dmg);
  if (enemyDmgTaken === 0){
    //console.log(`player uses ${dungeon.maps[playerY][playerX].entity.weapon.name} and MISSES!`);
  }
  else {
    //console.log(`player uses ${dungeon.maps[playerY][playerX].entity.weapon.name} and does ${enemyDmgTaken} damage`);
    if(bossCheck){
      dungeon.boss.loseHP(enemyDmgTaken);
      if (dungeon.boss.checkForDeath()){
        
      }
      else {
        assessPlayerDmg(bossCheck);
      }
    }
    else {
      dungeon.maps[enemyY][enemyX].entity.loseHP(enemyDmgTaken);
      if (dungeon.maps[enemyY][enemyX].entity.checkForDeath()){
        //console.log(`enemy is DEAD`);
        dungeon.maps[enemyY][enemyX].entity = "";
        dungeon.maps[enemyY][enemyX].entityTexture = "";
        dungeon.player.addExp(15);
        dungeon.player.checkForLevelUp();

      }
      else{
        assessPlayerDmg(bossCheck);

      }
    }
    
      
  }
  return dungeon.player.alive;
}

//*****GLOBAL VARIABLE INITIALIZATION*****//
//****************************************//

var weapons = [
  {
    name: "rusty knife",
    dmg: 2,
    level: 0
  },
  {
    name: "steel sword",
    dmg: 4,
    level: 1
  },
  {
    name: "battle axe",
    dmg: 8,
    level: 2
  },
  {
    name: "enchanted staff",
    dmg: 11,
    level: 3
  },
  {
    name: "bload-soaked broadsword",
    dmg: 14,
    level: 4
  },
  {
    name: "flaming longsword of power",
    dmg: 20,
    level: 5
  },
];

var dungeon = {
  currentMap: 0,
  nextMap: function(){
    this.currentMap++;
  },
}; 
var dungeonBuilt = buildDungeon();
dungeon.maps = dungeonBuilt.newMaps;
dungeon.rooms = dungeonBuilt.newRooms;
dungeon.playerStart = dungeonBuilt.playerStart;
dungeon.bossSpot = dungeonBuilt.bossSpot;
dungeon.player = new Player();
dungeon.boss = new Boss();

dungeon.maps[dungeon.playerStart.y][dungeon.playerStart.x].entity = dungeon.player;


//*****REACT COMPONENTS*****//
//**************************//

var MapDisplay = React.createClass({
  getInitialState: function(){
    return {
      playerLocX: dungeon.playerStart.x,
      playerLocY: dungeon.playerStart.y,
      playerAlive: "true",
      bossAlive: "true",
      playerHP: dungeon.player.HP,
      currentMap: dungeon.currentMap,
      toggleDark: true
    };
  },
  componentDidMount: function() {
    window.addEventListener('keydown', this.handleKeyDown);
    try {
        if (window.addEventListener) {
            window.addEventListener("keydown", this.handleKeyDown);
        } else if (document.attachEvent) { // IE 
            document.attachEvent("onkeydown", this.handleKeyDown);
        } else {
            document.addEventListener("keydown", this.handleKeyDown);
        }
    } catch (e) {
        alert(e);
    }

  },
  collisionCheck: function(x,y) {
    if (dungeon.maps[y][x].texture === "floor" && (dungeon.maps[y][x].entityTexture === undefined || dungeon.maps[y][x].entityTexture === "")){
        return false;
    }
    else {
      if (dungeon.maps[y][x].entityTexture === 'red'){
        
        if (!this.props.handleCombat(this.state.playerLocX,this.state.playerLocY, x, y)){
          this.setState({playerAlive: "false"});
        }
        else {
          if (dungeon.boss.alive === false){
            this.setState({bossAlive: false, playerHP: dungeon.player.HP});
          }
          this.setState({playerHP: dungeon.player.HP});
        }
      }
      else if (dungeon.maps[y][x].entityTexture === 'green'){
        console.log('pickup health');
        this.props.handleHealth(this.state.playerLocX,this.state.playerLocY, x, y);
        return false;
      }
      else if (dungeon.maps[y][x].entityTexture === 'gold'){
        console.log('pickup weapon');
        this.props.handleWeapon(this.state.playerLocX,this.state.playerLocY, x, y);
        return false;
      }
      else if (dungeon.maps[y][x].entityTexture === 'purple'){
        console.log('change maps');
        this.props.handleStairs();
        this.setState({playerLocX: dungeon.playerStart.x,
        playerLocY: dungeon.playerStart.y, currentMap: dungeon.currentMap});
      }
      return true;
    }
  },
  handleKeyDown: function(e){
    e.preventDefault();
    if(e.keyCode === 37){ //LEFT
      if(!this.collisionCheck(this.state.playerLocX-1, this.state.playerLocY)){
        dungeon.maps[this.state.playerLocY][this.state.playerLocX].entityTexture = "";
        dungeon.maps[this.state.playerLocY][this.state.playerLocX].entity = "";
        dungeon.maps[this.state.playerLocY][this.state.playerLocX-1].entityTexture = "blue";
        dungeon.maps[this.state.playerLocY][this.state.playerLocX-1].entity = dungeon.player;
        this.setState({playerLocX: this.state.playerLocX -1});
      }
    }
    else if(e.keyCode === 38){ //UP
      if(!this.collisionCheck(this.state.playerLocX, this.state.playerLocY-1)){
        dungeon.maps[this.state.playerLocY][this.state.playerLocX].entityTexture = "";
        dungeon.maps[this.state.playerLocY-1][this.state.playerLocX].entityTexture = "blue";
        dungeon.maps[this.state.playerLocY][this.state.playerLocX].entity = "";
        dungeon.maps[this.state.playerLocY-1][this.state.playerLocX].entity = dungeon.player;
        this.setState({playerLocY: this.state.playerLocY-1});
      }
    }
    else if(e.keyCode === 39){ //RIGHT
      if(!this.collisionCheck(this.state.playerLocX+1, this.state.playerLocY)){
        dungeon.maps[this.state.playerLocY][this.state.playerLocX].entityTexture = "";
        dungeon.maps[this.state.playerLocY][this.state.playerLocX+1].entityTexture = "blue";
        dungeon.maps[this.state.playerLocY][this.state.playerLocX].entity = "";
        dungeon.maps[this.state.playerLocY][this.state.playerLocX+1].entity = dungeon.player;
        this.setState({playerLocX: this.state.playerLocX+1});
      }
    }
    else if(e.keyCode === 40){ //DOWN
      if(!this.collisionCheck(this.state.playerLocX, this.state.playerLocY+1)){
        dungeon.maps[this.state.playerLocY][this.state.playerLocX].entityTexture = "";
        dungeon.maps[this.state.playerLocY+1][this.state.playerLocX].entityTexture = "blue";
        dungeon.maps[this.state.playerLocY][this.state.playerLocX].entity = "";
        dungeon.maps[this.state.playerLocY+1][this.state.playerLocX].entity = dungeon.player;
        this.setState({playerLocY: this.state.playerLocY+1});
      }
    }
  },
  toggleDark: function(){
    if (this.state.toggleDark === false){
      this.setState({toggleDark: true});
    }
    else {
      this.setState({toggleDark: false});
    }
  },
  render: function(){
    if (dungeon.player.alive === false){
      return (<div className="whiteText">you DIED!</div>);
    }
    else if (dungeon.boss.alive === false){
      return (<div className="whiteText">you killed the boss! you WIN!!</div>);
    }
    else {
      

      //TODO determine if there is a more performant option
      //TODO remove magic numbers

      var playerX = this.state.playerLocX;
      var playerY = this.state.playerLocY;
      var viewMinX;
      var viewMaxX;
      var viewMinY;
      var viewMaxY;
      if (playerX - 32 <= 0){
        viewMinX = 0;
        viewMaxX = 66;
      }
      else if (playerX + 33 >= 99){
        viewMaxX = 99;
        viewMinX = 33;
      }
      else {
        viewMinX = playerX - 33;
        viewMaxX = playerX + 33;
      }
      if (playerY - 16 <= 0){
        viewMinY = 0;
        viewMaxY = 33;
      }
      else if (playerY + 17 >= 99){
        viewMinY = 66;
        viewMaxY = 99;
      }
      else {
        viewMinY = playerY - 16;
        viewMaxY = playerY + 17;
      }

      var slicedMap = dungeon.maps.slice(viewMinY, viewMaxY).map(function(item, index){
        return (item.slice(viewMinX,viewMaxX));
      });
      
      var tiles = [];
      var darkX = this.state.playerLocX-6;
      var darkY = this.state.playerLocY-6;
      var index = 0;
      for (let i = 0; i < slicedMap.length; i++){
        for (let j = 0; j < slicedMap[i].length; j++){
          let t;
          if (this.state.toggleDark === true && ((j+viewMinX) < (darkX) || (j+viewMinX) > (darkX+12))){
            t = "dark";
          }
          else if (this.state.toggleDark === true && ((i+viewMinY) < (darkY) || (i+viewMinY) > (darkY+12))){
            t = "dark";
          }
          else if (this.state.toggleDark === true && 
          (
            ((i+viewMinY) === (darkY) && (j+viewMinX) === (darkX))
            ||
            ((i+viewMinY) === (darkY+1) && (j+viewMinX) === (darkX))
            ||
            ((i+viewMinY) === (darkY) && (j+viewMinX) === (darkX+1))
            ||
            ((i+viewMinY) === (darkY+11) && (j+viewMinX) === (darkX))
            ||
            ((i+viewMinY) === (darkY+12) && (j+viewMinX) === (darkX))
            ||
            ((i+viewMinY) === (darkY+12) && (j+viewMinX) === (darkX+1))
            ||
            ((i+viewMinY) === (darkY) && (j+viewMinX) === (darkX+11))
            ||
            ((i+viewMinY) === (darkY) && (j+viewMinX) === (darkX+12))
            ||
            ((i+viewMinY) === (darkY+1) && (j+viewMinX) === (darkX+12))
            ||
            ((i+viewMinY) === (darkY+12) && (j+viewMinX) === (darkX+11))
            ||
            ((i+viewMinY) === (darkY+12) && (j+viewMinX) === (darkX+12))
            ||
            ((i+viewMinY) === (darkY+11) && (j+viewMinX) === (darkX+12))
          )
          ){
            t = "dark";
          }
          else if (slicedMap[i][j].entityTexture === undefined || slicedMap[i][j].entityTexture === ""){
            t = slicedMap[i][j].texture;
          }
          else {
            t = slicedMap[i][j].entityTexture;
          }
          tiles.push(<Tile key={index} texture={t}/>);
          index++;
        }
      }
      //console.log(testtiles);

      /*var testtiles = flatMap.map(function(item, index){
        var t;
        if (item.entityTexture === undefined || item.entityTexture === ""){
          t = item.texture;
        }
        else {
          t = item.entityTexture;
        }

        return (<Tile key={index} texture={t}/>);

      });*/

      return (
        <div>
        {tiles}
          <div>
            <div className="whiteText"><div className="status"><b>HP</b>: {dungeon.player.HP}</div>
            <div className="status"><b>Weapon</b>: {dungeon.player.weapon.name}</div>
            <div className="status"><b>Attack Power</b>: {dungeon.player.dmg}</div>
            <div className="status"><b>Player Level</b>: {dungeon.player.level}</div>
            <div className="status"><b>Exp</b>: {dungeon.player.exp} / 100</div>
            <div className="status"><b>Floor</b>: {dungeon.currentMap}</div></div>
            
          </div>
          <div><br/><button onClick={this.toggleDark}>Toggle Darkness</button></div>
        <br/>
        </div>
        
      );
    }
  }
});
var Tile = React.createClass({
  render: function(){
    return (<div className={"tile "+this.props.texture}></div>);
  }
});

ReactDOM.render(
  <MapDisplay handleCombat={combat} handleHealth={health} handleWeapon={weapon} handleStairs={stairs}/>,
  document.getElementById("view")
);