package models

import "time"

type Student struct {
	ID              string    `gorm:"primaryKey;column:id" json:"id"`
	TenantID        string    `gorm:"column:tenant_id" json:"tenantId"`
	UserID          string    `gorm:"column:user_id" json:"userId"`
	Branch          string    `gorm:"column:branch" json:"branch"`
	Year            int       `gorm:"column:year" json:"year"`
	CGPA            float64   `gorm:"column:cgpa" json:"cgpa"`
	Backlogs        int       `gorm:"column:backlogs" json:"backlogs"`
	Skills          string    `gorm:"column:skills;type:json" json:"skills"`
	PlacementStatus string    `gorm:"column:placement_status" json:"placementStatus"`
	ProfileCompletion int     `gorm:"column:profile_completion" json:"profileCompletion"`
	CreatedAt       time.Time `gorm:"column:created_at" json:"createdAt"`
}
func (Student) TableName() string { return "students" }

type Drive struct {
	ID          string    `gorm:"primaryKey;column:id" json:"id"`
	TenantID    string    `gorm:"column:tenant_id" json:"tenantId"`
	CompanyID   string    `gorm:"column:company_id" json:"companyId"`
	Title       string    `gorm:"column:title" json:"title"`
	Branches    string    `gorm:"column:branches;type:json" json:"branches"`
	MinCGPA     float64   `gorm:"column:min_cgpa" json:"minCgpa"`
	MaxBacklogs int       `gorm:"column:max_backlogs" json:"maxBacklogs"`
	PackageLPA  float64   `gorm:"column:package_lpa" json:"packageLpa"`
	Status      string    `gorm:"column:status" json:"status"`
	StartDate   time.Time `gorm:"column:start_date" json:"startDate"`
	EndDate     time.Time `gorm:"column:end_date" json:"endDate"`
}
func (Drive) TableName() string { return "drives" }

type MatchRequest struct { TenantID string `json:"tenantId"`; DriveID string `json:"driveId"` }
type MatchResult struct { StudentID string `json:"studentId"`; Name string `json:"name"`; Branch string `json:"branch"`; CGPA float64 `json:"cgpa"`; MatchScore float64 `json:"matchScore"`; SkillMatchCount int `json:"skillMatchCount"`; Eligible bool `json:"eligible"` }
type MatchResponse struct { DriveID string `json:"driveId"`; TotalFound int `json:"totalFound"`; Eligible int `json:"eligible"`; ProcessedMs int64 `json:"processedMs"`; Results []MatchResult `json:"results"` }
type ReportRequest struct { TenantID string `json:"tenantId"`; DriveID string `json:"driveId"`; Type string `json:"type"` }
type ReportResponse struct { URL string `json:"url"`; Filename string `json:"filename"`; SizeBytes int64 `json:"sizeBytes"` }
