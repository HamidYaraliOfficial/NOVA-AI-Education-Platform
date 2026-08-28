package com.nova.flashcard

import com.nova.common.ApiResponse
import com.nova.common.BaseEntity
import com.nova.common.NotFoundException
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID
import kotlin.math.max
import kotlin.math.roundToInt

@Entity
@Table(name = "flashcards")
class Flashcard(
    var userId: UUID? = null,
    var courseId: UUID? = null,
    @Column(columnDefinition = "TEXT") var front: String = "",
    @Column(columnDefinition = "TEXT") var back: String = "",
    @Column(nullable = false) var easeFactor: Double = 2.5,
    @Column(nullable = false) var intervalDays: Int = 1,
    @Column(nullable = false) var correctStreak: Int = 0,
    @Column(nullable = false) var dueAt: Instant = Instant.now(),
    @Column(nullable = false) var aiGenerated: Boolean = false
) : BaseEntity()

interface FlashcardRepository : JpaRepository<Flashcard, UUID> {
    fun findByUserIdAndDueAtBefore(userId: UUID, before: Instant): List<Flashcard>
}

enum class Grade { AGAIN, GOOD, EASY }

/**
 * Simplified SM-2 spaced-repetition scheduler. Cards graded AGAIN reset to a
 * short interval and lose ease; GOOD/EASY grow the interval, with EASY
 * additionally boosting the ease factor so future intervals grow faster.
 */
@org.springframework.stereotype.Service
class SpacedRepetitionService {

    fun grade(card: Flashcard, grade: Grade): Flashcard {
        when (grade) {
            Grade.AGAIN -> {
                card.correctStreak = 0
                card.intervalDays = 1
                card.easeFactor = max(1.3, card.easeFactor - 0.2)
            }
            Grade.GOOD -> {
                card.correctStreak += 1
                card.intervalDays = when (card.correctStreak) {
                    1 -> 1
                    2 -> 3
                    else -> (card.intervalDays * card.easeFactor).roundToInt()
                }
            }
            Grade.EASY -> {
                card.correctStreak += 1
                card.intervalDays = if (card.correctStreak == 1) 2 else (card.intervalDays * card.easeFactor * 1.3).roundToInt()
                card.easeFactor += 0.15
            }
        }
        card.dueAt = Instant.now().plusSeconds(card.intervalDays * 86400L)
        return card
    }
}

data class GradeRequest(val grade: Grade)

@org.springframework.stereotype.Service
class FlashcardService(
    private val flashcardRepository: FlashcardRepository,
    private val spacedRepetitionService: SpacedRepetitionService
) {
    fun dueCards(userId: UUID): List<Flashcard> = flashcardRepository.findByUserIdAndDueAtBefore(userId, Instant.now())

    fun gradeCard(cardId: UUID, request: GradeRequest): Flashcard {
        val card = flashcardRepository.findById(cardId).orElseThrow { NotFoundException("Flashcard not found") }
        val updated = spacedRepetitionService.grade(card, request.grade)
        return flashcardRepository.save(updated)
    }
}

@RestController
@RequestMapping("/api/v1/flashcards")
class FlashcardController(private val flashcardService: FlashcardService) {

    @GetMapping("/due")
    fun due(authentication: org.springframework.security.core.Authentication) =
        ApiResponse.ok(flashcardService.dueCards(UUID.fromString(authentication.principal as String)))

    @PostMapping("/{cardId}/grade")
    fun grade(@PathVariable cardId: UUID, @RequestBody request: GradeRequest) =
        ApiResponse.ok(flashcardService.gradeCard(cardId, request))
}
