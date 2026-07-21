package com.termux.promptbuilder.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.termux.promptbuilder.models.Prompt
import com.termux.promptbuilder.models.PromptClass
import com.termux.promptbuilder.models.Level
import com.termux.promptbuilder.viewmodel.PromptViewModel

@Composable
fun CreatePromptScreen(
    viewModel: PromptViewModel,
    prompt: Prompt? = null,
    onNavigateBack: () -> Unit
) {
    val categories by viewModel.categories.collectAsState()
    val classes by viewModel.classesByCategory.collectAsState(emptyList())
    val levels by viewModel.levels.collectAsState()

    var selectedCategory by remember { mutableStateOf(prompt?.categoryId ?: categories.firstOrNull()?.id ?: 0) }
    var selectedClass by remember { mutableStateOf(prompt?.classId ?: 0) }
    var selectedLevel by remember { mutableStateOf(prompt?.levelId ?: 0) }
    var title by remember { mutableStateOf(prompt?.title ?: "") }
    var description by remember { mutableStateOf(prompt?.description ?: "") }
    var content by remember { mutableStateOf(prompt?.content ?: "") }
    var tags by remember { mutableStateOf(prompt?.tags ?: "") }

    val isFormValid = selectedCategory > 0 && selectedClass > 0 && selectedLevel > 0 &&
            title.isNotEmpty() && description.isNotEmpty() && content.isNotEmpty()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (prompt != null) "Editar Prompt" else "Crear Prompt") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Atrás")
                    }
                },
                actions = {
                    IconButton(
                        onClick = {
                            if (isFormValid) {
                                if (prompt != null) {
                                    viewModel.updatePrompt(
                                        prompt.copy(
                                            categoryId = selectedCategory,
                                            classId = selectedClass,
                                            levelId = selectedLevel,
                                            title = title,
                                            description = description,
                                            content = content,
                                            tags = tags
                                        )
                                    )
                                } else {
                                    viewModel.addPrompt(
                                        categoryId = selectedCategory,
                                        classId = selectedClass,
                                        levelId = selectedLevel,
                                        title = title,
                                        description = description,
                                        content = content,
                                        tags = tags
                                    )
                                }
                                onNavigateBack()
                            }
                        },
                        enabled = isFormValid
                    ) {
                        Icon(Icons.Default.Check, contentDescription = "Guardar")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    "Categoría",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
                DropdownSelector(
                    label = "Selecciona categoría",
                    options = categories.map { it.id.toString() to it.name },
                    selectedIndex = categories.indexOfFirst { it.id == selectedCategory },
                    onSelectIndex = { index ->
                        if (index >= 0) selectedCategory = categories[index].id
                    }
                )
            }

            item {
                Text(
                    "Clase",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
                DropdownSelector(
                    label = "Selecciona clase",
                    options = classes.map { it.id.toString() to it.name },
                    selectedIndex = classes.indexOfFirst { it.id == selectedClass },
                    onSelectIndex = { index ->
                        if (index >= 0) selectedClass = classes[index].id
                    },
                    enabled = classes.isNotEmpty()
                )
            }

            item {
                Text(
                    "Nivel",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
                DropdownSelector(
                    label = "Selecciona nivel",
                    options = levels.map { it.id.toString() to it.name },
                    selectedIndex = levels.indexOfFirst { it.id == selectedLevel },
                    onSelectIndex = { index ->
                        if (index >= 0) selectedLevel = levels[index].id
                    }
                )
            }

            item {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Título") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )
            }

            item {
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Descripción") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    shape = RoundedCornerShape(8.dp)
                )
            }

            item {
                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("Contenido del Prompt") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 150.dp),
                    minLines = 8,
                    shape = RoundedCornerShape(8.dp)
                )
            }

            item {
                OutlinedTextField(
                    value = tags,
                    onValueChange = { tags = it },
                    label = { Text("Tags (separadas por comas)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )
            }

            if (prompt != null) {
                item {
                    Button(
                        onClick = {
                            viewModel.deletePrompt(prompt)
                            onNavigateBack()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer
                        )
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Eliminar Prompt")
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(16.dp)) }
        }
    }
}

@Composable
fun DropdownSelector(
    label: String,
    options: List<Pair<String, String>>,
    selectedIndex: Int,
    onSelectIndex: (Int) -> Unit,
    enabled: Boolean = true
) {
    var expanded by remember { mutableStateOf(false) }
    val selectedLabel = if (selectedIndex >= 0 && selectedIndex < options.size) {
        options[selectedIndex].second
    } else {
        label
    }

    Box(modifier = Modifier.fillMaxWidth()) {
        OutlinedButton(
            onClick = { expanded = true },
            modifier = Modifier.fillMaxWidth(),
            enabled = enabled,
            shape = RoundedCornerShape(8.dp)
        ) {
            Text(selectedLabel, modifier = Modifier.weight(1f))
            Icon(Icons.Default.KeyboardArrowDown, contentDescription = null)
        }

        DropdownMenu(
            expanded = expanded && enabled,
            onDismissRequest = { expanded = false },
            modifier = Modifier.fillMaxWidth(0.9f)
        ) {
            options.forEachIndexed { index, (_, name) ->
                DropdownMenuItem(
                    text = { Text(name) },
                    onClick = {
                        onSelectIndex(index)
                        expanded = false
                    }
                )
            }
        }
    }
}

@Composable
fun KeyboardArrowDown() {
    Icon(
        imageVector = Icons.Default.MoreVert,
        contentDescription = null
    )
}
