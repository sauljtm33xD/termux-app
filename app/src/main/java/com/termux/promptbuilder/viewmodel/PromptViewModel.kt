package com.termux.promptbuilder.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.termux.promptbuilder.data.PromptDatabase
import com.termux.promptbuilder.data.PromptRepository
import com.termux.promptbuilder.models.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class PromptViewModel(
    private val repository: PromptRepository
) : ViewModel() {

    // State flows
    private val _selectedCategory = MutableStateFlow<Category?>(null)
    val selectedCategory: StateFlow<Category?> = _selectedCategory.asStateFlow()

    private val _selectedClass = MutableStateFlow<PromptClass?>(null)
    val selectedClass: StateFlow<PromptClass?> = _selectedClass.asStateFlow()

    private val _selectedLevel = MutableStateFlow<Level?>(null)
    val selectedLevel: StateFlow<Level?> = _selectedLevel.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    // Data flows
    val categories = repository.getAllCategories().stateIn(
        viewModelScope,
        SharingStarted.Lazily,
        emptyList()
    )

    val levels = repository.getAllLevels().stateIn(
        viewModelScope,
        SharingStarted.Lazily,
        emptyList()
    )

    val allClasses = repository.getAllClasses().stateIn(
        viewModelScope,
        SharingStarted.Lazily,
        emptyList()
    )

    val classesByCategory: Flow<List<PromptClass>> = _selectedCategory
        .filterNotNull()
        .flatMapLatest { repository.getClassesByCategory(it.id) }

    val prompts: Flow<List<Prompt>> = combine(
        _selectedCategory,
        _selectedClass,
        _selectedLevel,
        _searchQuery
    ) { category, promptClass, level, search ->
        when {
            search.isNotEmpty() -> repository.searchPrompts(search)
            category != null && promptClass != null && level != null ->
                repository.getPromptsByClass(promptClass.id)
                    .combine(repository.getPromptsByLevel(level.id)) { classPrompts, levelPrompts ->
                        classPrompts.intersect(levelPrompts.toSet())
                    }
            category != null -> repository.getPromptsByCategory(category.id)
            promptClass != null -> repository.getPromptsByClass(promptClass.id)
            level != null -> repository.getPromptsByLevel(level.id)
            else -> repository.getAllPrompts()
        }
    }.flatMapLatest { it }

    val favoritePrompts = repository.getFavoritePrompts().stateIn(
        viewModelScope,
        SharingStarted.Lazily,
        emptyList()
    )

    // Actions
    fun selectCategory(category: Category?) {
        _selectedCategory.value = category
        _selectedClass.value = null
        _selectedLevel.value = null
    }

    fun selectClass(promptClass: PromptClass?) {
        _selectedClass.value = promptClass
    }

    fun selectLevel(level: Level?) {
        _selectedLevel.value = level
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun addCategory(name: String, description: String = "", icon: String = "📝") {
        viewModelScope.launch {
            repository.addCategory(Category(name = name, description = description, icon = icon))
        }
    }

    fun deleteCategory(category: Category) {
        viewModelScope.launch {
            repository.deleteCategory(category)
        }
    }

    fun addClass(categoryId: Int, name: String, description: String = "") {
        viewModelScope.launch {
            repository.addClass(PromptClass(categoryId = categoryId, name = name, description = description))
        }
    }

    fun deleteClass(promptClass: PromptClass) {
        viewModelScope.launch {
            repository.deleteClass(promptClass)
        }
    }

    fun addLevel(name: String, description: String = "", difficulty: Int = 1) {
        viewModelScope.launch {
            repository.addLevel(Level(name = name, description = description, difficulty = difficulty))
        }
    }

    fun deleteLevel(level: Level) {
        viewModelScope.launch {
            repository.deleteLevel(level)
        }
    }

    fun addPrompt(
        categoryId: Int,
        classId: Int,
        levelId: Int,
        title: String,
        description: String,
        content: String,
        tags: String = ""
    ) {
        viewModelScope.launch {
            repository.addPrompt(
                Prompt(
                    categoryId = categoryId,
                    classId = classId,
                    levelId = levelId,
                    title = title,
                    description = description,
                    content = content,
                    tags = tags
                )
            )
        }
    }

    fun updatePrompt(prompt: Prompt) {
        viewModelScope.launch {
            repository.updatePrompt(prompt.copy(updatedAt = System.currentTimeMillis()))
        }
    }

    fun deletePrompt(prompt: Prompt) {
        viewModelScope.launch {
            repository.deletePrompt(prompt)
        }
    }

    fun toggleFavorite(promptId: Int, currentValue: Boolean) {
        viewModelScope.launch {
            repository.updateFavorite(promptId, !currentValue)
        }
    }
}

class PromptViewModelFactory(
    private val application: Application
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(PromptViewModel::class.java)) {
            val database = PromptDatabase.getDatabase(application)
            val repository = PromptRepository(
                database.categoryDao(),
                database.promptClassDao(),
                database.levelDao(),
                database.promptDao()
            )
            @Suppress("UNCHECKED_CAST")
            return PromptViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
