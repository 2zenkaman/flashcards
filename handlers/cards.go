package handlers

import (
	"flashcards/models"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func HandleCreateCard() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		deckID, err := strconv.Atoi(ctx.Param("deckid"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to parse deck id: %v", err)})
			return
		}

		var req struct {
			Question string `json:"question"`
			Answer   string `json:"answer"`
		}

		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid body request: %v", err)})
			return
		}

		card := models.Card{
			DeckID:   deckID,
			Question: req.Question,
			Answer:   req.Answer,
		}

		if err := card.Create(); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create card: %v", err)})
			return
		}

		ctx.JSON(http.StatusCreated, card)
	}
}

func HandleGetAllCards() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		deckID, err := strconv.Atoi(ctx.Param("deckid"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to parse deck id: %v", err)})
			return
		}

		cards, err := models.GetAllCards(deckID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get cards: %v", err)})
			return
		}

		ctx.JSON(http.StatusOK, cards)
	}
}

func HandleUpdateCard() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		deckID, err := strconv.Atoi(ctx.Param("deckid"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to parse deck id: %v", err)})
			return
		}

		id, err := strconv.Atoi(ctx.Param("id"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to parse id: %v", err)})
			return
		}

		card, err := models.UpdateCard(id, deckID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update card: %v", err)})
			return
		}

		ctx.JSON(http.StatusOK, card)
	}
}

func HandleDeleteCard() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		deckID, err := strconv.Atoi(ctx.Param("deckid"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to parse deck id: %v", err)})
			return
		}

		id, err := strconv.Atoi(ctx.Param("id"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to parse id: %v", err)})
			return
		}

		if err := models.DeleteCard(id, deckID); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete card: %v", err)})
			return
		}

		ctx.Status(http.StatusNoContent)
	}
}
