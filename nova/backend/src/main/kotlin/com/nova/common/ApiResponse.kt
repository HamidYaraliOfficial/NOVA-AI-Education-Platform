package com.nova.common

import org.springframework.data.domain.Page

data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val errorCode: String? = null
) {
    companion object {
        fun <T> ok(data: T): ApiResponse<T> = ApiResponse(success = true, data = data)
        fun <T> error(message: String, errorCode: String? = null): ApiResponse<T> =
            ApiResponse(success = false, message = message, errorCode = errorCode)
    }
}

data class PageResponse<T>(
    val items: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val hasNext: Boolean
) {
    companion object {
        fun <T> from(page: Page<T>): PageResponse<T> = PageResponse(
            items = page.content,
            page = page.number,
            size = page.size,
            totalElements = page.totalElements,
            totalPages = page.totalPages,
            hasNext = page.hasNext()
        )
    }
}

open class NovaException(message: String, val errorCode: String = "NOVA_ERROR") : RuntimeException(message)
class NotFoundException(message: String) : NovaException(message, "NOT_FOUND")
class ValidationException(message: String) : NovaException(message, "VALIDATION_ERROR")
class UnauthorizedException(message: String) : NovaException(message, "UNAUTHORIZED")
class ForbiddenException(message: String) : NovaException(message, "FORBIDDEN")
class RateLimitedException(message: String) : NovaException(message, "RATE_LIMITED")
