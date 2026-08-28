package com.nova.auth

import com.nova.common.ApiResponse
import com.nova.common.UnauthorizedException
import com.nova.common.ValidationException
import com.nova.security.JwtService
import com.nova.user.Role
import com.nova.user.User
import com.nova.user.UserRepository
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*

data class RegisterRequest(
    @field:NotBlank val fullName: String,
    @field:Email val email: String,
    @field:Size(min = 8) val password: String
)

data class LoginRequest(
    @field:Email val email: String,
    @field:NotBlank val password: String
)

data class AuthResponse(val accessToken: String, val refreshToken: String)

data class UserProfileResponse(
    val id: String,
    val fullName: String,
    val email: String,
    val role: Role,
    val level: Int,
    val xp: Long,
    val streakDays: Int
)

@org.springframework.stereotype.Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {

    fun register(request: RegisterRequest): UserProfileResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw ValidationException("An account with this email already exists")
        }
        val user = User(
            email = request.email,
            passwordHash = passwordEncoder.encode(request.password),
            fullName = request.fullName,
            role = Role.STUDENT
        )
        val saved = userRepository.save(user)
        return saved.toProfile()
    }

    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            .orElseThrow { UnauthorizedException("Invalid email or password") }
        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw UnauthorizedException("Invalid email or password")
        }
        val userId = user.id.toString()
        return AuthResponse(
            accessToken = jwtService.generateAccessToken(userId, user.role.name),
            refreshToken = jwtService.generateRefreshToken(userId)
        )
    }

    fun refresh(refreshToken: String): AuthResponse {
        if (!jwtService.isValid(refreshToken)) throw UnauthorizedException("Invalid refresh token")
        val userId = jwtService.subject(refreshToken)
        val user = userRepository.findById(java.util.UUID.fromString(userId))
            .orElseThrow { UnauthorizedException("User not found") }
        return AuthResponse(
            accessToken = jwtService.generateAccessToken(userId, user.role.name),
            refreshToken = jwtService.generateRefreshToken(userId)
        )
    }

    fun me(userId: String): UserProfileResponse {
        val user = userRepository.findById(java.util.UUID.fromString(userId))
            .orElseThrow { UnauthorizedException("User not found") }
        return user.toProfile()
    }

    private fun User.toProfile() = UserProfileResponse(
        id = id.toString(), fullName = fullName, email = email, role = role, level = level, xp = xp, streakDays = streakDays
    )
}

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/register")
    fun register(@org.springframework.web.bind.annotation.RequestBody @jakarta.validation.Valid request: RegisterRequest) =
        ApiResponse.ok(authService.register(request))

    @PostMapping("/login")
    fun login(@RequestBody @jakarta.validation.Valid request: LoginRequest) =
        ApiResponse.ok(authService.login(request))

    @PostMapping("/refresh")
    fun refresh(@RequestBody body: Map<String, String>) =
        ApiResponse.ok(authService.refresh(body["refreshToken"] ?: throw ValidationException("refreshToken is required")))

    @GetMapping("/me")
    fun me(authentication: org.springframework.security.core.Authentication) =
        ApiResponse.ok(authService.me(authentication.principal as String))
}
