// Email utilities that call server endpoints with your SMTP credentials

export async function sendContactEmail(data: {
    username: string;
    email: string;
    subject: string;
    message: string;
}) {
    try {
        const response = await fetch('/api/send-contact-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to send contact email');
        }

        console.log('Contact email sent successfully');
        return { success: true };
    } catch (error) {
        console.error('Contact email error:', error);
        throw error;
    }
}

export async function sendInviteEmail(data: {
    email: string;
    inviterId?: string;
}) {
    try {
        const response = await fetch('/api/send-invite-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email })
        });

        if (!response.ok) {
            throw new Error('Failed to send invite email');
        }

        console.log('Invite email sent successfully');
        return { success: true };
    } catch (error) {
        console.error('Invite email error:', error);
        throw error;
    }
}