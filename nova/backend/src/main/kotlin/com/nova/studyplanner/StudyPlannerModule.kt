package com.nova.studyplanner

import com.nova.common.ApiResponse
import com.nova.common.BaseEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.web.bind.annotation.*
import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalTime
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.util.UUID

@Entity
@Table(name = "availability_windows")
class AvailabilityWindow(
    var userId: UUID? = null,
    @Column(nullable = false) var dayOfWeek: Int = 1, // 0 = Sunday .. 6 = Saturday
    @Column(nullable = false) var startTime: String = "18:00", // HH:mm
    @Column(nullable = false) var endTime: String = "19:00"
) : BaseEntity()

interface AvailabilityWindowRepository : JpaRepository<AvailabilityWindow, UUID> {
    fun findByUserId(userId: UUID): List<AvailabilityWindow>
    fun deleteByUserId(userId: UUID)
}

data class AvailabilityWindowDto(val dayOfWeek: Int, val startTime: String, val endTime: String)
data class SaveAvailabilityRequest(val windows: List<AvailabilityWindowDto>)
data class NextSessionResponse(val isOpenNow: Boolean, val nextStartAt: Instant?, val nextEndAt: Instant?)

/**
 * Determines whether the user is currently inside one of their declared
 * weekly study windows, and if not, when the next one begins. This mirrors
 * the client-side countdown widget so the "is a session open right now, and
 * how long until the next one" answer is consistent across web and Android,
 * even when a device has been offline.
 */
@org.springframework.stereotype.Service
class StudyPlannerService(private val repository: AvailabilityWindowRepository) {

    fun getAvailability(userId: UUID): List<AvailabilityWindow> = repository.findByUserId(userId)

    fun saveAvailability(userId: UUID, request: SaveAvailabilityRequest): List<AvailabilityWindow> {
        repository.deleteByUserId(userId)
        val entities = request.windows.map {
            AvailabilityWindow(userId = userId, dayOfWeek = it.dayOfWeek, startTime = it.startTime, endTime = it.endTime)
        }
        return repository.saveAll(entities)
    }

    fun nextSession(userId: UUID, now: ZonedDateTime = ZonedDateTime.now(ZoneOffset.UTC)): NextSessionResponse {
        val windows = repository.findByUserId(userId)
        if (windows.isEmpty()) return NextSessionResponse(false, null, null)

        // Check if "now" falls inside any window across this week, last week, and next week
        // (to correctly handle windows that wrap past midnight or past week boundaries).
        for (weekOffset in -1..1) {
            for (w in windows) {
                val start = occurrenceOf(w.dayOfWeek, w.startTime, now, weekOffset)
                var end = occurrenceOf(w.dayOfWeek, w.endTime, now, weekOffset)
                if (!end.isAfter(start)) end = end.plusDays(1) // window crosses midnight
                if (!now.isBefore(start) && now.isBefore(end)) {
                    return NextSessionResponse(true, start.toInstant(), end.toInstant())
                }
            }
        }

        // Otherwise, find the closest future start time.
        var best: ZonedDateTime? = null
        for (weekOffset in 0..2) {
            for (w in windows) {
                val start = occurrenceOf(w.dayOfWeek, w.startTime, now, weekOffset)
                if (!start.isBefore(now) && (best == null || start.isBefore(best))) best = start
            }
        }
        val bestEnd = best?.let { s ->
            windows.filter { occurrenceOf(it.dayOfWeek, it.startTime, now, 0).dayOfWeek.value % 7 == s.dayOfWeek.value % 7 }
                .firstOrNull()
        }
        return NextSessionResponse(false, best?.toInstant(), null).let {
            if (best != null) {
                val matching = windows.first { w -> dayOfWeekFromIndex(w.dayOfWeek) == best.dayOfWeek }
                val end = occurrenceOf(matching.dayOfWeek, matching.endTime, best, 0)
                it.copy(nextEndAt = end.toInstant())
            } else it
        }
    }

    private fun occurrenceOf(dayIndex: Int, hhmm: String, reference: ZonedDateTime, weekOffset: Int): ZonedDateTime {
        val time = LocalTime.parse(hhmm)
        val targetDow = dayOfWeekFromIndex(dayIndex)
        var candidate = reference.with(targetDow).withHour(time.hour).withMinute(time.minute).withSecond(0).withNano(0)
        candidate = candidate.plusWeeks(weekOffset.toLong())
        return candidate
    }

    private fun dayOfWeekFromIndex(index: Int): DayOfWeek =
        DayOfWeek.of(if (index == 0) 7 else index) // our index: 0=Sunday..6=Saturday -> ISO: 1=Monday..7=Sunday
}

@RestController
@RequestMapping("/api/v1/study-planner")
class StudyPlannerController(private val studyPlannerService: StudyPlannerService) {

    @GetMapping("/availability")
    fun getAvailability(authentication: org.springframework.security.core.Authentication) =
        ApiResponse.ok(studyPlannerService.getAvailability(UUID.fromString(authentication.principal as String)))

    @PostMapping("/availability")
    fun saveAvailability(
        @RequestBody request: SaveAvailabilityRequest,
        authentication: org.springframework.security.core.Authentication
    ) = ApiResponse.ok(studyPlannerService.saveAvailability(UUID.fromString(authentication.principal as String), request))

    @GetMapping("/next-session")
    fun nextSession(authentication: org.springframework.security.core.Authentication) =
        ApiResponse.ok(studyPlannerService.nextSession(UUID.fromString(authentication.principal as String)))
}
