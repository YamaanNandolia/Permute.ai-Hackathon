# Agent Architecture Usage Guide

This document explains how to use the agent architecture implemented in the agentic canvas application.

## Overview

The agent system implements the **observe-plan-act** pattern, allowing programmatic control of the canvas through autonomous agents that can:
- Observe the current canvas state
- Plan actions to optimize layouts
- Execute those actions through the Zustand store

## Architecture Components

### 1. Core Components

#### `IAgent` Interface
Defines the contract all agents must implement:
- `observe(state)` - Read current state and extract relevant information
- `plan(observation)` - Generate list of actions based on observations
- `act(actions, context)` - Execute planned actions on the store

#### `AgentEngine`
Central coordinator that:
- Manages registered agents
- Executes agents in priority order
- Handles conflict resolution
- Prevents infinite loops (max 10 iterations per trigger)
- Logs agent activity for debugging

#### `BaseAgent`
Abstract base class providing:
- Common helper methods (overlap detection, distance calculation, etc.)
- Logging utilities
- Result creation helpers

### 2. Action Types

The system supports the following action types:

```typescript
- CREATE_SHAPE    // Add new shape to canvas
- UPDATE_SHAPE    // Modify existing shape properties
- DELETE_SHAPE    // Remove shape from canvas
- SELECT_SHAPE    // Update shape selection
- UPDATE_CANVAS   // Modify canvas config (zoom, pan)
- BATCH_UPDATE    // Update multiple shapes efficiently
```

## Creating a Custom Agent

### Step 1: Extend BaseAgent

```typescript
import { BaseAgent } from '../agents/BaseAgent';
import type { AgentObservation, AgentAction, AgentContext, AgentResult } from '../types/agent';

export class MyCustomAgent extends BaseAgent {
  id = 'my-custom-agent';
  name = 'My Custom Agent';
  description = 'Does something awesome';
  priority = 5; // Higher = runs first
  
  observe(state: any): AgentObservation {
    // Extract relevant information from state
    const shapes = state.shapes;
    
    return this.createObservation({
      shapes,
      // Add custom observation data
    });
  }
  
  plan(observation: AgentObservation): AgentAction[] {
    const actions: AgentAction[] = [];
    
    // Generate actions based on observations
    // Example: Move a shape
    actions.push({
      type: 'update_shape',
      shapeId: 'some-id',
      payload: { x: 100, y: 100 },
      reason: 'Optimizing layout',
    });
    
    return actions;
  }
  
  act(actions: AgentAction[], context: AgentContext): AgentResult {
    const store = useCanvasStore.getState();
    const errors: string[] = [];
    let applied = 0;
    
    try {
      // Apply actions using batch update for efficiency
      const batchUpdates = actions
        .filter(a => a.type === 'update_shape' && a.shapeId)
        .map(a => ({ id: a.shapeId!, changes: a.payload }));
      
      if (batchUpdates.length > 0) {
        store.batchUpdateShapes(batchUpdates);
        applied = batchUpdates.length;
      }
      
      return this.createSuccessResult(applied);
    } catch (error) {
      this.logError('Failed to apply actions', error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return this.createErrorResult(errors, applied);
    }
  }
}
```

### Step 2: Register the Agent

```typescript
import { useAgentEngine } from './agents';
import { MyCustomAgent } from './agents/MyCustomAgent';

function App() {
  const { registerAgent } = useAgentEngine();
  
  useEffect(() => {
    // Register your custom agent
    registerAgent(new MyCustomAgent());
  }, []);
  
  // ... rest of component
}
```

## Using the Agent System

### Setting Up in Your Application

```typescript
import { useAgentEngine } from './agents';

function App() {
  const { triggerAgents, getAgents } = useAgentEngine();
  const agentConfig = useCanvasStore(state => state.agentConfig);
  const setAgentEnabled = useCanvasStore(state => state.setAgentEnabled);
  
  // Enable agents
  const handleEnableAgents = () => {
    setAgentEnabled(true);
  };
  
  // Manually trigger all agents
  const handleTriggerAgents = async () => {
    await triggerAgents();
  };
  
  return (
    <div>
      <button onClick={handleEnableAgents}>
        {agentConfig.enabled ? 'Disable' : 'Enable'} Agents
      </button>
      <button onClick={handleTriggerAgents}>
        Run Agents Manually
      </button>
    </div>
  );
}
```

### Agent Configuration

The agent system can be configured through the store:

```typescript
const store = useCanvasStore.getState();

// Configure agent behavior
store.agentConfig = {
  enabled: true,              // Master on/off switch
  autoRun: false,            // Auto-run on state changes (not yet implemented)
  intervalMs: 0,             // Polling interval (0 = event-driven only)
  maxIterations: 10,         // Max iterations per trigger
  conflictResolution: 'abort' // 'abort' | 'merge' | 'overwrite'
};
```

## Example: Layout Optimization Agent

The included `LayoutOptimizationAgent` demonstrates a complete agent implementation:

**Observe Phase:**
- Finds all shapes on canvas
- Detects overlapping shapes
- Calculates average spacing

