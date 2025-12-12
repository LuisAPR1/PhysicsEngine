class PhysicsEntity {
    constructor(x, y, width, height) {
        // Position (current)
        this.x = x;
        this.y = y;

        // Previous Position (for Verlet Integration)
        // Initially set to current position (object at rest)
        this.prevX = x;
        this.prevY = y;

        // Size (AABB)
        this.width = width;
        this.height = height;

        // Acceleration (accumulated each frame)
        this.ax = 0;
        this.ay = 0;

        // Material Properties
        this.mass = 1;
        this.restitution = 0.7; // Bounciness (0 = no bounce, 1 = perfect bounce)
        this.friction = 0.3;    // Friction coefficient (0 = ice, 1 = rubber)
        this.color = [255, 0, 0];

        // Store last deltaTime for velocity calculations
        this.lastDeltaTime = 1 / 60; // Default to 60fps
    }

    // Set velocity by adjusting previous position
    // This is important for Verlet: v = (current - previous) / dt
    setVelocity(vx, vy, deltaTime = 1 / 60) {
        // For Verlet: prevPos = currentPos - velocity * deltaTime
        this.prevX = this.x - vx * deltaTime;
        this.prevY = this.y - vy * deltaTime;
        this.lastDeltaTime = deltaTime;
    }

    // Get current velocity (derived from positions)
    getVelocityX() {
        return (this.x - this.prevX) / this.lastDeltaTime;
    }

    getVelocityY() {
        return (this.y - this.prevY) / this.lastDeltaTime;
    }

    applyForce(forceX, forceY) {
        // F = ma -> a = F/m
        this.ax += forceX / this.mass;
        this.ay += forceY / this.mass;
    }

    update(deltaTime) {
        // Verlet Integration
        // Formula: p_new = 2*p_current - p_previous + a * dt²
        // 
        // This is mathematically equivalent to:
        //   p_new = p_current + (p_current - p_previous) + a * dt²
        //   p_new = p_current + velocity*dt + a*dt² (implicit velocity)
        //
        // Benefits over Euler:
        // - Exact for constant acceleration (like gravity)
        // - More stable for oscillating systems
        // - Time-reversible (symplectic)

        // Time-Corrected Verlet Integration
        // Formula: p_new = p_current + (p_current - p_previous) * (dt / dt_prev) + a * dt²

        // Calculate time correction ratio
        // If dt changes, we scale the "velocity" term (displacement) accordingly
        let dtRatio = deltaTime / this.lastDeltaTime;

        // Calculate new positions
        // (this.x - this.prevX) is the displacement from the previous frame
        // We scale it by dtRatio to estimate the displacement for the current frame
        let newX = this.x + (this.x - this.prevX) * dtRatio + this.ax * deltaTime * deltaTime;
        let newY = this.y + (this.y - this.prevY) * dtRatio + this.ay * deltaTime * deltaTime;

        // Update previous positions to current
        this.prevX = this.x;
        this.prevY = this.y;

        // Update current positions to new
        this.x = newX;
        this.y = newY;

        // Reset acceleration
        this.ax = 0;
        this.ay = 0;

        // Store current deltaTime for next frame's correction
        this.lastDeltaTime = deltaTime;
    }

    // Check if this entity is touching (in contact with) a static body
    // Returns: 'top', 'bottom', 'left', 'right', or null
    isTouching(staticBody) {
        const tolerance = 1; // Pixel tolerance for contact detection

        // Check horizontal overlap (required for top/bottom contact)
        let horizontalOverlap = this.x < staticBody.getRight() &&
            this.x + this.width > staticBody.getLeft();

        // Check vertical overlap (required for left/right contact)
        let verticalOverlap = this.y < staticBody.getBottom() &&
            this.y + this.height > staticBody.getTop();

        // Check top contact (entity sitting on top of static body)
        if (horizontalOverlap &&
            Math.abs((this.y + this.height) - staticBody.getTop()) < tolerance) {
            return 'top';
        }

        // Check bottom contact (entity pressed against ceiling)
        if (horizontalOverlap &&
            Math.abs(this.y - staticBody.getBottom()) < tolerance) {
            return 'bottom';
        }

        // Check left contact (entity against right side of static body)
        if (verticalOverlap &&
            Math.abs((this.x + this.width) - staticBody.getLeft()) < tolerance) {
            return 'left';
        }

        // Check right contact (entity against left side of static body)
        if (verticalOverlap &&
            Math.abs(this.x - staticBody.getRight()) < tolerance) {
            return 'right';
        }

        return null;
    }

    // Apply continuous friction while in contact with a surface
    // For Verlet, we modify the previous position to affect velocity
    // Physics: F_friction = μ * N, where N is the normal force
    // On horizontal surface: N = m*g, so a_friction = μ * g
    // On vertical surface: N depends on how hard object pushes against wall
    applyFriction(staticBody, gravity, deltaTime) {
        let contactSide = this.isTouching(staticBody);
        if (!contactSide) return;

        // Calculate combined friction coefficient (geometric mean)
        let combinedFriction = Math.sqrt(this.friction * staticBody.friction);

        // Velocity threshold to stop (prevent micro-oscillations)
        const velocityThreshold = 5;

        // Use the stored deltaTime for consistency with velocity calculations
        let dt = this.lastDeltaTime;

        if (contactSide === 'top' || contactSide === 'bottom') {
            // On horizontal surface: friction affects horizontal velocity
            // Normal force N = m*g, so friction deceleration a = μ * g
            let frictionDecel = combinedFriction * gravity;

            // Get current velocity using consistent deltaTime
            let vx = this.getVelocityX();

            if (Math.abs(vx) > velocityThreshold) {
                // Calculate velocity change from friction: Δv = a * dt
                let deltaV = frictionDecel * dt;

                // Apply friction in opposite direction of motion
                let newVx;
                if (vx > 0) {
                    newVx = Math.max(0, vx - deltaV);
                } else {
                    newVx = Math.min(0, vx + deltaV);
                }

                // Update prevX to reflect new velocity
                // v = (x - prevX) / dt  =>  prevX = x - v * dt
                this.prevX = this.x - newVx * dt;
            } else {
                // Stop completely if below threshold
                this.prevX = this.x;
            }
        } else if (contactSide === 'left' || contactSide === 'right') {
            // On vertical surface: friction affects vertical velocity
            // Normal force depends on horizontal velocity/impact
            // Simplified: use a fraction of gravity as base normal force
            let horizontalSpeed = Math.abs(this.getVelocityX());
            let normalForce = gravity * 0.1 + horizontalSpeed * combinedFriction;
            let frictionDecel = combinedFriction * normalForce / this.mass;

            let vy = this.getVelocityY();

            if (Math.abs(vy) > velocityThreshold) {
                let deltaV = frictionDecel * dt;

                let newVy;
                if (vy > 0) {
                    newVy = Math.max(0, vy - deltaV);
                } else {
                    newVy = Math.min(0, vy + deltaV);
                }

                this.prevY = this.y - newVy * dt;
            } else {
                this.prevY = this.y;
            }
        }
    }

    // Check collision with a StaticBody and resolve it
    resolveCollision(staticBody) {
        // 1. Broad Phase: Simple AABB Overlap Check
        if (this.x < staticBody.getRight() &&
            this.x + this.width > staticBody.getLeft() &&
            this.y < staticBody.getBottom() &&
            this.y + this.height > staticBody.getTop()) {

            // 2. Narrow Phase: Determine which side we hit
            // We calculate how far we are penetrating into the object from each side
            let overlapLeft = (this.x + this.width) - staticBody.getLeft();
            let overlapRight = staticBody.getRight() - this.x;
            let overlapTop = (this.y + this.height) - staticBody.getTop();
            let overlapBottom = staticBody.getBottom() - this.y;

            // Find the smallest overlap to determine the collision normal
            let minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            // For Verlet, collision response works by:
            // 1. Correcting position
            // 2. Reflecting the previous position to simulate velocity reflection

            if (minOverlap === overlapTop) {
                // Hit the top surface
                let oldY = this.y;
                this.y = staticBody.getTop() - this.height; // Position Correction

                // Reflect previous Y for bounce (with restitution)
                // The velocity component is (y - prevY), we want to reflect and scale it
                let vy = oldY - this.prevY; // Implicit downward velocity
                this.prevY = this.y + vy * this.restitution; // Reflect: set prevY above current

            } else if (minOverlap === overlapBottom) {
                // Hit the bottom surface (ceiling)
                let oldY = this.y;
                this.y = staticBody.getBottom();

                let vy = oldY - this.prevY;
                this.prevY = this.y + vy * this.restitution;

            } else if (minOverlap === overlapLeft) {
                // Hit the left side
                let oldX = this.x;
                this.x = staticBody.getLeft() - this.width;

                let vx = oldX - this.prevX;
                this.prevX = this.x + vx * this.restitution;

            } else if (minOverlap === overlapRight) {
                // Hit the right side
                let oldX = this.x;
                this.x = staticBody.getRight();

                let vx = oldX - this.prevX;
                this.prevX = this.x + vx * this.restitution;
            }
        }
    }

    display() {
        fill(this.color);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
    }
}
