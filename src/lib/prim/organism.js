class MazeCanvas {
    constructor(width, height, canvasWidth, canvasHeight, foodCells, poisonCells, canvasId, soilColor, foodColor, poisonColor, organismStartX, organismStartY, birthRadius) {
        this.width = width;
        this.height = height;
        this.foodCells = foodCells;
        this.poisonCells = poisonCells;
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.soilColor = soilColor;
        this.foodColor = foodColor;
        this.poisonColor = poisonColor;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.rectWidth = Math.floor(this.canvasWidth / this.width);
        this.rectHeight = Math.floor(this.canvasHeight / this.height);
        this.organismStartX = organismStartX;
        this.organismStartY = organismStartY;
        this.birthRadius = birthRadius;
        this.maze = this.createEmptyMaze(this.height, this.width);
        this.clearCanvas();
        this.generateFoodCells(this.foodCells);
        this.generatePoisonCells(this.poisonCells);
        this.drawMaze();
    }

    createEmptyMaze(height, width) {
        return Array.from({ length: height }, () => Array(width).fill(1));
    }

    clearCanvas() {
        this.ctx.fillStyle = this.soilColor;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    drawCell(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.rectWidth, y * this.rectHeight, this.rectWidth, this.rectHeight);
    }

    clearCell(x, y) {
        this.ctx.clearRect(x * this.rectWidth, y * this.rectHeight, this.rectWidth, this.rectHeight);
    }

    generateFoodCells(count) {
        for (let i = 0; i < count; i++) {
            let x = Math.floor(Math.random() * this.width);
            let y = Math.floor(Math.random() * this.height);
            this.maze[y][x] = 2;
        }
    }

    generatePoisonCells(count) {
        let placed = 0;
        while (placed < count) {
            let x = Math.floor(Math.random() * this.width);
            let y = Math.floor(Math.random() * this.height);
            const dx = x - this.organismStartX;
            const dy = y - this.organismStartY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > this.birthRadius && this.maze[y][x] !== 2 && this.maze[y][x] !== 4) {
                this.maze[y][x] = 3;
                placed++;
            }
        }
    }

    drawMaze() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cellValue = this.maze[y][x];
                if (cellValue === 1) {
                    this.drawCell(x, y, this.soilColor);
                } else if (cellValue === 2) {
                    this.drawCell(x, y, this.foodColor);
                } else if (cellValue === 3) {
                    this.drawCell(x, y, this.poisonColor);
                } else if (cellValue === 0) {
                    this.drawCell(x, y, this.soilColor);
                } else if (cellValue === 4) {
                    this.drawCell(x, y, this.bloomColor);
                }
            }
        }
    }

    getCanvasSize() {
        return { width: this.canvasWidth, height: this.canvasHeight };
    }

    setBloomColor(bloomColor) {
        this.bloomColor = bloomColor;
    }
}

class PrimsOrganism {
    constructor(
        mazeCanvas, 
        speed, 
        bodySize, 
        bodySizeIncrement, 
        color, 
        frontierColor, 
        deadColor, 
        scanColor, 
        poisonScanColor, 
        scanRadius, 
        poisonRadius, 
        birthRadius, 
        bloomRadius, 
        bloomColor, 
        bloomBodyColor, 
        flowerColorTuples, // Changed from flowerRootColor, flowerStemColor
        flowerPetalColor
    ) {
        this.mazeCanvas = mazeCanvas;
        this.speed = speed;
        this.bodySize = bodySize;
        this.bodySizeIncrement = bodySizeIncrement;
        this.maze = mazeCanvas.maze;
        this.width = mazeCanvas.width;
        this.height = mazeCanvas.height;
        this.rectWidth = mazeCanvas.rectWidth;
        this.rectHeight = mazeCanvas.rectHeight;
        this.color = color;
        this.frontierColor = frontierColor;
        this.scanColor = scanColor;
        this.poisonScanColor = poisonScanColor;
        this.scanRadius = scanRadius;
        this.deadColor = deadColor;
        this.poisonRadius = poisonRadius;
        this.birthRadius = birthRadius;
        this.bloomRadius = bloomRadius;
        this.bloomColor = bloomColor;
        this.bloomBodyColor = bloomBodyColor;
        this.flowerColorTuples = flowerColorTuples; // Store array of [root, stem] color tuples
        this.flowerPetalColor = flowerPetalColor;
        this.bodyCells = [];
        this.bloomCircles = [];
        this.mazeCanvas.setBloomColor(bloomColor);
        this.flowers = new Set();
    }

    

