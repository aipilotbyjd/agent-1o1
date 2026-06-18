export const CredentialTypeEndpoints = {
	list: '/credential-types',
	detail: (id: string) => `/credential-types/${id}`,
} as const;
