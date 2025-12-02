/**
 * AI Triage module for agentic-control
 * 
 * Unified AI-powered triage and analysis:
 * - Conversation analysis and task extraction
 * - PR triage with MCP integration
 * - Code review and issue creation
 * - GitHub operations
 * - Multi-provider AI support
 */

// Core analyzer (provider-agnostic)
export { AIAnalyzer, type AIAnalyzerOptions } from "./analyzer.js";

// MCP client integration
export { 
  initializeMCPClients, 
  getMCPTools, 
  closeMCPClients,
  mcpCredentials,
  MCP_ENV_VARS,
  type MCPClientConfig,
  type MCPClients 
} from "./mcp-clients.js";

// PR triage agent
export { PRTriageAgent } from "./pr-triage-agent.js";

// Unified agent (combines all capabilities)
export { UnifiedAgent, runTask } from "./unified-agent.js";

// Enhanced agent with smart routing
export { EnhancedAgent, runEnhancedTask, runSmartTask } from "./enhanced-agent.js";

// Code agent for code-specific tasks
export { CodeAgent, runCodeTask } from "./code-agent.js";

// Issue resolver
export { IssueResolver, resolveIssue, type ResolverConfig } from "./resolver.js";

// GitHub utilities
export { GitHubClient, type GitHubConfig } from "./github.js";

// Core triage function
export { triageSession, type TriageOptions } from "./triage.js";

// Types
export * from "./types.js";
