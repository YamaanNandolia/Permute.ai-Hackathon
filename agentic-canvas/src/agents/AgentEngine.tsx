/**
 * AgentEngine - Central coordinator for agent execution
 * Implements the observe-plan-act cycle with conflict resolution
 */

import type { IAgent, AgentAction, AgentContext } from '../types/agent';
import { useCanvasStore } from '../state/useCanvasStore';

type CanvasStore = ReturnType<typeof useCanvasStore.getState>;

export interface AgentEngineConfig {
  maxIterationsPerTrigger: number;
  enableLogging: boolean;
  conflictResolution: 'abort' | 'merge' | 'overwrite';
}

const DEFAULT_CONFIG: AgentEngineConfig = {
  maxIterationsPerTrigger: 10,
  enableLogging: true,
  conflictResolution: 'abort',
};

/**
 * AgentEngine - Manages and executes agents in observe-plan-act cycles
 */
export class AgentEngine {
  private agents: Map<string, IAgent> = new Map();
  private executionCount: number = 0;
  private config: AgentEngineConfig;

  constructor(config: Partial<AgentEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register an agent with the engine
   */
  registerAgent(agent: IAgent): void {
    if (this.agents.has(agent.id)) {
      this.log(`Agent ${agent.id} already registered, replacing...`);
    }
    this.agents.set(agent.id, agent);
    this.log(`Registered agent: ${agent.name} (priority: ${agent.priority})`);
  }

  /**
   * Unregister an agent from the engine
   */
  unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.log(`Unregistered agent: ${agent.name}`);
    }
  }

  /**
   * Get all registered agents
   */
  getAgents(): IAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get a specific agent by ID
   */
  getAgent(agentId: string): IAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Execute all enabled agents in priority order
   * Returns the number of agents that made changes
   */
  async executeAgents(): Promise<number> {
    const store = useCanvasStore.getState();

    // Check if agents are enabled
    if (!store.agentConfig.enabled) {
      this.log('Agents are disabled, skipping execution');
      return 0;
    }

    // Check if already running
    if (store.agentState.isRunning) {
      this.log('Agents already running, skipping execution');
      return 0;
    }

    // Reset execution count
    this.executionCount = 0;

    // Set running state
    useCanvasStore.setState((state) => ({
      agentState: {
        ...state.agentState,
        isRunning: true,
        error: null,
      },
    }));

    let changedAgents = 0;

    try {
      // Get enabled agents sorted by priority (higher first)
      const enabledAgents = this.getEnabledAgentsSorted();

      if (enabledAgents.length === 0) {
        this.log('No enabled agents to execute');
        return 0;
      }

      this.log(`Executing ${enabledAgents.length} enabled agents`);

      // Execute each agent sequentially
      for (const agent of enabledAgents) {
        // Check iteration limit
        if (this.executionCount >= this.config.maxIterationsPerTrigger) {
          this.log(`Max iterations (${this.config.maxIterationsPerTrigger}) reached, stopping execution`);
          break;
        }

        const executed = await this.executeAgent(agent);
        if (executed) {
          changedAgents++;
        }
        this.executionCount++;
      }

      this.log(`Execution complete: ${changedAgents}/${enabledAgents.length} agents made changes`);
      return changedAgents;

    } catch (error) {
      this.logError('Error during agent execution', error);
      useCanvasStore.setState((state) => ({
        agentState: {
          ...state.agentState,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
      return changedAgents;

    } finally {
      // Clear running state
      useCanvasStore.setState((state) => ({
        agentState: {
          ...state.agentState,
          isRunning: false,
          lastRun: Date.now(),
        },
      }));
    }
  }

  /**
   * Execute a single agent manually
   */
  async executeAgent(agent: IAgent): Promise<boolean> {
    const currentState = useCanvasStore.getState();

    try {
      this.log(`[${agent.name}] Starting observe-plan-act cycle`);

      // Set current agent
      useCanvasStore.setState((state) => ({
        agentState: {
          ...state.agentState,
          currentAgent: agent.id,
        },
      }));

      // OBSERVE: Agent reads current state
      const observation = agent.observe(currentState);
      this.log(`[${agent.name}] Observed state`, observation.data);

      // PLAN: Agent generates actions
      const actions = agent.plan(observation);
      
      if (actions.length === 0) {
        this.log(`[${agent.name}] No actions planned`);
        return false;
      }

      this.log(`[${agent.name}] Planned ${actions.length} actions`);

      // Check conflict resolution
      if (this.config.conflictResolution === 'abort') {
        if (this.hasConflicts(actions, observation, currentState)) {
          this.log(`[${agent.name}] Conflicts detected, aborting actions`);
          return false;
        }
      }

      // ACT: Execute actions through the agent
      const context: AgentContext = {
        timestamp: Date.now(),
        previousState: currentState,
      };

      const result = agent.act(actions, context);

      if (!result.success) {
        this.logError(`[${agent.name}] Execution failed`, result.errors);
        return false;
      }

      this.log(`[${agent.name}] Successfully applied ${result.actionsApplied} actions`);
      return result.actionsApplied > 0;

    } catch (error) {
      this.logError(`[${agent.name}] Error during execution`, error);
      useCanvasStore.setState((state) => ({
        agentState: {
          ...state.agentState,
          error: `${agent.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      }));
      return false;

    } finally {
      // Clear current agent
      useCanvasStore.setState((state) => ({
        agentState: {
          ...state.agentState,
          currentAgent: null,
        },
      }));
    }
  }

  /**
   * Apply actions to the store (used by agents in their act() method)
   */
  applyActions(actions: AgentAction[]): { applied: number; errors: string[] } {
    const store = useCanvasStore.getState();
    const errors: string[] = [];
    let applied = 0;

    for (const action of actions) {
      try {
        this.applyAction(action);
        applied++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to apply action ${action.type}: ${errorMsg}`);
        this.logError(`Failed to apply action`, error);
      }
    }

    return { applied, errors };
  }

  /**
   * Apply a single action to the store
   */
  private applyAction(action: AgentAction): void {
    const { type, shapeId, payload } = action;
    const store = useCanvasStore.getState();

    this.log(`Applying action: ${type}${shapeId ? ` on shape ${shapeId}` : ''}`, payload);

    // Handle the action type using switch for better type handling
    switch (type) {
      case 'create_shape':
        store.addShape(payload as any);
        break;

      case 'update_shape':
        if (!shapeId) {
          throw new Error('Shape ID required for update action');
        }
        store.updateShape(shapeId, payload);
        break;

      case 'delete_shape':
        if (!shapeId) {
          throw new Error('Shape ID required for delete action');
        }
        store.deleteShape(shapeId);
        break;

      case 'select_shape':
        if (!shapeId) {
          throw new Error('Shape ID required for select action');
        }
        store.selectShape(shapeId);
        break;

      case 'update_canvas':
        if (payload.zoom !== undefined) store.setZoom(payload.zoom);
        if (payload.panX !== undefined || payload.panY !== undefined) {
          const currentCanvas = store.canvas;
          store.setPan(
            payload.panX ?? currentCanvas.panX,
            payload.panY ?? currentCanvas.panY
          );
        }
        if (payload.gridSize !== undefined) store.setGridSize(payload.gridSize);
        if (payload.snapToGrid !== undefined) store.setSnapToGrid(payload.snapToGrid);
        break;

      case 'batch_update':
        // Batch updates should be an array in the payload
        if (Array.isArray(payload.updates)) {
          for (const update of payload.updates) {
            if (update.id && update.changes) {
              store.updateShape(update.id, update.changes);
            }
          }
        }
        break;

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  /**
   * Check if actions conflict with current state
   */
  private hasConflicts(
    actions: AgentAction[],
    observation: any,
    currentState: CanvasStore
  ): boolean {
    // Check if any shapes referenced in actions were modified since observation
    const observationTime = observation.timestamp;
    const shapeIds = new Set(
      actions.map(a => a.shapeId).filter((id): id is string => id !== undefined)
    );

    for (const shapeId of shapeIds) {
      const shape = currentState.shapes.find(s => s.id === shapeId);
      if (shape && shape.updatedAt > observationTime) {
        return true; // Shape was modified since observation
      }
    }

    return false;
  }

  /**
   * Get enabled agents sorted by priority
   */
  private getEnabledAgentsSorted(): IAgent[] {
    return Array.from(this.agents.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Log message if logging is enabled
   */
  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [AgentEngine] ${message}`, data ?? '');
    }
  }

  /**
   * Log error message
   */
  private logError(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [AgentEngine] ERROR: ${message}`, error ?? '');
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<AgentEngineConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AgentEngineConfig {
    return { ...this.config };
  }
}