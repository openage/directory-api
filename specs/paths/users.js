module.exports = [{
    url: '/',
    permissions: ['tenant.user'],
    get: {},
    post: {
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/exists',
    get: {
        method: 'exists',
        id: 'check-exists',
        summary: 'exists',
        permissions: ['tenant.guest', 'organization-guest', 'tenant.user']
    }
}, {
    url: '/register',
    post: {
        method: 'register',
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/signIn',
    post: {
        method: 'signIn',
        id: 'login',
        summary: 'login',
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/signOut/:id',
    post: {
        method: 'signOut',
        permissions: ['tenant.user']
    }
}, {
    url: '/signUp',
    post: {
        method: 'signUp',
        id: 'register',
        summary: 'register',
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/confirm',
    post: {
        method: 'verifyOtp',
        id: 'otp-confirm',
        summary: 'confirm otp',
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/setPassword',
    post: {
        method: 'setPassword',
        id: 'password-set',
        summary: 'set password self',
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/setPassword/:id',
    post: {
        method: 'setPassword',
        id: 'user-password-set-by-id',
        summary: 'set password for id',
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/resetPassword',
    post: {
        method: 'resetPassword',
        id: 'user-password-reset-request',
        summary: 'request password reset',
        permissions: ['tenant.user']
    }
}, {
    url: '/changePassword',
    post: {
        method: 'changePassword',
        id: 'password-change',
        summary: 'change password',
        permissions: ['tenant.user']
    }
}, {
    url: '/resend',
    post: {
        method: 'resendOtp',
        id: 'user-otp-resend',
        summary: 'resend otp',
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/:id',
    permissions: ['tenant.user'],
    put: {},
    get: {}
}, {
    url: '/:id/profile',
    put: {
        method: 'profile',
        id: 'user-profile-update',
        summary: 'update profile',
        permissions: ['tenant.user']
    }
}, {
    url: '/auth/:provider',
    get: {
        method: 'authRedirect',
        id: 'user-auth-provider-get',
        summary: 'start external auth',
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/auth/:provider/success',
    get: {
        method: 'authSuccess',
        id: 'user-auth-provider-success',
        summary: 'on external auth success',
        permissions: ['tenant.guest', 'tenant.user']
    },
    post: {
        method: 'authSuccess',
        id: 'user-auth-provider-success',
        summary: 'on external auth success',
        permissions: ['tenant.guest', 'tenant.user']
    }
}, {
    url: '/auth/:provider/logout',
    get: {
        method: 'authLogout',
        id: 'user-auth-provider-logout',
        summary: 'on external auth logout',
        permissions: ['tenant.guest', 'tenant.user']
    }
}]
