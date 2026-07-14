import { useState } from 'react';
import { Beaker, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useWorkflowEditor } from '../../../_context/WorkflowEditorProvider.context';
import type { TNodeDefinition } from '../../../_types/node.type';

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

const NodeInlineTest = ({
	nodeId,
	defKey,
	def,
}: {
	nodeId: string;
	defKey: string;
	def: TNodeDefinition | null;
}) => {
	const { state, dispatch } = useWorkflowEditor();
	const node = state.nodes.find((n) => n.id === nodeId);
	const testStatus = node?.data.testStatus ?? 'idle';
	const testOutput = node?.data.testOutput;
	const [expanded, setExpanded] = useState(false);

	const runTest = async (e: React.MouseEvent) => {
		e.stopPropagation();
		dispatch({ type: 'SET_NODE_TEST_STATUS', id: nodeId, status: 'running' });

		await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 600));

		const succeed = Math.random() > 0.15;
		if (succeed) {
			const output = MOCK_OUTPUTS[defKey] ?? { result: 'OK', timestamp: Date.now() };
			dispatch({ type: 'SET_NODE_TEST_STATUS', id: nodeId, status: 'success', output });
		} else {
			dispatch({
				type: 'SET_NODE_TEST_STATUS',
				id: nodeId,
				status: 'error',
				output: { error: 'Simulated test failure', code: 500 },
			});
		}
		setExpanded(true);
	};

	const statusIcon = {
		idle: <Beaker size={11} />,
		running: <Loader2 size={11} className='animate-spin' />,
		success: <CheckCircle2 size={11} className='text-emerald-500' />,
		error: <AlertCircle size={11} className='text-rose-500' />,
	}[testStatus];

	const btnClass = {
		idle: 'border-zinc-200 text-zinc-500 hover:border-primary-300 hover:text-primary-600 dark:border-zinc-700 dark:hover:border-primary-700 dark:hover:text-primary-400',
		running:
			'border-sky-300 text-sky-600 dark:border-sky-700 dark:text-sky-400 cursor-not-allowed',
		success:
			'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400',
		error: 'border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-400',
	}[testStatus];

	return (
		<div className='mt-3'>
			<div className='flex items-center gap-2'>
				<button
					type='button'
					disabled={testStatus === 'running'}
					onClick={runTest}
					className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[11px] font-bold transition ${btnClass}`}>
					{statusIcon}
					{testStatus === 'running' ? 'Testing…' : 'Test Node'}
				</button>
				{testOutput !== undefined && (
					<button
						type='button'
						onClick={(e) => {
							e.stopPropagation();
							setExpanded((prev) => !prev);
						}}
						className='flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-600 dark:border-zinc-700'>
						{expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
					</button>
				)}
			</div>

			{expanded && testOutput !== undefined && (
				<div
					className={`mt-2 rounded-lg border p-2 ${
						testStatus === 'error'
							? 'border-rose-100 bg-rose-50 dark:border-rose-900/30 dark:bg-rose-950/20'
							: 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20'
					}`}>
					<div className='mb-1 text-[10px] font-bold tracking-wide text-zinc-500 uppercase'>
						Test Output
					</div>
					<pre className='max-h-28 overflow-y-auto text-[10px] text-zinc-700 dark:text-zinc-300'>
						{JSON.stringify(testOutput, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
};

export default NodeInlineTest;
