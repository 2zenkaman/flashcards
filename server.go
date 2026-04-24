package main

import (
	"flashcards/handlers"
	"flashcards/models"
	"log"
	"net/http"
)

func main() {
	if err := models.InitDB(); err != nil {
		log.Fatalf("failed to connect to database: %v", err.Error())
	}

	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/cards", handlers.HandleCreateCard())
	mux.HandleFunc("GET /api/cards", handlers.HandleGetAllCards())
	mux.HandleFunc("PUT /api/cards", handlers.HandleUpdateCard())
	mux.HandleFunc("DELETE /api/cards/{id}", handlers.HandleDeleteCard())

	http.ListenAndServe(":8080", mux)
}
