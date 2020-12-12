"use strict";

// width and height in cells
const FIELD_WIDTH = 30;
const FIELD_HEIGHT = 30;
const CELL_SIZE = 15;

let intervalGameHandler;

class Field {
    constructor(canvasId, scoreId) {
        let _this = this;
        _this.canvas = document.getElementById(canvasId);
        _this.canvas.height = FIELD_HEIGHT * CELL_SIZE;
        _this.canvas.width = FIELD_WIDTH * CELL_SIZE;
        _this.context = _this.canvas.getContext('2d');
        _this.width = FIELD_WIDTH;
        _this.height = FIELD_HEIGHT;
        _this.cell_size = CELL_SIZE;
        _this.scoreElement = document.getElementById(scoreId);
    }

    updateScore() {
        let score = parseInt(this.scoreElement.innerText);
        this.scoreElement.innerText = ++score;
    }

    render() {
        this.context.save();
        this.context.beginPath();
        for (let i = 0; i < this.width; i++) {
            this.context.moveTo(i * this.cell_size, 0);
            this.context.lineTo(i * this.cell_size, this.height * this.cell_size);
        }
        this.context.stroke();

        this.context.beginPath();
        for (let i = 0; i < this.height; i++) {
            this.context.moveTo(0, i * this.cell_size);
            this.context.lineTo(this.width * this.cell_size, i * this.cell_size);
        }
        this.context.stroke();
        this.context.restore();
    }

    clear() {
        this.context.clearRect(0, 0, this.width * this.cell_size, this.height * this.cell_size)
    }

    /**
     * Вывод змейки
     *
     * @param snakeCoords Point[]
     */
    renderSnake(snakeCoords) {
        this.context.fillStyle = "rgb(0,0,0)";
        for (let point of snakeCoords) {
            let x = point.x * this.cell_size;
            let y = point.y * this.cell_size;
            this.context.fillRect(x, y, this.cell_size, this.cell_size);
        }
    }

    /**
     * Вывод кролика на поле
     *
     * @param rabbitCoords Point
     */
    renderRabbit(rabbitCoords) {
        this.context.fillStyle = "rgba(0,200,0,0.8)";
        this.context.fillRect(rabbitCoords.x * this.cell_size, rabbitCoords.y * this.cell_size, this.cell_size, this.cell_size);
    }
}

class Keyboard {
    #_dX = 0;
    #_dY = 0;
    #_stopGame = false;

    constructor() {
        let _this = this;
        window.addEventListener('keydown', function (event) {
            switch (event.code) {
                case 'KeyW':
                    _this.#_dY = -1;
                    _this.#_dX = 0;
                    break;
                case 'KeyS':
                    _this.#_dY = 1;
                    _this.#_dX = 0;
                    break;
                case 'KeyA':
                    _this.#_dX = -1;
                    _this.#_dY = 0;
                    break;
                case 'KeyD':
                    _this.#_dX = 1;
                    _this.#_dY = 0;
                    break;
                case 'Escape':
                    _this.#_stopGame = true;
            }
        })
    }

    get isStopGame() {
        return this.#_stopGame
    };

    get dY() {
        return this.#_dY;
    }

    get dX() {
        return this.#_dX;
    }
}

class Rabbit {
    /**
     * @var Point
     */
    #_coords;

    constructor() {
        this.#_coords = null;
    }

    get coords() {
        return this.#_coords;
    }

    /**
     * @param snakeCoords Point[]
     */
    createNew(snakeCoords) {
        // создаем массив всех ячеек
        let fieldCells = [];
        for (let i = 0; i < FIELD_WIDTH; i++) {
            for (let j = 0; j < FIELD_HEIGHT; j++) {
                fieldCells.push(new Point(i, j));
            }
        }

        // вычтем координаты ячеек змейки
        let freeCells = fieldCells.filter(
            cell => snakeCoords.filter(
                snakeCell => snakeCell.isEquals(cell)
            ).length === 0
        );

        // теперь выберем ячейку в пределах свободной
        let randomIndex = getRandomInteger(0, freeCells.length);
        this.#_coords = freeCells[randomIndex];
    }

