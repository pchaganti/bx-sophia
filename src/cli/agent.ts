import '#fastify/trace-init/trace-init'; // leave an empty line next so this doesn't get sorted from the first line

import { AgentFeedback } from '#agent/agentFeedback';
import { provideFeedback, resumeCompleted, resumeError, resumeHil, startAgentAndWait } from '#agent/agentRunner';
import { appContext, initApplicationContext } from '#app/applicationContext';
import { FileSystemRead } from '#functions/storage/fileSystemRead';
import { defaultLLMs } from '#llm/services/defaultLlms';
import { logger } from '#o11y/logger';
import { parseProcessArgs, saveAgentId } from './cli';
import { resolveFunctionClasses } from './functionResolver';

export async function main() {
	const llms = defaultLLMs();
	await initApplicationContext();

	const { initialPrompt, resumeAgentId, functionClasses } = parseProcessArgs();

	console.log(`Prompt: ${initialPrompt}`);

	let functions: Array<new () => any>;
	if (functionClasses?.length) {
		functions = await resolveFunctionClasses(functionClasses);
	} else {
		// Default to FileSystemRead if no functions specified
		functions = [FileSystemRead];
	}
	functions.push(AgentFeedback);
	logger.info(`Available tools ${functions.map((f) => f.name).join(', ')}`);

	if (resumeAgentId) {
		const agent = await appContext().agentStateService.load(resumeAgentId);
		switch (agent.state) {
			case 'completed':
				return await resumeCompleted(resumeAgentId, agent.executionId, initialPrompt);
			case 'error':
				return resumeError(resumeAgentId, agent.executionId, initialPrompt);
			case 'hitl_threshold':
			case 'hitl_tool':
				return await resumeHil(resumeAgentId, agent.executionId, initialPrompt);
			case 'hitl_feedback':
				return await provideFeedback(resumeAgentId, agent.executionId, initialPrompt);
		}
	}
	const agentId = await startAgentAndWait({
		agentName: 'cli-agent',
		initialPrompt,
		functions,
		llms,
		type: 'autonomous',
		subtype: 'codegen',
		resumeAgentId,
		humanInLoop: {
			count: 30,
			budget: 30,
		},
	});
	logger.info('AgentId ', agentId);

	saveAgentId('agent', agentId);
}

main().then(
	() => console.log('done'),
	(e) => console.error(e),
);
