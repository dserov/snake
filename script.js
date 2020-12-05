"use strict";

const FIELD_WIDTH = 50;
const FIELD_HEIGHT = 50;
const CELL_SIZE = 20;

let canvas = document.getElementById('canvas');
// canvas.style.height = FIELD_HEIGHT * CELL_SIZE;
// canvas.style.width = FIELD_WIDTH * CELL_SIZE;
let context = canvas.getContext('2d');

class Field {
    constructor(w, h, c) {
        this.width = w * c;
        this.height = h * c;
        this.cell_size = c;
    }

    Render() {
        this.context = context;
        this.context.save();
        this.context.beginPath();
        for (let i = 0; i < this.width; i += this.cell_size) {
            this.context.moveTo(i, 0);
            this.context.lineTo(i, this.height);
        }
        this.context.stroke();
        this.context.restore();
        this.context = context;
        this.context.save();
        this.context.beginPath();
        for (let i = 0; i < this.height; i += this.cell_size) {
            this.context.moveTo(0, i);
            this.context.lineTo(this.width, i);
        }
        this.context.stroke();
        this.context.restore();
    }
}

let field = new Field(FIELD_WIDTH, FIELD_HEIGHT, CELL_SIZE);


field.Render();