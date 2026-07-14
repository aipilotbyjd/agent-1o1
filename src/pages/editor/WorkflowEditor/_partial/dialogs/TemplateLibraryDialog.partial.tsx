import { useState } from 'react';
import { Search, Zap, X } from 'lucide-react';
import { useWorkflowEditor } from '../../_context/WorkflowEditorProvider.context';
import Modal from './Modal.partial';

type TTemplate = {
	id: string;
	name: string;
	description: string;
	category: string;
	defKeys: string[];
	badge?: string;
};

const TEMPLATES: TTemplate[] = [
	{
		id: 'lead-routing',
		name: 'AI Lead Routing Agent',
		description:
			'Qualify inbound leads, enrich accounts, and route next actions automatically.',
		category: 'Sales',
		defKeys: [
			'trigger.webhook',
			'ai.agent',
			'logic.condition',
			'integration.slack',
			'output.display',
		],
		badge: 'Popular',
	},
	{
		id: 'content-pipeline',
		name: 'Content Generation Pipeline',
		description: 'Scrape web content, extract structured data, and generate AI summaries.',
		category: 'Marketing',
		defKeys: ['trigger.schedule', 'scrape.web', 'ai.extract', 'ai.agent', 'output.display'],
		badge: 'New',
	},
	{
		id: 'data-sync',
		name: 'Database Sync & Notify',
		description: 'Watch for changes in your database and notify the right team via Slack.',
		category: 'Engineering',
		defKeys: ['trigger.webhook', 'data.database', 'logic.condition', 'integration.slack'],
	},
	{
		id: 'email-automation',
		name: 'Smart Email Automation',
		description: 'Trigger on incoming emails, classify intent with AI, and route responses.',
		category: 'Customer Support',
		defKeys: [
			'trigger.webhook',
			'ai.agent',
			'logic.condition',
			'integration.gmail',
			'output.display',
		],
	},
	{
		id: 'http-aggregator',
		name: 'Multi-API Data Aggregator',
		description: 'Call multiple REST APIs in parallel and merge the results.',
		category: 'Engineering',
		defKeys: ['trigger.webhook', 'data.http', 'data.http', 'ai.extract', 'output.display'],
	},
	{
		id: 'approval-flow',
		name: 'Human-in-the-Loop Approval',
		description: 'Route tasks to humans for approval before proceeding.',
		category: 'Operations',
		defKeys: ['trigger.webhook', 'ai.agent', 'logic.condition', 'output.display'],
	},
	{
		id: 'scrape-monitor',
		name: 'Web Monitor & Alert',
		description: 'Periodically scrape a URL, detect changes, and alert your team.',
		category: 'Operations',
		defKeys: [
			'trigger.schedule',
			'scrape.web',
			'ai.extract',
			'logic.condition',
			'integration.slack',
		],
	},
	{
		id: 'hubspot-crm',
		name: 'HubSpot CRM Update',
		description: 'Webhook triggers CRM enrichment and deal-stage update in HubSpot.',
		category: 'Sales',
		defKeys: ['trigger.webhook', 'ai.agent', 'integration.hubspot', 'output.display'],
	},
];

const CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];

const badgeColor: Record<string, string> = {
	Popular: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
	New: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const TemplateLibraryDialog = () => {
	const { state, dispatch } = useWorkflowEditor();
	const [search, setSearch] = useState('');
	const [activeCategory, setActiveCategory] = useState('All');

	if (!state.ui.templateLibraryOpen) return null;

	const filtered = TEMPLATES.filter((t) => {
		const matchCat = activeCategory === 'All' || t.category === activeCategory;
		const matchSearch =
			!search.trim() ||
			t.name.toLowerCase().includes(search.toLowerCase()) ||
			t.description.toLowerCase().includes(search.toLowerCase());
		return matchCat && matchSearch;
	});

	const applyTemplate = (template: TTemplate) => {
		dispatch({
			type: 'ADD_TEMPLATE',
			defKeys: template.defKeys,
			name: template.name,
		});
		dispatch({ type: 'SET_TEMPLATE_LIBRARY', open: false });
	};

	return (
		<Modal
			title='Workflow Templates'
			onClose={() => dispatch({ type: 'SET_TEMPLATE_LIBRARY', open: false })}>
			<div className='space-y-4'>
				{/* Search */}
				<div className='relative'>
					<Search
						size={14}
						className='absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400'
					/>
					<input
						type='text'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder='Search templates…'
						className='w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pr-3 pl-9 text-sm outline-none placeholder:text-zinc-400 focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
					/>
				</div>

				{/* Category chips */}
				<div className='flex flex-wrap gap-2'>
					{CATEGORIES.map((cat) => (
						<button
							key={cat}
							type='button'
							onClick={() => setActiveCategory(cat)}
							className={[
								'rounded-full px-3 py-1 text-xs font-semibold transition',
								activeCategory === cat
									? 'bg-violet-600 text-white'
									: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
							].join(' ')}>
							{cat}
						</button>
					))}
				</div>

				{/* Template grid */}
				<div className='grid gap-3 sm:grid-cols-2'>
					{filtered.map((template) => (
						<div
							key={template.id}
							className='group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-violet-300 hover:shadow-md hover:shadow-violet-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-800/50'>
							<div>
								<div className='mb-1 flex items-start justify-between gap-2'>
									<div className='text-sm font-bold text-zinc-800 dark:text-zinc-100'>
										{template.name}
									</div>
									{template.badge && (
										<span
											className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor[template.badge] ?? ''}`}>
											{template.badge}
										</span>
									)}
								</div>
								<p className='text-xs leading-relaxed text-zinc-500 dark:text-zinc-400'>
									{template.description}
								</p>
								<div className='mt-2 flex flex-wrap gap-1'>
									{template.defKeys.slice(0, 4).map((key, i) => (
										<span
											key={i}
											className='rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'>
											{key.split('.')[1]}
										</span>
									))}
									{template.defKeys.length > 4 && (
										<span className='rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'>
											+{template.defKeys.length - 4}
										</span>
									)}
								</div>
							</div>
							<button
								type='button'
								onClick={() => applyTemplate(template)}
								className='mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-600 py-2 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100 hover:bg-violet-700'>
								<Zap size={12} fill='currentColor' />
								Use Template
							</button>
						</div>
					))}
				</div>

				{filtered.length === 0 && (
					<div className='py-8 text-center text-sm text-zinc-400'>
						No templates match your search
					</div>
				)}
			</div>
		</Modal>
	);
};

export default TemplateLibraryDialog;
