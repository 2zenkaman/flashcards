package handlers

import (
	"flashcards/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func HandleCreateDeck() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req struct {
			Name string `json:"name"`
		}

		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body request:" + err.Error()})
			return
		}

		deck := models.Deck{Name: req.Name}
		if err := deck.Create(); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create deck: " + err.Error()})
			return
		}

		ctx.JSON(http.StatusCreated, deck)
	}
}

func HandleGetAllDecks() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		decks, err := models.GetAllDecks()
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get decks: " + err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, decks)
	}
}

func HandleDeleteDeck() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, err := strconv.Atoi(ctx.Param("id"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse deck id: " + err.Error()})
			return
		}

		if err := models.DeleteDeck(id); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete deck: " + err.Error()})
			return
		}

		ctx.Status(http.StatusNoContent)
	}
}
