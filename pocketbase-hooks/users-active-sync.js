
async function syncSlackUserActiveByEmail(email, isActive) {
  if (!email) return;
  try {
    const slackRecord = await $app
      .dao()
      .findFirstRecordByData('slack_user', 'user_email', email);
    if (slackRecord) {
      slackRecord.set('active', !!isActive);
      await $app.dao().saveRecord(slackRecord);
    }
  } catch (err) {
    // It's fine if no slack_user is found
    console.warn('syncSlackUserActiveByEmail warning:', err?.message || err);
  }
}

onRecordAfterCreate('users', async (e) => {
  const email = e.record.get('email');
  const isActive = e.record.get('active');
  await syncSlackUserActiveByEmail(email, isActive);
});

onRecordAfterUpdate('users', async (e) => {
  const email = e.record.get('email');
  const wasActive = e.originalRecord?.get('active');
  const isActive = e.record.get('active');

  if (wasActive === isActive) return; // no change
  await syncSlackUserActiveByEmail(email, isActive);
});


