const API_BASE_URL = "https://pokeapi.co/api/v2/pokemon/";

let firstCard = null;
let secondCard = null;
let canClick = true;
let clicks = 0;
let pairsMatched = 0;
let gameInterval;
let gameTime = 0;

const fetchPokemon = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}${id}`);
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      image: data.sprites.front_default,
    };
  } catch (error) {
    console.error(error);
  }
};

const getPokemonPairs = async (count) => {
  const pokemonPromises = [];
  for (let i = 1; i <= count / 2; i++) {
    pokemonPromises.push(fetchPokemon(i));
  }
  const pokemons = await Promise.all(pokemonPromises);
  return [...pokemons, ...pokemons];
};

const createCard = (pokemon) => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <div class="card_inner">
      <div class="card_face front">
        <img src="${pokemon.image}" alt="${pokemon.name}" />
      </div>
      <div class="card_face back"></div>
    </div>
  `;
  return card;
};

const setupCards = async (count) => {
  const gameGrid = document.getElementById("game_grid");
  gameGrid.innerHTML = "";

  const adjustedCount = count % 2 === 0 ? count : count + 1; // Ensure an even number of cards
  const numberOfPairs = adjustedCount / 2;

  const totalPairsElement = document.getElementById("total-pairs");
  totalPairsElement.textContent = `Total Pairs: ${numberOfPairs}`;


  let pairsLeft = numberOfPairs;

  const pairsLeftElement = document.getElementById("pairs-left");
  pairsLeftElement.textContent = `Pairs Left: ${pairsLeft}`;

  const pokemonPairs = await getPokemonPairs(adjustedCount);
  const shuffledPairs = pokemonPairs.sort(() => 0.5 - Math.random());
  shuffledPairs.forEach((pokemon) => {
    const card = createCard(pokemon);
    gameGrid.appendChild(card);
  });

};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const startGame = () => {
  const difficulty = parseInt(document.getElementById("difficulty").value);
  const timeGiven = difficulty * 2; // Time given in seconds based on difficulty (e.g., 6 cards = 12 seconds)
  
  setupCards(difficulty);
  clicks = 0;
  pairsMatched = 0;
  gameTime = 0;
  document.getElementById("clicks").innerText = clicks;
  document.getElementById("matched").innerText = pairsMatched;
  document.getElementById("timerGiven").innerText = formatTime(timeGiven); // Timer for time given
  document.getElementById("timerPassed").innerText = "00:00"; // Timer for time passed
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    gameTime++;
    const timeElapsed = formatTime(gameTime);
    document.getElementById("timerPassed").innerText = timeElapsed; // Update the timer for time passed
    if (gameTime === timeGiven) {
      clearInterval(gameInterval);
      // Game over logic here
    }
  }, 1000);
  updatePairsLeft();
};
const updatePairsLeft = () => {
  const pairsLeft = parseInt(document.getElementById("total-pairs").textContent.split(" ")[2]) - pairsMatched;
  const pairsLeftElement = document.getElementById("pairs-left");
  pairsLeftElement.textContent = `Pairs Left: ${pairsLeft}`;
};


const revealAllCards = () => {
  const allCards = document.querySelectorAll(".card");

  allCards.forEach((card) => {
    card.classList.add("flip");
  });

  setTimeout(() => {
    allCards.forEach((card) => {
      card.classList.remove("flip");
    });
  }, 2000); // Hide the cards after 2 seconds
};

document.getElementById("power-up").addEventListener("click", revealAllCards);
document.getElementById("start").addEventListener("click", startGame);
document.getElementById("reset").addEventListener("click", startGame);
document.getElementById("difficulty").addEventListener("change", startGame);
// ... rest of your JavaScript ...

document.getElementById("theme").addEventListener("change", () => {
  const theme = document.getElementById("theme").value;
  const root = document.documentElement;

  if (theme === "dark") {
    root.style.setProperty("--background-color", "#333");
    root.style.setProperty("--header-background-color", "#444");
    root.style.setProperty("--text-color", "#f0f0f0");
    root.style.setProperty("--border-color", "#666");
  } else {
    root.style.setProperty("--background-color", "#ffffff");
    root.style.setProperty("--header-background-color", "#f0f0f0");
    root.style.setProperty("--text-color", "#000000");
    root.style.setProperty("--border-color", "#ccc");
  }
});


document.getElementById("play-again").addEventListener("click", () => {
  document.getElementById("winning-message").classList.add("hidden");
  startGame();
});

document.addEventListener("click", (event) => {
  if (!canClick) return;
  const card = event.target.closest(".card");
  if (!card || card.classList.contains("matched") || card === firstCard) return;
  card.classList.add("flip");

     if (!firstCard) {
      firstCard = card;
    } else {
      secondCard = card;
      canClick = false;
      clicks++;
      document.getElementById("clicks").innerText = clicks;

      if (firstCard.innerHTML === secondCard.innerHTML) {
        pairsMatched++;
        document.getElementById("matched").innerText = pairsMatched;
        updatePairsLeft(); // Add this line
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        firstCard = null;
        secondCard = null;
        canClick = true;

        if (pairsMatched === parseInt(document.getElementById("difficulty").value) / 2) {
          clearInterval(gameInterval);
          document.getElementById("winning-message").classList.remove("hidden");
        }
      } else {
        setTimeout(() => {
          firstCard.classList.remove("flip");
          secondCard.classList.remove("flip");

          firstCard = null;
          secondCard = null;
          canClick = true;
        }, 1000);
      }
    }
});

startGame();


