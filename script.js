"use strict";

// width and height in cells
const FIELD_WIDTH = 30;
const FIELD_HEIGHT = 30;
const CELL_SIZE = 15;

let intervalGameHandler;

class Field {
    /**
     * @var #_fullCellList Point[]
     */
    #_fullCellList;
    constructor(canvasId) {
        let _this = this;
        _this.canvas = document.getElementById(canvasId);
        _this.canvas.height = FIELD_HEIGHT * CELL_SIZE;
        _this.canvas.width = FIELD_WIDTH * CELL_SIZE;
        _this.context = _this.canvas.getContext('2d');
        _this.width = FIELD_WIDTH;
        _this.height = FIELD_HEIGHT;
        _this.cell_size = CELL_SIZE;
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
     *
     * @param snakeCoords Point[]
     */
    renderSnake(snakeCoords) {
        for (let point of snakeCoords) {
            let x = point.x * this.cell_size;
            let y = point.y * this.cell_size;
            this.context.fillRect(x, y, this.cell_size, this.cell_size);
        }
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
    #_position;

    constructor() {
        this.#_position = new Point();
    }

    get position() {
        return this.#_position;
    }

    set position(value) {
        this.#_position = value;
    }

    /**
     * @param snakeCoords Point[]
     */
    createNew(snakeCoords) {
        let new_coords = new Point(getRandomInteger(0, FIELD_WIDTH), getRandomInteger(0, FIELD_HEIGHT));

        // проверка, что не попали в змейку
        if (snakeCoords.indexOf(new_coords) !== -1) {

        }
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
     * @param dX integer
     * @param dY integer
     * @throws Error
     */
    updateHeadPosition(dX, dY) {
        // достанем "голову" (всегда ячейка с индексом 0)
        let head = this.#_coords[0];

        // вычислим новые координаты
        let newHeadCoords = new Point(head.x + dX, head.y + dY);

        // проверка вылезания за пределы поля
        newHeadCoords = this.checkAndCorrectIfHeadOutOfField(newHeadCoords);

        // проверка, что змейка на себя не наехала
        if (this.checkIfSnakeTouchItSelf(newHeadCoords)) {
            throw Error('Змейка попала в себя!');
        }

        // поместим в массив тела змейки
        this.#_coords.unshift(newHeadCoords);

        // проверим, что не попали в кролика

        // попали - змейка вырастет

        // не попали - хвост подожмем
        this.#_coords.pop();
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
        return (this.#_coords.indexOf(head) != -1);
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
}

let field = new Field('canvas');
let keyboard = new Keyboard();
let snake = new Snake();

field.render();


function startGame() {
    intervalGameHandler = setInterval(function () {
        try {
            field.clear();

            snake.updateHeadPosition(keyboard.dX, keyboard.dY);

            field.renderSnake(snake.coords);

            console.log('.');

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

