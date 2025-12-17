# Interactive Bézier Curve with Physics & Sensor Control (Web)

## Overview

This project implements an **interactive cubic Bézier curve** that behaves like a **springy rope** in response to real-time user input.  
The implementation is built **from scratch** using **React, HTML Canvas, and TypeScript**, without relying on any prebuilt Bézier, animation, or physics libraries.

The curve dynamically updates at runtime, visualizes **tangent vectors**, and uses a **spring–damping physics model** to create smooth and natural motion.

---

## Features

- Cubic Bézier curve rendered using manual mathematical computation
- Real-time interaction using **mouse movement (Web)**
- Physics-based control point motion using a **spring–damping system**
- Tangent vector visualization using the analytical derivative
- Adjustable target FPS (10–120 FPS)
- Stable animation using `requestAnimationFrame`
- Clean separation of math, physics, rendering, and input logic

---

## Bézier Curve Mathematics

The cubic Bézier curve is defined using four control points:

- **P₀, P₃** → fixed endpoints  
- **P₁, P₂** → dynamic control points  

### Curve Equation

\[
B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3
\]

The curve is sampled at small `t` increments (≈ 0.01) and drawn manually on the canvas.

---

## Tangent Computation

Tangent vectors are calculated using the derivative of the cubic Bézier curve:

\[
B'(t) = 3(1-t)^2(P_1 - P_0) + 6(1-t)t(P_2 - P_1) + 3t^2(P_3 - P_2)
\]

- Tangents are **normalized**
- Short tangent lines are drawn at regular intervals along the curve
- This visually represents the curve direction at each point

---

## Spring Physics Model

Dynamic control points use a **spring–damping model** for smooth motion.

### Physics Equation

\[
acceleration = -k \cdot (position - target) - damping \cdot velocity
\]

Where:
- `k` = spring stiffness
- `damping` = velocity damping factor

### Integration Method

- **Semi-implicit Euler integration** is used
- This improves stability at high frame rates and prevents jitter

---

## Interaction Model (Web)

- Mouse movement displaces the **nearest control point**
- The selected control point follows the mouse using spring physics
- The other control point smoothly returns to its base position
- This produces a natural rope-like response

---

## Rendering Pipeline

Each frame performs the following steps:

1. Clear canvas and draw background grid
2. Update spring physics (control points)
3. Sample Bézier curve points
4. Draw control handles
5. Render curve with glow effect
6. Draw tangent vectors
7. Render control points and labels
8. Display FPS counter

Rendering is throttled to the selected target FPS.

---



