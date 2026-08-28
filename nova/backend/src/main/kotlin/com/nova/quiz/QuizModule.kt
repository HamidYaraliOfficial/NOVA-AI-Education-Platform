package com.nova.quiz

import com.nova.common.ApiResponse
import com.nova.common.BaseEntity
import com.nova.common.NotFoundException
import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.web.bind.annotation.*
import java.util.UUID

enum class QuestionType { MULTIPLE_CHOICE, MULTIPLE_ANSWER, TRUE_FALSE, MATCHING, ORDERING, FILL_BLANK, SHORT_ANSWER, CODE }
enum class Difficulty { EASY, MEDIUM, HARD }

@Entity
@Table(name = "questions")
class Question(
    @Enumerated(EnumType.STRING) var type: QuestionType = QuestionType.MULTIPLE_CHOICE,
    @Column(columnDefinition = "TEXT") var prompt: String = "",
    @ElementCollection @Column(name = "option_text") var options: MutableList<String> = mutableListOf(),
    @ElementCollection var correctOptionIndexes: MutableList<Int> = mutableListOf(),
    @Column(columnDefinition = "TEXT") var explanation: String? = null,
    @Enumerated(EnumType.STRING) var difficulty: Difficulty = Difficulty.MEDIUM,
    var timeLimitSeconds: Int = 60,
    var points: Int = 10,
    @ElementCollection var tags: MutableList<String> = mutableListOf(),
    var courseId: UUID? = null
) : BaseEntity()

@Entity
@Table(name = "quizzes")
class Quiz(
    var title: String = "",
    var courseId: UUID? = null,
    var lessonId: UUID? = null,
    @Column(nullable = false) var randomized: Boolean = true,
    @Column(nullable = false) var questionPoolSize: Int = 10,
    @ElementCollection var questionIds: MutableList<UUID> = mutableListOf()
) : BaseEntity()

@Entity
@Table(name = "quiz_attempts")
class QuizAttempt(
    var quizId: UUID? = null,
    var userId: UUID? = null,
    @Column(nullable = false) var scored: Int = 0,
    @Column(nullable = false) var total: Int = 0,
    @Column(nullable = false) var submitted: Boolean = false,
    @ElementCollection var givenAnswers: MutableMap<String, String> = mutableMapOf()
) : BaseEntity()

interface QuestionRepository : JpaRepository<Question, UUID> {
    fun findByCourseId(courseId: UUID): List<Question>
}
interface QuizRepository : JpaRepository<Quiz, UUID>
interface QuizAttemptRepository : JpaRepository<QuizAttempt, UUID> {
    fun findByUserIdAndQuizId(userId: UUID, quizId: UUID): List<QuizAttempt>
}

data class SubmitAnswerRequest(val questionId: UUID, val selectedIndexes: List<Int>)
data class SubmitAttemptRequest(val quizId: UUID, val answers: List<SubmitAnswerRequest>)
data class AttemptResult(val scored: Int, val total: Int, val correctCount: Int, val totalQuestions: Int)

@org.springframework.stereotype.Service
class QuizService(
    private val questionRepository: QuestionRepository,
    private val quizRepository: QuizRepository,
    private val attemptRepository: QuizAttemptRepository
) {
    /**
     * Builds a quiz attempt: pulls the configured pool of questions, shuffles
     * when randomization is enabled, and returns them without revealing
     * correct answers to the client.
     */
    fun startAttempt(quizId: UUID): List<Question> {
        val quiz = quizRepository.findById(quizId).orElseThrow { NotFoundException("Quiz not found") }
        val pool = questionRepository.findAllById(quiz.questionIds)
        val selected = if (quiz.randomized) pool.shuffled().take(quiz.questionPoolSize) else pool.take(quiz.questionPoolSize)
        return selected
    }

    fun submit(userId: UUID, request: SubmitAttemptRequest): AttemptResult {
        val quiz = quizRepository.findById(request.quizId).orElseThrow { NotFoundException("Quiz not found") }
        var scored = 0
        var total = 0
        var correctCount = 0
        for (answer in request.answers) {
            val question = questionRepository.findById(answer.questionId).orElseContinue() ?: continue
            total += question.points
            val given = answer.selectedIndexes.sorted()
            val correct = question.correctOptionIndexes.sorted()
            if (given == correct) {
                scored += question.points
                correctCount++
            }
        }
        val attempt = QuizAttempt(quizId = quiz.id, userId = userId, scored = scored, total = total, submitted = true)
        attemptRepository.save(attempt)
        return AttemptResult(scored, total, correctCount, request.answers.size)
    }

    private fun java.util.Optional<Question>.orElseContinue(): Question? = if (isPresent) get() else null
}

@RestController
@RequestMapping("/api/v1/quizzes")
class QuizController(private val quizService: QuizService) {

    @GetMapping("/{quizId}/start")
    fun start(@PathVariable quizId: UUID) = ApiResponse.ok(quizService.startAttempt(quizId))

    @PostMapping("/submit")
    fun submit(@RequestBody request: SubmitAttemptRequest, authentication: org.springframework.security.core.Authentication) =
        ApiResponse.ok(quizService.submit(UUID.fromString(authentication.principal as String), request))
}
