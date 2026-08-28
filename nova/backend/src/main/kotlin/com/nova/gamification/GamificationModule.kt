package com.nova.gamification

import com.nova.common.ApiResponse
import com.nova.common.BaseEntity
import com.nova.user.UserRepository
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.web.bind.annotation.*
import java.util.UUID
import kotlin.math.floor
import kotlin.math.sqrt

@Entity
@Table(name = "badges")
class Badge(
    var userId: UUID? = null,
    var code: String = "",
    var title: String = "",
    var description: String = ""
) : BaseEntity()

interface BadgeRepository : JpaRepository<Badge, UUID> {
    fun findByUserId(userId: UUID): List<Badge>
    fun existsByUserIdAndCode(userId: UUID, code: String): Boolean
}

data class XpAwardResult(val totalXp: Long, val level: Int, val leveledUp: Boolean, val newBadges: List<String>)

/**
 * XP curve: level N requires N^2 * 100 cumulative XP, so leveling gets
 * progressively harder — a common, predictable EdTech gamification curve.
 */
@org.springframework.stereotype.Service
class GamificationService(
    private val userRepository: UserRepository,
    private val badgeRepository: BadgeRepository
) {
    fun levelForXp(xp: Long): Int = floor(sqrt(xp / 100.0)).toInt().coerceAtLeast(1)

    fun awardXp(userId: UUID, amount: Long, reason: String): XpAwardResult {
        val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found") }
        val previousLevel = user.level
        user.xp += amount
        user.level = levelForXp(user.xp)
        userRepository.save(user)

        val newBadges = mutableListOf<String>()
        if (user.xp >= 10_000 && !badgeRepository.existsByUserIdAndCode(userId, "XP_10K")) {
            badgeRepository.save(Badge(userId = userId, code = "XP_10K", title = "10K Club", description = "Earned 10,000 XP"))
            newBadges += "XP_10K"
        }

        return XpAwardResult(user.xp, user.level, user.level > previousLevel, newBadges)
    }

    fun incrementStreak(userId: UUID): Int {
        val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found") }
        user.streakDays += 1
        userRepository.save(user)
        return user.streakDays
    }

    fun resetStreak(userId: UUID) {
        val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found") }
        user.streakDays = 0
        userRepository.save(user)
    }

    fun leaderboard(limit: Int = 20) =
        userRepository.findAll().sortedByDescending { it.xp }.take(limit)
            .mapIndexed { index, u -> mapOf("rank" to index + 1, "userName" to u.fullName, "xp" to u.xp) }
}

@RestController
@RequestMapping("/api/v1/gamification")
class GamificationController(private val gamificationService: GamificationService) {

    @GetMapping("/leaderboard")
    fun leaderboard() = ApiResponse.ok(gamificationService.leaderboard())

    @PostMapping("/award-xp")
    fun awardXp(
        @RequestBody body: Map<String, Any>,
        authentication: org.springframework.security.core.Authentication
    ) = ApiResponse.ok(
        gamificationService.awardXp(
            UUID.fromString(authentication.principal as String),
            (body["amount"] as Number).toLong(),
            body["reason"] as? String ?: "activity"
        )
    )
}
