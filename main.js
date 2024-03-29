var mode = "produce";
var subMode = '';

var mults = {};
mults.coalMineMult = 1;
mults.ironMineMult = 1;
mults.copperMineMult = 1;
mults.autoMineMult = 1;
mults.moveMult = 1;

mults.manufacturingMult = 1;
mults.autoManufacturingMult = 1;
mults.assemblyMult = 1;
mults.autoAssemblyMult = 1;

mults.base = 1;

var flashInterval, flashing;

var sellText = true;

var currTick = 0;

let saveId = '' + Math.random()*10 + Math.random()*10;
saveId = saveId.replace(/\./g,'');
var shouldAutosave = true;

var totalProduced = {money:0};
for (i in items)
    totalProduced[i] = 0;

for (i in ships) {
    totalProduced[i] = 0;
}

var produceKeyFuncs = {
    'a':()=>{addItem(iron_ore,player,1 * mults.ironMineMult)}
};
$('#iron_ore-text').click(()=>{addItem(iron_ore,player,1 * mults.ironMineMult)});

var sellKeyFuncs = {
    'num':num => {sellItem(num)}
}
$('#player-table').click(()=>{sellItem(event.target.dataset.num)});

var upgradeKeyFuncs = {
    'num':num => {buyUpgrade(num,upgrades,renderUpgradeTable)},
}
$('#upgrade-table').click(()=>{buyUpgrade(event.target.dataset.num,upgrades,renderUpgradeTable);});

var automationKeyFuncs = {
    'num':num => {(subMode == '' ? buyUpgrade(num,automations,renderAutomationTable) : toggleAutomation(num))},
    't':automationModeToggle
}
$('#automation-table').click(()=>{(subMode == '' ? 
buyUpgrade(event.target.dataset.num,automations,automations,renderAutomationTable) : 
toggleAutomation(event.target.dataset.num,automations))});

var shipyardKeyFuncs = {
    'num':num => {manufacture(ships[Object.keys(ships)[num-1]])}
}
$('#shipyard-list').click(()=>{manufacture(ships[Object.keys(ships)[event.target.dataset.num-1]])});

var universalKeyFuncs = {
    'i':() => {return changeMode('produce')}
}
$('#production').click(()=>{changeMode('produce')});

$('.category-header').click((e)=>{
    $('#' + (e.target.id) + '-container').toggle();
})

for (let i of ['furnace', 'manufacturing', 'assembly'])
    $('#' + i).hide();

var modeDict = {
    'produce':{key:'i',
        show:['production-container']
    },
    'sell':{id:'sell-items',text:'Sell Items',key:'o',
        show:[]
    },
    'upgrade':{id:'upgrade',text:'Buy Upgrades',key:'p',addon:'<span id="new-upgrade">New</span>',
        show:['upgrade-container']
    },
    'automation':{id:'automation',text:'Automation',key:'u',
        show:['automation-container']
    },
    'shipyard':{id:'shipyard',text:'Shipyard',key:'y',
        show:['shipyard-container']
    }
};

var masterKeyFuncs = {
    produce:produceKeyFuncs,
    sell:sellKeyFuncs,
    upgrade:upgradeKeyFuncs,
    automation:automationKeyFuncs,
    shipyard:shipyardKeyFuncs
};

var smeltCooldown = [0,0];
var maxSmeltCooldown = 60;

let money = 0;

$(document).keyup(function(e){
    if (document.activeElement == document.getElementById('load-save-text'))
        return;
    let keyFuncs = masterKeyFuncs[mode];
    if (symbols.indexOf(e.key) != -1)
        keyFuncs.num(symbols.indexOf(e.key) + 10)
    else if (!isNaN(e.key) && keyFuncs.num)
        keyFuncs.num(e.key);
    else if (universalKeyFuncs[e.key])
        universalKeyFuncs[e.key]();
    else if (keyFuncs[e.key])
        keyFuncs[e.key]();
});

