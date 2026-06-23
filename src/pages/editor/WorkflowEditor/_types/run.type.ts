export type TRunLog = {
	id: string;
	nodeId?: string;
	level: 'info' | 'warn' | 'error';
	message: string;
	at: number;
};

export type TRunState = {
	id: string | null;
	status: 'idle' | 'running' | 'success' | 'error' | 'stopped';
	startedAt: number | null;
	finishedAt: number | null;
	currentNodeId: string | null;
	logs: TRunLog[];
};
