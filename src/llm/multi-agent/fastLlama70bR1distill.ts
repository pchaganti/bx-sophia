import { deepinfraDeepSeekR1 } from '#llm/services/deepinfra';
import { sambanovaLlama3_3_70b_R1_Distill } from '#llm/services/sambanova';
import { togetherLlama3_70B_R1_Distill } from '#llm/services/together';
import { logger } from '#o11y/logger';
import type { GenerateTextOptions, LLM, LlmMessage } from '#shared/llm/llm.model';
import { BaseLLM } from '../base-llm';

/**
 * LLM implementation for Llama 3.3 70b DeepSeek R1 distill that prioritizes speed and falls back to other providers.
 */
export class MultiLlama3_70B_R1_Distill extends BaseLLM {
	private readonly providers: LLM[];

	constructor() {
		super('Llama3.3-70b R1 Distill (Fast)', 'multi', 'fast-llama3-70b-r1-distill', 0, () => ({
			inputCost: 0,
			outputCost: 0,
			totalCost: 0,
		}));
		// Define the providers and their priorities. Lower number = higher priority
		this.providers = [sambanovaLlama3_3_70b_R1_Distill(), togetherLlama3_70B_R1_Distill(), deepinfraDeepSeekR1()];

		this.maxInputTokens = Math.max(...this.providers.map((p) => p.getMaxInputTokens()));
	}

	isConfigured(): boolean {
		return this.providers.findIndex((llm) => !llm.isConfigured()) === -1;
	}

	protected supportsGenerateTextFromMessages(): boolean {
		return true;
	}

	async generateTextFromMessages(messages: LlmMessage[], opts?: GenerateTextOptions): Promise<string> {
		for (const llm of this.providers) {
			if (!llm.isConfigured()) continue;

			// const combinedPrompt = messages.map((m) => m.content).join('\n');
			// if (combinedPrompt.length > llm.getMaxInputTokens()) {
			// 	logger.warn(`Input tokens exceed limit for ${llm.getDisplayName()}. Trying next provider.`);
			// 	continue;
			// }
			try {
				logger.info(`Trying ${llm.getDisplayName()}`);
				return await llm.generateText(messages, opts);
			} catch (error) {
				logger.error(`Error with ${llm.getDisplayName()}: ${error.message}. Trying next provider.`);
			}
		}
		throw new Error('All Llama 3.3 70b R1 Distilll providers failed.');
	}
}