    killCell() {
        if (this.bodyCells.length > this.bodySize) {
            let removedCell = this.bodyCells.shift();
            const [x, y] = removedCell;
            let inBloomCircle = this.bloomCircles.some(([bx, by, r]) => {
                const dx = x - bx;
                const dy = y - by;
                return Math.sqrt(dx * dx + dy * dy) <= r;
            });
            if (!inBloomCircle && this.maze[y][x] !== 4) {
                this.mazeCanvas.drawCell(x, y, this.deadColor);
                this.maze[y][x] = 0;
            }
        }
    }
    
    async createCell(x, y, color) {
        await new Promise(resolve => {
            setTimeout(() => {
                let inBloomCircle = this.bloomCircles.some(([bx, by, r]) => {
                    const dx = x - bx;
                    const dy = y - by;
                    return Math.sqrt(dx * dx + dy * dy) <= r;
                });
                this.mazeCanvas.drawCell(x, y, inBloomCircle ? this.bloomBodyColor : color);
                this.bodyCells.push([x, y]);
                this.processFood(x, y);
                resolve();
            }, this.speed);
        });
        this.killCell();
    }

    async processFood(x, y) {
        const scanDirections = [];
        for (let dx = -this.scanRadius; dx <= this.scanRadius; dx++) {
            for (let dy = -this.scanRadius; dy <= this.scanRadius; dy++) {
                scanDirections.push([dx, dy]);
            }
        }

        const eatDirections = [];
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                eatDirections.push([dx, dy]);
            }
        }

        const poisonArea = [];
        for (let dx = -this.poisonRadius; dx <= this.poisonRadius; dx++) {
            for (let dy = -this.poisonRadius; dy <= this.poisonRadius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this.poisonRadius) {
                    poisonArea.push([dx, dy]);
                }
            }
        }

        const bloomArea = [];
        for (let dx = -this.bloomRadius; dx <= this.bloomRadius; dx++) {
            for (let dy = -this.bloomRadius; dy <= this.bloomRadius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this.bloomRadius) {
                    bloomArea.push([dx, dy]);
                }
            }
        }
        
        let foodDetected = false;
        let poisonDetected = false;
        const foodToEat = [];
        const poisonToEat = [];

        for (let [dx, dy] of scanDirections) {
            const checkX = x + dy;
            const checkY = y + dx;
            if (
                checkX >= 0 && checkX < this.width &&
                checkY >= 0 && checkY < this.height
            ) {
                if (this.maze[checkY][checkX] === 2) {
                    this.mazeCanvas.drawCell(checkX, checkY, this.scanColor);
                } else if (this.maze[checkY][checkX] === 3) {
                    this.mazeCanvas.drawCell(checkX, checkY, this.poisonScanColor);
                }
            }
        }

        for (let [dx, dy] of eatDirections) {
            const checkX = x + dy;
            const checkY = y + dx;
            if (
                checkX >= 0 && checkX < this.width &&
                checkY >= 0 && checkY < this.height
            ) {
                if (this.maze[checkY][checkX] === 2) {
                    foodDetected = true;
                    foodToEat.push([checkX, checkY]);
                } else if (this.maze[checkY][checkX] === 3) {
                    poisonDetected = true;
                    poisonToEat.push([checkX, checkY]);
                }
            }
        }

        if (foodDetected) {
            setTimeout(() => {
                foodToEat.forEach(([foodX, foodY]) => {
                    this.mazeCanvas.drawCell(foodX, foodY, this.deadColor);
                    this.maze[foodY][foodX] = 0;
                    this.bodySize += this.bodySizeIncrement;
                    this.bloomCircles.push([foodX, foodY, this.bloomRadius]);
                    for (let [dx, dy] of bloomArea) {
                        const bloomX = foodX + dy;
                        const bloomY = foodY + dx;
                        if (
                            bloomX >= 0 && bloomX < this.width &&
                            bloomY >= 0 && bloomY < this.height
                        ) {
                            if (this.maze[bloomY][bloomX] === 3) {
                                this.maze[bloomY][bloomX] = 4;
                                this.mazeCanvas.drawCell(bloomX, bloomY, this.bloomColor);
                            } else if (this.maze[bloomY][bloomX] !== 2 && this.maze[bloomY][bloomX] !== 3) {
                                this.mazeCanvas.drawCell(bloomX, bloomY, this.bloomColor);
                                this.maze[bloomY][bloomX] = 4;
                            }
                            if (this.bodyCells.some(([bx, by]) => bx === bloomX && by === bloomY)) {
                                this.mazeCanvas.drawCell(bloomX, bloomY, this.bloomBodyColor);
                            }
                        }
                    }
                });
            }, this.speed);
        }

        if (poisonDetected) {
            setTimeout(() => {
                poisonToEat.forEach(([poisonX, poisonY]) => {
                    this.mazeCanvas.drawCell(poisonX, poisonY, this.deadColor);
                    this.maze[poisonY][poisonX] = 0;
                    for (let [dx, dy] of poisonArea) {
                        const clearX = poisonX + dy;
                        const clearY = poisonY + dx;
                        if (
                            clearX >= 0 && clearX < this.width &&
                            clearY >= 0 && clearY < this.height
                        ) {
                            const isInBloomCircle = this.bloomCircles.some(([cx, cy, r]) => {
                                const dx = clearX - cx;
                                const dy = clearY - cy;
                                return Math.sqrt(dx * dx + dy * dy) <= r;
                            });
                            if (!isInBloomCircle) {
                                const isBodyCell = this.bodyCells.some(([bx, by]) => bx === clearX && by === clearY);
                                if (isBodyCell) {
                                    const cellIndex = this.bodyCells.findIndex(
                                        ([bx, by]) => bx === clearX && by === clearY
                                    );
                                    if (cellIndex !== -1) {
                                        this.bodyCells.splice(cellIndex, 1);
                                    }
                                }
                                this.mazeCanvas.drawCell(clearX, clearY, this.deadColor);
                                this.maze[clearY][clearX] = 0;
                            }
                        }
                    }
                });
            }, this.speed);
        }
    }

    neighbors(ic, jc) {
        const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        return dirs.map(([dx, dy]) => [ic + dx, jc + dy])
            .filter(([x, y]) => 
                x > 0 && x < this.maze.length && 
                y > 0 && y < this.maze[0].length && 
                (this.maze[x][y] === 1 || this.maze[x][y] === 4)
            );
    }

    isCellInBloom(x, y) {
        return this.bloomCircles.some(([bx, by, r]) => {
            const dx = x - bx;
            const dy = y - by;
            return Math.sqrt(dx * dx + dy * dy) <= r;
        });
    }

    async growFlowerAt(x, y) {
        const mainCtx = this.mazeCanvas.ctx;
        const canvasWidth = this.mazeCanvas.canvasWidth;
        const canvasHeight = this.mazeCanvas.canvasHeight;
        const offscreen = document.createElement("canvas");
        offscreen.width = canvasWidth;
        offscreen.height = canvasHeight;
        const offCtx = offscreen.getContext("2d");
        const startX = x * this.mazeCanvas.rectWidth + this.mazeCanvas.rectWidth / 2;
        const startY = y * this.mazeCanvas.rectHeight + this.mazeCanvas.rectHeight / 2;
        const segmentLength = 5;
        const minSegments = 10;
        const maxSegments = 30;
        const segments = Math.floor(Math.random() * (maxSegments - minSegments + 1)) + minSegments;
        const angleVariation = 0.2;
        const delay = 100;
        const dotRadius = 4;
        let currentAngle = -Math.PI / 2;
        const points = [{ x: startX, y: startY }];

        const [flowerRootColor, flowerStemColor] = this.flowerColorTuples[
            Math.floor(Math.random() * this.flowerColorTuples.length)
        ];

        for (let i = 0; i < segments; i++) {
            currentAngle += (Math.random() - 0.5) * angleVariation;
            const lastPoint = points[points.length - 1];
            const nextX = lastPoint.x + Math.cos(currentAngle) * segmentLength;
            const nextY = lastPoint.y + Math.sin(currentAngle) * segmentLength;
            points.push({ x: nextX, y: nextY });
            offCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            offCtx.beginPath();
            offCtx.moveTo(startX, startY);

            for (const pt of points) {
                offCtx.lineTo(pt.x, pt.y);
            }

            const gradient = offCtx.createLinearGradient(startX, startY, points[points.length - 1].x, points[points.length - 1].y);
            gradient.addColorStop(0, flowerRootColor);
            gradient.addColorStop(1, flowerStemColor);
            offCtx.strokeStyle = gradient;
            offCtx.lineWidth = 1.5;
            offCtx.lineCap = "round";
            offCtx.lineJoin = "round";
            offCtx.stroke();
            mainCtx.drawImage(offscreen, 0, 0);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        offCtx.beginPath();
        offCtx.arc(points[points.length - 1].x, points[points.length - 1].y, dotRadius, 0, Math.PI * 2);
        offCtx.fillStyle = flowerStemColor;
        offCtx.fill();
        mainCtx.drawImage(offscreen, 0, 0);
    }

    async animateFlowers() {
        while (true) {
            const delayTime = 0;
            await new Promise(resolve => setTimeout(resolve, delayTime));
            const candidates = this.bodyCells.filter(([x, y]) => this.isCellInBloom(x, y) && !this.flowers.has(`${x},${y}`));
            if (candidates.length > 0) {
                const [cellX, cellY] = candidates[Math.floor(Math.random() * candidates.length)];
                this.flowers.add(`${cellX},${cellY}`);
                const flowerCount = Math.floor(Math.random() * 5) + 1;
                for (let i = 0; i < flowerCount; i++) {
                    await this.growFlowerAt(cellX, cellY);
                }
            }
        }
    }

    async animate() {
        this.animateFlowers();
        this.maze[0][1] = 1;
        let start = [this.height / 2, this.width / 2];
        this.maze[start[0]][start[1]] = 1;
        let openCells = [start];
        this.mazeCanvas.drawCell(start[1], start[0], this.frontierColor);

        while (openCells.length) {
            let index = Math.floor(Math.random() * openCells.length);
            let cell = openCells[index];
            let neighbors = this.neighbors(cell[0], cell[1]);

            for (let neighbor of neighbors) {
                await this.createCell(neighbor[1], neighbor[0], this.frontierColor);
            }

            while (!neighbors.length) {
                let erased = openCells.splice(index, 1)[0];
                await this.createCell(erased[1], erased[0], this.color);

                if (!openCells.length) break;
                index = Math.floor(Math.random() * openCells.length);
                cell = openCells[index];
                neighbors = this.neighbors(cell[0], cell[1]);

                for (let neighbor of neighbors) {
                    await this.createCell(neighbor[1], neighbor[0], this.frontierColor);
                }
            }

            if (!openCells.length) break;
            let choice = neighbors[Math.floor(Math.random() * neighbors.length)];
            openCells.push(choice);

            if (neighbors.length === 1) {
                let erased = openCells.splice(index, 1)[0];
                await this.createCell(erased[1], erased[0], this.color);
            }

            this.maze[choice[0]][choice[1]] = 0;
            let path = [(choice[0] + cell[0]) / 2, (choice[1] + cell[1]) / 2];
            this.maze[path[0]][path[1]] = 0;

            await this.createCell(path[1], path[0], this.color);
        }
        this.killCell();
    }
}

