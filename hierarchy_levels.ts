interface hier{
    nodeName:String,
    parentName:String,
    children:hier[]
}

interface Tree{
    level:hier[]
}

// The index of the list shows whcih level it is in 
var tree:hier[][]=[
    [
        {nodeName:"root",parentName:"root",children:[]},

    ],
    [
        {nodeName:"root",parentName:"root",children:[]},

    ]

]


function getLevel(level:number,tree:hier[][]):hier[]{
    
    return tree[level]

}
