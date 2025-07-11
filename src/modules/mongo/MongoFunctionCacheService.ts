import type { Db } from 'mongodb';
import type { CacheScope, FunctionCacheService } from '#cache/functionCacheService';

export class MongoFunctionCacheService implements FunctionCacheService {
	constructor(private db: Db) {}

	async getValue(scope: CacheScope, className: string, method: string, params: any[]): Promise<any | null> {
		// TODO: Implement method
		throw new Error('Method not implemented.');
	}

	async setValue(scope: CacheScope, className: string, method: string, params: any[], value: any): Promise<void> {
		// TODO: Implement method
		throw new Error('Method not implemented.');
	}

	async clearAgentCache(agentId: string): Promise<number> {
		// TODO: Implement method
		throw new Error('Method not implemented.');
	}

	async clearUserCache(userId: string): Promise<number> {
		// TODO: Implement method
		throw new Error('Method not implemented.');
	}
}
