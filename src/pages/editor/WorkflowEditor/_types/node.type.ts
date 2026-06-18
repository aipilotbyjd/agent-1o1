export type TPortType = 'string' | 'number' | 'boolean' | 'list' | 'file' | 'json' | 'any';

export type TNodeCategory =
	| 'trigger'
	| 'input'
	| 'ai'
	| 'scrape'
	| 'extract'
	| 'data'
	| 'logic'
	| 'loop'
	| 'integration'
	| 'output'
	| 'note'
	| 'flow-control'
	| 'communication'
	| 'http-apis'
	| 'utility'
	| 'storage'
	| 'debug';

export type TNodePort = {
	id: string;
	name: string;
	type: TPortType;
	required?: boolean;
};

export type TFieldKind =
	| 'text'
	| 'longtext'
	| 'code'
	| 'number'
	| 'toggle'
	| 'select'
	| 'multiselect'
	| 'kv'
	| 'credential'
	| 'model';

export type TNodeField = {
	key: string;
	label: string;
	kind: TFieldKind;
	credentialType?: string;
	options?: { label: string; value: string }[];
	default?: unknown;
	required?: boolean;
	help?: string;
	placeholder?: string;
	supportsVariables?: boolean;
	rows?: number;
};

export type TNodeDefinition = {
	key: string;
	category: TNodeCategory;
	label: string;
	description: string;
	icon: string;
	color: string;
	colorHex?: string;
	inputs: TNodePort[];
	outputs: TNodePort[];
	fields: TNodeField[];
	supportsLoopMode?: boolean;
	requiresCredential?: boolean;
};

export type TNodeRunStatus = 'idle' | 'queued' | 'running' | 'success' | 'error' | 'skipped';

export type TNodeComment = {
	id: string;
	text: string;
	at: number;
	author?: string;
};

export type TCanvasNodeData = {
	defKey: string;
	label: string;
	definition?: TNodeDefinition;
	values: Record<string, unknown>;
	status?: TNodeRunStatus;
	durationMs?: number;
	error?: string;
	outputPreview?: unknown;
	notes?: string;
	locked?: boolean;
	// New node data fields
	color?: string;
	breakpoint?: boolean;
	comments?: TNodeComment[];
	testOutput?: unknown;
	testStatus?: 'idle' | 'running' | 'success' | 'error';
} & Record<string, unknown>;
