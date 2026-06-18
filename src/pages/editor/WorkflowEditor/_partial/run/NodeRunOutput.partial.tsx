import type { TCanvasNode } from '../../_types/canvas.type';

const NodeRunOutput = ({ nodes }: { nodes: TCanvasNode[] }) => {
	const nodesWithOutput = nodes.filter((node) => node.data.outputPreview !== undefined).slice(-3);

	if (!nodesWithOutput.length) {
		return (
			<div className='flex h-32 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'>
				Node outputs will appear here after running
			</div>
		);
	}

	return (
		<div className='grid gap-2 md:grid-cols-3'>
			{nodesWithOutput.map((node) => (
				<div
					key={node.id}
					className='rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900'>
					<div className='mb-2 flex items-center justify-between'>
						<div className='truncate text-xs font-black text-zinc-800 dark:text-zinc-200'>
							{node.data.label}
						</div>
						{node.data.durationMs && (
							<span className='text-[10px] text-zinc-500 dark:text-zinc-400'>
								{node.data.durationMs}ms
							</span>
						)}
					</div>
					<pre className='max-h-24 overflow-y-auto text-[10px] text-zinc-600 dark:text-zinc-400'>
						{JSON.stringify(node.data.outputPreview, null, 2)}
					</pre>
				</div>
			))}
		</div>
	);
};

export default NodeRunOutput;