class Worm {
    constructor(mazeCanvas, speed, color, startX, startY, scanRadius, scannedPoisonColor) {
        this.mazeCanvas = mazeCanvas;
        this.speed = speed;
        this.color = color;
        this.x = startX;
        this.y = startY;
        this.mouseX = this.x;
        this.mouseY = this.y;
        this.foodCellCounter = 0;
        this.bodyCells = [[this.x, this.y]];
        this.scanRadius = scanRadius;
        this.scannedPoisonColor = scannedPoisonColor;
        this.prevScannedCells = new Set();
        this.mazeCanvas.drawCell(this.x, this.y, this.color);

        this.mazeCanvas.canvas.addEventListener('mousemove', (event) => {
            const rect = this.mazeCanvas.canvas.getBoundingClientRect();
            const pixelX = event.clientX - rect.left;
            const pixelY = event.clientY - rect.top;
            this.mouseX = Math.floor(pixelX / this.mazeCanvas.rectWidth);
            this.mouseY = Math.floor(pixelY / this.mazeCanvas.rectHeight);
        });

        this.mazeCanvas.canvas.addEventListener('click', () => {
            this.dropFood();
        });

        this.animate();
    }

    dropFood() {
        if (this.foodCellCounter > 0 && (this.mazeCanvas.maze[this.y][this.x] === 1 || this.mazeCanvas.maze[this.y][this.x] === 0 || this.mazeCanvas.maze[this.y][this.x] === 4)) {
            this.mazeCanvas.maze[this.y][this.x] = 2;
            this.mazeCanvas.drawCell(this.x, this.y, this.mazeCanvas.foodColor);
            this.mazeCanvas.drawCell(this.x, this.y, this.color);
            this.foodCellCounter--;
            if (this.bodyCells.length > 1) {
                const removedCell = this.bodyCells.shift();
                const removedValue = this.mazeCanvas.maze[removedCell[1]][removedCell[0]];
                if (removedValue === 1 || removedValue === 0) {
                    this.mazeCanvas.drawCell(removedCell[0], removedCell[1], this.mazeCanvas.soilColor);
                } else if (removedValue === 2) {
                    this.mazeCanvas.drawCell(removedCell[0], removedCell[1], this.mazeCanvas.foodColor);
                } else if (removedValue === 4) {
                    this.mazeCanvas.drawCell(removedCell[0], removedCell[1], this.mazeCanvas.bloomColor);
                }
            }
        }
    }

