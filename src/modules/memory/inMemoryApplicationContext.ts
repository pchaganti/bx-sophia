import type { ApplicationContext } from '#app/applicationTypes';
import { InMemoryAgentStateService } from '#modules/memory/inMemoryAgentStateService';
import { InMemoryChatService } from '#modules/memory/inMemoryChatService';
import { InMemoryCodeReviewService } from '#modules/memory/inMemoryCodeReviewService';
import { InMemoryFunctionCacheService } from '#modules/memory/inMemoryFunctionCacheService';
import { InMemoryLlmCallService } from '#modules/memory/inMemoryLlmCallService';
import { InMemoryUserService } from '#modules/memory/inMemoryUserService';
import { InMemoryVibeService } from '#modules/memory/inMemoryVibeService';

export function inMemoryApplicationContext(): ApplicationContext {
	return {
		agentStateService: new InMemoryAgentStateService(),
		chatService: new InMemoryChatService(),
		userService: new InMemoryUserService(),
		llmCallService: new InMemoryLlmCallService(),
		codeReviewService: new InMemoryCodeReviewService(),
		functionCacheService: new InMemoryFunctionCacheService(),
		vibeService: new InMemoryVibeService(),
	};
}
