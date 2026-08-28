package com.nova.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableJpaAuditing
class JpaConfig

@Configuration
@EnableAsync
class AsyncConfig {
    /**
     * Dedicated pool for background jobs (video processing, AI indexing,
     * certificate generation, notification dispatch) so long-running work
     * never blocks request-handling threads.
     */
    @Bean(name = ["backgroundJobExecutor"])
    fun backgroundJobExecutor(): ThreadPoolTaskExecutor = ThreadPoolTaskExecutor().apply {
        corePoolSize = 4
        maxPoolSize = 16
        queueCapacity = 500
        setThreadNamePrefix("nova-job-")
        initialize()
    }
}

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS()
    }

    override fun configureMessageBroker(registry: MessageBrokerRegistry) {
        // Topics: /topic/course/{id}/progress, /topic/user/{id}/notifications, /topic/exam/{id}/live
        registry.enableSimpleBroker("/topic")
        registry.setApplicationDestinationPrefixes("/app")
    }
}

@Configuration
class OpenApiConfig {
    @Bean
    fun novaOpenApi(): OpenAPI = OpenAPI()
        .info(
            Info().title("NOVA API").version("v1")
                .description("REST API for the NOVA AI-native education platform: courses, quizzes, exams, AI tutor, flashcards, gamification and analytics.")
        )
        .addSecurityItem(SecurityRequirement().addList("bearerAuth"))
        .components(
            io.swagger.v3.oas.models.Components()
                .addSecuritySchemes(
                    "bearerAuth",
                    SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")
                )
        )
}
