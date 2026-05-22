package models

type Siswa struct {
	ID          uint       `gorm:"primaryKey;column:id_siswa;autoIncrement" json:"id_siswa"`
	NamaSiswa   string     `gorm:"column:nama_siswa;type:varchar(255);not null" json:"nama_siswa" binding:"required"`
	KabupatenID uint       `gorm:"column:id_kota_kabupaten;not null" json:"id_kota_kabupaten" binding:"required"`
	KecamatanID uint       `gorm:"column:id_kecamatan;not null" json:"id_kecamatan" binding:"required"`
	Alamat      string     `gorm:"column:alamat;type:text" json:"alamat"`
	Kabupaten   *Kabupaten `gorm:"foreignKey:KabupatenID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"kabupaten,omitempty"`
	Kecamatan   *Kecamatan `gorm:"foreignKey:KecamatanID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"kecamatan,omitempty"`
}
