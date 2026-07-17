export type TGitSyncProvider = 'github' | 'gitlab' | 'bitbucket';

export type TGitSyncStatus = {
	connected: boolean;
	provider: TGitSyncProvider | null;
	repository: string | null;
	branch: string | null;
	last_export_at: string | null;
	last_import_at: string | null;
	last_error: string | null;
	pending_changes: number;
};

export type TGitSyncExportDto = {
	message?: string;
	include?: ('workflows' | 'credentials' | 'variables')[];
};

export type TGitSyncImportDto = {
	branch?: string;
	commit?: string;
	overwrite?: boolean;
};

export type TGitSyncResult = {
	commit_sha: string;
	commit_url?: string;
	files_changed: number;
};
