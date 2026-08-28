package com.nova.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${nova.jwt.secret}") secret: String,
    @Value("\${nova.jwt.access-token-ttl-minutes}") private val accessTtlMinutes: Long,
    @Value("\${nova.jwt.refresh-token-ttl-days}") private val refreshTtlDays: Long
) {
    private val key: SecretKey = Keys.hmacShaKeyFor(secret.toByteArray().copyOf(32))

    fun generateAccessToken(userId: String, role: String): String =
        buildToken(userId, mapOf("role" to role, "type" to "access"), accessTtlMinutes * 60)

    fun generateRefreshToken(userId: String): String =
        buildToken(userId, mapOf("type" to "refresh"), refreshTtlDays * 24 * 60 * 60)

    private fun buildToken(subject: String, claims: Map<String, Any>, ttlSeconds: Long): String {
        val now = Instant.now()
        return Jwts.builder()
            .subject(subject)
            .claims(claims)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(ttlSeconds)))
            .signWith(key)
            .compact()
    }

    fun parse(token: String): Claims =
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload

    fun isValid(token: String): Boolean = try {
        parse(token); true
    } catch (ex: Exception) {
        false
    }

    fun subject(token: String): String = parse(token).subject
    fun role(token: String): String? = parse(token)["role"] as String?
}
