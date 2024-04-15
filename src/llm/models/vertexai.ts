import { HarmBlockThreshold, HarmCategory, SafetySetting, VertexAI } from '@google-cloud/vertexai';
import { WorkflowLLMs, addCost } from '#agent/workflows';
import { withActiveSpan } from '#o11y/trace';
import { projectId, region } from '../../config';
import { BaseLLM } from '../base-llm';
import { combinePrompts, logTextGeneration } from '../llm';
import { MultiLLM } from '../multi-llm';

const vertexAI = new VertexAI({ project: projectId, location: region });

export function GEMINI_1_0_PRO_LLMS(): WorkflowLLMs {
	const pro1_0 = Gemini_1_0_Pro();
	return {
		easy: pro1_0,
		medium: pro1_0,
		hard: pro1_0,
		xhard: new MultiLLM([pro1_0], 5),
	};
}

export function GEMINI_1_5_PRO_LLMS(): WorkflowLLMs {
	const pro1_5 = Gemini_1_5_Pro();
	return {
		easy: pro1_5,
		medium: pro1_5,
		hard: pro1_5,
		xhard: new MultiLLM([pro1_5], 5),
	};
}

export function Gemini_1_0_Pro() {
	return new VertexLLM('gemini-1.0-pro-001', 32_000, 0.0036 / 1000, 0.018 / 1000);
}

// gemini-1.5-pro-latest
export function Gemini_1_5_Pro() {
	return new VertexLLM('gemini-1.5-pro-preview-0409', 1_000_000, 0.0036 / 1000, 0.018 / 1000);
}

/**
 * Vertex AI models - Gemini
 */
class VertexLLM extends BaseLLM {
	@logTextGeneration
	async generateText(userPrompt: string, systemPrompt: string): Promise<string> {
		return withActiveSpan('generateText', async (span) => {
			const prompt = combinePrompts(userPrompt, systemPrompt);

			if (systemPrompt) span.setAttribute('systemPrompt', systemPrompt);
			span.setAttributes({
				userPrompt,
				inputChars: prompt.length,
				model: this.model,
			});

			const generativeModel = vertexAI.preview.getGenerativeModel({
				model: this.model,
				generationConfig: {
					maxOutputTokens: this.model.includes('1.5-pro') ? 8192 : 4096,
					temperature: 1,
					topP: 0.95,
					stopSequences: ['</response>'],
				},
				safetySettings: SAFETY_SETTINGS,
			});

			const request = {
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
			};

			// const inputTokens = await generativeModel.countTokens(request);

			const streamingResp = await generativeModel.generateContentStream(request);
			let response = '';
			for await (const item of streamingResp.stream) {
				response += item.candidates[0].content.parts[0].text;
			}

			const inputCost = prompt.length * this.getInputCostPerToken();
			const outputCost = response.length * this.getOutputCostPerToken();
			const cost = inputCost + outputCost;
			console.log(this.model, 'input', prompt.length, 'output', response.length);
			span.setAttributes({
				response,
				inputCost,
				outputCost,
				cost,
				outputChars: response.length,
			});
			addCost(cost);

			return response;
		});
	}
}

const SAFETY_SETTINGS: SafetySetting[] = [
	{
		category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_HARASSMENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
];
