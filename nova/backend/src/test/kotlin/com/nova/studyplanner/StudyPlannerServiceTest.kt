package com.nova.studyplanner

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.ZoneOffset
import java.time.ZonedDateTime

class StudyPlannerServiceTest {

    private val repository = mockRepository()
    private val service = StudyPlannerService(repository)

    @Test
    fun `reports open window when now falls inside a configured range`() {
        // Monday 19:00-21:00 UTC; "now" set to Monday 19:30 UTC.
        val now = ZonedDateTime.now(ZoneOffset.UTC).with(java.time.DayOfWeek.MONDAY).withHour(19).withMinute(30)
        val userId = java.util.UUID.randomUUID()
        repository.save(AvailabilityWindow(userId = userId, dayOfWeek = 1, startTime = "19:00", endTime = "21:00"))

        val result = service.nextSession(userId, now)
        assertTrue(result.isOpenNow)
    }
}

// Minimal in-memory fake to avoid requiring a real datasource for this unit test.
private fun mockRepository(): AvailabilityWindowRepository = object : AvailabilityWindowRepository {
    private val storage = mutableListOf<AvailabilityWindow>()
    override fun findByUserId(userId: java.util.UUID) = storage.filter { it.userId == userId }
    override fun deleteByUserId(userId: java.util.UUID) { storage.removeAll { it.userId == userId } }
    override fun <S : AvailabilityWindow?> save(entity: S & Any): S & Any { storage.add(entity); return entity }
    override fun <S : AvailabilityWindow?> saveAll(entities: MutableIterable<S>): MutableList<S> {
        entities.forEach { storage.add(it as AvailabilityWindow) }; return entities.toMutableList()
    }
    override fun findAll(): MutableList<AvailabilityWindow> = storage
    override fun findById(id: java.util.UUID) = storage.firstOrNull { it.id == id }?.let { java.util.Optional.of(it) } ?: java.util.Optional.empty()
    override fun existsById(id: java.util.UUID) = storage.any { it.id == id }
    override fun count() = storage.size.toLong()
    override fun deleteById(id: java.util.UUID) { storage.removeAll { it.id == id } }
    override fun delete(entity: AvailabilityWindow) { storage.remove(entity) }
    override fun deleteAllById(ids: MutableIterable<java.util.UUID>) {}
    override fun deleteAll(entities: MutableIterable<AvailabilityWindow>) {}
    override fun deleteAll() { storage.clear() }
    override fun findAllById(ids: MutableIterable<java.util.UUID>) = storage.filter { ids.contains(it.id) }.toMutableList()
    override fun flush() {}
    override fun <S : AvailabilityWindow?> saveAndFlush(entity: S & Any) = save(entity)
    override fun <S : AvailabilityWindow?> saveAllAndFlush(entities: MutableIterable<S>) = saveAll(entities)
    override fun deleteAllInBatch(entities: MutableIterable<AvailabilityWindow>) {}
    override fun deleteAllByIdInBatch(ids: MutableIterable<java.util.UUID>) {}
    override fun deleteAllInBatch() {}
    override fun getOne(id: java.util.UUID) = storage.first { it.id == id }
    override fun getById(id: java.util.UUID) = storage.first { it.id == id }
    override fun getReferenceById(id: java.util.UUID) = storage.first { it.id == id }
    override fun findAll(sort: org.springframework.data.domain.Sort) = storage
    override fun findAll(pageable: org.springframework.data.domain.Pageable) =
        org.springframework.data.domain.PageImpl(storage)
}
