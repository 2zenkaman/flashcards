package main

import (
	"flashcards/handlers"
	"flashcards/models"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := models.InitDB(); err != nil {
		log.Fatalf("failed to connect to database: %v", err.Error())
	}

	engine := gin.Default()

	engine.StaticFile("/", "./static/index.html")
	engine.Static("/static", "./static")

	engine.Handle("POST", "/api/cards", handlers.HandleCreateCard())
	engine.Handle("GET", "/api/cards", handlers.HandleGetAllCards())
	engine.Handle("PUT", "/api/cards/:id", handlers.HandleUpdateCard())
	engine.Handle("DELETE", "/api/cards/:id", handlers.HandleDeleteCard())

	engine.Run(":8080")
}
