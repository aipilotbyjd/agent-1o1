import { useEffect, useMemo, useRef, useState } from 'react';
import { Braces, CornerDownLeft } from 'lucide-react';
import { useWorkflowEditor } from '../../../_context/WorkflowEditorProvider.context';
import { collectUpstreamVariables } from '../../../_helper/variables.helper';
import { buildRuntimeContext, resolveExpressions } from '../../../_helper/runtime.helper';
import type { TNodeField } from '../../../_types/node.type';
import type { TNodeOutputs } from '../../../_helper/runtime.helper';

type Props = {
	field: TNodeField;
	value: unknown;
	onChange: (value: unknown) => void;
	compact?: boolean;
	nodeId: string;
	className: string;
};

/**
 * Text/longtext input with {{variable}} autocomplete and a live resolved preview.
 * Variables come from upstream nodes; the preview resolves them against whatever
 * outputs (or pinned data) the most recent run produced.
 */
const ExpressionInput = ({ field, value, onChange, compact, nodeId, className }: Props) => {
	const { state } = useWorkflowEditor();
	const ref = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
	const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [query, setQuery] = useState<string | null>(null);
	const [activeIndex, setActiveIndex] = useState(0);

	// Clear any pending blur timer on unmount so we never setState after teardown.
	useEffect(() => () => {
		if (blurTimer.current) clearTimeout(blurTimer.current);
	}, []);

	const text = String(value ?? '');

	const variables = useMemo(
		() => collectUpstreamVariables(nodeId, state.nodes, state.edges),
		[nodeId, state.nodes, state.edges],
	);

	// Build an id-keyed runtime context from the latest outputs / pinned data for
	// live preview, matching the backend resolver's scope.
	const runtimeCtx = useMemo(() => {
		const outputs: TNodeOutputs = {};
		state.nodes.forEach((node) => {
			const out = node.data.pinned ? node.data.pinnedOutput : node.data.outputPreview;
			if (out !== undefined) outputs[node.id] = out;
		});
		return buildRuntimeContext(state.nodes, outputs);
	}, [state.nodes]);

	const matches = useMemo(() => {
		if (query === null) return [];
		const q = query.toLowerCase();
		// Tokens are now id-based (opaque), so match against the friendly label
		// and field name too — that's what the user actually types.
		return variables
			.filter((v) => `${v.nodeLabel} ${v.outputId} ${v.token}`.toLowerCase().includes(q))
			.slice(0, 6);
	}, [query, variables]);

	const hasTokens = text.includes('{{');
	const preview = hasTokens ? String(resolveExpressions(text, runtimeCtx) ?? '') : '';
	const previewChanged = preview !== text;

	const syncQuery = (el: HTMLTextAreaElement | HTMLInputElement) => {
		const caret = el.selectionStart ?? el.value.length;
		const before = el.value.slice(0, caret);
		const open = before.lastIndexOf('{{');
		if (open === -1 || before.indexOf('}}', open) !== -1) {
			setQuery(null);
			return;
		}
		setQuery(before.slice(open + 2));
		setActiveIndex(0);
	};

	const insertToken = (token: string) => {
		const el = ref.current;
		if (!el) return;
		const caret = el.selectionStart ?? text.length;
		const before = text.slice(0, caret);
		const open = before.lastIndexOf('{{');
		const next = `${text.slice(0, open)}${token}${text.slice(caret)}`;
		onChange(next);
		setQuery(null);
		requestAnimationFrame(() => {
			el.focus();
			const pos = open + token.length;
			el.setSelectionRange(pos, pos);
		});
	};

	const onKeyDown = (event: React.KeyboardEvent) => {
		if (query === null || matches.length === 0) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setActiveIndex((i) => (i + 1) % matches.length);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			insertToken(matches[activeIndex].token);
		} else if (event.key === 'Escape') {
			setQuery(null);
		}
	};

	const isMultiline = field.kind === 'longtext' || field.kind === 'code';

	const sharedProps = {
		value: text,
		placeholder: field.placeholder,
		'aria-label': field.label,
		className: `${className} ${isMultiline ? 'font-mono' : ''}`,
		onChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			onChange(event.target.value);
			syncQuery(event.target);
		},
		onKeyDown,
		onKeyUp: (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
			syncQuery(event.currentTarget),
		onClick: (event: React.MouseEvent<HTMLTextAreaElement | HTMLInputElement>) =>
			syncQuery(event.currentTarget),
		onBlur: () => {
			if (blurTimer.current) clearTimeout(blurTimer.current);
			// Delay so a mousedown on a suggestion can register before the list closes.
			blurTimer.current = setTimeout(() => setQuery(null), 120);
		},
	};

	return (
		<div className='relative'>
			{isMultiline ? (
				<textarea
					ref={ref as React.Ref<HTMLTextAreaElement>}
					rows={field.rows ?? (compact ? 2 : 4)}
					{...sharedProps}
				/>
			) : (
				<input ref={ref as React.Ref<HTMLInputElement>} {...sharedProps} />
			)}

			{query !== null && matches.length > 0 && (
				<ul className='absolute z-30 mt-1 max-h-44 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 text-[11px] shadow-lg dark:border-zinc-700 dark:bg-zinc-900'>
					{matches.map((variable, index) => (
						<li key={`${variable.nodeId}-${variable.outputId}`}>
							<button
								type='button'
								onMouseDown={(event) => {
									event.preventDefault();
									insertToken(variable.token);
								}}
								className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left ${
									index === activeIndex
										? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
										: 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
								}`}>
								<Braces size={11} className='shrink-0 text-emerald-500' />
								<span className='truncate font-medium'>{variable.nodeLabel}</span>
								<span className='ml-auto truncate font-mono text-[10px] text-zinc-400'>
									.{variable.outputId}
								</span>
							</button>
						</li>
					))}
				</ul>
			)}

			{hasTokens && previewChanged && (
				<div className='mt-1 flex items-start gap-1 text-[10px] text-zinc-500 dark:text-zinc-400'>
					<CornerDownLeft size={10} className='mt-0.5 shrink-0 text-emerald-500' />
					<span className='truncate font-mono'>{preview || '(empty)'}</span>
				</div>
			)}
			{hasTokens && !previewChanged && variables.length === 0 && (
				<div className='mt-1 text-[10px] text-zinc-400'>
					Connect upstream nodes to use their data here.
				</div>
			)}
		</div>
	);
};

export default ExpressionInput;
