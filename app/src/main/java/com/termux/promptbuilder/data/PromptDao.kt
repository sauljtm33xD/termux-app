package com.termux.promptbuilder.data

import androidx.room.*
import com.termux.promptbuilder.models.*
import kotlinx.coroutines.flow.Flow

@Dao
interface CategoryDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(category: Category): Long

    @Delete
    suspend fun delete(category: Category)

    @Query("SELECT * FROM categories ORDER BY name ASC")
    fun getAllCategories(): Flow<List<Category>>

    @Query("SELECT * FROM categories WHERE id = :id")
    fun getCategoryById(id: Int): Flow<Category>
}

@Dao
interface PromptClassDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(promptClass: PromptClass): Long

    @Delete
    suspend fun delete(promptClass: PromptClass)

    @Query("SELECT * FROM classes WHERE categoryId = :categoryId ORDER BY name ASC")
    fun getClassesByCategory(categoryId: Int): Flow<List<PromptClass>>

    @Query("SELECT * FROM classes WHERE id = :id")
    fun getClassById(id: Int): Flow<PromptClass>

    @Query("SELECT * FROM classes ORDER BY name ASC")
    fun getAllClasses(): Flow<List<PromptClass>>
}

@Dao
interface LevelDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(level: Level): Long

    @Delete
    suspend fun delete(level: Level)

    @Query("SELECT * FROM levels ORDER BY difficulty ASC")
    fun getAllLevels(): Flow<List<Level>>

    @Query("SELECT * FROM levels WHERE id = :id")
    fun getLevelById(id: Int): Flow<Level>
}

@Dao
interface PromptDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(prompt: Prompt): Long

    @Update
    suspend fun update(prompt: Prompt)

    @Delete
    suspend fun delete(prompt: Prompt)

    @Query("SELECT * FROM prompts ORDER BY createdAt DESC")
    fun getAllPrompts(): Flow<List<Prompt>>

    @Query("SELECT * FROM prompts WHERE categoryId = :categoryId ORDER BY createdAt DESC")
    fun getPromptsByCategory(categoryId: Int): Flow<List<Prompt>>

    @Query("SELECT * FROM prompts WHERE classId = :classId ORDER BY createdAt DESC")
    fun getPromptsByClass(classId: Int): Flow<List<Prompt>>

    @Query("SELECT * FROM prompts WHERE levelId = :levelId ORDER BY createdAt DESC")
    fun getPromptsByLevel(levelId: Int): Flow<List<Prompt>>

    @Query("SELECT * FROM prompts WHERE isFavorite = 1 ORDER BY createdAt DESC")
    fun getFavoritePrompts(): Flow<List<Prompt>>

    @Query("SELECT * FROM prompts WHERE id = :id")
    fun getPromptById(id: Int): Flow<Prompt>

    @Query("""
        SELECT * FROM prompts
        WHERE title LIKE '%' || :query || '%'
           OR description LIKE '%' || :query || '%'
           OR tags LIKE '%' || :query || '%'
        ORDER BY createdAt DESC
    """)
    fun searchPrompts(query: String): Flow<List<Prompt>>

    @Query("UPDATE prompts SET isFavorite = :isFavorite WHERE id = :id")
    suspend fun updateFavorite(id: Int, isFavorite: Boolean)
}
