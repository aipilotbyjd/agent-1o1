import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { useWorkflowEditor } from '../../_context/WorkflowEditorProvider.context';
import type { TCanvasEdge } from '../../_types/canvas.type';

const ClickEdge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style,
	selected,
	data,
}: EdgeProps<TCanvasEdge>) => {
	const { dispatch } = useWorkflowEditor();
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
		borderRadius: 16,
	});

	const stroke = (style?.stroke as string) ?? 'rgb(139 92 246)';
	const arrowId = `edge-arrow-${id}`;

	return (
		<>
			<defs>
				<marker
					id={arrowId}
					viewBox='0 0 10 10'
					refX='8'
					refY='5'
					markerWidth='6'
					markerHeight='6'
					orient='auto-start-reverse'>
					<path d='M 0 0 L 10 5 L 0 10 z' fill={stroke} />
				</marker>
			</defs>
			{/* Solid colored base line */}
			<BaseEdge
				path={edgePath}
				markerEnd={`url(#${arrowId})`}
				style={{ ...style, stroke, strokeWidth: 3 }}
				interactionWidth={20}
			/>
			{/* Animated flowing dash on top of the line */}
			<path
				d={edgePath}
				fill='none'
				stroke='rgba(255,255,255,0.85)'
				strokeWidth={2}
				strokeLinecap='round'
				strokeDasharray='6 18'
				className='workflow-edge-flow pointer-events-none'
			/>
			<EdgeLabelRenderer>
				<div
					className={[
						'nodrag nopan absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 transition-opacity duration-150',
						selected ? 'opacity-100' : 'opacity-0 hover:opacity-100',
					].join(' ')}
					style={{
						transform: `translate(${labelX}px, ${labelY}px)`,
						pointerEvents: 'all',
					}}>
					<span
						title={
							data?.issue ? String(data.issue) : String(data?.label ?? 'Connection')
						}
						className={[
							'rounded-full border bg-white px-2 py-0.5 text-[10px] font-black shadow dark:bg-zinc-900',
							data?.issue
								? 'border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-300'
								: 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-300',
							data?.isActive ? 'ring-2 ring-emerald-400/40' : '',
						].join(' ')}
						style={{
							borderColor: data?.labelColor ? String(data.labelColor) : undefined,
						}}>
						{data?.issue ? '!' : String(data?.label ?? 'flow')}
					</span>
					<button
						type='button'
						onClick={() => dispatch({ type: 'REMOVE_EDGE', id })}
						title='Remove connection'
						className={[
							'h-5 w-5 rounded-full border text-[10px] leading-none shadow transition',
							'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100',
							'dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
							selected ? 'ring-2 ring-violet-400/50' : '',
						].join(' ')}>
						x
					</button>
				</div>
			</EdgeLabelRenderer>
		</>
	);
};

export default ClickEdge;
