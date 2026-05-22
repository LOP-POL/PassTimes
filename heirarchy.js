const container = document.getElementById("container")
const nameInput = document.getElementById("Name")
const childInput = document.getElementById("Child")
const form = document.getElementById("form")
const logs = document.getElementById("miniLogs")

// Select buttons using getElementsByClassName and add click event listeners
const addChildBtn = document.getElementsByClassName("addChild")[0];
const removeChildBtn = document.getElementsByClassName("removeChild")[0];
const parentLeftBtn = document.getElementsByClassName("parentLeft")[0];
const parentRightBtn = document.getElementsByClassName("parentRight")[0];
const levelUpBtn = document.getElementsByClassName("levelUp")[0];
const levelDownBtn = document.getElementsByClassName("levelDown")[0];
const renameBtn = document.querySelector(".rename")


// importand export buttons

const importBtn = document.getElementById('importBtn')
const exportBtn = document.getElementById('exportBtn')
const clearBtn = document.getElementById('clearBtn')

const toggleView = document.getElementById("viewToggle")
const worldView = document.getElementById("world")
// interface Hier {
//     name:String,
//     children:Hier[],
//     nodeId:String   // e.g. "child1211" = child at pos 1, level 2, parent at pos 1, parent level 1
// }
let view = false
toggleView.onclick = ()=>{
    if(!view){
        worldView.style.opacity = 1
        worldView.style.zIndex = 2
        container.style.opacity = 0
        view = !view 
    }
    else{
        worldView.style.opacity = 0
         worldView.style.zIndex = -1
        container.style.opacity = 1
        view = !view
    }
    
}


var currentLevel = 0

var rootNode = "root"

var currentParent = "root"
var currentParentId = ""     // Tracks the ID of the current parent
var currentNodeId = ""       // Tracks the ID of the current node
var currentChainId = 0

var nameGiven = ""
var childGiven = ""
var parentRename = ""

var existingIds = []


function setNameGivenValue(value, nodeId = "") {
    nameGiven = value;
    currentNodeId = nodeId;
    trackPosition();
}
function setCurrentParent(value, parentId = "") {
    currentParent = value
    currentParentId = parentId
    trackPosition()
}



var addChildDisabled = true
var removechildDisabled = true

var switchParentDisabled = true

function setNameGiven(newName) {
    if (newName.length) {
        setNameGivenValue(newName)
    }
    parentLeftBtn.disabled = false
    parentRightBtn.disabled = false

    return newName
}

function setChildGiven(newName) {
    if (newName.length) {
        childGiven = newName
    }
    return newName
}

function miniLog(...log) {
    let finalLog = ""
    log.forEach((l) => {
        finalLog += "<br/> ~ " + l + " "
    })
    let myP = document.createElement("p")
    myP.innerHTML = finalLog
    logs.innerHTML = logs.innerHTML + finalLog

}

// Very very Important this Controls Everything !!
export var chains = [

]


function deactivateButtons() {

    addChildBtn.disabled = true
    addChildBtn.style.color = "red"
    addChildBtn.style.backgroundColor = "pink"

}
function activateRemoveBtn() {
    removeChildBtn.disabled = false
    removeChildBtn.style.color = "green"
    removeChildBtn.style.backgroundColor = "lightgreen"
}

function deactivateRemoveBtn() {
    removeChildBtn.disabled = true
    removeChildBtn.style.color = "red"
    removeChildBtn.style.backgroundColor = "pink"
}


function enableParentButtons() {
    parentRightBtn.disabled = false
    parentRightBtn.style.color = "green"
    parentRightBtn.style.backgroundColor = "lightgreen"
    // left
    parentLeftBtn.disabled = true
    parentLeftBtn.style.color = "green"
    parentLeftBtn.style.backgroundColor = "lightgreen"
}

function traverseChain(chain, listOfNames = []) {
    chain.forEach((node) => {
        listOfNames.push(node.nodeName)
        if (node.children.length) {
            traverseChain(node.children, listOfNames)
        }

    })
    return listOfNames
}

