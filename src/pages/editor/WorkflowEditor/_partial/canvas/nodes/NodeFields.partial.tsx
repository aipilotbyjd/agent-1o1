import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useWorkflowEditor } from '../../../_context/WorkflowEditorProvider.context';
import type { TNodeField } from '../../../_types/node.type';
import FieldInput from './FieldInput.partial';

const COLLAPSED_COUNT = 3;

type Props = {
	nodeId: string;
	fields: TNodeField[];
	values: Record<string, unknown>;
};

const NodeFields = ({ nodeId, fields, values }: Props) => {
	const { dispatch } = useWorkflowEditor();
	const [expanded, setExpanded] = useState(false);

	if (fields.length === 0) return null;

	const visible = expanded ? fields : fields.slice(0, COLLAPSED_COUNT);
	const hiddenCount = fields.length - visible.length;

	return (
		<div
			className='nodrag nowheel flex flex-col gap-3'
			onPointerDown={(event) => event.stopPropagation()}>
			{visible.map((field) => (
				<div key={field.key}>
					<div className='mb-1.5 flex items-center gap-1'>
						<span className='truncate text-[11px] font-bold text-zinc-800 dark:text-zinc-200'>
							{field.label}
						</span>
						{field.required && <span className='text-rose-500'>*</span>}
						<Info size={11} className='text-zinc-400' />
					</div>
					<FieldInput
						compact
						field={field}
						value={values[field.key]}
						onChange={(value) =>
							dispatch({
								type: 'UPDATE_NODE_VALUE',
								id: nodeId,
								fieldKey: field.key,
								value,
							})
						}
					/>
				</div>
			))}

			{fields.length > COLLAPSED_COUNT && (
				<button
					type='button'
					onClick={() => setExpanded((value) => !value)}
					className='mt-0.5 flex cursor-pointer items-center gap-1.5 self-start rounded-md border border-zinc-200 bg-white px-2 py-1 text-[10px] font-semibold text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400'>
					{expanded ? (
						<>
							<ChevronUp size={11} /> Show less
						</>
					) : (
						<>
							<ChevronDown size={11} /> Show {hiddenCount} more
						</>
					)}
				</button>
			)}
		</div>
	);
};

export default NodeFields;
