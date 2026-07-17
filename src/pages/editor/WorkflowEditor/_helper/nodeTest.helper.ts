/**
 * Single-node test execution. Outputs are simulated — swap `runNodeTest` for the
 * real per-node run endpoint once it exists; callers need no change.
 */
const MOCK_OUTPUTS: Record<string, unknown> = {
	'trigger.webhook': { method: 'POST', body: { userId: 'u_123', event: 'signup' } },
	'ai.agent': { response: 'Processed successfully.', tokens: 142, confidence: 0.94 },
	'ai.extract': { fields: { name: 'John Doe', email: 'john@example.com' } },
	'data.http': { status: 200, data: { id: 1, value: 'sample' } },
	'data.database': {
		rows: [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' },
		],
		count: 2,
	},
	'logic.condition': { branch: 'true', passed: true },
	'integration.slack': { ok: true, messageId: 'msg_abc123' },
	'output.display': { rendered: true },
};

export type TNodeTestResult = {
	status: 'success' | 'error';
	output: unknown;
};

export const runNodeTest = async (defKey: string): Promise<TNodeTestResult> => {
	await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 600));

	if (Math.random() > 0.15) {
		return {
			status: 'success',
			output: MOCK_OUTPUTS[defKey] ?? { result: 'OK', timestamp: Date.now() },
		};
	}
	return {
		status: 'error',
		output: { error: 'Simulated test failure', code: 500 },
	};
};
