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

	engine.Handle("POST", "/api/cards/:deckid", handlers.HandleCreateCard())
	engine.Handle("GET", "/api/cards/:deckid", handlers.HandleGetAllCards())
	engine.Handle("PUT", "/api/cards/:deckid/:id", handlers.HandleUpdateCard())
	engine.Handle("DELETE", "/api/cards/:deckid/:id", handlers.HandleDeleteCard())

	engine.Handle("POST", "/api/decks", handlers.HandleCreateDeck())
	engine.Handle("GET", "/api/decks", handlers.HandleGetAllDecks())
	engine.Handle("DELETE", "/api/decks/:id", handlers.HandleDeleteDeck())

	engine.Run(":8080")
}