// This is utter bullsh*t btw 
function traverseChainWF(chain, callback) {
    let childList = []
    chain.forEach((node) => {
        node = callback(node)
        if (node.children.length) {
            traverseChainWF(node.children)
        }
        childList.push(node)
    })

    return childList

}

function refreshIdsList() {
    let idsList = []
    chains.forEach((node) => {
        idsList.push(node.nodeName)
        if (node.children.length) {
            traverseChain(node.children)
        }
    })

    existingIds = idsList

}

// ---------------------------------------------------------------------------
// nodeId generation
//
// Format: "child" + childPosition + level + parentPosition + parentLevel
//
// Example: the 1st child (pos 1) at level 2, whose parent is the 1st node
//          (pos 1) at level 1  →  "child1211"
//
// Root is always assigned the special id "child1100" (pos 1, level 1,
// no parent  → parentPosition 0, parentLevel 0).
// ---------------------------------------------------------------------------

/**
 * Build a unique id string using the parent's nodeId and the child's position.
 * This ensures globally unique IDs across the entire tree.
 * @param {number} childPosition - 1-based position among siblings
 * @param {string} parentNodeId - the parent's nodeId (or "0000" for root)
 */
function generateNodeId(childPosition, parentNodeId) {
    return parentNodeId + "_child" + childPosition
}

/**
 * Walk the whole tree and stamp every node with a fresh nodeId based on its
 * actual position in the tree and its parent's ID.  Call this any time the tree
 * structure changes (add, remove, rename triggers a re-render anyway).
 *
 * @param {Array}  chain          - the chain array to process (default: chains)
 * @param {string} parentNodeId   - the nodeId of the parent (for setting parentId field and generating child IDs)
 */
function assignIds(chain = chains, parentNodeId = "0000") {
    chain.forEach((node, index) => {
        const childPosition = index + 1          // 1-based
        node.nodeId = generateNodeId(childPosition, parentNodeId)
        node.parentId = parentNodeId             // Set parentId to parent's nodeId

        if (node.children.length) {
            assignIds(node.children, node.nodeId)
        }
    })
}

/**
 * Find a node's nodeId by its nodeName (display name).
 * Returns null if not found.
 */
function getNodeIdByName(nodeName, chain = chains) {
    for (const node of chain) {
        if (node.nodeName === nodeName) return node.nodeId
        if (node.children.length) {
            const found = getNodeIdByName(nodeName, node.children)
            if (found) return found
        }
    }
    return null
}

// ---------------------------------------------------------------------------
function getNode(nodeName, chain = chains) {
    for (const node of chain) {
        if (node.nodeName === nodeName) return node
        if (node.children.length) {
            const gotIm = getNode(nodeName, node.children)
            if (gotIm) return gotIm
        }
    }
    return null
}

function getNodeById(nodeID, chain = chains){
    for (const node of chain) {
        if (node.nodeId === nodeID) return node
        if (node.children.length) {
            const gotIm = getNodeById(nodeID, node.children)
            if (gotIm) return gotIm
        }
    }
    return null
}

function listChildrenNames(nameGiven) {
    const node = getNode(nameGiven)
    if (node) {
        return traverseChain(node.children)
    }
    return []
}

function addToChain(newNode, chain = chains) {
    let childList = []

    if (!chain.length) {
        childList.push(newNode)
    }

    chain.forEach((node) => {

        if (node.nodeId == newNode.parentId) {
            
            node.children.push(newNode)
        }
        if (node.children.length) {
            node.children = addToChain(newNode, node.children)
        }
        childList.push(node)

    })


    return childList


}


// Differnt removing methods

//Known parent - uses nodeIds
function removeChildFromParent(parentId, nodeId, chain = chains) {
    for (const node of chain) {
        if (node.nodeId === parentId) {
            node.children = node.children.filter(
                child => child.nodeId !== nodeId
            );
            return true;
        }

        if (node.children.length) {
            const removed = removeChildFromParent(parentId, nodeId, node.children);
            if (removed) return true;
        }
    }
    return false;
}

