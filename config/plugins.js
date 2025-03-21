module.exports = ({
    env
}) => ({
    //...
    'import-export-entries': {
        enabled: true,
        config: {
            // See `Config` section.
        },
    },
    'documentation': {
        enabled: false,
    },
    'workflow': {
        enabled: true,
        resolve: './src/plugins/workflow'
    },
    'custom-function': {
        enabled: true,
        resolve: './src/plugins/custom-function'
    },
    'email': {
        config: {
            provider: 'nodemailer',
            providerOptions: {
                host: env('SMTP_HOST', 'studywitheve.com'),
                port: env('SMTP_PORT', 465),
                auth: {
                    user: env('SMTP_USERNAME'),
                    pass: env('SMTP_PASSWORD'),
                },
                // ... any custom nodemailer options
            },
            settings: {
                defaultFrom: env('SMTP_DEFAULT_FROM'),
                defaultReplyTo: env('SMTP_DEFAULT_REPLYTO'),
            },
        },
    },
    'email-designer': {
        enabled: true,
    },

    //...
});
