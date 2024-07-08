function startGame() {
  const form = document.getElementById("form");
  const input = document.getElementById("form__input");
  const btnStart = document.querySelector(".form__btn");
  const btnRestart = document.querySelector(".restart__btn");
  const timer = document.querySelector(".timer-container");
  let timerInterval;
  let openCardsCount = 0; // Сохраняем переменные в области видимости
  let numberOfCards;

  // Обработчик для кнопки "Начать игру"
  async function startGameHandler() {
    numberOfCards = parseInt(input.value, 10);

    // Проверка на четное количество карт и допустимое значение
    if (isNaN(numberOfCards) || numberOfCards % 2 !== 0 || numberOfCards < 2 || numberOfCards > 10) {
      alert("Введите четное число от 2 до 10!");
      return;
    }

    form.remove();
    // Показываем кнопку "Начать заново" и контейнер для таймера
    btnRestart.style.visibility = "visible";
    timer.style.visibility = "visible";

    await createSquares(numberOfCards); // Создаем карточки асинхронно
    timerForPlay(); // Вызываем функцию для запуска таймера
    RestartGame();
  }

  btnStart.addEventListener("click", startGameHandler);

  // Обработчик для нажатия клавиши Enter на элементе ввода
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startGameHandler();
    }
  });

  async function createSquares(numberOfCards) {
    const container = document.createElement("div");
    const cardsWrapper = document.createElement("ul");
    cardsWrapper.classList.add("cards-wrapper");

    const pairedNumbers = generateShuffledPairedNumbers(numberOfCards * numberOfCards);

    // Создаем квадратную сетку карточек
    for (let i = 0; i < numberOfCards; ++i) {
      const row = document.createElement("li");
      row.classList.add("row");

      for (let j = 0; j < numberOfCards; ++j) {
        let card = document.createElement("div");
        card.classList.add("card");
        card.classList.add("back"); // Изначально скрываем число
        row.appendChild(card);
      }

      cardsWrapper.appendChild(row);
    }

    container.appendChild(cardsWrapper);
    document.body.appendChild(container);

    const cards = document.querySelectorAll(".card");
    addCardClickHandlers(cards, pairedNumbers);
  }

  // Функция для обработки кликов по карточкам
  function addCardClickHandlers(cards, pairedNumbers) {
    let openCards = []; // Массив для хранения открытых карточек
    let isAnimating = false; // Флаг, указывающий на анимацию закрытия карточек

    function toggleCard(card, randomNumber) {
      card.classList.toggle("front");
      card.classList.toggle("back");

      if (card.classList.contains("back")) {
        card.textContent = ""; // Скрыть число
      } else {
        card.textContent = randomNumber; // Показать число
      }
    }

    cards.forEach((clickCard, index) => {
      clickCard.addEventListener("click", () => {
        // Если карточка уже открыта или анимация закрытия активна, прерываем обработку
        if (clickCard.classList.contains("front") || isAnimating) {
          return;
        }

        const randomNumber = pairedNumbers[index]; // Получаем число из массива
        toggleCard(clickCard, randomNumber);

        openCards.push({ card: clickCard, value: randomNumber }); // Добавляем открытую карточку в массив

        // Если открыто две карточки, проводим сравнение и закрываем их
        if (openCards.length === 2) {
          const [firstCard, secondCard] = openCards;

          if (firstCard.value !== secondCard.value) {
            isAnimating = true; // Устанавливаем флаг анимации закрытия
            setTimeout(() => {
              toggleCard(firstCard.card, firstCard.value);
              toggleCard(secondCard.card, secondCard.value);
              openCards = []; // Очищаем массив открытых карточек
              isAnimating = false; // Снимаем флаг анимации закрытия
            }, 1000); // Ждем 1 секунду перед закрытием
          } else {
            // Увеличиваем счетчик открытых карточек
            openCardsCount += 2;
            // console.log(openCardsCount);
            openCards = []; // Очищаем массив открытых карточек
            if (openCardsCount === numberOfCards * numberOfCards) {
              // Открываем последнюю карточку и вызываем endGame() после открытия
              setTimeout(() => {
                endGame();
                openCardsCount = 0;
              }, 300);
            }
          }
        }
      });
    });
  }

  function timerForPlay() {
    const INITIAL_TIME = 60; // Начальное значение таймера (в секундах)
    let time = INITIAL_TIME;
    const timerElement = document.getElementById("timer");

    // Обновление отображения таймера
    function updateTimer() {
      timerElement.textContent = time;
    }

    // Запуск таймера
    timerInterval = setInterval(() => {
      // Если время закончилось, останавливаем таймер
      if (time <= 0) {
        clearInterval(timerInterval);
        showGameOverModal();
      } else {
        // Уменьшение времени на 1 секунду
        time--;
        // Обновление значения таймера
        updateTimer();
      }
    }, 1000); // Обновляем каждую секунду
    // Обновляем таймер сразу после запуска
    updateTimer();
  }

  // Функция для генерации массива парных чисел
  function ArrayPairedNumbers(length) {
    let arrPairedNum = [];
    let num = 0;

    for (let i = 0; i < length / 2; ++i) {
      num++;
      arrPairedNum.push(num);
      arrPairedNum.push(num);
    }

    return arrPairedNum;
  }

  // Функция для перемешивания массива
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Генерируем случайный индекс
      if (i !== j) {
        [array[i], array[j]] = [array[j], array[i]]; // Обмениваем элементы
      }
    }
    return array;
  }

  // Функция для генерации перемешанных парных чисел
  function generateShuffledPairedNumbers(length) {
    const pairedNumbers = ArrayPairedNumbers(length); // Генерируем массив парных чисел
    return shuffleArray(pairedNumbers); // Перемешиваем массив
  }

  function showGameOverModal() {
    const myModal = new bootstrap.Modal(document.querySelector(".modal"));
    const modalText = document.querySelector(".modal-text");

    if (openCardsCount === numberOfCards * numberOfCards) {
      modalText.textContent = "Вы победили!";
    } else {
      modalText.textContent = "Вы проиграли!";
    }

    const modalBtnRestart = document.querySelector(".modal-btn"); // Получаем кнопку "Начать сначала" в модальном окне
    modalBtnRestart.addEventListener("click", () => {
      clearInterval(timerInterval); // Очищаем таймер
      const cardsContainer = document.querySelector(".cards-wrapper");
      if (cardsContainer) {
        cardsContainer.remove(); // Удаляем контейнер с карточками
      }
      document.body.appendChild(form); // Возвращаем форму на место
      btnRestart.style.visibility = "hidden"; // Скрываем кнопку "Начать заново"
      timer.style.visibility = "hidden"; // Скрываем контейнер для таймера
      myModal.hide(); // Скрываем модальное окно
    });

    myModal.show();
  }

  function RestartGame() {
    btnRestart.addEventListener("click", () => {
      const cardsContainer = document.querySelector(".cards-wrapper");
      clearInterval(timerInterval); // Очищаем предыдущий таймер, если он был запущен

      if (cardsContainer) {
        cardsContainer.remove();
      }

      // Возвращаем форму на место
      document.body.appendChild(form);
      // Скрываем кнопку "Начать заново" и контейнер для таймера
      btnRestart.style.visibility = "hidden";
      timer.style.visibility = "hidden";
    });
  }

  function endGame() {
    clearInterval(timerInterval);
    showGameOverModal();
  }
}

startGame();
