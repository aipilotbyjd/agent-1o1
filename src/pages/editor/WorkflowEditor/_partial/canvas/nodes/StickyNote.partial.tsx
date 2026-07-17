import { type NodeProps } from '@xyflow/react';
import type { TCanvasNode } from '../../../_types/canvas.type';

const StickyNote = ({ data, selected }: NodeProps<TCanvasNode>) => (
	<div
		className={[
			'w-[200px] rounded-md border p-3 text-left shadow-lg transition',
			'border-amber-300 bg-amber-100 text-amber-950',
			'dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200',
			selected ? 'ring-4 ring-amber-400/40' : '',
		].join(' ')}>
		<div className='text-xs font-black tracking-widest text-amber-700 uppercase dark:text-amber-400'>
			Note
		</div>
		<div className='mt-1 text-sm whitespace-pre-line'>
			{String(data.values.content ?? 'Add notes in the inspector.')}
		</div>
	</div>
);

export default StickyNote;
