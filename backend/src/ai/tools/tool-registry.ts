import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { LlmTool } from '../interfaces/ai.types';
import { TOOL_DEFINITIONS, ToolInputSchema } from './tool-schemas';

export interface ToolHandler {
  (params: { projectId: string }, userId: string): Promise<unknown>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: ZodSchema;
  outputSchema: ZodSchema;
  handler: ToolHandler;
}

@Injectable()
export class ToolRegistry {
  private readonly logger = new Logger(ToolRegistry.name);
  private readonly tools = new Map<string, ToolDefinition>();

  register(definition: ToolDefinition): void {
    this.tools.set(definition.name, definition);
  }

  getToolsForPrompt(): LlmTool[] {
    const registeredNames = new Set(this.tools.keys());
    return TOOL_DEFINITIONS
      .filter((def) => registeredNames.has(def.function.name))
      .map((def) => ({
        type: 'function' as const,
        function: {
          name: def.function.name,
          description: def.function.description,
          parameters: def.function.parameters,
        },
      }));
  }

  async execute(
    name: string,
    argsJson: string,
    userId: string,
  ): Promise<string> {
    const definition = this.tools.get(name);
    if (!definition) {
      this.logger.warn(`Tool '${name}' not found in registry`);
      return JSON.stringify({ error: `Outil inconnu: ${name}` });
    }

    let parsedArgs: unknown;
    try {
      parsedArgs = JSON.parse(argsJson);
    } catch {
      return JSON.stringify({ error: `Arguments invalides (JSON mal formé) pour ${name}` });
    }

    const inputValidation = definition.inputSchema.safeParse(parsedArgs);
    if (!inputValidation.success) {
      const errors = inputValidation.error.issues.map((e) => e.message).join(', ');
      return JSON.stringify({ error: `Paramètres invalides pour ${name}: ${errors}` });
    }

    try {
      const result = await definition.handler(inputValidation.data as { projectId: string }, userId);

      const outputValidation = definition.outputSchema.safeParse(result);
      if (!outputValidation.success) {
        this.logger.error(
          `Tool '${name}' output validation failed: ${outputValidation.error.message}`,
        );
      }

      return JSON.stringify(outputValidation.data ?? result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Tool '${name}' execution failed: ${message}`);
      return JSON.stringify({ error: message });
    }
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }
}
