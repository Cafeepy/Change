//const { everyLimit } = require("async");

document.addEventListener('DOMContentLoaded', init);

// JSON objects that store everything else inside the tables
let mapTable = { table: null, btns: [] };
let actionTable = { table: null, contents: [] };
let inspectPanel = { table: null, cells: [] };
let mediaWidget = { scroll: null };
let startForm={ form:null, input: null }
let gameinfo = { day: 0, population: 0, budget: 0, gridSize: 9, name: '' }
async function init() {
    // initialize screen size
    await eel.initialize_screen_size(window.outerWidth,window.outerHeight);
    startForm.form=document.getElementById('startForm')
    startForm.form.addEventListener('submit', startSubmit);
    startForm.input=document.getElementById('startInput')
}
async function startSubmit(e){
    e.preventDefault();
    document.body.removeChild(startForm.form);
    await eel.start_game(startForm.input.value);
    start();
}

// start the game
async function start() {
    const fullTable=document.getElementById('fullTable');
    fullTable.style.display='';
    // initialize the map table
    mapTable.table = document.getElementById('mapTable');
    for (let i = 0; i < gameinfo.gridSize; i++) {
        let mapRow = document.createElement('tr')
        mapTable.btns.push([]);
        for (let j = 0; j < gameinfo.gridSize; j++) {
            let cell = document.createElement('td')
            let btn = document.createElement('button');
            mapTable.btns[i].push(btn);
            cell.appendChild(btn);
            btn.addEventListener('click', async function () {
                tileClick(i, j);
            });
            btn.addEventListener('mouseover', async function () {
                tileHover(i, j);
            });
            let tile = await eel.get_tile(i, j)();
            let info;
            if (tile == -1) {
                info = [0, 0, 0, 0, "Grass", 0, "An empty tile.", -1];
            } else if (tile < 10) {
                info = await eel.get_source(tile)();
            } else {
                info = await eel.get_amenity(tile)();
            }
            btn.innerText = 'btn';
            const imgName=info[4].toLowerCase().replace(' ','_').replace(' ','_').replace(' ','_').replace(' ','_').replace(' ','_');
            btn.innerHTML=`<img src="/img/${imgName}.png" width=40 height=40>${info[4]}`;
            mapRow.appendChild(cell);
        }
        mapTable.table.appendChild(mapRow);
    }
    // initialize the inspect bar at the bottom
    inspectPanel.table = document.getElementById('inspectTable');
    let inspectRow = document.createElement('tr')
    inspectPanel.cells = [document.createElement('td'), document.createElement('td')];
    inspectPanel.cells[0].id = 'img';
    inspectRow.appendChild(inspectPanel.cells[0]);
    inspectRow.appendChild(inspectPanel.cells[1]);
    inspectPanel.table.appendChild(inspectRow);
    // initialize the action bar on the right
    actionTable.table = document.getElementById('actionTable');
    actionTable.table.style.display = 'none'; // keep it hidden until the user clicks on a tile
    let descTile = document.getElementById('actionDesc')
    actionTable.contents.push([descTile]);
    for (let i = 0; i < 3; i++) {
        actionRow = document.createElement('tr')
        actionTable.contents.push([]);
        for (let j = 0; j < 2; j++) {
            let cell = document.createElement('td')
            let btn = document.createElement('button');
            actionTable.contents[i + 1].push(btn);
            cell.appendChild(btn);
            btn.addEventListener('click', async function () {
                actionClick(i, j);
            });
            btn.innerHTML='btn'
            actionRow.appendChild(cell);
        }
        actionTable.table.appendChild(actionRow);
    }
    // get the social media widget on the left
    mediaWidget.scroll = document.getElementById('scrollDiv');
    let nextDayBtn=document.getElementById('nextDay');
    nextDayBtn.addEventListener('click',nextDay);
    // start the next day
    nextDay();
}

async function nextDay() {
    let info=await eel.next_day()();
    let scrollinginfo = document.getElementById('scrollingInfo');
    // day, budget, population, population_increase
    scrollinginfo.innerHTML = `${gameinfo.name} | Day: ${info[0]} Budget: ${info[1]} Citizens: ${info[2]} Carbon: ${info[4]}`;
}

async function actionClick(row, col) {
    //
}

async function tileClick(row, col) {
    actionTable.table.style.display = ''; // show the action table
    // pass the tile's coordinates to a cafee.py function
    let tile = await eel.get_tile(row, col)();
    let info;
    if (tile == -1) {
        info = [0, 0, 0, 0, "Grass", 0, "An empty tile.", -1];
        description = `${info[4]}: ${info[6]}`;
    } else if (tile < 10) {
        info = await eel.get_source(tile)();
        description = `${info[4]}<br>Carbon emissions: ${info[1]} | Cost: $${info[2]} | Power output: ${info[0]} kW`;
    } else {
        info = await eel.get_amenity(tile)();
        description = `${info[4]}<br>Carbon emissions: ${info[1]} | Cost: $${info[2]}`;
    }
    let descTile = actionTable.contents[0][0];
    descTile.innerHTML = description;
}
async function tileHover(row, col) {
    // pass the tile's coordinates to a cafee.py function
    const tile = await eel.get_tile(row, col)();
    // output, emissions, cost, environment cost, power type (type), amount, description, id
    let info, description;
    if (tile == -1) {
        info = [0, 0, 0, 0, "Grass", 0, "An empty tile.", -1];
        description = '';
    } else if (tile < 10) {
        info = await eel.get_source(tile)();
        description = `Power output: ${info[0]} kW | Carbon emissions: ${info[1]} | Cost: $${info[2]}`;
    } else {
        info = await eel.get_amenity(tile)();
        description = `Carbon emissions: ${info[1]} | Cost: $${info[2]}`;
    }
    const imgName=info[4].toLowerCase().replace(' ','_').replace(' ','_').replace(' ','_').replace(' ','_').replace(' ','_');
    inspectPanel.cells[1].innerHTML = `Row ${row + 1}, Column ${col + 1}<br>${info[4]}: ${info[6]}<br>${description}`;
    inspectPanel.cells[0].innerHTML = `<img src="/img/${imgName}.png">`;
}

eel.expose(end)
async function end(day, budget, population, totalSpent, totalEmissions, win){
  if(win){
    // winning
  }else{
    // losing
  }
}