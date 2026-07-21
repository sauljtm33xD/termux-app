package com.termux.promptbuilder.data

import com.termux.promptbuilder.models.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine

class PromptRepository(
    private val categoryDao: CategoryDao,
    private val promptClassDao: PromptClassDao,
    private val levelDao: LevelDao,
    private val promptDao: PromptDao
) {
    // Categories
    suspend fun addCategory(category: Category) = categoryDao.insert(category)
    suspend fun deleteCategory(category: Category) = categoryDao.delete(category)
    fun getAllCategories(): Flow<List<Category>> = categoryDao.getAllCategories()

    // Classes
    suspend fun addClass(promptClass: PromptClass) = promptClassDao.insert(promptClass)
    suspend fun deleteClass(promptClass: PromptClass) = promptClassDao.delete(promptClass)
    fun getClassesByCategory(categoryId: Int): Flow<List<PromptClass>> =
        promptClassDao.getClassesByCategory(categoryId)
    fun getAllClasses(): Flow<List<PromptClass>> = promptClassDao.getAllClasses()

    // Levels
    suspend fun addLevel(level: Level) = levelDao.insert(level)
    suspend fun deleteLevel(level: Level) = levelDao.delete(level)
    fun getAllLevels(): Flow<List<Level>> = levelDao.getAllLevels()

    // Prompts
    suspend fun addPrompt(prompt: Prompt) = promptDao.insert(prompt)
    suspend fun updatePrompt(prompt: Prompt) = promptDao.update(prompt)
    suspend fun deletePrompt(prompt: Prompt) = promptDao.delete(prompt)
    fun getAllPrompts(): Flow<List<Prompt>> = promptDao.getAllPrompts()
    fun getPromptsByCategory(categoryId: Int): Flow<List<Prompt>> =
        promptDao.getPromptsByCategory(categoryId)
    fun getPromptsByClass(classId: Int): Flow<List<Prompt>> =
        promptDao.getPromptsByClass(classId)
    fun getPromptsByLevel(levelId: Int): Flow<List<Prompt>> =
        promptDao.getPromptsByLevel(levelId)
    fun getFavoritePrompts(): Flow<List<Prompt>> = promptDao.getFavoritePrompts()
    fun searchPrompts(query: String): Flow<List<Prompt>> = promptDao.searchPrompts(query)
    suspend fun updateFavorite(id: Int, isFavorite: Boolean) =
        promptDao.updateFavorite(id, isFavorite)
}
