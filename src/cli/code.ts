import { readFileSync } from 'fs';
import { Span } from '@opentelemetry/api';
import { LlmFunctions } from '#agent/LlmFunctions';
import { AgentContext, AgentLLMs, agentContextStorage, createContext } from '#agent/agentContext';
import { RunAgentConfig } from '#agent/xmlAgentRunner';
import '#fastify/trace-init/trace-init';
import { FileSystem } from '#functions/filesystem';
import { withActiveSpan } from '#o11y/trace';
import { CodeEditingAgent } from '#swe/codeEditingAgent';
import { TypescriptTools } from '#swe/lang/nodejs/typescriptTools';
import { ProjectInfo } from '#swe/projectDetection';

import { ClaudeVertexLLMs } from '#llm/models/anthropic-vertex';
import { currentUser } from '#user/userService/userContext';
import { envVarHumanInLoopSettings } from './cliHumanInLoop';

// Used to test the local repo editing workflow in CodeEditingAgent

// Usage:
// npm run code

async function main() {
	const llms: AgentLLMs = ClaudeVertexLLMs();

	const initialPrompt = readFileSync('src/cli/code-in', 'utf-8');

	const functions = new LlmFunctions();
	functions.addFunctionClass(FileSystem);

	const config: RunAgentConfig = {
		agentName: 'code',
		llms,
		functions,
		user: currentUser(),
		initialPrompt,
		humanInLoop: envVarHumanInLoopSettings(),
	};
	const context: AgentContext = createContext(config);
	agentContextStorage.enterWith(context);

	// const info = await new DevRequirementsWorkflow().detectProjectInfo();

	let projectInfo: ProjectInfo | undefined;
	// projectInfo = {
	// 	baseDir: process.cwd(),
	// 	language: 'nodejs',
	// 	initialise: 'npm install',
	// 	compile: 'npm run build',
	// 	format: 'npm run lint && npm run fix',
	// 	staticAnalysis: null,
	// 	test: 'npm run test:unit',
	// 	languageTools: new TypescriptTools(),
	// };

	await withActiveSpan('code', async (span: Span) => {
		span.setAttributes({
			initialPrompt,
		});
		await new CodeEditingAgent().runCodeEditWorkflow(initialPrompt, projectInfo);
	});
}

main().then(
	() => console.log('done'),
	(e) => console.error(e),
);
