let player;
let platforms = [];
let gravity = 980; // Gravitational acceleration in pixels/s²
let isSimulating = false; // State to track if simulation is running
let isBuildMode = false; // State to track if we are building
let launchBtn; // Reference to the start button
let buildBtn; // Reference to the build button

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');

    // Initialize Player at default position
    resetPlayer();

    // Create a "Floor" and some obstacles
    // Boundarie Walls (Thick enough to prevent tunneling at high speeds)
    let wallThickness = 20;

    // Bottom (Ground)
    platforms.push(new StaticBody(0, height - wallThickness, width, wallThickness));
    // Top (Ceiling)
    platforms.push(new StaticBody(0, 0, width, wallThickness));
    // Left Wall
    platforms.push(new StaticBody(0, 0, wallThickness, height));
    // Right Wall
    platforms.push(new StaticBody(width - wallThickness, 0, wallThickness, height));



    // Connect Launch Button
    launchBtn = select('#btn-launch');
    if (launchBtn) {
        launchBtn.html('Start Simulation'); // Initial text
        launchBtn.mousePressed(toggleSimulation);
    }

    // Connect Build Button
    buildBtn = select('#btn-build');
    if (buildBtn) {
        buildBtn.mousePressed(toggleBuildMode);
    }
}

function resetPlayer() {
    // Start position near bottom left
    player = new PhysicsEntity(50, height - 100, 40, 40);
    // For Verlet, velocity is implicit (derived from positions)
    // prevX = prevY = current position means zero velocity
    // This is already handled in the constructor
}

function toggleSimulation() {
    // If we start simulation, ensure build mode is off
    if (!isSimulating) {
        isBuildMode = false;
        if (buildBtn) buildBtn.style('background', ''); // Reset color (or default)
        if (buildBtn) buildBtn.style('color', '');
    }

    if (isSimulating) {
        // STOP Simulation
        isSimulating = false;
        launchBtn.html('Start Simulation');
        resetPlayer(); // Reset position
    } else {
        // START Simulation
        isSimulating = true;
        launchBtn.html('Stop Simulation');

        // Apply Launch Forces immediately

        // 1. Get Values from HTML Inputs
        let massVal = parseFloat(document.getElementById('input-mass').value);
        let restitutionVal = parseFloat(document.getElementById('input-restitution').value);
        let frictionVal = parseFloat(document.getElementById('input-friction').value);
        let angleDeg = parseFloat(document.getElementById('input-angle').value);
        let forceMag = parseFloat(document.getElementById('input-force').value);
        let gravityVal = parseFloat(document.getElementById('input-gravity').value);

        // Update Global Gravity
        gravity = gravityVal;

        // 2. Apply Properties to Player
        player.mass = massVal;
        player.restitution = restitutionVal;
        player.friction = frictionVal;

        // 3. Calculate Velocity Vector
        let angleRad = radians(angleDeg);
        let vx = forceMag * cos(angleRad);
        let vy = forceMag * sin(angleRad);

        // Apply Velocity using Verlet method
        // This sets the previous position so that the implicit velocity is (vx, vy)
        let dt = 1 / 60; // Assume 60fps for initial velocity setup
        player.setVelocity(vx, vy, dt);
    }
}

function toggleBuildMode() {
    // Can only build if NOT simulating
    if (isSimulating) return;

    isBuildMode = !isBuildMode;

    // Check if element exists before styling
    if (buildBtn) {
        if (isBuildMode) {
            buildBtn.style('background', '#28a745'); // Green for active
            buildBtn.style('color', 'white');
        } else {
            buildBtn.style('background', ''); // Default
            buildBtn.style('color', '');
        }
    }
}

function mousePressed() {
    // Only handle canvas clicks
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

    if (isBuildMode) {
        let wInput = document.getElementById('input-block-width');
        let hInput = document.getElementById('input-block-height');
        let w = wInput ? parseFloat(wInput.value) : 100;
        let h = hInput ? parseFloat(hInput.value) : 20;

        let frictionInput = document.getElementById('input-block-friction');
        let blockFriction = frictionInput ? parseFloat(frictionInput.value) : 0.5;

        // Center the box on the mouse
        let bx = mouseX - w / 2;
        let by = mouseY - h / 2;

        if (checkPlacementValidity(bx, by, w, h)) {
            platforms.push(new StaticBody(bx, by, w, h, blockFriction));
        }
    }
}


