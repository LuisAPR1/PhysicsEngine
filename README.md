# 2D Physics Engine

**Live Demo:** [https://luisapr1.github.io/PhysicsEngine/](https://luisapr1.github.io/PhysicsEngine/)

An interactive 2D physics engine built from scratch using p5.js. This project implements rigid body dynamics, AABB collision detection, and Verlet integration for stable simulations.

## Features

- Real-time control over mass, friction, and restitution
- Predictive trajectory visualization for projectile motion
- Custom environment builder with adjustable block properties
- Modern, dark-themed control panel

## Technical Decisions

### Verlet Integration

The simulation uses Verlet integration instead of the simpler Euler method. While Euler integration (`position += velocity * dt`) is straightforward, it suffers from energy drift and instability in constrained systems.

Verlet integration offers:
- **Energy conservation**: Better preservation of total system energy over long simulations
- **Numerical stability**: More robust handling of collision constraints through implicit velocity correction

For a detailed comparison, see: [Euler vs Verlet](http://kahrstrom.com/gamephysics/2011/08/03/euler-vs-verlet/)

### Collision System

- **Detection**: AABB (Axis-Aligned Bounding Box) for efficient overlap testing
- **Resolution**: Position projection to resolve penetration
- **Bounce**: Reflection of previous position across the collision normal
- **Friction**: Continuous force application based on normal force and combined friction coefficients

## Tech Stack

- **Language**: JavaScript (ES6+)
- **Rendering**: p5.js
- **Styling**: CSS3

## Author

LuisR
