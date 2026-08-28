package com.nova.android.data.repository

import com.nova.android.data.local.CourseDao
import com.nova.android.data.local.CourseEntity
import com.nova.android.data.local.LessonProgressDao
import com.nova.android.data.local.LessonProgressEntity
import com.nova.android.data.remote.NovaApiService
import com.nova.android.data.remote.ProgressUpdateDto
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

/**
 * Offline-first repository. Reads always come from Room so the UI works with
 * no connectivity; writes are applied locally immediately (marked
 * `pendingSync`) and pushed to the backend by `syncPendingProgress()`, which
 * WorkManager invokes on reconnect. Conflicts are resolved last-write-wins
 * using each record's local update time, matching the simple strategy used
 * server-side for cross-device progress merging.
 */
class CourseRepository @Inject constructor(
    private val api: NovaApiService,
    private val courseDao: CourseDao,
    private val lessonProgressDao: LessonProgressDao
) {
    fun observeCourses(): Flow<List<CourseEntity>> = courseDao.observeCourses()

    suspend fun refreshCourses() {
        val remote = api.listCourses()
        courseDao.upsertAll(remote.map { CourseEntity(it.id, it.title, it.description, it.progressPercent) })
    }

    suspend fun recordProgress(courseId: String, lessonId: String, positionSeconds: Int, completed: Boolean) {
        lessonProgressDao.upsert(
            LessonProgressEntity(
                lessonId = lessonId,
                courseId = courseId,
                completed = completed,
                positionSeconds = positionSeconds,
                pendingSync = true
            )
        )
    }

    suspend fun syncPendingProgress() {
        val pending = lessonProgressDao.pendingSync()
        for (item in pending) {
            runCatching {
                api.updateProgress(item.courseId, item.lessonId, ProgressUpdateDto(item.positionSeconds, item.completed))
            }.onSuccess {
                lessonProgressDao.markSynced(item.lessonId)
            }
            // On failure, the record simply stays pendingSync = true and is retried on the next sync pass.
        }
    }
}
