import { motion } from 'framer-motion';
import { X, Info, User, Check, AlertCircle } from 'lucide-react';
import { useWorkflowEditor } from '../../_context/WorkflowEditorProvider.context';
import { getNodeDefinition } from '../../_helper/nodeCatalog.constants';
import { useState } from 'react';

const LinkCredentialsDialog = () => {
	const { state, dispatch } = useWorkflowEditor();
	const open = state.ui.linkCredentialsOpen;
	const [linkedIds, setLinkedIds] = useState<Record<string, boolean>>({});

	if (!open) return null;

	const handleClose = () => {
		dispatch({ type: 'SET_LINK_CREDENTIALS_OPEN', open: false });
	};

	// Find all nodes that require credentials but don't have them configured
	const missingNodes = state.nodes.filter((node) => {
		const def = getNodeDefinition(node.data.defKey, node.data.definition);
		return Boolean(def?.requiresCredential) && !node.data.values.credential_id && !linkedIds[node.id];
	});

	const showMockGoogle = state.nodes.length === 0 && !linkedIds['mock-google'];

	const handleLink = (nodeId: string) => {
		setLinkedIds((prev) => ({ ...prev, [nodeId]: true }));
		if (nodeId !== 'mock-google') {
			// Update the node's credential_id to simulate linking
			dispatch({
				type: 'UPDATE_NODE_VALUE',
				id: nodeId,
				fieldKey: 'credential_id',
				value: 'mock_credential_linked_123',
			});
		}
	};

	// If no missing nodes, show success state or auto-close
	const allResolved = missingNodes.length === 0 && !showMockGoogle;

	return (
		<div className='fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/50 dark:bg-black/75 p-4 backdrop-blur-xs sm:backdrop-blur-sm select-none'>
			<motion.div
				initial={{ opacity: 0, scale: 0.96, y: 15 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.96, y: 15 }}
				transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
				className='relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl shadow-zinc-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/96 dark:text-zinc-100 dark:shadow-black/50'>
				
				{/* Top-Right Close Button */}
				<button
					type='button'
					onClick={handleClose}
					className='absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-800 dark:border-white/10 dark:text-zinc-500 dark:hover:bg-white/[0.06] dark:hover:text-white transition'>
					<X size={14} />
				</button>

				{/* Modal Body */}
				<div className='p-6'>
					<h2 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight'>
						Please link your accounts
					</h2>
					<p className='mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-normal'>
						The following credentials need to be authenticated to run the flow:
					</p>

					{/* Credentials List */}
					<div className='mt-5 space-y-3.5 max-h-[300px] overflow-y-auto pr-1'>
						{allResolved ? (
							<div className='flex flex-col items-center justify-center py-6 text-center text-zinc-500 dark:text-zinc-400'>
								<div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400 mb-3'>
									<Check size={24} strokeWidth={3} />
								</div>
								<h3 className='text-sm font-bold text-zinc-800 dark:text-zinc-200'>All Accounts Linked</h3>
								<p className='text-[11px] text-zinc-400 mt-1 max-w-[280px]'>
									All node credentials have been verified. You can now execute the workflow.
								</p>
							</div>
						) : (
							<>
								{showMockGoogle && (
									<div className='flex items-center justify-between rounded-xl border border-zinc-100 dark:border-zinc-850 p-4 bg-zinc-50/50 dark:bg-zinc-900/40 transition hover:border-zinc-200 dark:hover:border-zinc-800'>
										<div className='flex items-start'>
											{/* Icon */}
											<div className='mr-3.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600'>
												<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
													<rect x='3' y='4' width='18' height='17' rx='2' fill='#4285F4' />
													<path d='M3 9h18v12h-18z' fill='#fff' />
													<text x='12' y='18' fill='#4285F4' fontSize='10' fontWeight='bold' textAnchor='middle'>31</text>
												</svg>
											</div>

											{/* Account details */}
											<div className='min-w-0'>
												<div className='text-[13px] font-bold text-zinc-850 dark:text-zinc-200'>
													Google Calendar
												</div>
												<div className='mt-1 flex items-center gap-1.5'>
													<User size={12} className='text-zinc-400 shrink-0' />
													<span className='text-[11px] font-semibold text-zinc-700 dark:text-zinc-300'>
														Default personal
													</span>
													<span className='inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 border border-amber-200/50 text-amber-600 px-1.5 py-0.2 text-[8px] font-bold tracking-wide uppercase dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400'>
														0/2
													</span>
													<Info size={11} className='text-zinc-400' />
												</div>
												<div className='mt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500'>
													Currently none
												</div>
											</div>
										</div>

										{/* Link Button */}
										<div>
											<button
												type='button'
												onClick={() => handleLink('mock-google')}
												className='flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs transition active:scale-97'>
												Link
											</button>
										</div>
									</div>
								)}

								{missingNodes.map((node) => {
									const isGoogle = node.data.defKey.includes('google');
									const labelName = isGoogle ? 'Google Calendar' : node.data.label || 'API Account';

									return (
										<div
											key={node.id}
											className='flex items-center justify-between rounded-xl border border-zinc-100 dark:border-zinc-850 p-4 bg-zinc-50/50 dark:bg-zinc-900/40 transition hover:border-zinc-200 dark:hover:border-zinc-800'>
											<div className='flex items-start'>
												{/* Icon */}
												<div className='mr-3.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600'>
													{isGoogle ? (
														<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
															<rect x='3' y='4' width='18' height='17' rx='2' fill='#4285F4' />
															<path d='M3 9h18v12h-18z' fill='#fff' />
															<text x='12' y='18' fill='#4285F4' fontSize='10' fontWeight='bold' textAnchor='middle'>31</text>
														</svg>
													) : (
														<AlertCircle size={18} className='text-zinc-500 dark:text-zinc-400' />
													)}
												</div>

												{/* Account details */}
												<div className='min-w-0'>
													<div className='text-[13px] font-bold text-zinc-850 dark:text-zinc-200'>
														{labelName}
													</div>
													<div className='mt-1 flex items-center gap-1.5'>
														<User size={12} className='text-zinc-400 shrink-0' />
														<span className='text-[11px] font-semibold text-zinc-700 dark:text-zinc-300'>
															Default personal
														</span>
														<span className='inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 border border-amber-200/50 text-amber-600 px-1.5 py-0.2 text-[8px] font-bold tracking-wide uppercase dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400'>
															0/2
														</span>
														<Info size={11} className='text-zinc-400' />
													</div>
													<div className='mt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500'>
														Currently none
													</div>
												</div>
											</div>

											{/* Link Button */}
											<div>
												<button
													type='button'
													onClick={() => handleLink(node.id)}
													className='flex items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs transition active:scale-97'>
													Link
												</button>
											</div>
										</div>
									);
								})}
							</>
						)}
					</div>
				</div>

				{/* Footer bar */}
				<div className='flex items-center justify-end border-t border-zinc-150 bg-zinc-50/70 px-6 py-3.5 dark:border-zinc-850 dark:bg-zinc-900/40'>
					<button
						type='button'
						onClick={handleClose}
						className='flex h-8 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-4 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition active:scale-97'>
						Close
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default LinkCredentialsDialog;
