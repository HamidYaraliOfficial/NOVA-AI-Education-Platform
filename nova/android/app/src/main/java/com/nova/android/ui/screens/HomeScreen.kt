package com.nova.android.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.nova.android.ui.theme.NovaThemeVariant

data class CourseSummary(val title: String, val progress: Float, val lessonsLeft: Int)

private val sampleCourses = listOf(
    CourseSummary("Python for Data Analysis", 0.62f, 18),
    CourseSummary("Algorithms & Data Structures", 0.24f, 46),
    CourseSummary("Applied Machine Learning", 0.05f, 52)
)

@Composable
fun HomeScreen(currentTheme: NovaThemeVariant, onThemeChange: (NovaThemeVariant) -> Unit) {
    var menuOpen by remember { mutableStateOf(false) }

    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth()) {
                Text(
                    "Welcome back",
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.weight(1f)
                )
                TextButton(onClick = { menuOpen = true }) { Text("Theme") }
                DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                    NovaThemeVariant.entries.forEach { variant ->
                        DropdownMenuItem(
                            text = { Text(variant.name) },
                            onClick = { onThemeChange(variant); menuOpen = false }
                        )
                    }
                }
            }

            Text("My Learning", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 16.dp, bottom = 8.dp))

            LazyColumn {
                items(sampleCourses) { course ->
                    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(course.title, style = MaterialTheme.typography.titleLarge)
                            androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 8.dp))
                            LinearProgressIndicator(progress = { course.progress }, modifier = Modifier.fillMaxWidth())
                            androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 4.dp))
                            Text("${course.lessonsLeft} lessons left", style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}
