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

	mux.Handle("GET /", http.FileServer(http.Dir("./static")))

	mux.Handle("POST /api/cards", handlers.HandleCreateCard())
	mux.Handle("GET /api/cards", handlers.HandleGetAllCards())
	mux.Handle("PUT /api/cards", handlers.HandleUpdateCard())
	mux.Handle("DELETE /api/cards/{id}", handlers.HandleDeleteCard())

	http.ListenAndServe(":8080", mux)
}
