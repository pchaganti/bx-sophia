import { Agent } from '#agent/autonomous/functions/agentFunctions';
import { functionFactory } from '#functionSchema/functionDecorators';
import { FUNC_SEP, type FunctionSchema, getFunctionSchemas } from '#functionSchema/functions';
import { FileSystemRead } from '#functions/storage/fileSystemRead'; // Ensure FileSystemRead is imported
import { logger } from '#o11y/logger';
import type { LlmFunctions } from '#shared/agent/agent.model';
import { type ToolType, toolType } from '#shared/agent/functions';
import type { FunctionCall } from '#shared/llm/llm.model';

/**
 * Holds the instances of the classes with function callable methods.
 */
export class LlmFunctionsImpl implements LlmFunctions {
	functionInstances: { [functionClassName: string]: object } = {
		Agent: new Agent(),
	};

	constructor(...functionClasses: Array<new () => any>) {
		this.addFunctionClass(...functionClasses);
	}

	toJSON() {
		return {
			functionClasses: Object.keys(this.functionInstances),
		};
	}

	fromJSON(obj: any): this {
		if (!obj) return this;

		// For backward compatibility with an older format that might use 'tools' key
		const functionClassNames = (obj.functionClasses ?? obj.tools) as string[];

		if (!Array.isArray(functionClassNames)) {
			logger.warn('LlmFunctionsImpl.fromJSON: functionClassNames is not an array or missing.', { receivedObject: obj });
			return this;
		}

		const currentFactory = functionFactory(); // Get the factory

		for (const functionClassName of functionClassNames) {
			if (typeof functionClassName !== 'string') {
				logger.warn(`LlmFunctionsImpl.fromJSON: Encountered non-string class name: ${functionClassName}`, { receivedObject: obj });
				continue;
			}

			const FuncClassConstructor = currentFactory[functionClassName];

			if (FuncClassConstructor) {
				try {
					this.functionInstances[functionClassName] = new FuncClassConstructor();
				} catch (e) {
					logger.error(`Error instantiating function class ${functionClassName} during fromJSON: ${e.message}`, { error: e });
				}
			} else if (functionClassName === 'FileSystem') {
				// Specific backward compatibility for 'FileSystem' mapping to FileSystemRead
				this.functionInstances[FileSystemRead.name] = new FileSystemRead();
			} else {
				logger.warn(`LlmFunctionsImpl.fromJSON: Function class '${functionClassName}' not found in factory.`);
			}
		}
		return this;
	}

	removeFunctionClass(functionClassName: string): void {
		delete this.functionInstances[functionClassName];
	}

	getFunctionInstances(): Array<object> {
		return Object.values(this.functionInstances);
	}

	getFunctionInstanceMap(): Record<string, object> {
		return this.functionInstances;
	}

	getFunctionClassNames(): string[] {
		return Object.keys(this.functionInstances);
	}

	getFunctionType(type: ToolType): any {
		return Object.values(this.functionInstances).find((obj) => toolType(obj) === type);
	}

	addFunctionInstance(functionClassInstance: object, name: string): void {
		this.functionInstances[name] = functionClassInstance;
	}

	addFunctionClass(...functionClasses: Array<new () => any>): void {
		// Check the prototype of the instantiated function class has the functions metadata
		for (const functionClass of functionClasses) {
			try {
				this.functionInstances[functionClass.name] = new functionClass();
			} catch (e) {
				logger.error(`Error instantiating function class from type of ${typeof functionClass}`);
				throw e;
			}
		}
	}

	async callFunction(functionCall: FunctionCall): Promise<any> {
		const [functionClass, functionName] = functionCall.function_name.split(FUNC_SEP);
		const functionClassInstance = this.functionInstances[functionClass];
		if (!functionClassInstance) throw new Error(`Function class ${functionClass} does not exist`);
		const func = functionClassInstance[functionName];
		if (!func) throw new Error(`Function ${functionClass}${FUNC_SEP}${functionName} does not exist`);
		if (typeof func !== 'function') throw new Error(`Function error: ${functionClass}.${functionName} is not a function. Is a ${typeof func}`);

		const args = Object.values(functionCall.parameters);
		let result: any;
		if (args.length === 0) {
			result = await func.call(functionClassInstance);
		} else if (args.length === 1) {
			result = await func.call(functionClassInstance, args[0]);
		} else {
			const functionSchemas: Record<string, FunctionSchema> = getFunctionSchemas(functionClassInstance);
			let functionDefinition = functionSchemas[functionName];
			if (!functionDefinition) {
				// Seems bit of a hack, why coming through in both formats? Also doing this in functionDecorators.ts
				functionDefinition = functionSchemas[`${functionClass}${FUNC_SEP}${functionName}`];
			}
			if (!functionDefinition) throw new Error(`No function schema found for ${functionName}.  Valid functions are ${Object.keys(functionSchemas)}`);
			if (!functionDefinition.parameters) {
				logger.error(`${functionClass}${FUNC_SEP}${functionName} schema doesnt have any parameters`);
				logger.info(functionDefinition);
			}
			const args: any[] = new Array(functionDefinition.parameters.length);
			for (const [paramName, paramValue] of Object.entries(functionCall.parameters)) {
				const paramDef = functionDefinition.parameters.find((paramDef) => paramDef.name === paramName);
				if (!paramDef)
					throw new Error(
						`Invalid parameter name: ${paramName} for function ${functionCall.function_name}. Valid parameters are: ${functionDefinition.parameters
							.map((paramDef) => paramDef.name)
							.join(', ')}`,
					);
				args[paramDef.index] = paramValue;
			}
			result = await func.call(functionClassInstance, ...args);
		}
		return result;
	}
}
