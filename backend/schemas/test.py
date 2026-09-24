from typing import Optional, List, Dict
from pydantic import BaseModel

class QuestionOptionSchema(BaseModel):
    id: str
    text: str
    isCorrect: Optional[bool] = None

    class Config:
        from_attributes = True

class QuestionSchema(BaseModel):
    id: str
    text: str
    options: List[QuestionOptionSchema]
    topic: str = "General"
    difficulty: str = "Medium"
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class AntiCheatRules(BaseModel):
    randomizeQuestions: bool = True
    randomizeOptions: bool = True
    tabDetection: bool = True
    fullscreenLock: bool = True

class TestCreate(BaseModel):
    title: str
    skill_name: str
    difficulty: str = "Medium"
    time_limit: int = 30
    attempts: int = 2
    randomize_questions: bool = True
    randomize_options: bool = True
    tab_detection: bool = True
    fullscreen_lock: bool = True
    assigned_to: str = "batch"
    target_batch: Optional[str] = "Batch A"
    target_year: Optional[int] = None
    target_students: Optional[List[str]] = []
    due_date: str = ""

class TestResponse(BaseModel):
    id: str
    title: str
    skillName: str
    difficulty: str
    questions: List[QuestionSchema] = []
    timeLimit: int
    attempts: int
    antiCheat: AntiCheatRules
    assignedTo: str
    targetBatch: Optional[str] = None
    targetYear: Optional[int] = None
    targetStudents: Optional[List[str]] = []
    dueDate: str
    createdBy: str
    createdAt: str = ""

    class Config:
        from_attributes = True

class TestSubmitRequest(BaseModel):
    answers: Dict[str, str]  # questionId -> optionId
    timeTaken: int = 0  # in seconds
    tabSwitches: int = 0

class TopicScore(BaseModel):
    topic: str
    correct: int
    total: int
    percentage: float

class QuestionResult(BaseModel):
    questionId: str
    questionText: str
    selectedOptionId: Optional[str] = None
    correctOptionId: str
    isCorrect: bool
    skipped: bool

class TestResultResponse(BaseModel):
    testId: str
    testTitle: str
    skillName: str
    score: int
    total: int
    percentage: float
    correct: int
    wrong: int
    skipped: int
    timeTaken: int
    tabSwitches: int
    passed: bool
    badgeEarned: Optional[str] = None
    topicBreakdown: List[TopicScore] = []
    questionResults: List[QuestionResult] = []
    completedAt: str = ""

class TestAttemptResponse(BaseModel):
    id: str
    testId: str
    studentId: str
    studentName: str
    rollNumber: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None
    testTitle: str
    skillName: str
    score: int
    total: int
    percentage: float
    timeTaken: int
    tabSwitches: int
    passed: bool
    badgeEarned: Optional[str] = None
    completedAt: str = ""

    class Config:
        from_attributes = True

