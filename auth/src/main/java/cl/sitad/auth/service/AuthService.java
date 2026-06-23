package cl.sitad.auth.service;

import cl.sitad.auth.dto.*;
import cl.sitad.auth.entity.RefreshToken;
import cl.sitad.auth.entity.Rol;
import cl.sitad.auth.entity.Sesion;
import cl.sitad.auth.entity.Usuario;
import cl.sitad.auth.enums.NombreRol;
import cl.sitad.auth.enums.TipoAutenticacion;
import cl.sitad.auth.feign.ClaveUnicaResponse;
import cl.sitad.auth.feign.ServicioExternoClient;
import cl.sitad.auth.repository.RefreshTokenRepository;
import cl.sitad.auth.repository.RolRepository;
import cl.sitad.auth.repository.SesionRepository;
import cl.sitad.auth.repository.UsuarioRepository;
import cl.sitad.auth.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    public record LoginTokens(String accessToken, String refreshToken, long expiresIn) {}

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final SesionRepository sesionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final ServicioExternoClient servicioExternoClient;

    public AuthService(UsuarioRepository usuarioRepository,
                       RolRepository rolRepository,
                       SesionRepository sesionRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       ServicioExternoClient servicioExternoClient) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.sesionRepository = sesionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.servicioExternoClient = servicioExternoClient;
    }

    @Transactional
    public LoginTokens loginCiudadano(LoginCiudadanoRequest request) {
        ClaveUnicaResponse claveUnica = servicioExternoClient.validarClaveUnica(request.rut());

        if (!claveUnica.valido()) {
            throw new IllegalArgumentException("Credenciales inv�lidas");
        }

        Usuario usuario = usuarioRepository.findByRut(claveUnica.rut())
                .orElseGet(() -> crearUsuario(claveUnica.rut(), claveUnica.nombre(), claveUnica.email()));

        Rol rolPasajero = rolRepository.findByNombre(NombreRol.PASAJERO)
                .orElseThrow(() -> new IllegalStateException("Rol PASAJERO no encontrado"));

        if (usuario.getRoles().stream().noneMatch(r -> r.getNombre().equals(NombreRol.PASAJERO))) {
            usuario.getRoles().add(rolPasajero);
            usuarioRepository.save(usuario);
        }

        Sesion sesion = crearSesion(usuario, rolPasajero, TipoAutenticacion.CLAVE_UNICA);

        String accessToken = jwtService.generateAccessToken(usuario, rolPasajero, TipoAutenticacion.CLAVE_UNICA);
        String refreshTokenStr = jwtService.generateRefreshToken();

        guardarRefreshToken(refreshTokenStr, usuario, sesion);

        return new LoginTokens(accessToken, refreshTokenStr, jwtService.getAccessTokenExpiration());
    }

    @Transactional
    public LoginTokens loginFuncionario(LoginFuncionarioRequest request) {
        Usuario usuario = usuarioRepository.findByRut(request.rut())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inv�lidas"));

        if (usuario.getPassword() == null || !passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw new IllegalArgumentException("Credenciales inv�lidas");
        }

        Rol rolFuncionario = rolRepository.findByNombre(NombreRol.FUNCIONARIO)
                .orElseThrow(() -> new IllegalStateException("Rol FUNCIONARIO no encontrado"));

        if (usuario.getRoles().stream().noneMatch(r -> r.getNombre().equals(NombreRol.FUNCIONARIO))) {
            throw new IllegalArgumentException("El usuario no tiene permisos de funcionario");
        }

        Sesion sesion = crearSesion(usuario, rolFuncionario, TipoAutenticacion.CREDENCIAL_INSTITUCIONAL);

        String accessToken = jwtService.generateAccessToken(usuario, rolFuncionario, TipoAutenticacion.CREDENCIAL_INSTITUCIONAL);
        String refreshTokenStr = jwtService.generateRefreshToken();

        guardarRefreshToken(refreshTokenStr, usuario, sesion);

        return new LoginTokens(accessToken, refreshTokenStr, jwtService.getAccessTokenExpiration());
    }

    @Transactional
    public RefreshResponse refresh(String refreshTokenStr) {
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token inv�lido"));

        if (refreshTokenEntity.isRevocado()) {
            throw new IllegalArgumentException("Refresh token ya fue revocado");
        }

        if (refreshTokenEntity.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Refresh token expirado");
        }

        Usuario usuario = refreshTokenEntity.getUsuario();
        Sesion sesion = refreshTokenEntity.getSesion();

        String newAccessToken = jwtService.generateAccessToken(
                usuario, sesion.getRol(), sesion.getTipoAutenticacion());

        return new RefreshResponse(newAccessToken, jwtService.getAccessTokenExpiration());
    }

    @Transactional
    public LogoutResponse logout(String refreshTokenStr) {
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token inv�lido"));

        refreshTokenEntity.setRevocado(true);
        refreshTokenRepository.save(refreshTokenEntity);

        return new LogoutResponse("Sesi�n cerrada correctamente");
    }

    private Usuario crearUsuario(String rut, String nombre, String email) {
        Usuario usuario = new Usuario();
        usuario.setRut(rut);
        usuario.setNombre(nombre);
        usuario.setEmail(email);
        return usuarioRepository.save(usuario);
    }

    private Sesion crearSesion(Usuario usuario, Rol rol, TipoAutenticacion tipoAutenticacion) {
        Sesion sesion = new Sesion();
        sesion.setUsuario(usuario);
        sesion.setRol(rol);
        sesion.setTipoAutenticacion(tipoAutenticacion);
        sesion.setFechaInicio(LocalDateTime.now());
        return sesionRepository.save(sesion);
    }

    private void guardarRefreshToken(String tokenStr, Usuario usuario, Sesion sesion) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(tokenStr);
        refreshToken.setUsuario(usuario);
        refreshToken.setSesion(sesion);
        refreshToken.setFechaExpiracion(LocalDateTime.now().plusDays(7));
        refreshToken.setRevocado(false);
        refreshTokenRepository.save(refreshToken);
    }
}
