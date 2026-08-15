package com.uru.domain.entity

data class MessageEntity(
    val id: String,
    val sender: String,
    val content: String,
    val timestamp: Long
)