    async move() {
        const directions = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1]
        ];

        const scanDirections = [];
        for (let dx = -this.scanRadius; dx <= this.scanRadius; dx++) {
            for (let dy = -this.scanRadius; dy <= this.scanRadius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this.scanRadius) {
                    scanDirections.push([dx, dy]);
                }
            }
        }

        const currentScannedCells = new Set();
        for (let [dx, dy] of scanDirections) {
            const checkX = this.x + dx;
            const checkY = this.y + dy;
            if (
                checkX >= 0 && checkX < this.mazeCanvas.width &&
                checkY >= 0 && checkY < this.mazeCanvas.height &&
                this.mazeCanvas.maze[checkY][checkX] === 3
            ) {
                this.mazeCanvas.drawCell(checkX, checkY, this.scannedPoisonColor);
                currentScannedCells.add(`${checkX},${checkY}`);
            }
        }

        for (let cell of this.prevScannedCells) {
            if (!currentScannedCells.has(cell)) {
                const [x, y] = cell.split(',').map(Number);
                if (this.mazeCanvas.maze[y][x] === 3) {
                    this.mazeCanvas.drawCell(x, y, this.mazeCanvas.poisonColor);
                }
            }
        }
        
        this.prevScannedCells = currentScannedCells;
        const currentDx = this.mouseX - this.x;
        const currentDy = this.mouseY - this.y;
        const currentDistance = Math.sqrt(currentDx * currentDx + currentDy * currentDy);
        let bestX = this.x;
        let bestY = this.y;
        let minDistance = currentDistance;

        for (const [dy, dx] of directions) {
            const nextX = this.x + dx;
            const nextY = this.y + dy;

            if (
                nextX >= 0 && nextX < this.mazeCanvas.width &&
                nextY >= 0 && nextY < this.mazeCanvas.height &&
                (this.mazeCanvas.maze[nextY][nextX] === 1 || this.mazeCanvas.maze[nextY][nextX] === 3 || this.mazeCanvas.maze[nextY][nextX] === 4) &&
                !this.bodyCells.some(([bx, by]) => bx === nextX && by === nextY)
            ) {
                const newDx = this.mouseX - nextX;
                const newDy = this.mouseY - nextY;
                const newDistance = Math.sqrt(newDx * newDx + newDy * newDy);

                if (newDistance < minDistance) {
                    minDistance = newDistance;
                    bestX = nextX;
                    bestY = nextY;
                }
            }
        }

        if (bestX !== this.x || bestY !== this.y) {
            this.bodyCells.push([bestX, bestY]);

            let atePoison = false;
            if (this.mazeCanvas.maze[bestY][bestX] === 3) {
                this.mazeCanvas.maze[bestY][bestX] = 1;
                this.mazeCanvas.drawCell(bestX, bestY, this.mazeCanvas.soilColor);
                this.foodCellCounter++;
                atePoison = true;
            }

            this.mazeCanvas.drawCell(bestX, bestY, this.color);
            this.x = bestX;
            this.y = bestY;

            if (!atePoison && this.bodyCells.length > this.foodCellCounter + 1) {
                const removedCell = this.bodyCells.shift();
                const removedValue = this.mazeCanvas.maze[removedCell[1]][removedCell[0]];
                if (removedValue === 1 || removedValue === 0) {
                    this.mazeCanvas.drawCell(removedCell[0], removedCell[1], this.mazeCanvas.soilColor);
                } else if (removedValue === 2) {
                    this.mazeCanvas.drawCell(removedCell[0], removedCell[1], this.mazeCanvas.foodColor);
                } else if (removedValue === 4) {
                    this.mazeCanvas.drawCell(removedCell[0], removedCell[1], this.mazeCanvas.bloomColor);
                }
            }
        }
    }

    async animate() {
        while (true) {
            await this.move();
            await new Promise(resolve => setTimeout(resolve, this.speed));
        }
    }
}

export { MazeCanvas, PrimsOrganism, Worm };