function ironToFurnace() {
    let max = furnace1.maxCapacity.iron_ore;
    let amount = Math.min(1 * mults.moveMult,max - furnace1.inventory.iron_ore,player.inventory.iron_ore);
    if (canAfford(iron_ore,player,amount)) {
        removeItem(iron_ore,player,amount);
        addItem(iron_ore,furnace1,amount);
    }
}

function canAfford(item,entity,amount) {
    let inv = entity.inventory;
    let result = true
    let index;
    let insufficient = [];
    if (!item.name) {
        for (i in item)
            if (!inv[i] || item[i] * amount > inv[i]) {
                result = false;
                if (entity == player) {
                    index = Object.keys(inv).indexOf(i);
                    insufficient.push($('.player-inventory-row')[index]);
                }
            }
        if (!result && entity == player) {
            flash(insufficient);
        }
    }
    else {
        result = (inv[item.name] != undefined && inv[item.name] >= amount);
        if (entity == player && !result) {
            index = Object.keys(inv).indexOf(item.name);
            flash($('.player-inventory-row')[index]);
        }
    }
    return result;
}

function coalToFurnace(furnace) {
    let max = furnace.maxCapacity.coal;
    let amount = Math.min(1 * mults.moveMult,max - furnace.inventory.coal,player.inventory.coal);
    if (canAfford(coal,player,amount)) {
        removeItem(coal,player,amount);
        addItem(coal,furnace,amount);
    }
}

function copperToFurnace() {
    let max = furnace2.maxCapacity.copper_ore;
    let amount = Math.min(1 * mults.moveMult,max - furnace2.inventory.copper_ore,player.inventory.copper_ore);
    if (canAfford(copper_ore,player,amount)) {
        removeItem(copper_ore,player,amount);
        addItem(copper_ore,furnace2,amount);
    }
}

function manufacture(item,auto = false) {
    let amount;
    let mult = 1;
    if (manufactured.indexOf(item.name) != -1)
        mult = (auto ? 'autoManufacturingMult' : 'manufacturingMult')
    else if (assembled.indexOf(item.name) != -1)
        mult = (auto ? 'autoAssemblyMult' : 'assemblyMult')
    else
        mult = 'base';
    amount = Math.min(mults[mult],player.maxCapacity[item.name] - (player.inventory[item.name] ? player.inventory[item.name] : 0) );
    if (canAfford(item.recipe,player,amount)) {
        removeRecipe(item,player,amount);
        addItem(item,player,amount * (item.output != undefined ? item.output : 1));
        if (totalProduced[item.name] == 0)
            $('#' + item.name + '-text .cost').hide();
    }
    if (mode == 'shipyard')
        renderShipyard();
}

$('#settings-icon').click(toggleSettings);
$('#settings-close-icon').click(toggleSettings);
$('#export-save').click(exportSave);
$('#load-save').click(loadSave);

function toggleSettings() {
    $('#settings-menu').toggle();
    $('#export-save').html('Export Save As Text');
    $('#load-save').html('Load Save From Text')
}

function exportSave() {
    save();
    const el = document.createElement('textarea');
    el.value = window.sessionStorage.superSmith;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    $('#export-save').html('Save Text Copied To Clipboard');
}

function loadSave() {
    if (!$('#load-save-text')[0].value)
        alert('Paste save text into box')
    else if (load($('#load-save-text')[0].value))
        $('#load-save').html('Save Loaded')
    else
        alert('That doesn\'t look like a valid save.');
}

setInterval(gameTick,50);

function gameTick() {
    furnaceTick();
    furnaceTick();
    autoMineTick();
    checkUnlocks();
    if (shouldAutosave && currTick % 100 == 0) {
        if (!window.sessionStorage.superSmithSaveId || saveId == JSON.parse(window.sessionStorage.superSmithSaveId))
            save();
        else {
            var r = confirm("Overwrite Existing Autosave File?");
            if (r == true) {
                shouldAutosave = true;
                window.sessionStorage.superSmithSaveId = JSON.stringify(saveId);
            }
            else
                shouldAutosave = false;
            
        }
    }
    renderUI();
    currTick++;
}