    /**
     * Существует ли кролик?
     * @return {boolean}
     */
    isRabbitCreated() {
        return !!this.#_coords;
    }

    /**
     * Уничтожаем кролика
     */
    destroyRabbit() {
        this.#_coords = null;
    }
}

class Snake {
    /**
     * @var Point[]
     */
    #_coords;

    constructor() {
        // поместим змейку в ЛЮБУЮ ячейку
        this.#_coords = [
            new Point(getRandomInteger(0, FIELD_WIDTH), getRandomInteger(0, FIELD_HEIGHT))
        ];
    }

    get coords() {
        return this.#_coords;
    }

    /**
     * Вычисляем новое положение головы змейки
     *
     * @param keyboard Keyboard
     * @param rabbit Rabbit
     * @throws Error
     */
    updateHeadPosition(keyboard, rabbit) {
        // достанем "голову" (всегда ячейка с индексом 0)
        let head = this.#_coords[0];

        // вычислим новые координаты
        let newHeadCoords = new Point(head.x + keyboard.dX, head.y + keyboard.dY);

        // проверка вылезания за пределы поля
        newHeadCoords = this.checkAndCorrectIfHeadOutOfField(newHeadCoords);

        // проверка, что змейка на себя не наехала. пока игра не началась - смещений нет
        if (!(keyboard.dX === 0 && keyboard.dY === 0) && this.checkIfSnakeTouchItSelf(newHeadCoords)) {
            throw Error('Змейка попала в себя!');
        }

        // поместим в массив тела змейки
        this.#_coords.unshift(newHeadCoords);

        // проверим попадание в кролика
        if (!(keyboard.dX === 0 && keyboard.dY === 0) && newHeadCoords.isEquals(rabbit.coords)) {
            // попали - змейка вырастет
            rabbit.destroyRabbit();
        } else {
            // не попали - хвост подожмем
            this.#_coords.pop();
        }
    }

    /**
     * Проверка вылезания головы за пределы поля и возврат ее на поле
     *
     * @param head
     * @return {*}
     */
    checkAndCorrectIfHeadOutOfField(head) {
        if (head.x < 0) head.x = FIELD_WIDTH - 1;
        if (head.x >= FIELD_WIDTH) head.x = 0;
        if (head.y < 0) head.y = FIELD_HEIGHT - 1;
        if (head.y >= FIELD_HEIGHT) head.y = 0;
        return head;
    }

    /**
     * Проверка, что змейка не попала в себя
     *
     * @param head
     * @return {boolean}
     */
    checkIfSnakeTouchItSelf(head) {
        return this.#_coords.filter(
            snakeCell => head.isEquals(snakeCell)
        ).length > 0;
    }
}

class Point {
    /**
     * @var integer
     */
    #_x;

    /**
     * @var integer
     */
    #_y;

    constructor(x, y) {
        this.#_x = x;
        this.#_y = y;
    }

    get x() {
        return this.#_x;
    }

    set x(value) {
        this.#_x = value;
    }

    get y() {
        return this.#_y;
    }

    set y(value) {
        this.#_y = value;
    }

    /**
     * Сравнение двух точек
     *
     * @param obj Point
     * @return {boolean}
     */
    isEquals(obj) {
        if (obj.x !== this.x) return false;
        if (obj.y !== this.y) return false;
        return true;
    }
}

let field = new Field('canvas', 'score');
let keyboard = new Keyboard();
let snake = new Snake();
let rabbit = new Rabbit();

function startGame() {
    intervalGameHandler = setInterval(function () {
        try {
            field.clear();

            snake.updateHeadPosition(keyboard, rabbit);
            field.renderSnake(snake.coords);

            if (!rabbit.isRabbitCreated()) {
                field.updateScore();
                rabbit.createNew(snake.coords);
            }
            field.renderRabbit(rabbit.coords);

            // не требуется ли остановить игру?
            if (keyboard.isStopGame) {
                throw Error('Игра остановлена!');
            }
        } catch (e) {
            clearInterval(intervalGameHandler);
            alert(e.message);
        }
    }, 100);
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
