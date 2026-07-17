import { X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowEditor } from '../../_context/WorkflowEditorProvider.context';
import { getNodeDefinition } from '../../_helper/nodeCatalog.constants';
import NodeFields from '../canvas/nodes/NodeFields.partial';
import ApiNodeIcon from '../library/NodeIcon.partial';
import { tintStyle } from '../library/library.util';

const NodeExpandedView = () => {
	const { state, dispatch } = useWorkflowEditor();
	if (!state.ui.nodeExpandedOpen) return null;

	const nodeId = state.ui.nodeExpandedId ?? state.ui.selectedNodeId;
	const node = state.nodes.find((n) => n.id === nodeId);
	const def = node ? getNodeDefinition(node.data.defKey, node.data.definition) : null;

	if (!node || !def) return null;

	const brand = (def?.key.split('.')[0] ?? def?.category ?? 'node')
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
	const effectiveColorHex = node.data.color ?? def?.colorHex;

	return (
		<AnimatePresence>
			<motion.div
				key='node-expanded-backdrop'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.22 }}
				onClick={() => dispatch({ type: 'SET_NODE_EXPANDED', open: false })}
				className='fixed inset-0 z-40 bg-black/30 dark:bg-black/50'
			/>

			<motion.div
				key='node-expanded-modal'
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.95, opacity: 0 }}
				transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
				onClick={(e) => e.stopPropagation()}
				className='fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-950 sm:inset-8 md:inset-12 lg:inset-16'>
				{/* Header */}
				<div className='flex items-start justify-between border-b border-zinc-200 px-6 py-4 dark:border-white/[0.06]'>
					<div className='flex flex-1 items-start gap-4'>
						<div
							className='flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl text-white'
							style={tintStyle(effectiveColorHex)}>
							{def?.icon ? (
								<ApiNodeIcon icon={def.icon} size={32} />
							) : (
								<Maximize2 size={32} />
							)}
						</div>

						<div className='flex-1 min-w-0'>
							<div className='flex items-center gap-2 mb-1'>
								<span className='text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase'>
									{brand}
								</span>
							</div>
							<h2 className='text-2xl font-bold text-zinc-900 dark:text-white mb-1'>
								{node.data.label || def?.label || 'Node'}
							</h2>
							<p className='text-sm text-zinc-600 dark:text-zinc-400'>
								{def?.description}
							</p>
						</div>
					</div>

					<button
						type='button'
						onClick={() => dispatch({ type: 'SET_NODE_EXPANDED', open: false })}
						className='ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/[0.07] dark:hover:text-white transition'>
						<X size={18} />
					</button>
				</div>

				{/* Content */}
				<div className='flex-1 overflow-y-auto px-6 py-6'>
					{def.fields.length > 0 ? (
						<div className='space-y-6'>
							<div>
								<h3 className='text-sm font-semibold text-zinc-900 dark:text-white mb-4'>
									Configuration
								</h3>
								<NodeFields
									nodeId={node.id}
									fields={def.fields}
									values={node.data.values}
								/>
							</div>
						</div>
					) : (
						<div className='flex items-center justify-center h-full text-sm text-zinc-500 dark:text-zinc-400'>
							No configuration fields
						</div>
					)}
				</div>
			</motion.div>
		</AnimatePresence>
	);
};

export default NodeExpandedView;
