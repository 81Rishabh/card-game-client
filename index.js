// const { appendFile } = require("fs");

const socket = io("https://card-game-s.herokuapp.com");
const suffleCardContainer = document.querySelector(".card-suffle");
const ACard = document.getElementById("a-card");
const randomPosition = 100;
const users = {};
const suffleCard = document.querySelectorAll(".card-suffle-img");
let card1, card2, card3, card4;
let isUsedJoined = false;
let playerName = "";
card1 = suffleCard[0];
card2 = suffleCard[2];
card3 = suffleCard[2];
card4 = suffleCard[3];

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
      flipAnimation(card);
    }
  });

  // reload boradcasting
  socket.on("reload-success", (args) => {
    if (args) {
      document.getElementById("message").innerText = "";
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

  socket.on("winOrLoss", (players) => {
    console.log(players);
    if (players.state) {
      document.getElementById("message").innerText =
        players.name + "has Won the game!";
    } else {
      document.getElementById("message").innerText =
        players.name + " has Lost the game!";
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

let winOrLoss = false;

suffleCard.forEach((card) => {
  card.children[1].addEventListener("click", function (e) {
    flipAnimation(card);
    socket.emit("flip", { id: card.getAttribute("id"), state: true });
    // emit users
    socket.emit("player", { name: users[socket.id], state: winOrLoss });
    // auto flip animation
  });
});


function flipAnimation(card) {
  console.log(card);
  var secondChild = card.children[1];
  secondChild.style.transform = "rotateY(90deg)";
  secondChild.style.transition = "transform .5s ease";

  if (card.getAttribute("id") == ACard.getAttribute("id")) {
    document.getElementById("message").innerText = "you Won!";
    winOrLoss = true;
    console.log(winOrLoss);
  } else {
    document.getElementById("message").innerText = "you Loss!";
    winOrLoss = false;
  }
  // after 1000 - 1sec auto fliped
  suffleCard.forEach((cardItem) => {
    if (card != cardItem) {
      setTimeout(function () {
        cardItem.children[1].style.transform = "rotateY(90deg)";
        cardItem.children[1].style.transition = "transform .5s ease";
      }, 1000);
    }
  });
}

// reset browser
function reset() {
  socket.emit("reset", true);
  document.getElementById("message").innerText = "";
  suffleCard.forEach((card) => {
    card.children[1].style.transform = "rotateY(0deg)";
    card.children[1].style.transition = "none";
  });
  winOrLoss = false;
}

// start suffling defination
function startfuffling() {
  var count = 0,interval;

  if (suffleCardContainer.classList.contains("scale-up")) {
    suffleCardContainer.classList.remove("scale-up");
  }
  suffleCardContainer.classList.add("scale-down");

  // create fronDrop below on the suffling card
  let div = document.createElement("div");
  div.innerText = "Suffling....";
  div.classList.add("frontdrop");
  suffleCardContainer.append(div);

  //  interval intialized
  interval = setInterval(() => {
    if (count == 4) {
      clearInterval(interval);
      document.querySelector(".frontdrop").remove();
      suffleCardContainer.classList.add("scale-up");
      suffleCardContainer.classList.remove("scale-down");
      setCardToRandomPosition();
    }

    // card Animation
    div.innerText = count;
    AnimateCard();
    count++;
  }, 1000);
}

// start card suffling
function suffleStart() {
  startfuffling();
  // set state to server
  socket.emit("start", true);
}
// add addEventListener to button 
document.getElementById("suffle-btn").addEventListener("click", suffleStart);
document.getElementById("reset-btn").addEventListener("click", reset);

// animate card
function AnimateCard() {
  let transVal = "all .5s ease-in";
  card1.style.transition = transVal;
  card2.style.transition = transVal;
  card3.style.transition = transVal;
  card4.style.transition = transVal;
}

// append name to sidebar
function append(name) {
  var li = document.createElement("li");
  if (name != null) {
    li.innerText = name;
  }
  document.querySelector(".left ul").append(li);
}
