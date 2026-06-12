package cl.sitad.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

public class JwtUtil {

    public static SecretKey createKey(String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public static Claims validateToken(String token, SecretKey secretKey) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public static String extractRut(Claims claims) {
        return claims.get("rut", String.class);
    }

    public static String extractNombre(Claims claims) {
        return claims.get("nombre", String.class);
    }

    public static String extractRol(Claims claims) {
        return claims.get("rol", String.class);
    }
}
