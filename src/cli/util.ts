import '#fastify/trace-init/trace-init'; // leave an empty line next so this doesn't get sorted from the first line

import { writeFileSync } from 'node:fs';
import { tasks } from 'googleapis/build/src/apis/tasks';
import { CommentClassElement } from 'ts-morph';
import { LlmFunctionsImpl } from '#agent/LlmFunctionsImpl';
import { agentContextStorage, createContext, getFileSystem, llms } from '#agent/agentContextLocalStorage';
import type { RunWorkflowConfig } from '#agent/autonomous/runAgentTypes';
import { appContext } from '#app/applicationContext';
import { ComposerAirflowClient } from '#functions/cloud/google/composerAirflow';
import { ComposerAirflowDagDebugAgent } from '#functions/cloud/google/composerAirflowDagDebugAgent';
import { ComposerDagDebugger } from '#functions/cloud/google/composerAirflowDebugger2';
import { GoogleCloud } from '#functions/cloud/google/google-cloud';
import { Confluence } from '#functions/confluence';
import { Jira } from '#functions/jira';
import { LlmTools } from '#functions/llmTools';
import { GitLab } from '#functions/scm/gitlab';
import { FileSystemList } from '#functions/storage/fileSystemList';
import { FileSystemService } from '#functions/storage/fileSystemService';
import { SupportKnowledgebase } from '#functions/supportKnowledgebase';
import { MAD_Balanced } from '#llm/multi-agent/reasoning-debate';
import { MultiLLM } from '#llm/multi-llm';
import { Claude4_5_Sonnet_Vertex } from '#llm/services/anthropic-vertex';
import { defaultLLMs } from '#llm/services/defaultLlms';
import { openaiGPT5, openaiGPT5codex } from '#llm/services/openai';
import { countTokens } from '#llm/tokens';
import { SlackAPI } from '#modules/slack/slackApi';
import { formatAsSlackBlocks } from '#modules/slack/slackBlockFormatter';
import type { AgentContext, AgentLLMs } from '#shared/agent/agent.model';
import { CodeEditingAgent } from '#swe/codeEditingAgent';
import { SearchReplaceCoder } from '#swe/coder/searchReplaceCoder';
import { TypescriptRefactor } from '#swe/lang/nodejs/typescriptRefactor';
import { MorphAPI } from '#swe/morph/morphApi';
import { ChunkSearchResult } from '#swe/vector/chunking/chunkTypes';
import { GoogleVectorStore } from '#swe/vector/google/googleVectorService';
// import { projectDetectionAgent } from '#swe/projectDetectionAgent';
import { envVarHumanInLoopSettings } from './cliHumanInLoop';

// For running random bits of code
// Usage:
// npm run util

