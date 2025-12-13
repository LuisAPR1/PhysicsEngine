# 2D Physics Engine

> **🔴 Live Demo:** [https://luisapr1.github.io/PhysicsEngine/](https://luisapr1.github.io/PhysicsEngine/)

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

## Physics Implementation

The core of this engine deviates from standard Euler integration often found in simple tutorials. Instead, it adopts **Verlet Integration**, a choice driven by the need for numerical stability and physical accuracy.

### 1. Verlet Integration vs. Euler
Traditional Euler integration (`position += velocity * dt`) is simple but prone to energy drift (objects gaining or losing energy over time) and instability, especially in orbital or constrained systems.

[Usefull Article](http://kahrstrom.com/gamephysics/2011/08/03/euler-vs-verlet/)

**Why Verlet?**
-   **Symplectic Nature**: It preserves energy better over long simulations.
-   **Stability**: Handling constraints (like collisions) is much more stable by implicitly correcting velocity via position adjustments.

### 2. Collision & Friction
-   **Detection**: **AABB** for efficient broad and narrow phase detection.
-   **Resolution**: STRICT Position Projection to resolve overlaps.
-   **Bounce**: Implemented by reflecting the `prevPosition` across the collision normal.
-   **Friction**: Continuous force application based on normal force and combined friction coefficients, allowing realistic sliding and resting behavior.

---

## Tech Stack

-   **Language**: JavaScript (ES6+)
-   **Rendering**: [p5.js](https://p5js.org/) (Canvas API)
-   **Styling**: CSS3 (Variables, Flexbox, Grid)
-   **Icons**: Phosphor Icons

##  Author

**LuisR**
*Built with p5.js*
