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
// interface Hier {
//     name:String,
//     children:Hier[],
//     nodeId:String   // e.g. "child1211" = child at pos 1, level 2, parent at pos 1, parent level 1
// }



var currentLevel = 0

var rootNode = "root"

var currentParent = "root"
var currentChainId = 0

var nameGiven = ""
var childGiven = ""
var parentRename = ""

var existingIds = []


function setNameGivenValue(value) {
    nameGiven = value;
    trackPosition();
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
    logs.innerHTML ^= logs.innerHTML + finalLog

}


var chains = [

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

function traverseChain(chain,listOfNames=[]) {
    chain.forEach((node) => {
        listOfNames.push(node.nodeName)
        if (node.children.length) {
            traverseChain(node.children,listOfNames)
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
 * Build a flat id string from the four positional numbers.
 * All positions are 1-based; parentPosition/parentLevel are 0 for root.
 */
function generateNodeId(childPosition, level, parentPosition, parentLevel) {
    return "child" + childPosition + level + parentPosition + parentLevel
}

/**
 * Walk the whole tree and stamp every node with a fresh nodeId based on its
 * actual position in the tree at that moment.  Call this any time the tree
 * structure changes (add, remove, rename triggers a re-render anyway).
 *
 * @param {Array}  chain          - the chain array to process (default: chains)
 * @param {number} level          - 1-based depth of this chain's nodes
 * @param {number} parentPosition - 1-based position of the parent in its level (0 for root)
 * @param {number} parentLevel    - 1-based level of the parent (0 for root)
 */
function assignIds(chain = chains, level = 1, parentPosition = 0, parentLevel = 0) {
    chain.forEach((node, index) => {
        const childPosition = index + 1          // 1-based
        node.nodeId = generateNodeId(childPosition, level, parentPosition, parentLevel)

        if (node.children.length) {
            assignIds(node.children, level + 1, childPosition, level)
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
function getNode(nodeName,chain = chains){
    for (const node of chain){
        if(node.nodeName === nodeName) return node
        if(node.children.length){
            const gotIm = getNode(nodeName,node.children)
            if (gotIm) return gotIm
        }
    }
    return null
}


function listChildrenNames(nameGiven){
    const node = getNode(nameGiven)
    if(node){
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
        console.log("line 154", newNode.nodeName, newNode.parentName, node.nodeName)

        if (node.nodeName == newNode.parentName) {
            console.log("found", node.nodeName)
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

//Known parent
function removeChildFromParent(parentName, nodeName, chain = chains) {
    for (const node of chain) {
        if (node.nodeName === parentName) {
            node.children = node.children.filter(
                child => child.nodeName !== nodeName
            );
            return true;
        }

        if (node.children.length) {
            const removed = removeChildFromParent(parentName, nodeName, node.children);
            if (removed) return true;
        }
    }
    return false;
}

//Mutation
function removeFromChain(nodeName, chain = chains) {
    for (let i = 0; i < chain.length; i++) {
        const node = chain[i];

        if (node.nodeName === nodeName) {
            chain.splice(i, 1); //mutation
            return true;
        }

        if (node.children.length) {
            const removed = removeFromChain(nodeName, node.children);
            if (removed) return true;
        }
    }
    return false;
}

//Immutable
function removeFromChainImmutable(nodeName, chain) {
    return chain
        .filter(node => node.nodeName !== nodeName)
        .map(node => ({
            ...node,
            children: removeFromChainImmutable(nodeName, node.children)
        }));
}

function updateParentNameForChildren(newName, childList) {
    let newlist = []
    childList.forEach((child) => {
        child.parentName = newName
        newlist.push(child)
    })

    return newlist


}

//mutataion style
function modifyParentInChain(newName, oldName, chain = chains) {


    chain.forEach((node) => {
        if (node.nodeName == oldName) {
            node.nodeName = newName
            node.children = updateParentNameForChildren(newName, node.children)
        }
        if (node.children.length) {
            modifyParentInChain(newName, oldName, node.children)
        }

    })


}



function splitLevels(chain = chains, runningList = [], levelC = -1) {
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

        console.log("rl", runningList)
        console.log("node", node)

    })
    console.log("myLevel", myLevel)


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
        console.log(elem)
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
    trackPosition()
}


function checkNextParent(chain = chains) {

    let levels = splitLevels(chain)
    let currentLevelList = levels[currentLevel]
    for (var i = 0; i < currentLevelList.length; i++) {
        if (currentLevelList[i].nodeName == currentParent) {
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
        if (currentLevelList[i].nodeName == currentParent) {
            return currentLevelList[i + 1].nodeName
        }
    }


}

function checkPreviousParent(chain = chains) {
    let levels = splitLevels(chain)
    let currentLevelList = levels[currentLevel]
    for (var i = 0; i < currentLevelList.length; i++) {
        if (currentLevelList[i].nodeName == currentParent) {
            if (!currentLevelList[i - 1])
                return false
        }
        return true
    }

}

function getPreviousParent(chain = chains, value = "") {

    let levels = splitLevels(chain)
    let currentLevelList = levels[currentLevel]
    for (var i = 0; i < currentLevelList.length; i++) {
        if (currentLevelList[i].nodeName == currentParent) {
            return currentLevelList[i - 1].nodeName
        }
    }


}

function trackPosition() {
    let prevPosition = document.querySelector('.currentPosition')
    if (prevPosition) {
        prevPosition.classList.remove('currentPosition')
    }
    // Look up the node's stable nodeId rather than using nodeName as an HTML id
    const nodeId = getNodeIdByName(nameGiven)
    if (nodeId) {
        let elem = document.getElementById(nodeId)
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
        currentParent = levels[currentLevel][0].nodeName
        nameInput.value = levels[currentLevel][0].nodeName
        setNameGivenValue(levels[currentLevel][0].nodeName)
    }
}
function moveDownLevel() {
    let levels = splitLevels()

    if (currentLevel == levels.length - 1) {
        alert("already at bottom level")
        return
    }
    else {
        currentLevel++;
        currentParent = levels[currentLevel][0].nodeName;
        nameInput.value = levels[currentLevel][0].nodeName;
        setNameGivenValue(levels[currentLevel][0].nodeName);
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
        parentName: nameGiven,
        nodeId: "",      // will be assigned by assignIds() inside addToDom()
        children: []
    }
    chains = addToChain(newNode, chains)


    childInput.value = ""

    deactivateButtons()
    refreshIdsList()
    addToDom()
    trackPosition()
    console.log("Levels", splitLevels(chains))
}

//  Controllers for buttons

addChildBtn?.addEventListener("click", addForButtonEvent);

removeChildBtn?.addEventListener("click", (e) => {
    if (splitLevels()[0].includes(nameGiven) || currentLevel == 0) {
        console.log(nameGiven)
        alert("Cannot delete root, whole will be lost")
        return
    }
     miniLog(`removed ${nameGiven}`)
    chains = removeFromChainImmutable(nameGiven, chains)
    moveUpLevel()
    refreshIdsList()
    addToDom()
});


parentLeftBtn?.addEventListener("click", (e) => {

    if (checkPreviousParent()) {
        currentParent = getPreviousParent()

        setNameGivenValue(currentParent)
        if (nameInput) {
            nameInput.value = nameGiven
        }

    }
    console.log("Levels", splitLevels(chains))
});

parentRightBtn?.addEventListener("click", (e) => {

    if (checkNextParent()) {
        currentParent = getNextParent()

        setNameGivenValue(currentParent)
        if (nameInput) {
            nameInput.value = nameGiven
        }
    }
    console.log("Levels", splitLevels(chains))
});

levelUpBtn?.addEventListener("click", (e) => {
    moveUpLevel()

    console.log("Levels", splitLevels(chains))

});

levelDownBtn?.addEventListener("click", (e) => {
    moveDownLevel()
    activateRemoveBtn()
    console.log("Levels", splitLevels(chains))
});
renameBtn?.addEventListener("click", ((e) => {
    if (parentRename.length) {
        miniLog(`renamed ${nameGiven} to ${parentRename}`)
        modifyParentInChain(parentRename, nameGiven, chains)
        setNameGivenValue(parentRename)
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

function main() {

    let newNode = {
        nodeName: "root",
        parentName: "root",
        nodeId: "",      // will be assigned below
        children: []
    }

    if (!nameGiven.length) {
        nameGiven = "root"
        nameInput.value = "root"
        chains = addToChain(newNode, chains)
    }

    // Assign all nodeIds before building the DOM for the first time
    assignIds()
    container.appendChild(buildVisualTree(chains))

    var newChain = traverseChain(chains)

    if (currentLevel == 0) {
        deactivateRemoveBtn()
    }

    miniLog(`levels - ${splitLevels.length}`)
}

main()