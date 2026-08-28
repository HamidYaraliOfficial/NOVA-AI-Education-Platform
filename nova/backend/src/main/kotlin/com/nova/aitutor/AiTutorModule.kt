package com.nova.aitutor

import com.nova.common.ApiResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*
import org.springframework.web.reactive.function.client.WebClient
import java.util.UUID
import kotlin.math.sqrt

/**
 * A chunk of indexed course/lesson content used for retrieval-augmented
 * generation. In production this is persisted with a vector column
 * (e.g. Postgres + pgvector) and populated by a background indexing job
 * whenever a teacher publishes or edits content.
 */
data class ContentChunk(
    val id: UUID,
    val courseId: UUID,
    val lessonId: UUID?,
    val text: String,
    val embedding: DoubleArray
)

interface EmbeddingClient {
    fun embed(text: String): DoubleArray
}

/** Deterministic bag-of-words fallback embedding, used when no external embedding API key is configured. */
@Service
class LocalHashingEmbeddingClient : EmbeddingClient {
    private val dimensions = 256

    override fun embed(text: String): DoubleArray {
        val vector = DoubleArray(dimensions)
        text.lowercase().split(Regex("\\W+")).filter { it.isNotBlank() }.forEach { token ->
            val bucket = Math.floorMod(token.hashCode(), dimensions)
            vector[bucket] += 1.0
        }
        val norm = sqrt(vector.sumOf { it * it }).takeIf { it > 0 } ?: 1.0
        return DoubleArray(dimensions) { vector[it] / norm }
    }
}

@Service
class RagRetrievalService(private val embeddingClient: EmbeddingClient) {

    // In-memory demo index; swap for a pgvector-backed repository in production.
    private val index = mutableListOf<ContentChunk>()

    fun indexChunk(courseId: UUID, lessonId: UUID?, text: String) {
        index.add(ContentChunk(UUID.randomUUID(), courseId, lessonId, text, embeddingClient.embed(text)))
    }

    fun retrieveRelevant(courseId: UUID, query: String, topK: Int = 4): List<ContentChunk> {
        val queryVec = embeddingClient.embed(query)
        return index.filter { it.courseId == courseId }
            .map { it to cosineSimilarity(it.embedding, queryVec) }
            .sortedByDescending { it.second }
            .take(topK)
            .map { it.first }
    }

    private fun cosineSimilarity(a: DoubleArray, b: DoubleArray): Double {
        var dot = 0.0
        for (i in a.indices) dot += a[i] * b[i]
        return dot // vectors are already L2-normalized
    }
}

@Service
class AiProviderClient(
    @Value("\${nova.ai.provider}") private val provider: String,
    @Value("\${nova.ai.api-key}") private val apiKey: String,
    @Value("\${nova.ai.model}") private val model: String,
    @Value("\${nova.ai.base-url}") private val baseUrl: String
) {
    private val webClient = WebClient.builder().baseUrl(baseUrl).build()

    /**
     * Calls the configured AI provider with a grounded prompt. The API key
     * lives only in backend configuration/secret storage — it is never sent
     * to the web or Android clients.
     */
    fun complete(systemPrompt: String, userMessage: String): String {
        if (apiKey.isBlank()) {
            return "AI provider is not configured yet. Set AI_API_KEY (and AI_PROVIDER/AI_MODEL) to enable live tutoring responses."
        }
        return try {
            when (provider) {
                "anthropic" -> callAnthropic(systemPrompt, userMessage)
                "openai" -> callOpenAi(systemPrompt, userMessage)
                else -> "Local model integration point — wire this to your self-hosted inference server."
            }
        } catch (ex: Exception) {
            "The AI tutor is temporarily unavailable. Please try again shortly."
        }
    }

    private fun callAnthropic(systemPrompt: String, userMessage: String): String {
        val body = mapOf(
            "model" to model,
            "max_tokens" to 1024,
            "system" to systemPrompt,
            "messages" to listOf(mapOf("role" to "user", "content" to userMessage))
        )
        val response = webClient.post()
            .uri("/v1/messages")
            .header("x-api-key", apiKey)
            .header("anthropic-version", "2023-06-01")
            .bodyValue(body)
            .retrieve()
            .bodyToMono(Map::class.java)
            .block()
        val content = (response?.get("content") as? List<*>)?.firstOrNull() as? Map<*, *>
        return content?.get("text") as? String ?: "No response received from the AI provider."
    }

    private fun callOpenAi(systemPrompt: String, userMessage: String): String {
        val body = mapOf(
            "model" to model,
            "messages" to listOf(
                mapOf("role" to "system", "content" to systemPrompt),
                mapOf("role" to "user", "content" to userMessage)
            )
        )
        val response = webClient.post()
            .uri("/v1/chat/completions")
            .header("Authorization", "Bearer $apiKey")
            .bodyValue(body)
            .retrieve()
            .bodyToMono(Map::class.java)
            .block()
        val choice = (response?.get("choices") as? List<*>)?.firstOrNull() as? Map<*, *>
        val message = choice?.get("message") as? Map<*, *>
        return message?.get("content") as? String ?: "No response received from the AI provider."
    }
}

data class AskRequest(val courseId: UUID, val lessonId: UUID?, val message: String)
data class AskResponse(val answer: String)
data class GenerateFlashcardsRequest(val courseId: UUID, val lessonId: UUID)
data class GenerateQuizRequest(val courseId: UUID, val lessonId: UUID, val count: Int = 5)

@Service
class AiTutorService(
    private val ragRetrievalService: RagRetrievalService,
    private val aiProviderClient: AiProviderClient
) {
    fun ask(request: AskRequest): AskResponse {
        val chunks = ragRetrievalService.retrieveRelevant(request.courseId, request.message)
        val context = chunks.joinToString("\n---\n") { it.text }
        val systemPrompt = buildString {
            append("You are NOVA's AI Tutor. Teach step by step, using the Socratic method when helpful. ")
            append("Ground every answer in the course material below; if it isn't covered, say so honestly.\n\n")
            append("COURSE MATERIAL:\n")
            append(context.ifBlank { "(no indexed material yet for this course)" })
        }
        val answer = aiProviderClient.complete(systemPrompt, request.message)
        return AskResponse(answer)
    }

    fun generateFlashcards(request: GenerateFlashcardsRequest): String =
        aiProviderClient.complete(
            "Generate 5 concise flashcards (front/back) from the lesson content as a JSON array.",
            "Lesson ID: ${request.lessonId}"
        )

    fun generateQuiz(request: GenerateQuizRequest): String =
        aiProviderClient.complete(
            "Generate ${request.count} multiple-choice questions with explanations as a JSON array.",
            "Lesson ID: ${request.lessonId}"
        )
}

@RestController
@RequestMapping("/api/v1/ai/tutor")
class AiTutorController(private val aiTutorService: AiTutorService) {

    @PostMapping("/ask")
    fun ask(@RequestBody request: AskRequest) = ApiResponse.ok(aiTutorService.ask(request))

    @PostMapping("/flashcards")
    fun flashcards(@RequestBody request: GenerateFlashcardsRequest) =
        ApiResponse.ok(mapOf("raw" to aiTutorService.generateFlashcards(request)))

    @PostMapping("/quiz")
    fun quiz(@RequestBody request: GenerateQuizRequest) =
        ApiResponse.ok(mapOf("raw" to aiTutorService.generateQuiz(request)))
}
