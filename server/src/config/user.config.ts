export interface Password {
    hash: string,
    salt: string
}

export interface Token {
    token: string,
    expires: string
}

export interface TokenStatus {
    validate: boolean,
    message: string,
    id?: string
}

export interface AuthUserSchema {
    email: string,
    password: string
}

export interface AuthUserError {
    email: string[],
    password: string[]
}

export interface UserSchema {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword?: string
}

export interface UserError {
    firstName: string[],
    lastName: string[],
    email: string[],
    phone: string[],
    password: string[],
    confirmPassword: string[]
}