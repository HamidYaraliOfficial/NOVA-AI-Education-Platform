package com.nova.notification

import com.nova.common.ApiResponse
import com.nova.common.BaseEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.web.bind.annotation.*
import java.util.UUID

enum class NotificationType { REMINDER, EXAM, ASSIGNMENT, STREAK, COURSE_UPDATE, ANNOUNCEMENT, AI_RECOMMENDATION }

@Entity
@Table(name = "notifications")
class Notification(
    var userId: UUID? = null,
    var title: String = "",
    @Column(columnDefinition = "TEXT") var body: String = "",
    @Enumerated(EnumType.STRING) var type: NotificationType = NotificationType.REMINDER,
    @Column(nullable = false) var read: Boolean = false
) : BaseEntity()

interface NotificationRepository : JpaRepository<Notification, UUID> {
    fun findByUserIdOrderByCreatedAtDesc(userId: UUID): List<Notification>
}

@org.springframework.stereotype.Service
class NotificationService(private val repository: NotificationRepository) {

    fun list(userId: UUID) = repository.findByUserIdOrderByCreatedAtDesc(userId)

    fun create(userId: UUID, title: String, body: String, type: NotificationType): Notification =
        repository.save(Notification(userId = userId, title = title, body = body, type = type))

    fun markRead(id: UUID): Notification {
        val n = repository.findById(id).orElseThrow { NoSuchElementException("Notification not found") }
        n.read = true
        return repository.save(n)
    }
}

@RestController
@RequestMapping("/api/v1/notifications")
class NotificationController(private val notificationService: NotificationService) {

    @GetMapping
    fun list(authentication: org.springframework.security.core.Authentication) =
        ApiResponse.ok(notificationService.list(UUID.fromString(authentication.principal as String)))

    @PatchMapping("/{id}/read")
    fun markRead(@PathVariable id: UUID) = ApiResponse.ok(notificationService.markRead(id))
}
