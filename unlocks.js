var unlocks = [];

function unlock(requirements,func) {
    let newUnlock = {};
    newUnlock.requirements = requirements;
    newUnlock.func = func;
    newUnlock.bought = false;
    return newUnlock;
}

function checkUnlocks() {
    let requirementsMet;
    for (let i = 0; i < unlocks.length; i++) {
        requirementsMet = true;
        for (let j in unlocks[i].requirements)
            if (unlocks[i].bought || unlocks[i].requirements[j] > totalProduced[j])
                requirementsMet = false;
        if (requirementsMet) {
            unlocks[i].func();
            unlocks[i].bought = true;
        }
    }
}

unlocks.push(
    unlock({iron_ore:2},
    ()=>{ $('#iron_ore-press').fadeOut(); })
);

unlocks.push(
    unlock({iron_ore:7},
    ()=>{ 
        $('#sell-items').fadeIn(500);
        $('#sell-items').click(()=>{changeMode('sell')});
        universalKeyFuncs.o = ()=>{return changeMode('sell')};
    })
);

unlocks.push(
    unlock({iron_bulkhead:1,simple_circuit_board:1,small_engine:1},
    ()=>{ 
        $('#shipyard').fadeIn(500);
        $('#shipyard').click(()=>{changeMode('shipyard')});
        universalKeyFuncs.y = ()=>{return changeMode('shipyard')};
    })
)

unlocks.push(
    unlock({money:25},
    ()=>{ 
        upgrades.push(coalMining);
        $('#upgrade').fadeIn(500);
        $('#upgrade').click(()=>{changeMode('upgrade')});
        universalKeyFuncs.p = ()=>{return changeMode('upgrade')};
    })
);

unlocks.push(
    unlock({iron_bar:5},
    ()=>{
        upgrades.push(improvedFurnaceSpeed);
        upgrades.push(automatedCoalMining);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({iron_bar:40},
    ()=>{
        upgrades.push(improvedFurnaceSpeed2);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({copper_bar:50},
    ()=>{
        upgrades.push(improvedFurnaceSpeed3);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({iron_bar:250,copper_bar:250},
    ()=>{
        upgrades.push(improvedFurnaceSpeed4);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({copper_ore:8},
    ()=>{
        upgrades.push(copperForging);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({small_engine:2},
    ()=>{
        upgrades.push(improvedAssembly);
        $('#new-upgrade').show();
    })
);

/*unlocks.push(
    unlock({escape_pod:1},
    ()=>{
        upgrades.push(improvedAssembly2);
        upgrades.push(improvedAutoAssembly2);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({escape_pod:1},
    ()=>{
        upgrades.push(improvedAssembly2);
        upgrades.push(improvedAutoAssembly2);
        $('#new-upgrade').show();
    })
);*/

// -----  Manufacturing Upgrades ----- 
unlocks.push(
    unlock({iron_bar:20},
    ()=>{
        upgrades.push(ironPlateManufacturing);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({copper_bar:8},
    ()=>{
        upgrades.push(copperWireManufacturing);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({copper_bar:20},
    ()=>{
        upgrades.push(improvedCopperMining);
        $('#new-upgrade').show();
    })
);

// ----- Assembly Unlocks ----- 
unlocks.push(
    unlock({iron_plate:20},
    ()=>{
        upgrades.push(ironBulkheadAssembly);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({copper_wire:100,iron_bar:20},
    ()=>{
        upgrades.push(simpleCircuitBoardAssembly);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({simple_circuit_board:20},
    ()=>{
        upgrades.push(smallEngineAssembly);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({small_hauler:2},
    ()=>{
        upgrades.push(smallLifeSupportAssembly);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({small_transport:2},
    ()=>{
        upgrades.push(smallRailgunAssembly);
        $('#new-upgrade').show();
    })
);

unlocks.push(
    unlock({iron_plate:15},
    ()=>{
        upgrades.push(copperMining);
        $('#new-upgrade').show();
    })
);

// ----- Automation Unlocks ----- 
unlocks.push(
    unlock({iron_bar:40},
    ()=>{
        upgrades.push(automatedIronMining);
    })
);

unlocks.push(
    unlock({copper_bar:30},
    ()=>{
        upgrades.push(automatedCopperMining);
    })
);

unlocks.push(
    unlock({iron_bar:30},
    ()=>{
        upgrades.push(automaticCoalLoading);
    })
);

unlocks.push(
    unlock({iron_bar:80},
    ()=>{
        upgrades.push(automaticIronLoading)
    })
);

unlocks.push(
    unlock({copper_bar:50},
    ()=>{
        upgrades.push(automaticCopperLoading);
    })
);

unlocks.push(
    unlock({iron_plate:80},
    ()=>{
        upgrades.push(automaticIronPlateMaking);
    })
);

unlocks.push(
    unlock({copper_wire:80},
    ()=>{
        upgrades.push(automaticCopperWireMaking);
    })
);

unlocks.push(
    unlock({iron_bulkhead:30},
    ()=>{
        upgrades.push(automaticIronBulkheadAssembly);
    })
);

unlocks.push(
    unlock({simple_circuit_board:30},
    ()=>{
        upgrades.push(automaticSimpleCircuitBoardAssembly);
    })
);

unlocks.push(
    unlock({small_engine:30},
    ()=>{
        upgrades.push(automaticSmallEngineAssembly);
    })
);
