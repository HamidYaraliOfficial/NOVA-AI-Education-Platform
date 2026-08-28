package com.nova.android.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

data class LoginRequestDto(val email: String, val password: String)
data class AuthResponseDto(val accessToken: String, val refreshToken: String)
data class CourseDto(val id: String, val title: String, val description: String, val progressPercent: Int)
data class ProgressUpdateDto(val positionSeconds: Int, val completed: Boolean = false)

interface NovaApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequestDto): AuthResponseDto

    @GET("courses")
    suspend fun listCourses(): List<CourseDto>

    @PATCH("courses/{courseId}/lessons/{lessonId}/progress")
    suspend fun updateProgress(
        @Path("courseId") courseId: String,
        @Path("lessonId") lessonId: String,
        @Body update: ProgressUpdateDto
    )
}
