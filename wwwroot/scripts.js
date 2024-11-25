// Establish a WebSocket connection
const socket = new WebSocket("ws://"+ location.host +"/ws");

// Event listener for when the connection opens
socket.addEventListener("open", () => {
    console.log("Connected to WebSocket server");
    socket.send("Hello"); 
    
});
let myCode;
// Event listener for receiving messages from the server
socket.addEventListener("message", (event) => {
    console.log(event.data);
    if(event.data=="Reg"){
    const length =8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    myCode=result;
    document.getElementById("mycode").innerText=result;
    console.log(result);
    socket.send("RegisterId : "+result) 
    }
    
    else if (event.data=="Verified id"){
        document.getElementById("status").innerText="Player verified... you can start your game. It's your turn . Your piece is RED ";
        turn = true;
        myPiece='red-piece'
        var id  = document.getElementById("Code").value;
        console.log(id)
        localStorage.setItem("OppId",id);
    }
    else if (event.data.startsWith("ConnectedWithId")){
        var id  = event.data.split(" ")[1];
        document.getElementById("status").innerText="Connected with id : "+id;
        myPiece='black-piece'
        localStorage.setItem("OppId",id);
    }
    else if (event.data.startsWith("Update : ")){
        var Update = event.data.substring(9);
        Update=JSON.parse(Update);
        MovePiece(`r${Update.movement.prevRow}c${Update.movement.prevCol}`,Update.movement)
        if(Update.CapturedPiece!==null)
        CapturePiece(Update.CapturedPiece)
        
        document.getElementById("status").innerText="It's your turn... 👍";
        turn=true;
    }
});
// get the piece from id
// remove the piece from parent element
// add the piece to the new position
// check if it's a king piece
function  MovePiece(SquarePieceId,movement){
    
    const originalSquare=document.getElementById(SquarePieceId)
    const selectedPiece= originalSquare.childNodes[0];
    const pieceType=selectedPiece.classList.contains('red-piece')?'R':'B';
    originalSquare.removeChild(selectedPiece);
    boardState[movement.prevRow][movement.prevCol]=null;

    const targetSquare = document.getElementById(`r${movement.newRow}c${movement.newCol}`);
    targetSquare.appendChild(selectedPiece);
    boardState[movement.newRow][movement.newCol]=pieceType;

    if((pieceType=='R'&&movement.newRow==7)||(pieceType=='B'&&movement.newRow==0))
    selectedPiece.classList.add("king-piece")

    clearHighlights()
}

// get the captured box
// remove the piece from box
// mark the position of board state position as null;

function CapturePiece(CapturedPieceDim){
    const box=document.getElementById(`r${CapturedPieceDim.r}c${CapturedPieceDim.c}`)
    const piece=box.childNodes[0];
    box.removeChild(piece);
    boardState[CapturedPieceDim.r][CapturedPieceDim.c]=null;
}

// Event listener for errors
socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
});

// Event listener for connection close
socket.addEventListener("close", (event) => {
    console.log("WebSocket closed. Code:", event.code, "Reason:", event.reason);
});






// Board initialization
const board = document.getElementById('board');
const squares = [];
const boardState = [
    [null, 'R', null, 'R', null, 'R', null, 'R'],
    ['R', null, 'R', null, 'R', null, 'R', null],
    [null, 'R', null, 'R', null, 'R', null, 'R'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['B', null, 'B', null, 'B', null, 'B', null],
    [null, 'B', null, 'B', null, 'B', null, 'B'],
    ['B', null, 'B', null, 'B', null, 'B', null]
];

let turn = false;
let myPiece=null;
let selectedSquareIndex=null;
// Create the board visually and place pieces based on boardState
function createBoard() {
   
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
            square.id=`r${row}c${col}`;
            board.appendChild(square);
            squares.push(square);

            // Place pieces based on boardState
            if (boardState[row][col] === 'R') {
                const piece = document.createElement('div');
                piece.classList.add('piece', 'red-piece');
                square.appendChild(piece);
            } else if (boardState[row][col] === 'B') {
                const piece = document.createElement('div');
                piece.classList.add('piece', 'black-piece');
                square.appendChild(piece);
            }            
        }
    }
}

// Function to track pieces on click
function addPieceListeners() {
    const pieces = document.querySelectorAll('.piece');
    let selectedPiece = null;
   

    pieces.forEach((piece, index) => {
        piece.addEventListener('click', () => {

            clearHighlights()
            // Deselect the previous piece
            if (selectedPiece) {
                selectedPiece.classList.remove('selected');
            }

            // Select the clicked piece
            selectedPiece = piece;
            selectedPiece.classList.add('selected');
            selectedSquareIndex = index;
            let id=selectedPiece.parentElement.id;
           
            // eg r4c5
            //    0123
            let row = parseInt(id[1]);
            let col = parseInt(id[3]);
            if(turn && selectedPiece.classList.contains(myPiece))
            highlightMoves(row, col, boardState[row][col]);
        });
    });
}

