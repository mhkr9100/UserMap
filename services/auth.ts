import {
    CognitoUserPool as IdentityUserPool,
    CognitoUser as IdentityUser,
    AuthenticationDetails as IdentityAuthDetails,
    CognitoUserAttribute as IdentityUserAttribute
} from 'amazon-cognito-identity-js';

const USER_POOL_ID = import.meta.env.VITE_AUTH_POOL_ID;
const CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID;

if (!USER_POOL_ID || !CLIENT_ID) {
    throw new Error('Missing required auth env vars: VITE_AUTH_POOL_ID and VITE_AUTH_CLIENT_ID');
}

const userPool = new IdentityUserPool({
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID
});

export interface UserSession {
    email: string;
    id: string;
    name?: string;
}

type CurrentUser = {
    id: string;
    username: string;
    email: string;
    name: string;
};

const normalizeAuthError = (err: any, fallback: string) => {
    const raw = (err?.message || err?.code || fallback || 'Authentication failed').toString();
    const lower = raw.toLowerCase();

    if (lower.includes('user does not exist') || lower.includes('usernotfoundexception')) {
        return 'No account found for this email.';
    }
    if (lower.includes('incorrect username or password') || lower.includes('not authorized')) {
        return 'Incorrect email or password.';
    }
    if (lower.includes('username/client id combination not found')) {
        return 'No account found for this email.';
    }
    if (lower.includes('user is not confirmed')) {
        return 'Account not verified yet. Please confirm your email code.';
    }
    if (lower.includes('code mismatch')) {
        return 'Invalid verification code.';
    }
    if (lower.includes('expiredcodeexception') || lower.includes('expired code')) {
        return 'Verification code expired. Request a new code.';
    }
    if (lower.includes('invalid password')) {
        return 'Password does not meet security requirements.';
    }
    if (lower.includes('limit exceeded')) {
        return 'Too many attempts. Please wait a moment and try again.';
    }

    return raw;
};

function buildIdentityUser(emailRaw: string) {
    const email = emailRaw.toLowerCase().trim();
    return {
        email,
        user: new IdentityUser({
            Username: email,
            Pool: userPool
        })
    };
}

export const authService = {
    async register(emailRaw: string, password: string, name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const email = emailRaw.toLowerCase().trim();
            const attributeList = [
                new IdentityUserAttribute({ Name: 'email', Value: email }),
                new IdentityUserAttribute({ Name: 'name', Value: name })
            ];

            userPool.signUp(email, password, attributeList, [], (err) => {
                if (err) {
                    console.error('SignUp Error:', err);
                    reject(new Error(normalizeAuthError(err, 'Failed to create account.')));
                    return;
                }
                resolve();
            });
        });
    },

    async verifyOtp(emailRaw: string, otp: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const { user } = buildIdentityUser(emailRaw);
            user.confirmRegistration(otp, true, (err) => {
                if (err) {
                    console.error('OTP Error:', err);
                    reject(new Error(normalizeAuthError(err, 'Failed to verify code.')));
                    return;
                }
                resolve();
            });
        });
    },

    async resendVerificationCode(emailRaw: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const { user } = buildIdentityUser(emailRaw);
            user.resendConfirmationCode((err) => {
                if (err) {
                    console.error('Resend OTP Error:', err);
                    reject(new Error(normalizeAuthError(err, 'Failed to resend verification code.')));
                    return;
                }
                resolve();
            });
        });
    },

    async forgotPassword(emailRaw: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const { user } = buildIdentityUser(emailRaw);
            user.forgotPassword({
                onSuccess: () => resolve(),
                onFailure: (err) => reject(new Error(normalizeAuthError(err, 'Unable to start password reset.')))
            });
        });
    },

    async confirmPassword(emailRaw: string, code: string, newPassword: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const { user } = buildIdentityUser(emailRaw);
            user.confirmPassword(code, newPassword, {
                onSuccess: () => resolve(),
                onFailure: (err) => reject(new Error(normalizeAuthError(err, 'Unable to reset password.')))
            });
        });
    },

    async login(emailRaw: string, password?: string): Promise<UserSession> {
        return new Promise((resolve, reject) => {
            const email = emailRaw.toLowerCase().trim();

            if (!password) {
                reject(new Error('Password is required for login.'));
                return;
            }

            const authDetails = new IdentityAuthDetails({
                Username: email,
                Password: password
            });

            const { user } = buildIdentityUser(email);

            user.authenticateUser(authDetails, {
                onSuccess: (result) => {
                    const idToken = result.getIdToken().getJwtToken();
                    const payload = result.getIdToken().payload;
                    const session: UserSession = {
                        email: payload.email,
                        id: payload.sub,
                        name: payload.name || payload.email.split('@')[0]
                    };

                    sessionStorage.setItem('currentUser', JSON.stringify(session));
                    sessionStorage.setItem('auth_token', idToken);
                    sessionStorage.setItem('id_token', idToken);
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('id_token');
                    localStorage.removeItem('currentUser');

                    resolve(session);
                },
                onFailure: (err) => {
                    console.error('Login Error:', err);
                    reject(new Error(normalizeAuthError(err, 'Sign in failed.')));
                },
                newPasswordRequired: () => {
                    reject(new Error('Password reset is required before sign in can continue.'));
                }
            });
        });
    },

    getToken(): string | null {
        return sessionStorage.getItem('auth_token');
    },

    async logout() {
        const currentIdentityUser = userPool.getCurrentUser();
        if (currentIdentityUser) {
            currentIdentityUser.signOut();
        }

        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('id_token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('id_token');
    },

    async getCurrentUser(): Promise<CurrentUser | null> {
        try {
            const raw = sessionStorage.getItem('currentUser');
            if (!raw) {
                return null;
            }

            const session: UserSession = JSON.parse(raw);
            return {
                id: session.id,
                username: session.email,
                email: session.email,
                name: session.name || session.email.split('@')[0] || 'Architect'
            };
        } catch {
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('id_token');
            return null;
        }
    }
};
