import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
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
	markerEnd,
	style,
	selected,
	data,
}: EdgeProps<TCanvasEdge>) => {
	const { dispatch } = useWorkflowEditor();
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	return (
		<>
			<BaseEdge path={edgePath} markerEnd={markerEnd} style={style} interactionWidth={20} />
			<EdgeLabelRenderer>
				<div
					className='nodrag nopan absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1'
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