**Plan Phase:**
- For each overlapping pair, plans to move one shape
- Calculates non-overlapping positions

**Act Phase:**
- Uses batch update for efficiency
- Applies all position changes at once

## Best Practices

### 1. Use Batch Updates
When updating multiple shapes, always use `batchUpdateShapes()`:

```typescript
// Good ✓
store.batchUpdateShapes([
  { id: 'shape1', changes: { x: 100 } },
  { id: 'shape2', changes: { x: 200 } },
]);

// Avoid ✗
store.updateShape('shape1', { x: 100 });
store.updateShape('shape2', { x: 200 });
```

### 2. Keep Agents Pure
Agents should be pure functions with no side effects except through actions:

```typescript
// Good ✓
plan(observation: AgentObservation): AgentAction[] {
  // Pure function, returns actions
  return actions;
}

// Avoid ✗
plan(observation: AgentObservation): AgentAction[] {
  // Don't modify external state directly
  someGlobalVariable = 123; // BAD!
  return actions;
}
```

### 3. Use Logging
Leverage the built-in logging for debugging:

```typescript
observe(state: any): AgentObservation {
  this.log('Starting observation', { shapeCount: state.shapes.length });
  // ... observation logic
  return observation;
}
```

### 4. Handle Errors Gracefully
Always wrap risky operations in try-catch:

```typescript
act(actions: AgentAction[], context: AgentContext): AgentResult {
  try {
    // Apply actions
    return this.createSuccessResult(applied);
  } catch (error) {
    this.logError('Failed to apply actions', error);
    return this.createErrorResult([error.message]);
  }
}
```

## Conflict Resolution

The agent engine supports three conflict resolution strategies:

### 1. Abort (Default)
If a shape was modified since observation, skip that action:
```typescript
conflictResolution: 'abort'
```

### 2. Merge
Combine user changes with agent changes:
```typescript
conflictResolution: 'merge'
```

### 3. Overwrite
Agent changes always take precedence:
```typescript
conflictResolution: 'overwrite'
```

## Performance Considerations

### Execution Limits
- Max 10 iterations per trigger (configurable)
- Agents run sequentially in priority order
- Prevents infinite loops

### Batch Operations
- Use `batchUpdateShapes()` for multiple changes
- Single state update instead of multiple
- Better performance and fewer re-renders

### Logging
- Enable/disable via `AgentEngineConfig.enableLogging`
- Disable in production for better performance

## Debugging

### View Agent Execution
Check browser console for agent logs:
```
[2025-11-01T01:45:00.000Z] [AgentEngine] Executing 1 enabled agents
[2025-11-01T01:45:00.100Z] [Layout Optimizer] Observed 5 shapes, 2 overlaps
[2025-11-01T01:45:00.200Z] [Layout Optimizer] Planning to move shape xyz
[2025-11-01T01:45:00.300Z] [Layout Optimizer] Applied 2 shape updates
```

### Check Agent State
```typescript
const agentState = useCanvasStore(state => state.agentState);

console.log('Is running:', agentState.isRunning);
console.log('Current agent:', agentState.currentAgent);
console.log('Last run:', agentState.lastRun);
console.log('Last error:', agentState.error);
```

### List Registered Agents
```typescript
const { getAgents } = useAgentEngine();
const agents = getAgents();

console.log('Registered agents:', agents.map(a => ({
  id: a.id,
  name: a.name,
  priority: a.priority,
})));
```

## API Reference

### AgentEngine Methods

- `registerAgent(agent: IAgent)` - Register a new agent
- `unregisterAgent(agentId: string)` - Remove an agent
- `executeAgents()` - Run all enabled agents
- `executeAgent(agent: IAgent)` - Run a specific agent
- `getAgents()` - Get all registered agents
- `getAgent(agentId: string)` - Get specific agent by ID
- `setConfig(config)` - Update engine configuration

### Store Methods

- `registerAgent(agent)` - Add agent to store
- `unregisterAgent(agentId)` - Remove agent from store
- `triggerAgents()` - Legacy method (use AgentEngine instead)
- `setAgentEnabled(enabled)` - Enable/disable agent system
- `setAgentAutoRun(autoRun)` - Configure auto-run behavior

### BaseAgent Helpers

- `shapesOverlap(a, b)` - Check if two shapes overlap
- `shapeDistance(a, b)` - Calculate distance between shapes
- `snapToGrid(value, gridSize)` - Snap position to grid
- `isInBounds(shape, canvas)` - Check if shape is within canvas
- `log(message, data)` - Log agent activity
- `logError(message, error)` - Log errors
- `createObservation(data)` - Create observation object
- `createSuccessResult(applied, metadata)` - Create success result
- `createErrorResult(errors, applied, metadata)` - Create error result

## Examples

See [`LayoutOptimizationAgent.ts`](src/agents/LayoutOptimizationAgent.ts) for a complete working example.

## Next Steps

1. Create additional agents for specific use cases
2. Implement auto-run on state changes
3. Add WebSocket support for multi-user collaboration
4. Integrate with ML models for advanced optimization