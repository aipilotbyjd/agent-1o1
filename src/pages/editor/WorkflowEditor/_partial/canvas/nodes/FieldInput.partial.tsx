import { ChevronDown } from 'lucide-react';
import { useCredentials } from '@/api/modules/credentials';
import { useWorkspaceContext } from '@/context/workspaceContext';
import type { TNodeField } from '../../../_types/node.type';
import ExpressionInput from './ExpressionInput.partial';

export const inputClass =
	'w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20';

const compactInputClass =
	'w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 shadow-xs outline-none transition focus:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300';

type FieldInputProps = {
	field: TNodeField;
	value: unknown;
	onChange: (value: unknown) => void;
	compact?: boolean;
	nodeId?: string;
};

const CredentialFieldInput = ({ field, value, onChange, compact }: FieldInputProps) => {
	const { activeWorkspaceId } = useWorkspaceContext();
	const {
		data: credentials = [],
		isLoading,
		isError,
	} = useCredentials(
		activeWorkspaceId,
		field.credentialType ? { type: field.credentialType, per_page: 100 } : { per_page: 100 },
	);

	const cls = compact ? compactInputClass : inputClass;

	return (
		<select
			value={String(value ?? '')}
			onChange={(event) => onChange(event.target.value)}
			aria-label={field.label}
			disabled={isLoading || isError || credentials.length === 0}
			className={`${cls} disabled:cursor-not-allowed disabled:opacity-60`}>
			<option value=''>
				{isLoading
					? 'Loading…'
					: field.credentialType
						? `Select ${field.credentialType}…`
						: 'Select credential…'}
			</option>
			{credentials.map((credential) => {
				const expired =
					credential.expires_at && new Date(credential.expires_at) < new Date();
				return (
					<option key={credential.id} value={credential.id}>
						{credential.name}
						{expired ? ' (expired)' : ''}
					</option>
				);
			})}
		</select>
	);
};

const FieldInput = ({ field, value, onChange, compact, nodeId }: FieldInputProps) => {
	const cls = compact ? compactInputClass : inputClass;

	// Fields that opt into {{variables}} get the expression editor with autocomplete.
	if (
		field.supportsVariables &&
		nodeId &&
		(field.kind === 'text' || field.kind === 'longtext')
	) {
		return (
			<ExpressionInput
				field={field}
				value={value}
				onChange={onChange}
				compact={compact}
				nodeId={nodeId}
				className={cls}
			/>
		);
	}

	if (field.kind === 'toggle') {
		const active = Boolean(value);
		return (
			<button
				type='button'
				role='switch'
				aria-checked={active}
				onClick={() => onChange(!active)}
				aria-label={field.label}
				className={`${compact ? 'h-5 w-9' : 'h-7 w-12'} rounded-full border p-1 transition ${active ? 'border-emerald-400 bg-emerald-500' : 'border-zinc-300 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800'}`}>
				<span
					className={`block rounded-full bg-white transition ${compact ? 'h-3 w-3' : 'h-4 w-4'} ${active ? (compact ? 'translate-x-4' : 'translate-x-5') : ''}`}
				/>
			</button>
		);
	}

	if (field.kind === 'credential') {
		return (
			<CredentialFieldInput
				field={field}
				value={value}
				onChange={onChange}
				compact={compact}
			/>
		);
	}

	if (field.kind === 'select' || field.kind === 'model') {
		const select = (
			<select
				value={String(value ?? '')}
				onChange={(event) => onChange(event.target.value)}
				aria-label={field.label}
				className={`${cls} ${compact ? 'cursor-pointer appearance-none bg-none pr-7' : ''}`}>
				<option value=''>Select…</option>
				{field.options?.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		);

		if (!compact) return select;

		return (
			<div className='relative'>
				{select}
				<ChevronDown
					size={12}
					className='pointer-events-none absolute inset-y-0 right-2 my-auto h-3 w-3 text-zinc-400'
				/>
			</div>
		);
	}

	if (field.kind === 'multiselect') {
		const selectedValues = Array.isArray(value) ? value : [];
		return (
			<select
				multiple
				size={4}
				value={selectedValues}
				onChange={(event) =>
					onChange(Array.from(event.target.selectedOptions).map((opt) => opt.value))
				}
				aria-label={field.label}
				className={`${cls} h-auto`}>
				{field.options?.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		);
	}

	if (field.kind === 'number') {
		return (
			<input
				type='number'
				value={Number(value ?? 0)}
				onChange={(event) => onChange(Number(event.target.value))}
				aria-label={field.label}
				className={cls}
			/>
		);
	}

	if (field.kind === 'longtext' || field.kind === 'code') {
		return (
			<textarea
				rows={field.rows ?? (compact ? 2 : 4)}
				value={String(value ?? '')}
				onChange={(event) => onChange(event.target.value)}
				placeholder={field.placeholder}
				aria-label={field.label}
				className={`${cls} font-mono`}
			/>
		);
	}

	if (field.kind === 'kv') {
		const kvPairs = Array.isArray(value) ? value : [{ key: '', value: '' }];
		return (
			<div className='space-y-2'>
				{kvPairs.map((pair, index) => (
					<div key={index} className='grid grid-cols-2 gap-2'>
						<input
							type='text'
							placeholder='Key'
							value={pair.key || ''}
							onChange={(e) =>
								onChange(
									kvPairs.map((p, i) =>
										i === index ? { ...p, key: e.target.value } : p,
									),
								)
							}
							className={cls}
							aria-label={`${field.label} key ${index + 1}`}
						/>
						<input
							type='text'
							placeholder='Value'
							value={pair.value || ''}
							onChange={(e) =>
								onChange(
									kvPairs.map((p, i) =>
										i === index ? { ...p, value: e.target.value } : p,
									),
								)
							}
							className={cls}
							aria-label={`${field.label} value ${index + 1}`}
						/>
					</div>
				))}
				<button
					type='button'
					onClick={() => onChange([...kvPairs, { key: '', value: '' }])}
					className='text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'>
					+ Add row
				</button>
			</div>
		);
	}

	return (
		<input
			value={String(value ?? '')}
			onChange={(event) => onChange(event.target.value)}
			placeholder={field.placeholder}
			aria-label={field.label}
			className={cls}
		/>
	);
};

export default FieldInput;
