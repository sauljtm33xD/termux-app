package com.termux.promptbuilder.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.termux.promptbuilder.models.*

@Database(
    entities = [
        Category::class,
        PromptClass::class,
        Level::class,
        Prompt::class
    ],
    version = 1,
    exportSchema = false
)
abstract class PromptDatabase : RoomDatabase() {
    abstract fun categoryDao(): CategoryDao
    abstract fun promptClassDao(): PromptClassDao
    abstract fun levelDao(): LevelDao
    abstract fun promptDao(): PromptDao

    companion object {
        @Volatile
        private var instance: PromptDatabase? = null

        fun getDatabase(context: Context): PromptDatabase {
            return instance ?: synchronized(this) {
                val db = Room.databaseBuilder(
                    context.applicationContext,
                    PromptDatabase::class.java,
                    "prompt_database"
                ).addCallback(DatabaseCallback())
                    .build()
                instance = db
                db
            }
        }
    }

    private class DatabaseCallback : RoomDatabase.Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            db.beginTransaction()
            try {
                insertDefaultData(db)
                db.setTransactionSuccessful()
            } finally {
                db.endTransaction()
            }
        }

        private fun insertDefaultData(db: SupportSQLiteDatabase) {
            val levels = listOf(
                "INSERT INTO levels (name, description, difficulty) VALUES ('Principiante', 'Prompts básicos y simples', 1)",
                "INSERT INTO levels (name, description, difficulty) VALUES ('Intermedio', 'Prompts moderadamente complejos', 2)",
                "INSERT INTO levels (name, description, difficulty) VALUES ('Avanzado', 'Prompts sofisticados y detallados', 3)",
                "INSERT INTO levels (name, description, difficulty) VALUES ('Experto', 'Prompts muy complejos y especializados', 4)"
            )
            levels.forEach { db.execSQL(it) }

            val categories = listOf(
                "INSERT INTO categories (name, description, icon) VALUES ('Creativo', 'Para contenido creativo y artístico', '🎨')",
                "INSERT INTO categories (name, description, icon) VALUES ('Técnico', 'Para desarrollo y programación', '⚙️')",
                "INSERT INTO categories (name, description, icon) VALUES ('Educativo', 'Para enseñanza y aprendizaje', '📚')",
                "INSERT INTO categories (name, description, icon) VALUES ('Negocios', 'Para contextos empresariales', '💼')",
                "INSERT INTO categories (name, description, icon) VALUES ('Análisis', 'Para análisis y datos', '📊')",
                "INSERT INTO categories (name, description, icon) VALUES ('Marketing', 'Para marketing y publicidad', '📢')"
            )
            categories.forEach { db.execSQL(it) }
        }
    }
}
