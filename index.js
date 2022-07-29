// const { appendFile } = require("fs");

const socket = io("https://card-game-s.herokuapp.com");
const suffleCard = document.querySelectorAll(".card-suffle-img");
const suffleCardContainer = document.querySelector(".card-suffle");
const ACard = document.getElementById("a-card");
const card1 = suffleCard[0];
const card2 = suffleCard[1];
const card3 = suffleCard[2];
const card4 = suffleCard[3];
const randomPosition = 100;
const users = {};
let isUsedJoined = false;
let playerName = "";

// socket defined
socket.on("connect", () => {
  var username = window.prompt("Enter you name");
  if (username == "" || username == null) {
    document.getElementById("self").innerText = "";
  } else {
    document.getElementById("self").innerText = "You(" + username + ")";
  }

  // user joined
  users[socket.id] = username;
  playerName = username;
  socket.emit("user-joined", username);
  socket.on("new-user-joined", (name) => {
    isUsedJoined = true;
    append(name);
  });

  // start suffling both the side
  socket.on("states", (state) => {
    if (state) {
      startfuffling();
    }
  });

  // get card fliping state from server
  socket.on("fliped-success", (args) => {
    const { id, state } = args;
    var card = document.getElementById(id);
    if (state && isUsedJoined) {
      flipAnimation(card, socket);
    }
  });

  // reload boradcasting
  socket.on("reload-success", (args) => {
    if (args) {
      document.getElementById("message").innerText =  "";
      suffleCard.forEach((card) => {
        card.children[1].style.transform = "rotateY(0deg)";
         card.children[1].style.transition = "none";
      });
    }
  });

  // set card as same on current client browser
  socket.on("randomize-success", (args) => {
    var pos = args;
    setRandomizedCard(pos);
  });
  
  socket.on('winOrLoss' , players => {
    if(players.state == 'won') {
      document.getElementById("message").innerText = players.name + "has Won the game!";
    }
    else{
      document.getElementById("message").innerText = players.name + " has Lost the game!";
    }
  });
});

function setCardToRandomPosition() {
  var randomNumber = Math.max(0, Math.floor(Math.random() * 3));
  // emit random number for boradcasting
  socket.emit("set-random", randomNumber);
  setRandomizedCard(randomNumber);
}

function setRandomizedCard(randomNumber) {
  if (card1.getAttribute("style")) {
    card1.removeAttribute("style");
  }

  if (card2.getAttribute("style")) {
    card2.removeAttribute("style");
  }

  if (card3.getAttribute("style")) {
    card3.removeAttribute("style");
  }

  if (card4.getAttribute("style")) {
    card4.removeAttribute("style");
  }

  switch (randomNumber) {
    case 0: {
      card1.style.order = "1";
      card2.style.order = "2";
      card3.style.order = "3";
      card4.style.order = "0";
      break;
    }
    case 1: {
      card1.style.order = "2";
      card2.style.order = "0";
      card3.style.order = "3";
      card4.style.order = "1";
      break;
    }
    case 2: {
      card1.style.order = "3";
      card2.style.order = "0";
      card3.style.order = "1";
      card4.style.order = "2";
      break;
    }
    case 3: {
      card1.style.order = "0";
      card2.style.order = "3";
      card3.style.order = "4";
      card4.style.order = "1";
      break;
    }
  }
}



function flipAnimation(card) {
  var secondChild = card.children[1];
  secondChild.style.transform = "rotateY(90deg)";
  secondChild.style.transition = "transform .5s ease";
  

  if (card.getAttribute("id") == ACard.getAttribute("id")) {
    document.getElementById("message").innerText =  "you Won!";
  } else {
    document.getElementById("message").innerText =  "you Loss!";
  }
  // after 1000 - 1sec auto fliped
  suffleCard.forEach((card) => {
    setTimeout(function () {
      card.children[1].style.transform = "rotateY(90deg)";
      card.children[1].style.transition = "transform .5s ease";
    }, 1000);
  });
}


let emitOnce = true;
suffleCard.forEach((card) => {
  card.children[1].addEventListener("click", function (e) {
    if (emitOnce) {
       socket.emit("flip", { id: card.getAttribute("id"), state: true });
      // emit users 
       socket.emit('player' , {name : users[socket.id]});
       emitOnce = false;
    }
    // auto flip animation
    flipAnimation(card);
  });
});

// reset browser
function reset() {
  socket.emit("reset", true);
  document.getElementById("message").innerText =  "";
  suffleCard.forEach((card) => {
      card.children[1].style.transform = "rotateY(0deg)";
     card.children[1].style.transition = "none";
  });
}

// start suffling defination
function startfuffling() {
  var count = 0,
    interval;

  if (suffleCardContainer.classList.contains("scale-up")) {
    suffleCardContainer.classList.remove("scale-up");
  }
  suffleCardContainer.classList.add("scale-down");

  //  interval intialized
  interval = setInterval(() => {
    if (count == 4) {
      clearInterval(interval);
      suffleCardContainer.classList.add("scale-up");
      suffleCardContainer.classList.remove("scale-down");
      setCardToRandomPosition();
    }

    // card Animation
    AnimateCard();
    count++;
  }, 1000);
}

function suffleStart() {
  startfuffling();
  // set state to server
  socket.emit("start", true);
}

document.getElementById("suffle-btn").addEventListener("click", suffleStart);
document.getElementById("reset-btn").addEventListener("click", reset);

function AnimateCard() {
  card1.animate(
    [
      {
        transform: "translate(0px)",
        zIndex: 2,
      },
      {
        transform: "translate(300px)",
        zIndex: -1,
      },
    ],
    {
      duration: 400,
    }
  );

  card2.animate(
    [
      {
        transform: "translate(-100px)",
        zIndex: 2,
      },
      {
        zIndex: -1,
        transform: "translate(0px)",
      },
      {
        zIndex: 2,
        transform: "translate(100px)",
      },
    ],
    {
      duration: 200,
    }
  );

  card3.animate(
    [
      {
        transform: "translate(-100px)",
        zIndex : -1,
      },
      {
        zIndex : 2,
        transform: "translate(0px)",
      },
      {
        zIndex : -1,
        transform: "translate(100px)",
      },
    ],
    {
      duration: 200,
    }
  );

  card4.animate(
    [
      {
        transform: "translate(0px)",
      },
      {
        transform: "translate(-300px)",
      },
    ],
    {
      duration: 400,
    }
  );
}

function append(name) {
  var li = document.createElement("li");
  if (name != null) {
    li.innerText = name;
  }
  document.querySelector(".left ul").append(li);
}
