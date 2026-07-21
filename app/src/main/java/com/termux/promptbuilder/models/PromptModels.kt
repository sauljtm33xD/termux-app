package com.termux.promptbuilder.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey

@Entity(tableName = "categories")
data class Category(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val name: String,
    val description: String = "",
    val icon: String = "📝"
)

@Entity(tableName = "classes")
data class PromptClass(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val categoryId: Int,
    val name: String,
    val description: String = ""
)

@Entity(tableName = "levels")
data class Level(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val name: String,
    val description: String = "",
    val difficulty: Int = 1 // 1 = Beginner, 2 = Intermediate, 3 = Advanced, 4 = Expert
)

@Entity(
    tableName = "prompts",
    foreignKeys = [
        ForeignKey(
            entity = Category::class,
            parentColumns = ["id"],
            childColumns = ["categoryId"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = PromptClass::class,
            parentColumns = ["id"],
            childColumns = ["classId"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = Level::class,
            parentColumns = ["id"],
            childColumns = ["levelId"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class Prompt(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val categoryId: Int,
    val classId: Int,
    val levelId: Int,
    val title: String,
    val description: String,
    val content: String,
    val tags: String = "", // comma-separated
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val isFavorite: Boolean = false
)

data class PromptWithDetails(
    val prompt: Prompt,
    val category: Category,
    val promptClass: PromptClass,
    val level: Level
)
