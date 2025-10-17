// PocketBase Hook: Generate API token for user_tokens on create
// Place this file in your PocketBase hooks directory

const crypto = require('crypto');

// Auto-generate secure token and default relation on create
onRecordBeforeCreate('user_tokens', (e) => {
  // Default the relation to the authenticated user if not provided
  if (!e.record.get('user_id') && e.authRecord) {
    e.record.set('user_id', e.authRecord.id);
  }

  // Default token_name if not provided
  if (!e.record.get('token_name') || typeof e.record.get('token_name') !== 'string') {
    e.record.set('token_name', 'default');
  }

 
  let token = e.record.get('token_id');
  if (!token || typeof token !== 'string' || token.length < 16) {
    token = crypto.randomBytes(32).toString('hex'); // 64 chars hex
    e.record.set('token_id', token);
  }
});


onRecordBeforeUpdate('user_tokens', (e) => {
  if (e.record.get('token_id') !== e.originalRecord.get('token_id')) {
    // Revert token changes
    e.record.set('token_id', e.originalRecord.get('token_id'));
  }
});


