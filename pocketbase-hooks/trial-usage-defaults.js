// PocketBase Hook: Enforce defaults for trial_usage collection
// Place this file in the PocketBase hooks directory on your PB server

onRecordBeforeCreateRequest((e) => {
    if (e.collection?.name !== 'trial_usage') return;

    // Always set a fixed total request limit of 50
    const totalLimit = Number(e.record.get('request_total_limit'));
    if (!totalLimit || totalLimit <= 0) {
        e.record.set('request_total_limit', 50);
    }

    // Ensure request_count is initialized to 0
    const requestCount = Number(e.record.get('request_count'));
    if (!Number.isFinite(requestCount) || requestCount < 0) {
        e.record.set('request_count', 0);
    }

    // Force trial_start_date = now and trial_end_date = now + 2 days
    // (Some environments prefill a placeholder like 2022-01-01; we override it.)
    const now = new Date();
    const startIso = now.toISOString();
    const endIso = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
    e.record.set('trial_start_date', startIso);
    e.record.set('trial_end_date', endIso);
});

onRecordBeforeUpdateRequest((e) => {
    if (e.collection?.name !== 'trial_usage') return;

    // Prevent lowering or zeroing the total limit; keep it fixed at 50
    const totalLimit = Number(e.record.get('request_total_limit'));
    if (!totalLimit || totalLimit < 50) {
        e.record.set('request_total_limit', 50);
    }

    // Clamp request_count to be >= 0
    const requestCount = Number(e.record.get('request_count'));
    if (!Number.isFinite(requestCount) || requestCount < 0) {
        e.record.set('request_count', 0);
    }

    // If start date is changed or missing, recompute end = start + 2 days
    try {
        const start = new Date(e.record.get('trial_start_date'));
        if (!isNaN(start.getTime())) {
            const end = new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000);
            e.record.set('trial_end_date', end.toISOString());
        }
    } catch (_) {
        // ignore
    }
});