//Mutation - uses nodeId
function removeFromChain(nodeId, chain = chains) {
    for (let i = 0; i < chain.length; i++) {
        const node = chain[i];

        if (node.nodeId === nodeId) {
            chain.splice(i, 1); //mutation
            return true;
        }

        if (node.children.length) {
            const removed = removeFromChain(nodeId, node.children);
            if (removed) return true;
        }
    }
    return false;
}

//Immutable - uses nodeId

function removeFromChainImmutable(nodeId, chain) {
    return chain
        .filter(node => node.nodeId !== nodeId)
        .map(node => ({
            ...node,
            children: removeFromChainImmutable(nodeId, node.children)
        }));
}

//mutation style - uses nodeId for finding, updates nodeName
function modifyNodeNameInChain(newName, nodeId, chain = chains) {
    chain.forEach((node) => {
        if (node.nodeId == nodeId) {
            node.nodeName = newName
        }
        if (node.children.length) {
            modifyNodeNameInChain(newName, nodeId, node.children)
        }
    })
}



export function splitLevels(chain = chains, runningList = [], levelC = -1) {
    let myLevel = levelC + 1
    chain.forEach((node) => {
        if (!runningList[myLevel]) {

            runningList.push([node])
        }
        else {
            runningList[myLevel].push(node)
        }
        if (node.children.length) {

            splitLevels(node.children, runningList, myLevel)
        }

       

    })
  


    return runningList
}

function buildVisualTree(chain = chains) {
    let finalelem = document.createElement("div")
    chain.forEach((node) => {
        var elem = document.createElement("div")
        var pForName = document.createElement("p")

        pForName.innerHTML = node.nodeName
        elem.classList.add(node.nodeId)
        elem.classList.add("node")
        // Use the stable nodeId as the HTML id instead of nodeName
        elem.setAttribute("id", node.nodeId)
        elem.appendChild(pForName)

        if (node.children.length) {
            elem.appendChild(buildVisualTree(node.children))
        }
        finalelem.appendChild(elem)
       
        return elem
    })

    return finalelem

}


function addToDom() {
    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }
    // Re-assign all ids before rebuilding the DOM so positions are up to date
    assignIds()
    container.appendChild(buildVisualTree(chains))
    window.dispatchEvent(new CustomEvent('updatedChains', { update: chains }))
    trackPosition()
}


function checkNextParent(chain = chains) {
    let levels = splitLevels(chain)
    let currentLevelList = levels[currentLevel]
    for (var i = 0; i < currentLevelList.length; i++) {
        if (currentLevelList[i].nodeId == currentParentId) {
            if (!currentLevelList[i + 1])
                return false
        }
        return true
    }
}

function getNextParent(chain = chains) {
    let levels = splitLevels(chain)
    let currentLevelList = levels[currentLevel]
    for (var i = 0; i < currentLevelList.length; i++) {
        if (currentLevelList[i].nodeId == currentParentId) {
            return currentLevelList[i + 1]  // Return the node object, not just the name
        }
    }
}

function checkPreviousParent(chain = chains) {
    let levels = splitLevels(chain)
    let currentLevelList = levels[currentLevel]
    for (var i = 0; i < currentLevelList.length; i++) {
        if (currentLevelList[i].nodeId == currentParentId) {
            if (!currentLevelList[i - 1])
                return false
        }
        return true
    }
}

function getPreviousParent(chain = chains) {
    let levels = splitLevels(chain)
    let currentLevelList = levels[currentLevel]
    for (var i = 0; i < currentLevelList.length; i++) {
        if (currentLevelList[i].nodeId == currentParentId) {
            return currentLevelList[i - 1]  // Return the node object, not just the name
        }
    }
}

export function trackPosition() {
    let prevPosition = document.querySelector('.currentPosition')
    if (prevPosition) {
        prevPosition.classList.remove('currentPosition')
    }
    // Use the stored currentNodeId directly
    if (currentNodeId) {
        let elem = document.getElementById(currentNodeId)
        const el = document.querySelector(`[data-node-id="${currentNodeId}"]`);
        
        if(el) el.classList.add('currentPosition')

        if (elem) elem.classList.add('currentPosition')
    }
}