function furnaceTick() {
    // Furnace 1
    let inv = furnace1.inventory;
    if (inv.iron_ore && inv.coal >= 2 && smeltCooldown[0] <= 0 && player.inventory.iron_bar != player.maxCapacity.iron_bar) {
        removeItem(iron_ore,furnace1)
        removeItem(coal,furnace1,2)
        addItem(iron_bar,player)
        smeltCooldown[0] = maxSmeltCooldown/furnace1.speed;
    }
    smeltCooldown[0]--;
    $("#furnace1-inner").width(smeltCooldown[0]/(maxSmeltCooldown/furnace1.speed) * 100 + '%');

    // Furnace 2
    inv = furnace2.inventory;
    if (inv.copper_ore && inv.coal >= 2 && smeltCooldown[1] <= 0 && player.inventory.copper_bar != player.maxCapacity.copper_bar) {
        removeItem(copper_ore,furnace2)
        removeItem(coal,furnace2,2)
        addItem(copper_bar,player)
        smeltCooldown[1] = maxSmeltCooldown/furnace2.speed;
    }
    smeltCooldown[1]--;
    $("#furnace2-inner").width(smeltCooldown[1]/(maxSmeltCooldown/furnace2.speed) * 100 + '%');
}

function addItem(item,entity,amount = 1) {
    let inventory = entity.inventory;
    let max = entity.maxCapacity[item.name];
    if (inventory[item.name] == undefined)
        inventory[item.name] = amount;
    else
        inventory[item.name] += amount;
    inventory[item.name] = Math.min(inventory[item.name],max);
    totalProduced[item.name] += amount;
}

function sellItem(num) {
    let item = Object.keys(player.inventory)[num - 1];
    if (item == undefined)
        return;
    let amount = player.inventory[items[item].name];
    if (sellText)
        sellText = false;
    removeItem(item,player,'all');
    changeMoney(amount * items[item].val);
}

$('#automation-toggle-text').click(()=>{automationModeToggle()});

function automationModeToggle() {
    subMode = (subMode == '' ? 'toggle' : '');
    $('#automation-toggle-text').html((subMode == '' ? 'Toggle Mode [t]' : 'Buy Mode [t]'));
    renderAutomationTable();
}

function buyUpgrade(num,list,renderFunc) {
    let upgrade = list.filter(curr =>{
        return (curr.level != undefined || !curr.bought);
    })[num - 1];
    if (upgrade && money >= upgrade.cost) {
        changeMoney(-1 * upgrade.cost)
        upgrade.func();
        if (renderFunc == renderUpgradeTable)
            upgrade.bought = true;
        renderFunc();
    }
}

function toggleAutomation(num) {
    automations[num - 1].on = !automations[num-1].on;
    renderAutomationTable();
    renderInventoryTable(player);
}

function removeItem(item,entity,amount = 1) {
    let inventory = entity.inventory;
    let currItem = (item.name == undefined ? item : item.name);
    if (amount == 'all')
        amount = inventory[currItem];
    inventory[currItem] -= amount;
}

function removeRecipe(item,entity,mult) {
    for (i in item.recipe)
        removeItem(items[i],entity,item.recipe[i]*mult);
}

function changeMoney(amount) {
    money += amount;
    if (amount > 0)
        totalProduced.money += amount;
    $('#money-val').html(money);
}

