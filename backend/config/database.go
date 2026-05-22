package config

import (
	"fmt"
	"log"
	"os"

	"backendsiswa/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: No .env file found or error loading it. Using environment variables.")
	}

	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	if dbUser == "" {
		dbUser = "root"
	}
	if dbHost == "" {
		dbHost = "127.0.0.1"
	}
	if dbPort == "" {
		dbPort = "3306"
	}
	if dbName == "" {
		dbName = "poolapack_db"
	}

	dsnWithoutDb := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPassword, dbHost, dbPort)
	tempDb, err := gorm.Open(mysql.Open(dsnWithoutDb), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to MySQL server: %v", err)
	}

	createDbQuery := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;", dbName)
	if err := tempDb.Exec(createDbQuery).Error; err != nil {
		log.Fatalf("Failed to create database %s: %v", dbName, err)
	}

	sqlDB, _ := tempDb.DB()
	sqlDB.Close()

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPassword, dbHost, dbPort, dbName)
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database %s: %v", dbName, err)
	}

	log.Printf("Successfully connected to MySQL database: %s", dbName)

	err = database.AutoMigrate(&models.Kabupaten{}, &models.Kecamatan{}, &models.Siswa{})
	if err != nil {
		log.Fatalf("Failed to run database auto-migrations: %v", err)
	}
	log.Println("Database migration completed successfully.")

	DB = database
}