function moveUpLevel() {
    let levels = splitLevels()

    if (currentLevel == 0) {
        deactivateRemoveBtn()
        alert("already at top level")
        return
    }
    else {
        
        currentLevel--
        
        if (!levels[currentLevel] || !levels[currentLevel][0]) {
            alert("Error: No nodes found at this level")
            currentLevel++  // Revert level change
            return
        }
        
        const node = levels[currentLevel][0]
        currentParent = node.nodeName
        currentParentId = node.nodeId
        nameInput.value = node.nodeName
        setNameGivenValue(node.nodeName, node.nodeId)
    }
}
function moveDownLevel() {
    let levels = splitLevels()
    console.log(levels)

    if (currentLevel == levels.length - 1) {
        alert("already at bottom level")
        return
    }
    else {
        currentLevel++;
        
        if (!levels[currentLevel]) {
            alert("Error: No nodes found at this level")
            currentLevel--  // Revert level change
            return
        }
        
        const node = levels[currentLevel].filter((nodes)=>nodes.parentId==currentNodeId)[0];
        
        if (!node) {
            alert("Error: No child node found for current node")
            currentLevel--  // Revert level change
            return
        }

        currentParent = node.nodeName;
        currentParentId = node.nodeId;
        nameInput.value = node.nodeName;
        setNameGivenValue(node.nodeName, node.nodeId);
    }
}

function addForButtonEvent(e) {
    if (childInput.value == "") {
        return
    }
    if (existingIds.includes(childGiven)) {
        alert("child or parent already exists")
        return
    }
    let newNode = {
        nodeName: childGiven,
        parentId: currentNodeId,
        nodeId: "",      // will be assigned by assignIds() inside addToDom()
        children: []
    }
    chains = addToChain(newNode, chains)


    childInput.value = ""

    deactivateButtons()
    refreshIdsList()
    addToDom()
    trackPosition()
    
}

//  Controllers for buttons

addChildBtn?.addEventListener("click", addForButtonEvent);

removeChildBtn?.addEventListener("click", (e) => {
    if (splitLevels()[0].includes(nameGiven) || currentLevel == 0) {
        
        alert("Cannot delete root, whole will be lost")
        return
    }
    miniLog(`removed ${nameGiven}`)
    chains = removeFromChainImmutable(currentNodeId, chains)
    moveUpLevel()
    refreshIdsList()
    addToDom()
});


parentLeftBtn?.addEventListener("click", (e) => {
    if (checkPreviousParent()) {
        const node = getPreviousParent()
        currentParent = node.nodeName
        currentParentId = node.nodeId
        setNameGivenValue(currentParent, currentParentId)
        if (nameInput) {
            nameInput.value = nameGiven
        }
    }
});

parentRightBtn?.addEventListener("click", (e) => {
    if (checkNextParent()) {
        const node = getNextParent()
        currentParent = node.nodeName
        currentParentId = node.nodeId
        setNameGivenValue(currentParent, currentParentId)
        if (nameInput) {
            nameInput.value = nameGiven
        }
    }
});

levelUpBtn?.addEventListener("click", (e) => {
    moveUpLevel()

  

});

levelDownBtn?.addEventListener("click", (e) => {
    moveDownLevel()
    activateRemoveBtn()
   
});
renameBtn?.addEventListener("click", ((e) => {
    if (parentRename.length) {
        miniLog(`renamed ${nameGiven} to ${parentRename}`)
        modifyNodeNameInChain(parentRename, currentNodeId, chains)
        setNameGivenValue(parentRename, currentNodeId)
        currentParent = nameGiven
        if (currentLevel == 0) {
            rootNode = nameGiven
        }
    }
    renameBtn.style.backgroundColor = "#e8e8e8"
    renameBtn.style.color = "#333333"
    refreshIdsList()
    addToDom()

}))


nameInput?.addEventListener("input", ((e) => {
    if (currentLevel == 0) {
        rootNode = e.target.value
    }
    parentRename = e.target.value
    renameBtn.style.backgroundColor = "lightgreen"
    renameBtn.style.color = "green"

}))

