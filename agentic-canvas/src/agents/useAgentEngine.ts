/**
 * React hook for managing the AgentEngine
 * This hook initializes the engine and registers agents
 */

import { useEffect, useRef } from 'react';
import { AgentEngine } from './AgentEngine';
import { LayoutOptimizationAgent } from './LayoutOptimizationAgent';
import { useCanvasStore } from '../state/useCanvasStore';

/**
 * Hook to initialize and manage the AgentEngine
 * @returns AgentEngine instance and control functions
 */
export function useAgentEngine() {
  const engineRef = useRef<AgentEngine | null>(null);
  const agentConfig = useCanvasStore(state => state.agentConfig);

  // Initialize engine on mount
  useEffect(() => {
    if (!engineRef.current) {
      // Create engine with config from store
      const engine = new AgentEngine({
        maxIterationsPerTrigger: agentConfig.maxIterations,
        conflictResolution: agentConfig.conflictResolution,
        enableLogging: true,
      });

      // Register default agents
      engine.registerAgent(new LayoutOptimizationAgent());

      engineRef.current = engine;
      console.log('[useAgentEngine] AgentEngine initialized');
    }

    return () => {
      // Cleanup on unmount
      if (engineRef.current) {
        console.log('[useAgentEngine] AgentEngine cleanup');
      }
    };
  }, []);

  // Update engine config when store config changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setConfig({
        maxIterationsPerTrigger: agentConfig.maxIterations,
        conflictResolution: agentConfig.conflictResolution,
      });
    }
  }, [agentConfig.maxIterations, agentConfig.conflictResolution]);

  /**
   * Manually trigger all agents
   */
  const triggerAgents = async () => {
    if (engineRef.current) {
      await engineRef.current.executeAgents();
    }
  };

  /**
   * Trigger a specific agent
   */
  const triggerAgent = async (agentId: string) => {
    if (engineRef.current) {
      const agent = engineRef.current.getAgent(agentId);
      if (agent) {
        await engineRef.current.executeAgent(agent);
      }
    }
  };

  /**
   * Register a new agent
   */
  const registerAgent = (agent: any) => {
    if (engineRef.current) {
      engineRef.current.registerAgent(agent);
    }
  };

  /**
   * Get all registered agents
   */
  const getAgents = () => {
    return engineRef.current?.getAgents() || [];
  };

  return {
    engine: engineRef.current,
    triggerAgents,
    triggerAgent,
    registerAgent,
    getAgents,
  };
}