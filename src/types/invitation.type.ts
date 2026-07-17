export type TInvitation = {
	id: string;
	token: string;
	email: string;
	role: string;
	workspace_id: string;
	workspace_name: string;
	inviter_id: string;
	inviter_name: string;
	expires_at: string;
	accepted_at: string | null;
	declined_at: string | null;
	created_at: string;
};