childInput?.addEventListener("input", ((e) => {
    childGiven = e.target.value
    if (childInput.value != "") {
        addChildBtn.disabled = false
        addChildBtn.style.color = "green"
        addChildBtn.style.backgroundColor = "lightgreen"


    }
    else {
        addChildBtn.disabled = true
        addChildBtn.style.color = "red"
        addChildBtn.style.backgroundColor = "pink"
    }

}))

childInput?.addEventListener("change", ((e) => {
    miniLog(`added ${e.target.value}`)
    childGiven = e.target.value
}))

// keyBindings


document.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        addForButtonEvent()
    }

})

// Export functions

function downloadChains(event) {
    const json = JSON.stringify(chains, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const rootName = splitLevels()[0][0].nodeName + '.json'
    a.download = rootName  ?? 'chains.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    window.location.reload();
}

function importJson(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonContent = JSON.parse(e.target.result);
            chains = jsonContent;
            assignIds();
            setNameGiven(chains[0].nodeName)
            setCurrentParent(chains[0].nodeName, chains[0].nodeId)
            nameInput.value = chains[0].nodeName
            refreshIdsList()
            addToDom()
            trackPosition()
            buildVisualTree()

            miniLog("JSON imported successfully");
            window.location.reload();
        } catch (error) {
            miniLog("Error parsing JSON: " + error.message);
        }
    };
    reader.readAsText(file);
}

function saveSession() {
    try {
        sessionStorage.setItem('chains', JSON.stringify(chains));
        sessionStorage.setItem('nameGiven', nameGiven);
        sessionStorage.setItem('currentParent', currentParent);
    } catch (error) {
        console.error('Failed to save session', error);
    }
}

function loadSession() {
    const storedChains = sessionStorage.getItem('chains');
    if (!storedChains) return false;

    try {
        const parsedChains = JSON.parse(storedChains);
        if (Array.isArray(parsedChains)) {
            chains = parsedChains;
        }
    } catch (error) {
        console.error('Failed to parse session chains', error);
        return false;
    }

    assignIds();
    
    const storedName = sessionStorage.getItem('nameGiven');
    const storedParent = sessionStorage.getItem('currentParent');

    if (storedName) {
        nameGiven = storedName;
        const node = getNode(storedName);
        if (node) currentNodeId = node.nodeId;
        if (nameInput) nameInput.value = storedName;
    }

    if (storedParent) {
        currentParent = storedParent;
        const node = getNode(storedParent);
        if (node) currentParentId = node.nodeId;
    }

    return true;
}

exportBtn.addEventListener('click', downloadChains)
importBtn.addEventListener('change', importJson)
window.addEventListener('beforeunload', saveSession)

// ---Life Cycle and big functions---
function clearData() {
    const confirmaion = confirm('Are you sure you want to clear all data.')

    let newNode = {
        nodeName: "root",
        parentId: "0000",  // root has no parent
        nodeId: "",      // will be assigned below
        children: []
    }

    if (confirmaion) {
        chains = [];
        nameGiven = "root"
        nameInput.value = "root"
        sessionStorage.clear();

        chains = addToChain(newNode, chains)

        assignIds()
        refreshIdsList()
        addToDom()
    }

    window.location.reload();

}

clearBtn.addEventListener('click', clearData)



function main() {

    let newNode = {
        nodeName: "root",
        parentId: "0000",  // root has no parent
        nodeId: "",      // will be assigned below
        children: []
    }

    const restored = loadSession();
    if (!restored && !nameGiven.length) {
        nameGiven = "root"
        nameInput.value = "root"
        chains = addToChain(newNode, chains)
    }

    // Assign all nodeIds before building the DOM for the first time
    assignIds()
    refreshIdsList()
    
    // Set currentNodeId and currentParentId for the root
    const rootNode = chains[0];
    if (rootNode) {
        currentNodeId = rootNode.nodeId;
        currentParentId = rootNode.parentId;
    }
    
    addToDom()

    var newChain = traverseChain(chains)

    if (currentLevel == 0) {
        deactivateRemoveBtn()
    }

    miniLog(`levels - ${splitLevels.length}`)
}

main()