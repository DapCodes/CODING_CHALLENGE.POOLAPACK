package main

import (
	"log"
	"os"

	"backendsiswa/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"
	"fmt"
)

func main() {
	godotenv.Load()

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" { dbUser = "root" }
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" { dbHost = "127.0.0.1" }
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" { dbPort = "3306" }
	dbName := os.Getenv("DB_NAME")
	if dbName == "" { dbName = "poolapack_db" }

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}

	log.Println("Connected. Running auto-migrate...")
	db.AutoMigrate(&models.Kabupaten{}, &models.Kecamatan{}, &models.Siswa{}, &models.User{})

	// ─── Seed Users ───────────────────────────────────────────────────────────
	log.Println("Seeding users...")
	hashed, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	db.FirstOrCreate(&models.User{}, models.User{Username: "admin"}).Update("password", string(hashed))
	db.Where("username = ?", "admin").FirstOrCreate(&models.User{Username: "admin", Password: string(hashed)})

	// ─── Seed Kabupaten ───────────────────────────────────────────────────────
	log.Println("Seeding kabupaten...")
	kabupatens := []models.Kabupaten{
		{Nama: "Kota Bandung"},
		{Nama: "Kota Cimahi"},
		{Nama: "Kab. Bandung Barat"},
	}
	for i := range kabupatens {
		var existing models.Kabupaten
		result := db.Where("nama = ?", kabupatens[i].Nama).First(&existing)
		if result.Error != nil {
			db.Create(&kabupatens[i])
		} else {
			kabupatens[i] = existing
		}
	}

	// helper
	getKabID := func(nama string) uint {
		for _, k := range kabupatens {
			if k.Nama == nama { return k.ID }
		}
		return 0
	}

	// ─── Seed Kecamatan ───────────────────────────────────────────────────────
	log.Println("Seeding kecamatan...")
	kecamatanData := []struct {
		Nama        string
		KabupatenNama string
	}{
		{"Bandung Timur", "Kota Bandung"},
		{"Cimahi Utara",  "Kota Cimahi"},
		{"Padalarang",    "Kab. Bandung Barat"},
		{"Cimahi Tengah", "Kota Cimahi"},
		{"Antapani",      "Kota Bandung"},
		{"Lembang",       "Kab. Bandung Barat"},
		{"Cimahi Selatan","Kota Cimahi"},
		{"Batujajar",     "Kab. Bandung Barat"},
	}

	kecamatans := make(map[string]models.Kecamatan)
	for _, kd := range kecamatanData {
		kabID := getKabID(kd.KabupatenNama)
		var existing models.Kecamatan
		result := db.Where("nama = ? AND id_kota_kabupaten = ?", kd.Nama, kabID).First(&existing)
		if result.Error != nil {
			kec := models.Kecamatan{Nama: kd.Nama, KabupatenID: kabID}
			db.Create(&kec)
			kecamatans[kd.Nama] = kec
		} else {
			kecamatans[kd.Nama] = existing
		}
	}

	// ─── Seed Siswa ───────────────────────────────────────────────────────────
	log.Println("Seeding siswa...")
	siswaData := []struct {
		Nama          string
		KabupatenNama string
		KecamatanNama string
		Alamat        string
	}{
		{"Agus",    "Kota Bandung",       "Bandung Timur", "Jl. Alamat Siswa No. 1"},
		{"Budi",    "Kota Cimahi",        "Cimahi Utara",  "Jl. Alamat Siswa No. 2"},
		{"Nana",    "Kab. Bandung Barat", "Padalarang",    "Jl. Alamat Siswa No. 3"},
		{"Bambang", "Kab. Bandung Barat", "Padalarang",    "Jl. Alamat Siswa No. 4"},
		{"Fitri",   "Kota Cimahi",        "Cimahi Tengah", "Jl. Alamat Siswa No. 5"},
		{"Bagus",   "Kota Bandung",       "Antapani",      "Jl. Alamat Siswa No. 6"},
		{"Hartoko", "Kota Bandung",       "Antapani",      "Jl. Alamat Siswa No. 7"},
		{"Dadan",   "Kab. Bandung Barat", "Lembang",       "Jl. Alamat Siswa No. 8"},
		{"Ceceng",  "Kota Cimahi",        "Cimahi Selatan","Jl. Alamat Siswa No. 9"},
		{"Ilham",   "Kota Bandung",       "Bandung Timur", "Jl. Alamat Siswa No. 10"},
		{"Iqbal",   "Kab. Bandung Barat", "Batujajar",     "Jl. Alamat Siswa No. 11"},
		{"Adi",     "Kota Cimahi",        "Cimahi Tengah", "Jl. Alamat Siswa No. 12"},
	}

	for _, sd := range siswaData {
		kabID := getKabID(sd.KabupatenNama)
		kec := kecamatans[sd.KecamatanNama]
		var existing models.Siswa
		result := db.Where("nama_siswa = ?", sd.Nama).First(&existing)
		if result.Error != nil {
			siswa := models.Siswa{
				NamaSiswa:   sd.Nama,
				KabupatenID: kabID,
				KecamatanID: kec.ID,
				Alamat:      sd.Alamat,
			}
			db.Create(&siswa)
			log.Printf("  Created siswa: %s", sd.Nama)
		} else {
			log.Printf("  Skipped (exists): %s", sd.Nama)
		}
	}

	log.Println("✅ Seeding complete!")
}
