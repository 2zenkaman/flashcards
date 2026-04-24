package main

import (
	"flashcards/handlers"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/cards", handlers.HandleCreateCard())
	mux.HandleFunc("GET /api/cards", handlers.HandleGetAllCards())
	mux.HandleFunc("PUT /api/cards", handlers.HandleUpdateCard())
	mux.HandleFunc("DELETE /api/cards", handlers.HandleDeleteCard())

	http.ListenAndServe(":8080", mux)
}