async function main() {
	await appContext().userService.ensureSingleUser();
	const functions = new LlmFunctionsImpl();
	functions.addFunctionClass(FileSystemService);

	const config: RunWorkflowConfig = {
		agentName: 'util',
		subtype: 'util',
		llms: defaultLLMs(),
		functions,
		initialPrompt: '',
		humanInLoop: envVarHumanInLoopSettings(),
		useSharedRepos: true,
	};

	const context: AgentContext = createContext(config);

	agentContextStorage.enterWith(context);

	const resluts = await new ComposerAirflowClient().fetchDags('tgds-stage');
	console.log(resluts);
	// const diff = await new GitLab().getMergeRequestDiffs('engineering/trafficguard/waf/waf',2906)
	// console.log(await countTokens(diff));

	// const result = await Claude4_5_Sonnet_Vertex().generateText(diff + '\n\nPlease review this merge request (Robust error handling for Spanner operations', {id:'review', thinking: 'high'})
	// console.log(result);
	// const evidence = await new ComposerDagDebugger().debugDag('tgds-prod', 'ni_rcd_triggered_count_daily_incremental');
	// for (const e of evidence) {
	// 	console.log(e.type);
	// 	console.log(e.tokens);
	// }

	return;

	// new GoogleCloud().getCloudLoggingLogs('tg-infra-prod', 'resource.type="cloud_run_revision"', {
	// 	freshness: '1h',
	// });

	// console.log(blocks)
	// console.log(Object.keys(block))
	// blocks.blocks.forEach((block) => console.log(block));

	// 	const results = await new Confluence().search(
	// 		'trafficguard-242710',
	// 		`Just reviewing our GCP permissions and had a question:

	// Are owner permissions for non-infra team members really needed on trafficguard-242710?

	// boris.mesin@trafficguard.ai
	// ivan.majnaric@trafficguard.ai
	// tihomir.bregovic@trafficguard.ai

	// Are all owners. Does anyone remember why?`,
	// 	);
	// 	for (const result of results) {
	// 		// console.log(result.title.toUpperCase());
	// 		// console.log(result.bodyTokens);
	// 		// console.log(result.filteredContentsTokens);
	// 		// console.log(result.filteredContents);
	// 		// console.log('\n=======================================\n')
	// 	}

	// const results = await new GitLab().findDiscussionIdByNoteId('devops/experimental/ci-experiments', 6, 137698);
	// // const results = await new Confluence().search('gitlab ops');
	// console.log(results);
	// console.log(results?.notes?.map((d) => d.author));
	return;

	// console.log(await new GoogleCloud().getTraceSpans('tg-portal-prod', '7fa6095ecb12d8063deb2b8e87da068d'));

	// const threadMessages = await new SlackAPI().getConversationReplies('D08HGB1HF61', '1753971207.503459');
	// threadMessages.forEach((m) => console.log(m));
	// console.log(threadMessages.map((m) => `--------------------\n${m.text}`).join('\n'));

	// const store = new GoogleVectorStore({
	// 	project: 'tg-infra-dev',
	// 	discoveryEngineLocation: 'global',
	// 	collection: 'default_collection',
	// 	dataStoreId: 'test-datastore',
	// 	region: 'us-central1',
	// 	embeddingModel: 'gemini-embedding-001',
	// });
	// // await store.createDataStore();
	// // await store.indexRepository('./', './src/swe/vector/google');

	// const result: ChunkSearchResult[] = await store.search('what languages are supported?');
	// for (const item of result) {
	// 	// console.log(item.score);
	// 	// console.log(item.document);
	// }

	// console.log(src)
	// console.log(await new GitLab().getBranches('devops/terraform/waf_infra'));

	// if (console.log) return;

	const files = [
		'shared/files/fileSystemService.ts',
		'shared/scm/versionControlSystem.ts',
		// 'src/functions/scm/git.ts',
		// 'src/functions/storage/fileSystemService.ts',
		'src/llm/services/mock-llm.ts',
		'src/swe/coder/validators/moduleAliasRule.ts',
		'src/swe/coder/validators/compositeValidator.ts',
		'src/swe/coder/fixSearchReplaceBlock.ts',
		'src/swe/coder/editSession.ts',
		'src/swe/coder/editApplier.ts',
		'src/swe/coder/reflectionUtils.ts',
		'src/swe/coder/searchReplaceCoder.test.ts',
		'src/swe/coder/searchReplaceCoder.ts',
	];

	// const fileContent = await getFileSystem().readFilesAsXml(files);
	// writeFileSync('coder.xml', fileContent);

	// const mad = MAD_Balanced();
	// llms().hard = mad;
	// const plan = await mad.generateText(
	// 	`${fileContent}

	// 	Analyse the SearchReplace coder and come up with a plan to improve/refactor it to make the code more clear, robust, etc
	// 	`,
	// 	{ id: 'util' },
	// );

	// console.log(plan);
	// const result = await new CodeEditingAgent().implementDetailedDesignPlan(plan, files);

	// const result = await new LlmTools().analyseFile('test/llm/document.pdf', 'What is the content of this document?');
	// console.log(result);
	// if (console) return;

	// const edited = await new SearchReplaceCoder().editFilesToMeetRequirements(
	// 	'Add another button, after the toggle thinking button, with the markdown material icon which calls a function called reformat() method on the component',
	// 	['frontend/src/app/modules/chat/conversation/conversation.component.html', 'frontend/src/app/modules/chat/conversation/conversation.component.ts'],
	// 	[],
	// );
	// console.log(await projectDetectionAgent());

	// new TypescriptRefactor().moveFile('src/routes/agent/iteration-detail/[agentId]/[iterationNumber]/GET.ts', 'src/routes/agent/iteration-detail.ts');

	// const gitlab = new GitLab();
	// const pipeline = await gitlab.getLatestMergeRequestPipeline(89, 34);
	// const failedJobs = pipeline.jobs.filter(job => job.status === 'failed');
	// const failedJobs = await gitlab.getFailedJobLogs(89, 34);
	// console.log(failedJobs);
	// console.log(pipeline)
	// console.log(await new GitLab().getProjects());
	// const fss = getFileSystem();
	// fss.setWorkingDirectory('frontend');
	// console.log(fss.getVcsRoot());
	// const fileSystemList = new FileSystemList();
	// console.log(await fileSystemList.listFiles('.', { recursive: true }));
	// console.log('FileSystemList functionality temporarily disabled');
	// const gitlab = new GitLab();
	//
	// const projects = await gitlab.getProjects();
	// console.log(projects);
	// const cloned = await gitlab.cloneProject('devops/terraform/waf_infra', 'main');
	// console.log(cloned);

	// console.log(await new Jira().getJiraDetails('CLD-1685'));

	// const edited = await new SearchReplaceCoder().editFilesToMeetRequirements(
	// 	'Add another button, after the toggle thinking button, with the markdown material icon which calls a function called reformat() method on the component',
	// 	['frontend/src/app/modules/chat/conversation/conversation.component.html', 'frontend/src/app/modules/chat/conversation/conversation.component.ts'],
	// 	[],
	// );
	// console.log(edited);
}

