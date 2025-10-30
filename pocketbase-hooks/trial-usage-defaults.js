// PocketBase Hook: Enforce defaults for trial_usage collection
// Place this file in the PocketBase hooks directory on your PB server

onRecordBeforeCreateRequest((e) => {
    if (e.collection?.name !== 'trial_usage') return;

    // Ensure request_count is initialized to 0
    const requestCount = Number(e.record.get('request_count'));
    if (!Number.isFinite(requestCount) || requestCount < 0) {
        e.record.set('request_count', 0);
    }

    // Set request limit based on plan name, or default to 50 for Free Trial
    const planName = e.record.get('name') || 'Free Trial';
    const totalLimit = Number(e.record.get('request_total_limit'));
    
    if (!totalLimit || totalLimit <= 0) {
        // Set limit based on plan name
        if (planName === 'Pro') {
            e.record.set('request_total_limit', 10000);
        } else if (planName === 'Starter') {
            e.record.set('request_total_limit', 1000);
        } else {
            // Free Trial default
            e.record.set('request_total_limit', 50);
        }
    }

    // Set dates - use provided dates or default to now and now + 2 days for Free Trial
    const startDate = e.record.get('trial_start_date');
    const endDate = e.record.get('trial_end_date');
    
    if (!startDate) {
        const now = new Date();
        e.record.set('trial_start_date', now.toISOString());
        
        // If no end date provided, set based on plan
        if (!endDate) {
            if (planName === 'Free Trial') {
                // 2 days for free trial
                const endIso = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
                e.record.set('trial_end_date', endIso);
            } else {
                // 30 days for paid plans (monthly subscription)
                const endIso = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
                e.record.set('trial_end_date', endIso);
            }
        }
    }
});

onRecordBeforeUpdateRequest((e) => {
    if (e.collection?.name !== 'trial_usage') return;

    // Prevent lowering or zeroing the total limit based on plan name
    const planName = e.record.get('name') || 'Free Trial';
    const totalLimit = Number(e.record.get('total_request_limit'));
    
    // Set minimum limit based on plan
    let minLimit = 50; // Free Trial default
    if (planName === 'Pro') {
        minLimit = 10000;
    } else if (planName === 'Starter') {
        minLimit = 1000;
    }
    
    if (!totalLimit || totalLimit < minLimit) {
        e.record.set('total_request_limit', minLimit);
    }

    // Clamp total_request_count to be >= 0
    const requestCount = Number(e.record.get('total_request_count'));
    if (!Number.isFinite(requestCount) || requestCount < 0) {
        e.record.set('total_request_count', 0);
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


