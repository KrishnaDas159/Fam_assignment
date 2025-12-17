/**
 * Spring-Damping Physics System
 * 
 * Spring force model:
 * acceleration = -k * (position - target) - damping * velocity
 * 
 * Where:
 * - k: spring stiffness coefficient
 * - damping: velocity damping coefficient
 * - position: current position
 * - target: equilibrium/target position
 * - velocity: current velocity
 */

import type { Point } from './bezier';

export interface SpringState {
  position: Point;
  velocity: Point;
  target: Point;
}

export interface SpringConfig {
  stiffness: number;  // k - spring constant
  damping: number;    // damping coefficient
}

/**
 * Default spring configuration - feels responsive but smooth
 */
export const DEFAULT_SPRING_CONFIG: SpringConfig = {
  stiffness: 120,
  damping: 12,
};

/**
 * Create initial spring state
 */
export function createSpringState(initialPosition: Point): SpringState {
  return {
    position: { ...initialPosition },
    velocity: { x: 0, y: 0 },
    target: { ...initialPosition },
  };
}

/**
 * Update spring physics for one frame
 * Uses semi-implicit Euler integration for stability
 */
export function updateSpring(
  state: SpringState,
  config: SpringConfig,
  deltaTime: number
): SpringState {
  const { position, velocity, target } = state;
  const { stiffness, damping } = config;

  // Calculate spring force: F = -k * displacement
  const displacementX = position.x - target.x;
  const displacementY = position.y - target.y;

  // acceleration = -k * (position - target) - damping * velocity
  const accelerationX = -stiffness * displacementX - damping * velocity.x;
  const accelerationY = -stiffness * displacementY - damping * velocity.y;

  // Semi-implicit Euler: update velocity first, then position
  const newVelocity = {
    x: velocity.x + accelerationX * deltaTime,
    y: velocity.y + accelerationY * deltaTime,
  };

  const newPosition = {
    x: position.x + newVelocity.x * deltaTime,
    y: position.y + newVelocity.y * deltaTime,
  };

  return {
    position: newPosition,
    velocity: newVelocity,
    target,
  };
}

/**
 * Set the target position for the spring
 */
export function setSpringTarget(state: SpringState, target: Point): SpringState {
  return {
    ...state,
    target: { ...target },
  };
}

/**
 * Apply an impulse (instant velocity change) to the spring
 */
export function applyImpulse(state: SpringState, impulse: Point): SpringState {
  return {
    ...state,
    velocity: {
      x: state.velocity.x + impulse.x,
      y: state.velocity.y + impulse.y,
    },
  };
}

/**
 * Check if the spring has settled (velocity and displacement below threshold)
 */
export function isSettled(state: SpringState, threshold: number = 0.1): boolean {
  const velocityMagnitude = Math.sqrt(
    state.velocity.x ** 2 + state.velocity.y ** 2
  );
  const displacement = Math.sqrt(
    (state.position.x - state.target.x) ** 2 +
    (state.position.y - state.target.y) ** 2
  );
  return velocityMagnitude < threshold && displacement < threshold;
}
