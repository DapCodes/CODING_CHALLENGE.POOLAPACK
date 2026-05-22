package controllers

import (
	"net/http"

	"backendsiswa/config"
	"backendsiswa/models"

	"github.com/gin-gonic/gin"
)

func GetKecamatans(c *gin.Context) {
	var kecamatans []models.Kecamatan
	if err := config.DB.Preload("Kabupaten").Find(&kecamatans).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, kecamatans)
}

func GetKecamatanByID(c *gin.Context) {
	id := c.Param("id")
	var kecamatan models.Kecamatan

	if err := config.DB.Preload("Kabupaten").First(&kecamatan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kecamatan not found"})
		return
	}

	c.JSON(http.StatusOK, kecamatan)
}

func CreateKecamatan(c *gin.Context) {
	var input models.Kecamatan
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate if Kabupaten exists
	var kabupaten models.Kabupaten
	if err := config.DB.First(&kabupaten, input.KabupatenID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id_kota_kabupaten. Kabupaten does not exist."})
		return
	}

	kecamatan := models.Kecamatan{
		Nama:        input.Nama,
		KabupatenID: input.KabupatenID,
	}

	if err := config.DB.Create(&kecamatan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Fetch with preloaded Kabupaten details for response
	config.DB.Preload("Kabupaten").First(&kecamatan, kecamatan.ID)
	c.JSON(http.StatusCreated, kecamatan)
}

func UpdateKecamatan(c *gin.Context) {
	id := c.Param("id")
	var kecamatan models.Kecamatan

	if err := config.DB.First(&kecamatan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kecamatan not found"})
		return
	}

	var input models.Kecamatan
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// If updating Kabupaten ID, validate it exists
	if input.KabupatenID != 0 && input.KabupatenID != kecamatan.KabupatenID {
		var kabupaten models.Kabupaten
		if err := config.DB.First(&kabupaten, input.KabupatenID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id_kota_kabupaten. Kabupaten does not exist."})
			return
		}
	}

	if err := config.DB.Model(&kecamatan).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Fetch updated data with preloaded Kabupaten details
	config.DB.Preload("Kabupaten").First(&kecamatan, kecamatan.ID)
	c.JSON(http.StatusOK, kecamatan)
}

func DeleteKecamatan(c *gin.Context) {
	id := c.Param("id")
	var kecamatan models.Kecamatan

	if err := config.DB.First(&kecamatan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kecamatan not found"})
		return
	}

	// Restrict delete if there are referencing Siswas
	var count int64
	config.DB.Model(&models.Siswa{}).Where("id_kecamatan = ?", id).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete Kecamatan because it is referenced by one or more Siswas"})
		return
	}

	if err := config.DB.Delete(&kecamatan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kecamatan deleted successfully"})
}