function checkPlacementValidity(x, y, w, h) {
    // 1. Boundary Check
    if (x < 0 || x + w > width || y < 0 || y + h > height) return false;

    // 2. Overlap Check with existing platforms
    for (let p of platforms) {
        if (x < p.getRight() &&
            x + w > p.getLeft() &&
            y < p.getBottom() &&
            y + h > p.getTop()) {
            return false; // Overlapping
        }
    }
    return true;
}

function draw() {
    background(51);

    // --- Physics Controls ---
    // Mouse drag debug interaction (Only allow when NOT simulating AND NOT building)
    if (!isSimulating && !isBuildMode && mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        player.x = mouseX;
        player.y = mouseY;
        // For Verlet: set previous position = current position to zero out velocity
        player.prevX = mouseX;
        player.prevY = mouseY;
    }

    // --- Physics Step ---
    // Calculate deltaTime in seconds (p5's deltaTime is in milliseconds)
    let dt = deltaTime / 1000;
    // Clamp dt to prevent instability if frame takes too long
    dt = min(dt, 0.05);

    if (isSimulating) {
        // 1. Apply Forces (Gravity: F = m * g)
        // This ensures all objects fall at the same rate regardless of mass
        player.applyForce(0, gravity * player.mass);

        // 2. Update Kinematics
        player.update(dt);

        // 3. Collision Detection & Resolution
        for (let platform of platforms) {
            player.resolveCollision(platform);
        }

        // 4. Apply Continuous Friction (after collision resolution)
        for (let platform of platforms) {
            player.applyFriction(platform, gravity, dt);
        }
    }

    // --- Render Step ---
    // Always render, even if physics is paused
    for (let platform of platforms) {
        platform.display();
    }
    player.display();

    // --- Trajectory Visualization ---
    let trajCheckbox = document.getElementById('input-show-trajectory');
    if (!isSimulating && trajCheckbox && trajCheckbox.checked && player) {
        let angleInput = document.getElementById('input-angle');
        let forceInput = document.getElementById('input-force');

        let angle = angleInput ? parseFloat(angleInput.value) : -45;
        // Optional: Scale length by force? "Mini" suggests keep it small/fixed or clamped.
        // Let's make it fixed length for "mini" but maybe verify direction.
        let len = 60;

        let cx = player.x + player.width / 2;
        let cy = player.y + player.height / 2;

        let r = radians(angle);
        let ex = cx + cos(r) * len;
        let ey = cy + sin(r) * len;

        push();
        stroke(180, 180, 190, 100); // Greyish, low opacity
        strokeWeight(2);

        // Draw dashed line manually
        let d = dist(cx, cy, ex, ey);
        let dash = 6;
        let gap = 6;
        let steps = d / (dash + gap);
        let dx = (ex - cx) / d;
        let dy = (ey - cy) / d;

        for (let i = 0; i < steps; i++) {
            let start = i * (dash + gap);
            let end = min(start + dash, d);
            line(cx + dx * start, cy + dy * start, cx + dx * end, cy + dy * end);
        }
        pop();
    }

    // --- Build Mode Preview ---
    if (isBuildMode) {
        let wInput = document.getElementById('input-block-width');
        let hInput = document.getElementById('input-block-height');
        let w = wInput ? parseFloat(wInput.value) : 100;
        let h = hInput ? parseFloat(hInput.value) : 20;

        let bx = mouseX - w / 2;
        let by = mouseY - h / 2;

        let isValid = checkPlacementValidity(bx, by, w, h);

        push(); // Save drawing style
        if (isValid) {
            fill(0, 255, 0, 100); // Transparent Green
            stroke(0, 255, 0);
        } else {
            fill(255, 0, 0, 100); // Transparent Red
            stroke(255, 0, 0);
        }
        rect(bx, by, w, h);
        pop(); // Restore drawing style
    }
}
