package com.nova.android.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "courses")
data class CourseEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val progressPercent: Int,
    val downloaded: Boolean = false
)

@Entity(tableName = "lesson_progress")
data class LessonProgressEntity(
    @PrimaryKey val lessonId: String,
    val courseId: String,
    val completed: Boolean,
    val positionSeconds: Int,
    val pendingSync: Boolean = false // true until successfully synced with the backend
)

@Dao
interface CourseDao {
    @Query("SELECT * FROM courses")
    fun observeCourses(): Flow<List<CourseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(courses: List<CourseEntity>)

    @Query("SELECT * FROM courses WHERE downloaded = 1")
    suspend fun downloadedCourses(): List<CourseEntity>
}

@Dao
interface LessonProgressDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(progress: LessonProgressEntity)

    @Query("SELECT * FROM lesson_progress WHERE pendingSync = 1")
    suspend fun pendingSync(): List<LessonProgressEntity>

    @Query("UPDATE lesson_progress SET pendingSync = 0 WHERE lessonId = :lessonId")
    suspend fun markSynced(lessonId: String)
}

@Database(entities = [CourseEntity::class, LessonProgressEntity::class], version = 1, exportSchema = false)
abstract class NovaDatabase : RoomDatabase() {
    abstract fun courseDao(): CourseDao
    abstract fun lessonProgressDao(): LessonProgressDao
}
