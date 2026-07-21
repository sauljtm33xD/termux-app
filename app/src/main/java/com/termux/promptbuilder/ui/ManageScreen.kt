package com.termux.promptbuilder.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.termux.promptbuilder.models.Category
import com.termux.promptbuilder.models.Level
import com.termux.promptbuilder.models.PromptClass
import com.termux.promptbuilder.viewmodel.PromptViewModel

@Composable
fun ManageScreen(
    viewModel: PromptViewModel,
    onNavigateBack: () -> Unit
) {
    val categories by viewModel.categories.collectAsState()
    val classes by viewModel.allClasses.collectAsState()
    val levels by viewModel.levels.collectAsState()

    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Categorías", "Clases", "Niveles")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestionar") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Atrás")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        text = { Text(title) },
                        selected = selectedTab == index,
                        onClick = { selectedTab = index }
                    )
                }
            }

            when (selectedTab) {
                0 -> CategoriesTab(categories, viewModel)
                1 -> ClassesTab(classes, viewModel)
                2 -> LevelsTab(levels, viewModel)
            }
        }
    }
}

@Composable
fun CategoriesTab(
    categories: List<Category>,
    viewModel: PromptViewModel
) {
    var showDialog by remember { mutableStateOf(false) }
    var categoryName by remember { mutableStateOf("") }
    var categoryDescription by remember { mutableStateOf("") }
    var categoryIcon by remember { mutableStateOf("📝") }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Nueva Categoría") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = categoryName,
                        onValueChange = { categoryName = it },
                        label = { Text("Nombre") }
                    )
                    OutlinedTextField(
                        value = categoryDescription,
                        onValueChange = { categoryDescription = it },
                        label = { Text("Descripción") }
                    )
                    OutlinedTextField(
                        value = categoryIcon,
                        onValueChange = { categoryIcon = it },
                        label = { Text("Icono") }
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (categoryName.isNotEmpty()) {
                            viewModel.addCategory(categoryName, categoryDescription, categoryIcon)
                            categoryName = ""
                            categoryDescription = ""
                            categoryIcon = "📝"
                            showDialog = false
                        }
                    }
                ) {
                    Text("Crear")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Button(
                onClick = { showDialog = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Nueva Categoría")
            }
        }

        items(categories) { category ->
            CategoryItem(
                category = category,
                onDelete = { viewModel.deleteCategory(category) }
            )
        }
    }
}

@Composable
fun CategoryItem(
    category: Category,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    "${category.icon} ${category.name}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                if (category.description.isNotEmpty()) {
                    Text(
                        category.description,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            IconButton(onClick = onDelete) {
                Icon(
                    Icons.Default.Delete,
                    contentDescription = "Eliminar",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
fun ClassesTab(
    classes: List<PromptClass>,
    viewModel: PromptViewModel
) {
    val categories by viewModel.categories.collectAsState()
    var showDialog by remember { mutableStateOf(false) }
    var className by remember { mutableStateOf("") }
    var classDescription by remember { mutableStateOf("") }
    var selectedCategoryId by remember { mutableStateOf(categories.firstOrNull()?.id ?: 0) }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Nueva Clase") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    DropdownSelector(
                        label = "Selecciona categoría",
                        options = categories.map { it.id.toString() to it.name },
                        selectedIndex = categories.indexOfFirst { it.id == selectedCategoryId },
                        onSelectIndex = { index ->
                            if (index >= 0) selectedCategoryId = categories[index].id
                        }
                    )
                    OutlinedTextField(
                        value = className,
                        onValueChange = { className = it },
                        label = { Text("Nombre") }
                    )
                    OutlinedTextField(
                        value = classDescription,
                        onValueChange = { classDescription = it },
                        label = { Text("Descripción") }
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (className.isNotEmpty()) {
                            viewModel.addClass(selectedCategoryId, className, classDescription)
                            className = ""
                            classDescription = ""
                            showDialog = false
                        }
                    }
                ) {
                    Text("Crear")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Button(
                onClick = { showDialog = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Nueva Clase")
            }
        }

        items(classes) { promptClass ->
            val category = categories.find { it.id == promptClass.categoryId }
            ClassItem(
                promptClass = promptClass,
                category = category,
                onDelete = { viewModel.deleteClass(promptClass) }
            )
        }
    }
}

@Composable
fun ClassItem(
    promptClass: PromptClass,
    category: Category?,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    promptClass.name,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "Categoría: ${category?.name ?: "Desconocida"}",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (promptClass.description.isNotEmpty()) {
                    Text(
                        promptClass.description,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            IconButton(onClick = onDelete) {
                Icon(
                    Icons.Default.Delete,
                    contentDescription = "Eliminar",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
fun LevelsTab(
    levels: List<Level>,
    viewModel: PromptViewModel
) {
    var showDialog by remember { mutableStateOf(false) }
    var levelName by remember { mutableStateOf("") }
    var levelDescription by remember { mutableStateOf("") }
    var levelDifficulty by remember { mutableStateOf(1) }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Nuevo Nivel") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = levelName,
                        onValueChange = { levelName = it },
                        label = { Text("Nombre") }
                    )
                    OutlinedTextField(
                        value = levelDescription,
                        onValueChange = { levelDescription = it },
                        label = { Text("Descripción") }
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Dificultad:")
                        Slider(
                            value = levelDifficulty.toFloat(),
                            onValueChange = { levelDifficulty = it.toInt() },
                            valueRange = 1f..4f,
                            steps = 2,
                            modifier = Modifier.weight(1f)
                        )
                        Text(levelDifficulty.toString())
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (levelName.isNotEmpty()) {
                            viewModel.addLevel(levelName, levelDescription, levelDifficulty)
                            levelName = ""
                            levelDescription = ""
                            levelDifficulty = 1
                            showDialog = false
                        }
                    }
                ) {
                    Text("Crear")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Button(
                onClick = { showDialog = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Nuevo Nivel")
            }
        }

        items(levels) { level ->
            LevelItem(
                level = level,
                onDelete = { viewModel.deleteLevel(level) }
            )
        }
    }
}

@Composable
fun LevelItem(
    level: Level,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    level.name,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "Dificultad: ${"⭐".repeat(level.difficulty)}",
                    fontSize = 12.sp
                )
                if (level.description.isNotEmpty()) {
                    Text(
                        level.description,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            IconButton(onClick = onDelete) {
                Icon(
                    Icons.Default.Delete,
                    contentDescription = "Eliminar",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}
