import { getNodeDefinition } from './nodeCatalog.constants';
import type { TCanvasEdge, TCanvasNode } from '../_types/canvas.type';

/**
 * Frontend execution runtime for the workflow editor.
 *
 * There is no backend here — instead of issuing real network/API calls we run a
 * deterministic simulation that genuinely flows data from node to node, resolves
 * {{variable}} expressions against upstream outputs, evaluates branch conditions,
 * and executes user-authored Code nodes in a sandboxed Function. This is what
 * makes loops, conditions, expressions and the Code node behave for real.
 */

export type TNodeOutputs = Record<string, unknown>;

/** Sanitise a value into something safe to read inside an evaluated expression. */
const asScopeObject = (value: unknown): Record<string, unknown> => {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return value as Record<string, unknown>;
	}
	return { value };
};

/**
 * Build a map of `{{Node Label.port}}` → resolved value from the outputs produced
 * so far. Mirrors the token format emitted by collectUpstreamVariables.
 */
export const buildTokenMap = (
	nodes: TCanvasNode[],
	outputs: TNodeOutputs,
): Map<string, unknown> => {
	const tokens = new Map<string, unknown>();
	nodes.forEach((node) => {
		if (!(node.id in outputs)) return;
		const def = getNodeDefinition(node.data.defKey, node.data.definition);
		const output = outputs[node.id];
		(def?.outputs ?? []).forEach((port) => {
			const scoped =
				output && typeof output === 'object' && port.name in (output as object)
					? (output as Record<string, unknown>)[port.name]
					: output;
			tokens.set(`{{${node.data.label}.${port.name}}}`, scoped);
		});
		// Also expose the whole output under the bare label for convenience.
		tokens.set(`{{${node.data.label}}}`, output);
	});
	return tokens;
};

const stringifyToken = (value: unknown): string => {
	if (value === null || value === undefined) return '';
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
};

/** Replace every `{{...}}` token in a string with its resolved value. */
export const resolveExpressions = (input: unknown, tokens: Map<string, unknown>): unknown => {
	if (typeof input !== 'string') return input;
	if (!input.includes('{{')) return input;

	// If the whole string is a single token, return the raw value (keeps types).
	const single = input.match(/^\s*(\{\{[^}]+\}\})\s*$/);
	if (single && tokens.has(single[1])) return tokens.get(single[1]);

	return input.replace(/\{\{[^}]+\}\}/g, (match) =>
		tokens.has(match) ? stringifyToken(tokens.get(match)) : match,
	);
};

/** Resolve every field value's expressions against the current token map. */
export const resolveNodeValues = (
	values: Record<string, unknown>,
	tokens: Map<string, unknown>,
): Record<string, unknown> => {
	const resolved: Record<string, unknown> = {};
	Object.entries(values).forEach(([key, value]) => {
		resolved[key] = resolveExpressions(value, tokens);
	});
	return resolved;
};

/**
 * Evaluate a boolean expression against an input payload. The payload's own keys
 * are exposed as locals (so `lead.score >= 80` works) plus `input`, `value`,
 * `item` and `$json` aliases. Failures resolve to false.
 */
export const evaluateCondition = (expression: string, input: unknown): boolean => {
	if (!expression?.trim()) return true;
	const scope = asScopeObject(input);
	const keys = Object.keys(scope);
	try {
		const fn = new Function(
			...keys,
			'input',
			'value',
			'item',
			'$json',
			`"use strict"; return Boolean(${expression});`,
		);
		return Boolean(fn(...keys.map((k) => scope[k]), input, input, input, input));
	} catch {
		return false;
	}
};

export type TExecutionResult = {
	output: unknown;
	/** For branching nodes, which output handle is active. */
	branch?: string;
};

const sampleFromSchema = (raw: unknown): unknown => {
	if (typeof raw !== 'string') return { extracted: true };
	try {
		const schema = JSON.parse(raw) as Record<string, unknown>;
		const out: Record<string, unknown> = {};
		Object.entries(schema).forEach(([key, type]) => {
			out[key] =
				type === 'number' ? 42 : type === 'boolean' ? true : `sample ${key}`;
		});
		return out;
	} catch {
		return { extracted: 'value', confidence: 0.92 };
	}
};

/**
 * Execute a single node given its resolved field values and upstream inputs.
 * Returns the produced output and (for branch nodes) the active branch handle.
 */
export const executeNode = (
	node: TCanvasNode,
	inputs: unknown[],
	resolvedValues: Record<string, unknown>,
): TExecutionResult => {
	const def = getNodeDefinition(node.data.defKey, node.data.definition);
	const primaryInput = inputs.length <= 1 ? inputs[0] : inputs;
	const category = def?.category;

	switch (def?.key) {
		case 'utility.code': {
			const code = String(resolvedValues.code ?? 'return input;');
			try {
				const fn = new Function('input', 'items', '$json', `"use strict";\n${code}`);
				return { output: fn(primaryInput, inputs, primaryInput) };
			} catch (error) {
				throw new Error(
					error instanceof Error ? error.message : 'Code execution failed',
				);
			}
		}
		case 'logic.condition':
		case 'logic.if': {
			const expr = String(resolvedValues.expression ?? '');
			const passed = evaluateCondition(expr, primaryInput);
			return {
				output: { branch: passed ? 'true' : 'false', passed, input: primaryInput },
				branch: passed ? 'true' : 'false',
			};
		}
		case 'utility.delay':
			return { output: primaryInput ?? resolvedValues };
		default:
			break;
	}

	switch (category) {
		case 'trigger':
			return {
				output: {
					triggeredAt: new Date().toISOString(),
					...resolvedValues,
				},
			};
		case 'input':
			return { output: { value: resolvedValues.question ?? resolvedValues.value ?? 'sample input' } };
		case 'ai': {
			const prompt = String(resolvedValues.prompt ?? resolvedValues.goal ?? '');
			return {
				output: prompt
					? `AI response for: "${prompt.slice(0, 80)}"`
					: 'Generated AI response preview.',
			};
		}
		case 'extract':
			return { output: sampleFromSchema(resolvedValues.schema) };
		case 'scrape':
			return { output: `# ${resolvedValues.url ?? 'page'}\n\nFetched markdown content preview.` };
		case 'data':
			return {
				output: {
					status: 200,
					url: resolvedValues.url,
					method: resolvedValues.method ?? 'GET',
					data: { id: 1, value: 'sample', input: primaryInput ?? null },
				},
			};
		case 'storage':
			return {
				output: {
					operation: resolvedValues.operation ?? 'upsert',
					table: resolvedValues.table,
					rows: [{ id: 1 }, { id: 2 }],
					count: 2,
				},
			};
		case 'loop': {
			const items = Array.isArray(primaryInput)
				? primaryInput
				: [{ index: 0, item: primaryInput }];
			return { output: { items, count: items.length } };
		}
		case 'integration':
			return { output: { sent: true, channel: resolvedValues.channel, message: resolvedValues.message } };
		case 'output':
			return { output: primaryInput ?? resolvedValues.name ?? 'result' };
		default:
			return { output: { ...resolvedValues, input: primaryInput ?? null } };
	}
};

/** Active edge = source ran and (if source branched) the handle matches the decision. */
export const isEdgeActive = (
	edge: TCanvasEdge,
	outputs: TNodeOutputs,
	branches: Record<string, string>,
	skipped: Set<string>,
): boolean => {
	if (skipped.has(edge.source)) return false;
	if (!(edge.source in outputs)) return false;
	const branch = branches[edge.source];
	if (branch && edge.sourceHandle) return edge.sourceHandle === branch;
	return true;
};
