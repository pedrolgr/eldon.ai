import jwt from 'jsonwebtoken';

interface JWTPayload {
    access_token: string,
    expires_in: number
}

export function generateJWT(payload: JWTPayload) {
    return jwt.sign(
        {
            acces_token: payload.access_token
        },
        process.env.JWT_SECRET,
        { expiresIn: payload.expires_in }
    )
}