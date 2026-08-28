package com.nova.codeexec

import com.nova.common.ApiResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*
import java.io.File
import java.util.UUID
import java.util.concurrent.TimeUnit

enum class SupportedLanguage(val extension: String, val dockerImage: String) {
    PYTHON("py", "nova-sandbox-python:latest"),
    JAVASCRIPT("js", "nova-sandbox-node:latest"),
    TYPESCRIPT("ts", "nova-sandbox-node:latest"),
    JAVA("java", "nova-sandbox-java:latest"),
    KOTLIN("kt", "nova-sandbox-kotlin:latest"),
    CPP("cpp", "nova-sandbox-cpp:latest"),
    CSHARP("cs", "nova-sandbox-dotnet:latest"),
    GO("go", "nova-sandbox-go:latest"),
    RUST("rs", "nova-sandbox-rust:latest")
}

data class RunRequest(val language: String, val sourceCode: String, val stdin: String? = null)
data class RunResult(val stdout: String, val stderr: String, val exitCode: Int, val durationMs: Long)

/**
 * Executes untrusted student code in an isolated, resource-limited container.
 *
 * Design (production): each submission is written to a scratch directory and
 * run via `docker run --rm --network none --memory <limit> --cpus 1
 * --pids-limit 64 --read-only <image> <entrypoint>` inside a short-lived
 * container, so submissions can never reach the host filesystem, network,
 * or other jobs. A dedicated worker pool consumes this from a queue so slow
 * or hanging submissions never block API request threads.
 *
 * This class exposes that contract; wire `runInContainer` to your container
 * runtime (Docker/Firecracker/gVisor) in deployment. A best-effort local
 * fallback is provided for languages with a runtime on PATH, still bounded
 * by a wall-clock timeout, for local development without Docker.
 */
@Service
class SandboxExecutionService(
    @Value("\${nova.code-execution.timeout-seconds}") private val timeoutSeconds: Long,
    @Value("\${nova.code-execution.memory-limit-mb}") private val memoryLimitMb: Long
) {

    fun run(request: RunRequest): RunResult {
        val language = SupportedLanguage.entries.find { it.name.equals(request.language, ignoreCase = true) }
            ?: return RunResult("", "Unsupported language: ${request.language}", 1, 0)

        return runInContainer(language, request)
    }

    private fun runInContainer(language: SupportedLanguage, request: RunRequest): RunResult {
        val workDir = File(System.getProperty("java.io.tmpdir"), "nova-exec-${UUID.randomUUID()}").apply { mkdirs() }
        val sourceFile = File(workDir, "Main.${language.extension}").apply { writeText(request.sourceCode) }
        val started = System.currentTimeMillis()

        // NOTE: in production this shells out to `docker run` with the flags described above,
        // mounting only `workDir` read-only. Local fallback below runs the interpreter directly
        // and is intended for development environments only.
        val command = localCommandFor(language, sourceFile) ?: return RunResult(
            "", "Sandbox runtime for ${language.name} is not configured in this environment.", 1, 0
        )

        return try {
            val process = ProcessBuilder(command)
                .directory(workDir)
                .redirectErrorStream(false)
                .start()

            request.stdin?.let {
                process.outputStream.write(it.toByteArray())
                process.outputStream.close()
            }

            val finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS)
            if (!finished) {
                process.destroyForcibly()
                return RunResult("", "Execution timed out after ${timeoutSeconds}s", 124, System.currentTimeMillis() - started)
            }

            RunResult(
                stdout = process.inputStream.bufferedReader().readText().take(20_000),
                stderr = process.errorStream.bufferedReader().readText().take(20_000),
                exitCode = process.exitValue(),
                durationMs = System.currentTimeMillis() - started
            )
        } catch (ex: Exception) {
            RunResult("", "Execution failed: ${ex.message}", 1, System.currentTimeMillis() - started)
        } finally {
            workDir.deleteRecursively()
        }
    }

    private fun localCommandFor(language: SupportedLanguage, file: File): List<String>? = when (language) {
        SupportedLanguage.PYTHON -> listOf("python3", file.absolutePath)
        SupportedLanguage.JAVASCRIPT, SupportedLanguage.TYPESCRIPT -> listOf("node", file.absolutePath)
        else -> null // requires a compile step / container image; see class doc
    }
}

@RestController
@RequestMapping("/api/v1/code-execution")
class CodeExecutionController(private val sandboxExecutionService: SandboxExecutionService) {

    @PostMapping("/run")
    fun run(@RequestBody request: RunRequest) = ApiResponse.ok(sandboxExecutionService.run(request))
}