async function morph() {
	const fss = getFileSystem();
	const src = await new MorphAPI().edit(
		await fss.readFile('src/agent/autonomous/codegen/codegenAutonomousAgent.ts'),
		`...                                                                                                                                                                                                                                                                                 
        jsFunctionProxies[\`_\${schema.name}\`] = async (...args: any[]) => {                                                                                                                                                                                                          
            // logger.info(\`args \${JSON.stringify(args)}\`); // Can be very verbose                                                                                                                                                                                                  
            // The system prompt instructs the generated code to use positional arguments.                                                                                                                                                                                          
            const expectedParamNames: string[] = schema.parameters.map((p) => p.name);                                                                                                                                                                                              
                                                                                                                                                                                                                                                                                    
            const { finalArgs, parameters } = processFunctionArguments(args, expectedParamNames);                                                                                                                                                                                   
                                                                                                                                                                                                                                                                                    
            // Convert any Pyodide proxies in the parameters to plain JS objects before storing.                                                                                                                                                                                    
            // This is necessary because Firestore cannot handle JsProxy objects.                                                                                                                                                                                                   
            // toJs() is recursive by default and will handle nested objects and arrays.                                                                                                                                                                                            
            const convertedParameters: Record<string, any> = {};                                                                                                                                                                                                                    
            for (const key of Object.keys(parameters)) {                                                                                                                                                                                                                            
                const value = parameters[key];                                                                                                                                                                                                                                      
                if (value && typeof value.toJs === 'function') {                                                                                                                                                                                                                    
                    convertedParameters[key] = value.toJs({ dict_converter: Object.fromEntries });                                                                                                                                                                                  
                } else {                                                                                                                                                                                                                                                            
                    convertedParameters[key] = value;                                                                                                                                                                                                                               
                }                                                                                                                                                                                                                                                                   
            }                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                    
            try {                                                                                                                                                                                                                                                                   
                const functionResponse = await functionInstances[className][method](...finalArgs);                                                                                                                                                                                  
                // Don't need to duplicate the content in the function call history                                                                                                                                                                                                 
                // TODO Would be nice to save over-written memory keys for history/debugging                                                                                                                                                                                        
                let stdout = removeConsoleEscapeChars(functionResponse);                                                                                                                                                                                                            
                stdout = JSON.stringify(cloneAndTruncateBuffers(stdout));                                                                                                                                                                                                           
                if (className === 'Agent' && method === 'saveMemory') convertedParameters[AGENT_SAVE_MEMORY_CONTENT_PARAM_NAME] = '(See <memory> entry)';                                                                                                                           
                if (className === 'Agent' && method === 'getMemory') stdout = '(See <memory> entry)';                                                                                                                                                                               
                                                                                                                                                                                                                                                                                    
                let stdoutSummary: string | undefined;                                                                                                                                                                                                                              
                if (stdout && stdout.length > FUNCTION_OUTPUT_THRESHOLD) {                                                                                                                                                                                                          
                    stdoutSummary = await summarizeFunctionOutput(agent, agentPlanResponse, schema, convertedParameters, stdout);                                                                                                                                                   
                }                                                                                                                                                                                                                                                                   
                                                                                                                                                                                                                                                                                    
                const functionCallResult: FunctionCallResult = {                                                                                                                                                                                                                    
                    iteration: agent.iterations,                                                                                                                                                                                                                                    
                    function_name: schema.name,                                                                                                                                                                                                                                     
                    parameters: convertedParameters,                                                                                                                                                                                                                                
                    stdout,                                                                                                                                                                                                                                                         
                    stdoutSummary,                                                                                                                                                                                                                                                  
                };                                                                                                                                                                                                                                                                  
                agent.functionCallHistory.push(functionCallResult);                                                                                                                                                                                                                 
                currentIterationFunctionCalls.push(functionCallResult);                                                                                                                                                                                                             
                return functionResponse;                                                                                                                                                                                                                                            
            } catch (e) {                                                                                                                                                                                                                                                           
                logger.warn(e, 'Error calling function');                                                                                                                                                                                                                           
                const stderr = removeConsoleEscapeChars(errorToString(e, false));                                                                                                                                                                                                   
                if (stderr.length > FUNCTION_OUTPUT_THRESHOLD) {                                                                                                                                                                                                                    
                    // For function call errors, we might not need to summarize as aggressively as script errors.                                                                                                                                                                   
                    // Keeping existing logic, or simplify if full error is always preferred for function calls.                                                                                                                                                                    
                    // stderr = await summarizeFunctionOutput(agent, agentPlanResponse, schema, convertedParameters, stderr);                                                                                                                                                       
                }                                                                                                                                                                                                                                                                   
                const functionCallResult: FunctionCallResult = {                                                                                                                                                                                                                    
                    iteration: agent.iterations,                                                                                                                                                                                                                                    
                    function_name: schema.name,                                                                                                                                                                                                                                     
                    parameters: convertedParameters,                                                                                                                                                                                                                                
                    stderr,                                                                                                                                                                                                                                                         
                    // stderrSummary: outputSummary, TODO                                                                                                                                                                                                                           
                };                                                                                                                                                                                                                                                                  
                agent.functionCallHistory.push(functionCallResult);                                                                                                                                                                                                                 
                currentIterationFunctionCalls.push(functionCallResult);                                                                                                                                                                                                             
...`,
	);
	await fss.writeFile('src/agent/autonomous/codegen/codegenAutonomousAgent.ts', src);
}

main()
	.then(() => {
		console.log('done');
	})
	.catch((e) => {
		console.error(e);
	});
