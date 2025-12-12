# 2D Physics Engine

A robust, interactive 2D physics engine built from scratch using **p5.js**. This project demonstrates advanced physics simulations in a web environment, featuring custom implementations of rigid body dynamics, collision detection, and numerical integration.

![Physics Engine UI](https://via.placeholder.com/800x400?text=Physics+Engine+Preview)

## Features

-   **Interactive Simulation**: Real-time control over physical properties like mass, friction, and restitution.
-   **Trajectory Visualization**: Predictive path visualization for projectile motion.
-   **World Builder**: Custom environment creation with adjustable block dimensions and friction.
-   **Stable Physics Core**: Built on Verlet Integration for superior stability and accuracy.
-   **Collision System**: AABB (Axis-Aligned Bounding Box) collision detection with continuous friction application.
-   **Responsive UI**: Modern, dark-themed control panel for tuning simulation parameters.

---

## Physics Implementation Decisions

The core of this engine deviates from standard Euler integration often found in simple tutorials. Instead, it adopts **Verlet Integration**, a choice driven by the need for numerical stability and physical accuracy.

### 1. Verlet Integration vs. Euler
Traditional Euler integration (`position += velocity * dt`) is simple but prone to energy drift (objects gaining or losing energy over time) and instability, especially in orbital or constrained systems.

**Decision:** We chose **Verlet Integration** because:
-   **Symplectic Nature**: It preserves energy better over long simulations.
-   **Implicit Velocity**: Velocity is not stored explicitly but derived from the difference between the current position and the previous position (`v = (pos - prevPos) / dt`). This makes handling constraints (like collisions) much more stable—simply correcting the position implicitly corrects the velocity for the next frame.
-   **Reversibility**: The formulation allows for time-reversible simulations, contributing to their stability.

### 2. Collision Resolution
Conflict handling is performed using a position-based approach suitable for Verlet physics.

-   **Detection**: We use **AABB (Axis-Aligned Bounding Box)** for efficient broad and narrow phase detection. This checks for overlaps on the X and Y axes.
-   **Resolution**: When a collision occurs, we strictly project the object out of the obstacle (position correction).
-   **Bounce (Restitution)**: To simulate bounciness without explicit velocity vectors, we modify the `prevPosition`. By reflecting the `prevPosition` across the collision normal, the Verlet integrator interprets this as a reversal of direction in the next step.

### 3. Friction Model
Friction is implemented as a continuous force application rather than a simple velocity damper.

-   **Kinetic Friction**: Calculated based on the normal force. On horizontal surfaces, the normal force is derived from gravity (`N = mg`).
-   **Implementation**: We apply an opposing force (or position adjustment in Verlet terms) proportional to the velocity and the combined friction coefficients of the colliding bodies. This allows for realistic sliding behaviors where objects naturally come to rest.

---

## Tech Stack

-   **Language**: JavaScript (ES6+)
-   **Rendering**: [p5.js](https://p5js.org/) (Canvas API)
-   **Styling**: CSS3 with modern features (Flexbox, Grid, CSS Variables)
-   **Icons**: Phosphor Icons

## How to Run

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/LuisR/physics-engine.git
    ```
2.  **Open the project**:
    Simply open the `index.html` file in any modern web browser. No compilation or build step is required.
3.  **Interact**:
    -   Use the **Controls Panel** to adjust Mass, Gravity, and Launch Force.
    -   Toggle **Build Mode** to drag and drop new obstacles.
    -   Click **Start Simulation** to launch the object.

##  Author

**LuisR**
*Built with p5.js*