function renderInventoryTable(entity) {
    let table = '';
    let count = 1;
    let curr,max;
    for (let i in entity.inventory) {
        max = prettyPrint(entity.maxCapacity[i]);
        table += '<tr class="' + entity.name + '-inventory-row">';
        table += '<td>' + prettyPrint(i) + ':</td>';
        table += '<td>' + entity.inventory[i] + '/' + max + '</td>';
        if (mode == 'sell' && entity.name == 'player') {
            table += '<td> x $' + items[i].val + '</td>';
            table += '<td> = $' + items[i].val * entity.inventory[i] + '</td>';
            table += '<td class="clickable" data-num="' + count + '">'
            if (count < 10)
                table +=  '[' + (sellText ? 'Press ' : '') + count + ']</td>';
            else
                table +=  '[' + (sellText ? 'Press ' : '') + symbols[count - 10] + ']</td>';
        }
        else if (entity == player){
            curr = automations.filter(auto => auto.resource == items[i] && auto.type != 'loader')[0];
            if (curr && curr.maxCooldown && curr.on) {
                let mult = 1;
                if (resources.indexOf(curr.resource.name) != -1)
                    mult = 'autoMineMult';
                else if (manufactured.indexOf(curr.resource.name) != -1)
                    mult = 'autoManufacturingMult';
                else if (assembled.indexOf(curr.resource.name) != -1)
                    mult = 'autoAssemblyMult';
                if (i == 'iron_bar')
                    curr = 'autoIronLoader';
                else if (i == 'copper_bar')
                    curr = autoCopperLoader;
                table += '<td>+' + prettyPrint(curr.amount * mults[mult] * (20/curr.maxCooldown)) + '/s</td>';
            }
        }
        table += '</tr>';
        count++;
    }
    $('#' + entity.name +'-table').html(table);
}

function renderUpgradeTable() {
    let table = ''
    let count = 1;
    for (let i of upgrades) {
        if (!i.bought && count <= 9) {
            if (count % 2 == 1)
                table += '<tr class="clickable">';
            table += '<td class="border-container center" data-num="' + count + '"><p data-num="' + count + '">' + i.name + '</p>';
            table += '<p data-num="' + count + '">$' + i.cost + ' [' + count + ']</p>';
            table += '</p>';
            if (count % 2 == 0)
                table += '</tr>';
            count++;
        }
    }
    $('#upgrade-table').html(table);
}

function renderAutomationTable() {
    let table = '';
    let count = 1;
    for (let i of automations) {
        if (count % 2 == 1)
            table += '<tr class="clickable">';
        table += '<td class="border-container automation-item ' + (i.on ? '' : 'red-border') + '" data-num="' + count + '"><p class="title" data-num="' + count + '">';
        table += i.name + '</p>';
        table += '<p data-num="' + count + '">Level:' + i.level + '</p>';
        if (subMode == '')
            table += '<p data-num="' + count + '">Upgrade: $' + i.cost + ' [' + (count <= 9 ? count : symbols[count-10]) +']</p></td>';
        else {
            table += '<p data-num="' + count + '"> <span class="' + (i.on ? 'green' : 'red') + '">' + (i.on ? 'On' : 'Off');
            table += '</span> [' + (count <= 9 ? count : symbols[count-10]) +']</p></td>';
        }
        if (count % 2 == 0)
            table += '</tr>';
        count++;
    }
    $('#automation-table').html(table);
}

function renderShipyard() {
    let list = '';
    let table, curr;
    let count = 1;
    for (let i in ships) {
        curr = ships[i];
        table = '<li><table class="shipyard-table border-container clickable" data-num="' + count + '">'
        table += '<tr><th colspan="2" data-num="' + count + '"><span class="title" data-num="' + count + '">' + prettyPrint(curr.name) + '</span> [' + count + ']</th></tr>'
        for (let j in curr.recipe) {
            table += '<tr>';
            table += '<td data-num="' + count + '">' + prettyPrint(j) + '</td>';
            table += '<td data-num="' + count + '">' + prettyPrint(player.inventory[j]) + '/' + curr.recipe[j] + '</td>';
            table += '</tr>';
        }
        table += '</table></li>'
        list += table;
        count++;
    }
    $('#shipyard-list').html(list);
}

function changeMode(given) {
    // If user hits the button they just hit go back
    if (given == mode)
        given = 'produce';
    if (modeDict[given].id)
        $('#' + modeDict[given].id).html('Exit [' + modeDict[given].key + ']')
    for (let i of modeDict[mode].show)
        $('#' + i).hide();
    for (let i of modeDict[given].show)
        $('#' + i).show();
    $('#' + modeDict[mode].id).html(modeDict[mode].text + ' [' + modeDict[mode].key + ']' + ' ' + (modeDict[mode].addon ? modeDict[mode].addon : ''))

    if (mode == 'upgrade')
        $('#new-upgrade').hide();

    mode = given;
    renderUI();
}

