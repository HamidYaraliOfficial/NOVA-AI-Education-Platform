package com.nova.user

import com.nova.common.BaseEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional
import java.util.UUID

@Entity
@Table(name = "users")
class User(
    @Column(nullable = false, unique = true)
    var email: String,

    @Column(nullable = false)
    var passwordHash: String,

    @Column(nullable = false)
    var fullName: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: Role = Role.STUDENT,

    var avatarUrl: String? = null,

    @Column(nullable = false)
    var emailVerified: Boolean = false,

    @Column(nullable = false)
    var level: Int = 1,

    @Column(nullable = false)
    var xp: Long = 0,

    @Column(nullable = false)
    var streakDays: Int = 0,

    var preferredLocale: String = "en",
    var dailyFreeMinutes: Int = 30,
    var knowledgeLevel: String = "BEGINNER"
) : BaseEntity()

interface UserRepository : JpaRepository<User, UUID> {
    fun findByEmail(email: String): Optional<User>
    fun existsByEmail(email: String): Boolean
}
