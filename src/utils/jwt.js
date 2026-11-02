import jwt from 'jsonwebtoken';

// This function signs a JWT token with the given payload, secret, and expiration time. It uses the jsonwebtoken library to create the token.
export function signToken(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
}


// This function verifies a JWT token using the provided secret. It returns the decoded payload if the token is valid, or throws an error if the token is invalid or expired.
export function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

// Remove the hardcoded expiresIn value and instead pass it in from the environment variable or function parameter. This allows for more flexibility and easier configuration.