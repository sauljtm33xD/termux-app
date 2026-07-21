# Prompt Builder - Herramienta de Creación de Prompts Personalizable

Una aplicación Android moderna para crear, gestionar y organizar prompts en múltiples categorías, clases y niveles de dificultad.

## Características

### 🎯 Gestión de Prompts
- **Crear prompts** con título, descripción, contenido y tags
- **Editar prompts** existentes
- **Eliminar prompts** de la base de datos
- **Marcar favoritos** para rápido acceso
- **Copiar contenido** al portapapeles

### 📁 Organización Estructurada
- **Categorías personalizables** (Creativo, Técnico, Educativo, Negocios, Análisis, Marketing)
- **Clases** dentro de cada categoría
- **Niveles de dificultad** (Principiante, Intermedio, Avanzado, Experto)
- **Tags** para clasificación adicional

### 🔍 Búsqueda y Filtros
- Búsqueda por título, descripción o tags
- Filtrar por categoría
- Filtrar por clase
- Filtrar por nivel de dificultad
- Visualizar prompts favoritos

### 🎨 Interfaz Moderna
- Diseño con Jetpack Compose y Material 3
- Temas claros y oscuros automáticos
- Interfaz intuitiva y responsive
- Navegación fluida entre pantallas

### 💾 Almacenamiento Local
- Base de datos SQLite con Room
- Todas las categorías, clases y prompts guardados localmente
- Sin conexión a internet requerida

## Estructura de la Aplicación

```
com.termux.promptbuilder/
├── MainActivity.kt              # Punto de entrada y navegación
├── models/
│   └── PromptModels.kt         # Entidades de datos
├── data/
│   ├── PromptDao.kt            # Data Access Objects
│   ├── PromptDatabase.kt        # Room Database
│   └── PromptRepository.kt      # Acceso a datos
├── viewmodel/
│   └── PromptViewModel.kt       # Lógica de presentación
└── ui/
    ├── theme/
    │   ├── Theme.kt             # Tema Material 3
    │   ├── Color.kt             # Paleta de colores
    │   └── Type.kt              # Tipografía
    ├── HomeScreen.kt            # Pantalla principal
    ├── CreatePromptScreen.kt     # Crear/editar prompts
    ├── DetailScreen.kt          # Ver detalles
    └── ManageScreen.kt          # Gestionar categorías, clases y niveles
```

## Flujo de Datos

```
MainActivity (Navegación)
    ↓
PromptViewModel (Lógica)
    ↓
PromptRepository (Acceso a datos)
    ↓
PromptDatabase (Room + DAOs)
    ↓
SQLite (Almacenamiento)
```

## Pantallas

### Home Screen
- Vista principal con lista de prompts
- Fichas de categorías para filtrar
- Búsqueda en tiempo real
- Acceso rápido a favoritos

### Create/Edit Screen
- Formulario para crear nuevos prompts
- Selección de categoría, clase y nivel
- Editor de contenido multi-línea
- Validación de campos obligatorios

### Detail Screen
- Vista completa del prompt
- Copiar contenido al portapapeles
- Marcar/desmarcar como favorito
- Editar o eliminar prompt
- Información de fechas de creación y modificación

### Manage Screen
- Pestañas para gestionar categorías, clases y niveles
- Crear nuevos elementos
- Eliminar elementos existentes
- Asociar clases a categorías

## Modelos de Datos

### Category
- id: Int (PK)
- name: String
- description: String
- icon: String (emoji)

### PromptClass
- id: Int (PK)
- categoryId: Int (FK)
- name: String
- description: String

### Level
- id: Int (PK)
- name: String
- description: String
- difficulty: Int (1-4)

### Prompt
- id: Int (PK)
- categoryId: Int (FK)
- classId: Int (FK)
- levelId: Int (FK)
- title: String
- description: String
- content: String
- tags: String (CSV)
- createdAt: Long
- updatedAt: Long
- isFavorite: Boolean

## Dependencias

- **Jetpack Compose UI Framework**
- **Material Design 3**
- **Room Database**
- **Lifecycle & ViewModel**
- **Coroutines**

## Uso

1. **Crear categoría**: Ir a Gestionar → Categorías → Nueva Categoría
2. **Crear clase**: Ir a Gestionar → Clases → Nueva Clase (seleccionar categoría)
3. **Crear nivel**: Ir a Gestionar → Niveles → Nuevo Nivel
4. **Crear prompt**: Presionar FAB (+) en la pantalla principal
5. **Buscar**: Presionar el ícono de búsqueda y escribir
6. **Filtrar**: Seleccionar una categoría desde las fichas

## Datos por Defecto

La aplicación incluye datos iniciales:

**Categorías:**
- 🎨 Creativo
- ⚙️ Técnico
- 📚 Educativo
- 💼 Negocios
- 📊 Análisis
- 📢 Marketing

**Niveles:**
- Principiante (⭐)
- Intermedio (⭐⭐)
- Avanzado (⭐⭐⭐)
- Experto (⭐⭐⭐⭐)

## Arquitectura

La aplicación sigue el patrón MVVM (Model-View-ViewModel):

- **Model**: Entidades de datos (Category, Prompt, Level, etc.)
- **View**: Composables de Jetpack Compose
- **ViewModel**: Gestiona la lógica y el estado de la UI

El flujo es unidireccional:
- Las vistas observan cambios en el ViewModel
- Las acciones de usuario se envían al ViewModel
- El ViewModel actualiza el estado reactivamente

## Próximas Mejoras

- Exportar prompts a archivos (JSON, CSV)
- Importar prompts desde archivos
- Sincronización en la nube
- Compartir prompts entre dispositivos
- Historial de cambios
- Estadísticas de uso
