package com.nova.course

import com.nova.common.ApiResponse
import com.nova.common.BaseEntity
import com.nova.common.NotFoundException
import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.web.bind.annotation.*
import java.util.UUID

enum class Difficulty { BEGINNER, INTERMEDIATE, ADVANCED, EXPERT }
enum class LessonType { VIDEO, TEXT, AUDIO, PDF, CODE_EXERCISE, QUIZ, ASSIGNMENT, PROJECT, FINAL_EXAM }

@Entity
@Table(name = "courses")
class Course(
    @Column(nullable = false) var title: String,
    @Column(columnDefinition = "TEXT") var description: String,
    var coverUrl: String? = null,
    var category: String = "General",
    @Enumerated(EnumType.STRING) var difficulty: Difficulty = Difficulty.BEGINNER,
    var language: String = "en",
    var instructorId: UUID? = null,
    @Column(nullable = false) var published: Boolean = false,
    @Column(nullable = false) var version: Int = 1
) : BaseEntity() {
    @OneToMany(mappedBy = "course", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderColumn(name = "position")
    var sections: MutableList<Section> = mutableListOf()
}

@Entity
@Table(name = "sections")
class Section(
    @ManyToOne @JoinColumn(name = "course_id") var course: Course? = null,
    var title: String = ""
) : BaseEntity() {
    @OneToMany(mappedBy = "section", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderColumn(name = "position")
    var chapters: MutableList<Chapter> = mutableListOf()
}

@Entity
@Table(name = "chapters")
class Chapter(
    @ManyToOne @JoinColumn(name = "section_id") var section: Section? = null,
    var title: String = ""
) : BaseEntity() {
    @OneToMany(mappedBy = "chapter", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderColumn(name = "position")
    var lessons: MutableList<Lesson> = mutableListOf()
}

@Entity
@Table(name = "lessons")
class Lesson(
    @ManyToOne @JoinColumn(name = "chapter_id") var chapter: Chapter? = null,
    var title: String = "",
    @Enumerated(EnumType.STRING) var type: LessonType = LessonType.TEXT,
    var durationMinutes: Int = 0,
    @Column(columnDefinition = "TEXT") var contentMarkdown: String? = null,
    var videoUrl: String? = null
) : BaseEntity()

@Entity
@Table(name = "lesson_progress", uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "lesson_id"])])
class LessonProgress(
    @Column(name = "user_id", nullable = false) var userId: UUID,
    @Column(name = "lesson_id", nullable = false) var lessonId: UUID,
    @Column(name = "course_id", nullable = false) var courseId: UUID,
    @Column(nullable = false) var completed: Boolean = false,
    @Column(nullable = false) var positionSeconds: Int = 0
) : BaseEntity()

interface CourseRepository : JpaRepository<Course, UUID>
interface LessonRepository : JpaRepository<Lesson, UUID>
interface LessonProgressRepository : JpaRepository<LessonProgress, UUID> {
    fun findByUserIdAndLessonId(userId: UUID, lessonId: UUID): LessonProgress?
    fun findByUserIdAndCourseId(userId: UUID, courseId: UUID): List<LessonProgress>
}

data class UpdateProgressRequest(val positionSeconds: Int, val completed: Boolean = false)

@org.springframework.stereotype.Service
class CourseService(
    private val courseRepository: CourseRepository,
    private val lessonRepository: LessonRepository,
    private val progressRepository: LessonProgressRepository
) {
    fun listCourses() = courseRepository.findAll().filter { it.published }

    fun getCourse(id: UUID) = courseRepository.findById(id).orElseThrow { NotFoundException("Course not found") }

    /**
     * Records playback / reading position for a lesson so the user can resume
     * exactly where they left off, on any device.
     */
    fun updateProgress(userId: UUID, courseId: UUID, lessonId: UUID, request: UpdateProgressRequest): LessonProgress {
        lessonRepository.findById(lessonId).orElseThrow { NotFoundException("Lesson not found") }
        val existing = progressRepository.findByUserIdAndLessonId(userId, lessonId)
        val progress = existing ?: LessonProgress(userId = userId, lessonId = lessonId, courseId = courseId)
        progress.positionSeconds = request.positionSeconds
        if (request.completed) progress.completed = true
        return progressRepository.save(progress)
    }

    fun courseCompletionPercent(userId: UUID, courseId: UUID): Double {
        val course = getCourse(courseId)
        val totalLessons = course.sections.sumOf { s -> s.chapters.sumOf { it.lessons.size } }
        if (totalLessons == 0) return 0.0
        val completed = progressRepository.findByUserIdAndCourseId(userId, courseId).count { it.completed }
        return (completed.toDouble() / totalLessons) * 100.0
    }
}

@RestController
@RequestMapping("/api/v1/courses")
class CourseController(private val courseService: CourseService) {

    @GetMapping
    fun list() = ApiResponse.ok(courseService.listCourses())

    @GetMapping("/{courseId}")
    fun get(@PathVariable courseId: UUID) = ApiResponse.ok(courseService.getCourse(courseId))

    @GetMapping("/{courseId}/progress")
    fun progress(@PathVariable courseId: UUID, authentication: org.springframework.security.core.Authentication) =
        ApiResponse.ok(courseService.courseCompletionPercent(UUID.fromString(authentication.principal as String), courseId))

    @PatchMapping("/{courseId}/lessons/{lessonId}/progress")
    fun updateProgress(
        @PathVariable courseId: UUID,
        @PathVariable lessonId: UUID,
        @RequestBody request: UpdateProgressRequest,
        authentication: org.springframework.security.core.Authentication
    ) = ApiResponse.ok(
        courseService.updateProgress(UUID.fromString(authentication.principal as String), courseId, lessonId, request)
    )
}
