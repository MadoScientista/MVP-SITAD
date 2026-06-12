package cl.sitad.auth.security;

import cl.sitad.auth.entity.Rol;
import cl.sitad.auth.entity.Usuario;
import cl.sitad.auth.enums.TipoAutenticacion;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration}") long accessTokenExpiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
    }

    public String generateAccessToken(Usuario usuario, Rol rol, TipoAutenticacion tipoAutenticacion) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
                .subject(usuario.getId().toString())
                .claim("rut", usuario.getRut())
                .claim("nombre", usuario.getNombre())
                .claim("rol", rol.getNombre().name())
                .claim("tipoAutenticacion", tipoAutenticacion.name())
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String generateRefreshToken() {
        return UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }
}