function renderUI() {
    if (mode == 'upgrade') {
        renderUpgradeTable();
    }
    else if (mode == 'automation')
        renderAutomationTable();
    else if (mode == 'shipyard')
        renderShipyard();
    else {
        renderInventoryTable(player);
        renderInventoryTable(furnace1);
        renderInventoryTable(furnace2);
    }
}

function flash(element) {
    if (Array.isArray(flashing))
        for (let i of flashing)
            $(i).removeClass('insufficient');
    else
        $(flashing).removeClass('insufficient');
    clearInterval(flashInterval);
    flashing = element;
    let count = 0;
    flashInterval = setInterval(() => {
        if (Array.isArray(element))
            for (let i of element)
                $(i).toggleClass('insufficient');
        else
            $(element).toggleClass('insufficient');
        count++;
        if (count == 10)
            clearInterval(flashInterval);
    },200)   
}

function save() {
    let save = {};
    let saveString = ''
    let encodedSave = [];
    window.sessionStorage.superSmithSaveId = JSON.stringify(saveId);
    save.mode = mode;
    save.money = money;
    save.player = player;
    save.furnace1 = furnace1;
    save.furnace2 = furnace2;
    save.upgrades = upgrades;
    save.unlocks = unlocks;
    save.automations = automations;
    save.mults = mults;
    save.totalProduced = totalProduced;
    save.currTick = currTick;
    saveString = JSON.stringify(save);
    encodedSave = encodeSave(saveString);
    window.sessionStorage.superSmith = encodedSave;
}

function encodeSave(string) {
    let encoded = '';
    let total = 0;
    let saveSymbols = ['!','@','#','$','%','^','&','*','(',')'];
    for (let i = 0; i < string.length; i++) {
        encoded += string.charCodeAt(i).toString(i % 33 + 2) + saveSymbols[parseInt(Math.random()*saveSymbols.length)];
        total += string.charCodeAt(i);
    }
    encoded += total.toString(16);
    return encoded;
}

function decodeSave(array) {
    let save = '';
    let total = 0;
    let curr;
    for (let i = 0; i < array.length-1; i++) {
        curr = parseInt(array[i],i % 33 + 2);
        total += curr;
        save += String.fromCharCode(curr);
    }
    if(array[array.length-1] == total.toString(16))
        return save;
    else
        return false;
}

function load(string) {
    let baseSave;
    if (string)
        baseSave = string.split(/[!@#$%^&*()]+/);
    else
        baseSave = window.sessionStorage.superSmith.split(/[!@#$%^&*()]+/);
    let decodedSave = decodeSave(baseSave);
    if (decodedSave == false)
        return false;
    let save = JSON.parse(decodedSave);
    saveId = JSON.parse(window.sessionStorage.superSmithSaveId);
    shouldAutosave = true;
    money = save.money;
    player = save.player;
    furnace1 = save.furnace1;
    furnace2 = save.furnace2;
    for (let i = 0; i < save.unlocks.length; i++)
        if(save.unlocks[i].bought) {
            unlocks[i].func();
            unlocks[i].bought = true;
            if (unlocks[i].upgrade)
                for (let j of save.upgrades)
                    if (j.bought && !unlocks[i].upgrade.bought) {
                        unlocks[i].upgrade.func()
                        unlocks[i].upgrade.bought = true;
                    }
        }
    // Used this instead of going by array position because ordering issue between states
    for (let i of save.upgrades) {
        for (let j of upgrades)
            if (i.bought && !j.bought && i.name == j.name) {
                j.func();
                j.bought = true;
            }
    }
    
    for (let i = 0; i < save.automations.length; i++) {
        automations[i].level = save.automations[i].level;
        automations[i].cost = save.automations[i].cost;
        automations[i].cooldown = save.automations[i].cooldown;
        automations[i].maxCooldown = save.automations[i].maxCooldown;
    }
    mults = save.mults;
    totalProduced = save.totalProduced;
    currTick = save.currTick;
    changeMode(save.mode);
    changeMoney(0);
    return true;
}
