import {chains,splitLevels} from './heirarchy.js'

const colorControls = document.getElementById("colorControls")
const allColordivs =  document.querySelectorAll('colorLevel')
const colorInput = document.getElementById('colorInput');

const levels = splitLevels()

let selectedColor = '000'
let chosenLevel = ''

function handleClick(e) {
    if (chosenLevel.length) {
        const prev = document.getElementById(chosenLevel);
        if (prev) {
            prev.classList.remove('chosenLevel');
        }
    }
    console.log(levels)
    chosenLevel = e.currentTarget.id;
    colorInput.style.opacity = 1;
    e.currentTarget.classList.add('chosenLevel');
}

function handleColorInput(e){
    selectedColor = e.target.value;
    document.getElementById(chosenLevel).style.backgroundColor = selectedColor;
    console.log(chosenLevel.split('_')[1])
    changeLevelColor(chosenLevel.split('_')[1])
}

function changeLevelColor(index){
    levels[index].forEach((node)=>{
        console.log(node)
        console.log(node.nodeId)
      
        document.getElementById(node.nodeId).style.boxShadow = `inset 0px -10px ${selectedColor}`
        
    })
}
colorInput.addEventListener('change',handleColorInput)

function createDivs(){
    levels.forEach((level,index)=>{
        let newLevelColor = document.createElement('div');
        newLevelColor.addEventListener('click',handleClick);
        newLevelColor.id = `level_${index}`
        newLevelColor.innerHTML = `<p>Level ${index}</p>`
        newLevelColor.classList.add('colorLevel')
        colorControls.appendChild(newLevelColor)
    })
}
function main(){
    createDivs()
}
main()

window.addEventListener('updatedChains',createDivs)