function addSquareListeners() {
    squares.forEach(square => {
        square.addEventListener('click', () => {
            const row = parseInt(square.id[1]); // Extract row from ID
            const col = parseInt(square.id[3]); // Extract column from ID
            const selectedPiece=document.getElementsByClassName(`selected`)[0]
            if((square.classList.contains("highlight") || square.classList.contains("highlight-red"))
            && (square.id[1]==0 || square.id[1]==7)){
               selectedPiece.classList.add("king-piece");
           }
            // Check if this square is highlighted
            if (square.classList.contains('highlight')) {
                
                // Update the DOM: Remove the piece from its original position                
                const originalSquare = selectedPiece.parentElement;
                const selectedRow=parseInt(originalSquare.id[1]);
                const selectedCol=parseInt(originalSquare.id[3]);
                originalSquare.removeChild(selectedPiece);

                // Append the piece to the new square
                square.appendChild(selectedPiece);

                // Update the boardState array
                boardState[selectedRow][selectedCol] = null;  // Clear the original position
                boardState[row][col] = selectedPiece.classList.contains('red-piece') ? 'R' : 'B';  // Update the new position
               
                const Update ={
                    oppid:localStorage.getItem("OppId"),
                    CapturedPiece :null,
                    movement:{
                        prevRow:selectedRow,
                        prevCol:selectedCol,
                        newRow:row,
                        newCol:col
                    }
                }
                
                socket.send("Update : "+JSON.stringify(Update));
                //  Update the turn
                turn =  false;
                document.getElementById("status").innerText="Friend's turn 🤞🏻"
                //console.log(turn)

                // Clear highlights and reset the selected piece                
                selectedPiece.classList.remove('selected');                
                clearHighlights();
            }

            // if the red square is clicked
            // get the position of the selected piece
            // get the position of the piece to be captured
            // mark the position of the selected piece as null , and detach itself from its parent
            // append the selected piece to the clicked square
            // detach the captured piece from its parent 
            // mark the captured piec poistion as null

            else if(square.classList.contains('highlight-red')){
                
                const prevTile=selectedPiece.parentElement;
                const prevRow=parseInt(prevTile.id[1]);
                const prevCol=parseInt(prevTile.id[3]);

                // get the postion of the piece to be captured
                const CapturedPieceDim={
                    r:prevRow-row > 0 ? prevRow-1 : prevRow+1,
                    c:prevCol-col > 0 ? prevCol-1 : prevCol+1
                }
                // detach the captured piece from its parent and mark its position as null
                const CapturedTile=document.getElementById(`r${CapturedPieceDim.r}c${CapturedPieceDim.c}`);
                const CapturedPiece=CapturedTile.getElementsByClassName("piece")[0];
                CapturedTile.removeChild(CapturedPiece);
                boardState[CapturedPieceDim.r][CapturedPieceDim.c]=null;
                // append the selected piece to the clicked square
                prevTile.removeChild(selectedPiece);
                boardState[prevRow][prevCol]=null;
                square.appendChild(selectedPiece);
                boardState[row][col]=selectedPiece.classList.contains('red-piece')?'R':'B'

                // send the message to the opponent
                // info to be sent : 
                // opponent id
                // captured piece
                // movement of the piece

                const Update ={
                    oppid:localStorage.getItem("OppId"),
                    CapturedPiece :CapturedPieceDim,
                    movement:{
                        prevRow:prevRow,
                        prevCol:prevCol,
                        newRow:row,
                        newCol:col
                    }
                }
                document.getElementById("status").innerText="Friend's turn 🤞🏻"
                socket.send("Update : "+JSON.stringify(Update));

                //  Update the turn
                turn =  false;
                //console.log(turn)
                clearHighlights();
            }
            

           
        });
    });
}


// remove highlight class from all divs
function clearHighlights(){
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.classList.remove('highlight',"highlight-red");
    })
}

// this function highlights the potential moves a piece can make
//  it also highlights the square where the piece can capture an opponent's piece
// 1 clear any previous highlights
// 2 check the direction of the move
// 3 highlight the potential moves


function highlightMoves(row, col, pieceType) {
    clearHighlights(); // Remove any previous highlights
// Red pieces move downward, Black pieces move upward
const direction = pieceType === 'R' ? 1 : -1;
    
const potentialMoves = [
    { r: row + direction, c: col - 1 ,next :{r:row+2*direction,c: col-2}}, // Diagonal left
    { r: row + direction, c: col + 1 ,next :{r:row+2*direction,c: col+2}}  // Diagonal right
];
    if(document.getElementsByClassName("selected")[0]
    .classList.contains("king-piece")){
        potentialMoves.push({
            r: row+ direction*(-1),c:col-1,next :{r:row+2*direction*(-1),c: col-2}
        },{
            r: row+ direction*(-1),c:col+1,next :{r:row+2*direction*(-1),c: col+2}
        })
    }       
    potentialMoves.forEach(move => {
        if (move.r >= 0 && move.r < 8 && move.c >= 0 && move.c < 8) {
            if (boardState[move.r][move.c] === null) {
                const tile=document.getElementById(`r${move.r}c${move.c}`)
                tile.classList.add('highlight');
            }
            else if (move.next.r >= 0 && move.next.r < 8 && move.next.c >= 0 && move.next.c < 8 && boardState[move.r][move.c] != pieceType ){
                const r1=move.next.r
                const c1=move.next.c
               
                if (!boardState[r1][c1]) {
                    const tile=document.getElementById(`r${move.next.r}c${move.next.c}`)
                    tile.classList.add('highlight-red');
            }
        }
    }
    });

}


// Initialize the game
createBoard();
addPieceListeners();
addSquareListeners();


function addPlayer(){

    const id =document.getElementById("Code").value.trim();
    console.log(id)
    if(id != ''){
    
    socket.send("Verify : "+JSON.stringify({
        oppid:id,
        playerid:myCode
    }));
    }
    
}

// add the functionality to check the winner... below

