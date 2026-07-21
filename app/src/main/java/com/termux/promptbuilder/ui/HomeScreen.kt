package com.termux.promptbuilder.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.termux.promptbuilder.models.Category
import com.termux.promptbuilder.models.Prompt
import com.termux.promptbuilder.viewmodel.PromptViewModel

@Composable
fun HomeScreen(
    viewModel: PromptViewModel,
    onNavigateToCreate: () -> Unit,
    onNavigateToDetail: (Prompt) -> Unit,
    onNavigateToManage: () -> Unit
) {
    val categories by viewModel.categories.collectAsState()
    val prompts by viewModel.prompts.collectAsState(emptyList())
    val favorites by viewModel.favoritePrompts.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    var showSearchBar by remember { mutableStateOf(false) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToCreate,
                containerColor = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(56.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Crear Prompt")
            }
        },
        topBar = {
            TopAppBar(
                title = { Text("Prompt Builder") },
                actions = {
                    IconButton(onClick = { showSearchBar = !showSearchBar }) {
                        Icon(Icons.Default.Search, contentDescription = "Buscar")
                    }
                    IconButton(onClick = onNavigateToManage) {
                        Icon(Icons.Default.Settings, contentDescription = "Configurar")
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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Search bar
            if (showSearchBar) {
                item {
                    SearchBar(
                        query = searchQuery,
                        onQueryChange = { viewModel.setSearchQuery(it) },
                        onClear = { viewModel.setSearchQuery("") }
                    )
                }
            }

            // Categories
            item {
                Text(
                    "Categorías",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(categories) { category ->
                        CategoryChip(
                            category = category,
                            onClick = { viewModel.selectCategory(category) }
                        )
                    }
                }
            }

            // Prompts Section
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Prompts",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    if (favorites.isNotEmpty()) {
                        Badge(
                            containerColor = MaterialTheme.colorScheme.primary
                        ) {
                            Text("❤️ ${favorites.size}")
                        }
                    }
                }
            }

            if (prompts.isEmpty() && searchQuery.isEmpty()) {
                item {
                    EmptyStateCard(
                        icon = Icons.Default.EditNote,
                        title = "No hay prompts",
                        description = "Crea tu primer prompt para comenzar",
                        buttonText = "Crear Prompt",
                        onButtonClick = onNavigateToCreate
                    )
                }
            } else if (prompts.isEmpty()) {
                item {
                    EmptyStateCard(
                        icon = Icons.Default.SearchOff,
                        title = "Sin resultados",
                        description = "No se encontraron prompts con esa búsqueda",
                        buttonText = "Limpiar búsqueda",
                        onButtonClick = { viewModel.setSearchQuery("") }
                    )
                }
            } else {
                items(prompts) { prompt ->
                    PromptCard(
                        prompt = prompt,
                        onClick = { onNavigateToDetail(prompt) },
                        onFavoriteClick = { viewModel.toggleFavorite(prompt.id, prompt.isFavorite) },
                        onDeleteClick = { viewModel.deletePrompt(prompt) }
                    )
                }
            }
        }
    }
}

@Composable
fun SearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onClear: () -> Unit
) {
    OutlinedTextField(
        value = query,
        onValueChange = onQueryChange,
        modifier = Modifier
            .fillMaxWidth()
            .height(48.dp),
        placeholder = { Text("Buscar prompts...") },
        singleLine = true,
        trailingIcon = {
            if (query.isNotEmpty()) {
                IconButton(onClick = onClear) {
                    Icon(Icons.Default.Clear, contentDescription = "Limpiar")
                }
            }
        },
        shape = RoundedCornerShape(12.dp)
    )
}

@Composable
fun CategoryChip(
    category: Category,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.primaryContainer,
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(4.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(category.icon, fontSize = 16.sp)
            Text(category.name, fontSize = 12.sp)
        }
    }
}

@Composable
fun PromptCard(
    prompt: Prompt,
    onClick: () -> Unit,
    onFavoriteClick: () -> Unit,
    onDeleteClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        prompt.title,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        prompt.description,
                        fontSize = 12.sp,
                        maxLines = 2,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onFavoriteClick, modifier = Modifier.size(24.dp)) {
                    Icon(
                        if (prompt.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Favorito",
                        tint = if (prompt.isFavorite) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (prompt.tags.isNotEmpty()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    prompt.tags.split(",").forEach { tag ->
                        Surface(
                            color = MaterialTheme.colorScheme.secondaryContainer,
                            shape = RoundedCornerShape(4.dp),
                            modifier = Modifier.padding(2.dp)
                        ) {
                            Text(
                                tag.trim(),
                                fontSize = 10.sp,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun EmptyStateCard(
    icon: androidx.compose.material.icons.Icons.Filled,
    title: String,
    description: String,
    buttonText: String,
    onButtonClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainer
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                icon,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text(
                description,
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
            Button(onClick = onButtonClick) {
                Text(buttonText)
            }
        }
    }
}
