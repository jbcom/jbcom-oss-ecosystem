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

// Session analyzer (provider-agnostic, for agent conversations)
export { AIAnalyzer, type AIAnalyzerOptions } from "./analyzer.js";

// PR analyzer (for GitHub pull requests)
export { Analyzer as PRAnalyzer } from "./pr-analyzer.js";

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

// Security utilities
export { 
  validatePath, 
  sanitizeFilename, 
  assessCommandSafety,
  type PathValidationResult 
} from "./security.js";

// Agent - unified AI agent for all agentic tasks
export { 
  Agent, 
  runTask, 
  runSmartTask,
  TaskAnalysisSchema,
  type AgentConfig, 
  type AgentResult, 
  type AgentStep,
  type TaskAnalysis 
} from "./agent.js";

// PR triage agent (specialized for PR workflows)
export { PRTriageAgent } from "./pr-triage-agent.js";

// Issue resolver
export { Resolver, type ResolverConfig } from "./resolver.js";

// GitHub utilities
export { GitHubClient, type GitHubConfig } from "./github.js";

// Triage orchestrator
export { Triage, type TriageConfig } from "./triage.js";

// Types
export * from "./types.js";
