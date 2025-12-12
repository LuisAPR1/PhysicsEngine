class StaticBody {
    constructor(x, y, width, height, friction = 0.5) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.friction = friction; // Coeficiente de atrito da superfície (0 = gelo, 1 = borracha)
        this.color = 200; // Grey color
    }

    display() {
        fill(this.color);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
    }

    // Helper methods for collision detection logic
    getTop() { return this.y; }
    getBottom() { return this.y + this.height; }
    getLeft() { return this.x; }
    getRight() { return this.x + this.width; }
}
