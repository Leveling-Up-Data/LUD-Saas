// Manual API Token Configuration
// You can add multiple tokens here for different purposes

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  description?: string;
  environment?: 'development' | 'production' | 'staging';
}

export const API_TOKENS: ApiToken[] = [
  {
    id: 'main-api-token',
    name: 'Main API Token',
    token: 'sk-live-1234567890abcdefghijklmnopqrstuvwxyz',
    description: 'Primary API token for production use',
    environment: 'production'
  },
  {
    id: 'test-api-token',
    name: 'Test API Token',
    token: 'sk-test-1234-56789-abcdefghijklmnop',
    description: 'Test API token for development and testing',
    environment: 'development'
  },
  {
    id: 'staging-api-token',
    name: 'Staging API Token',
    token: 'sk-staging-9876543210fedcbaijklmnopqrstuvwxyz',
    description: 'Staging API token for pre-production testing',
    environment: 'staging'
  }
];

// Helper function to get a token by ID
export function getApiTokenById(id: string): ApiToken | undefined {
  return API_TOKENS.find(token => token.id === id);
}

// Helper function to get all tokens
export function getAllApiTokens(): ApiToken[] {
  return API_TOKENS;
}

// Helper function to get tokens by environment
export function getApiTokensByEnvironment(environment: 'development' | 'production' | 'staging'): ApiToken[] {
  return API_TOKENS.filter(token => token.environment === environment);
}
