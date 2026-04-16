package matcher

import (
	"encoding/json"
	"math"
	"sync"
	"time"
	"github.com/nexhire/engine/internal/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SmartMatchEngine struct {
	db     *gorm.DB
	logger *zap.SugaredLogger
	pool   *WorkerPool
}

type WorkerPool struct { workers int; taskCh chan matchTask; resultCh chan models.MatchResult; wg sync.WaitGroup }
type matchTask struct { student models.Student; drive models.Drive; driveSkills map[string]bool; driveBranches map[string]bool }

func NewSmartMatchEngine(db *gorm.DB, logger *zap.SugaredLogger) *SmartMatchEngine {
	pool := &WorkerPool{workers: 8, taskCh: make(chan matchTask, 1000), resultCh: make(chan models.MatchResult, 1000)}
	engine := &SmartMatchEngine{db: db, logger: logger, pool: pool}
	engine.startWorkers()
	return engine
}

func (e *SmartMatchEngine) startWorkers() {
	for i := 0; i < e.pool.workers; i++ {
		go func() { for task := range e.pool.taskCh { e.pool.resultCh <- e.evaluateStudent(task); e.pool.wg.Done() } }()
	}
	e.logger.Infof("✅ Worker pool: %d workers", e.pool.workers)
}

func (e *SmartMatchEngine) MatchStudents(req models.MatchRequest) (*models.MatchResponse, error) {
	start := time.Now()
	var drive models.Drive
	if err := e.db.Where("id = ? AND tenant_id = ?", req.DriveID, req.TenantID).First(&drive).Error; err != nil { return nil, err }
	var branches []string
	json.Unmarshal([]byte(drive.Branches), &branches)
	driveBranches := make(map[string]bool)
	for _, b := range branches { driveBranches[b] = true }
	var students []models.Student
	e.db.Where("tenant_id = ? AND placement_status = ?", req.TenantID, "unplaced").Find(&students)

	resultCh := make(chan models.MatchResult, len(students)+1)
	e.pool.resultCh = resultCh
	e.pool.wg.Add(len(students))
	go func() { for _, s := range students { e.pool.taskCh <- matchTask{student: s, drive: drive, driveSkills: map[string]bool{}, driveBranches: driveBranches} } }()
	e.pool.wg.Wait()
	close(resultCh)

	var results []models.MatchResult
	eligible := 0
	for r := range resultCh { results = append(results, r); if r.Eligible { eligible++ } }
	elapsed := time.Since(start).Milliseconds()
	e.logger.Infof("Match: %d students in %dms (%d eligible)", len(students), elapsed, eligible)
	return &models.MatchResponse{DriveID: req.DriveID, TotalFound: len(results), Eligible: eligible, ProcessedMs: elapsed, Results: results}, nil
}

func (e *SmartMatchEngine) evaluateStudent(task matchTask) models.MatchResult {
	s, d := task.student, task.drive
	eligible, score := true, 0.0
	if s.CGPA < d.MinCGPA { eligible = false }
	score += math.Min(s.CGPA/10.0, 1.0) * 40
	if s.Backlogs > d.MaxBacklogs { eligible = false }
	if s.Backlogs == 0 { score += 20 }
	if !task.driveBranches[s.Branch] { eligible = false } else { score += 20 }
	var skills []string
	json.Unmarshal([]byte(s.Skills), &skills)
	matches := 0
	for _, sk := range skills { if task.driveSkills[sk] { matches++ } }
	if len(task.driveSkills) > 0 { score += float64(matches) / float64(len(task.driveSkills)) * 20 } else { score += 20 }
	return models.MatchResult{StudentID: s.ID, Branch: s.Branch, CGPA: s.CGPA, MatchScore: math.Round(score*100) / 100, SkillMatchCount: matches, Eligible: eligible}
}
