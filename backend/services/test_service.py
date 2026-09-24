import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.test import Test, Question, QuestionOption, TestAttempt
from models.skill import StudentSkill
from models.user import User
from schemas.test import (
    TestCreate,
    TestResponse,
    QuestionSchema,
    QuestionOptionSchema,
    AntiCheatRules,
    TestSubmitRequest,
    TestResultResponse,
    TestAttemptResponse,
    TopicScore,
    QuestionResult
)

class TestService:
    @staticmethod
    async def create_test(data: TestCreate, created_by_name: str, db: AsyncSession) -> TestResponse:
        test_obj = Test(
            title=data.title,
            skill_name=data.skill_name,
            difficulty=data.difficulty,
            time_limit=data.time_limit,
            attempts=data.attempts,
            randomize_questions=data.randomize_questions,
            randomize_options=data.randomize_options,
            tab_detection=data.tab_detection,
            fullscreen_lock=data.fullscreen_lock,
            assigned_to=data.assigned_to,
            target_batch=data.target_batch,
            target_year=data.target_year,
            due_date=data.due_date,
            created_by=created_by_name
        )
        test_obj.target_students = data.target_students or []
        db.add(test_obj)
        await db.commit()
        await db.refresh(test_obj)

        # Generate skill-specific questions
        questions_data = [
            {
                "text": f"What is the recommended design pattern for managing asynchronous operations in {data.skill_name}?",
                "topic": "Architecture & Async",
                "opts": [
                    ("Direct synchronous blocking calls", False),
                    ("Async/Await with non-blocking error handling", True),
                    ("Continuous busy-wait loops", False),
                    ("Global immutable lock mechanism", False),
                ]
            },
            {
                "text": f"How are state mutations properly scoped and propagated in {data.skill_name} applications?",
                "topic": "State Management",
                "opts": [
                    ("Unidirectional data flow with pure reducers/handlers", True),
                    ("Direct memory pointer mutation across threads", False),
                    ("Shared global mutable singleton objects without synchronizers", False),
                    ("Hardcoded static class variables", False),
                ]
            },
            {
                "text": f"Which optimization technique prevents unnecessary performance bottlenecks in {data.skill_name}?",
                "topic": "Performance & Optimization",
                "opts": [
                    ("Memoization and efficient data indexing", True),
                    ("Disabling error boundary handlers", False),
                    ("Allocating unbounded buffer memory", False),
                    ("Polling APIs every 50 milliseconds", False),
                ]
            },
            {
                "text": f"What is the primary security requirement when handling client inputs in {data.skill_name} services?",
                "topic": "Security & Validation",
                "opts": [
                    ("Strict input sanitization and schema validation", True),
                    ("Trusting raw unvalidated payload parameters", False),
                    ("Storing cleartext credentials in local state", False),
                    ("Bypassing CORS headers for cross-origin requests", False),
                ]
            }
        ]

        for qd in questions_data:
            q = Question(
                test_id=test_obj.id,
                text=qd["text"],
                topic=qd["topic"],
                difficulty=data.difficulty,
                explanation=f"Core principle of {data.skill_name} production architectures."
            )
            db.add(q)
            await db.flush()
            for opt_text, is_corr in qd["opts"]:
                db.add(QuestionOption(question_id=q.id, text=opt_text, is_correct=is_corr))

        await db.commit()
        return await TestService.get_test_by_id(test_obj.id, db, include_answers=True)

    @staticmethod
    async def get_test_by_id(test_id: str, db: AsyncSession, include_answers: bool = False) -> TestResponse:
        result = await db.execute(
            select(Test)
            .filter(Test.id == test_id)
            .options(
                selectinload(Test.questions).selectinload(Question.options)
            )
        )
        t = result.scalars().first()
        if not t:
            raise HTTPException(status_code=404, detail="Test not found")

        questions_list = []
        for q in t.questions:
            opts = [
                QuestionOptionSchema(
                    id=opt.id,
                    text=opt.text,
                    isCorrect=opt.is_correct if include_answers else None
                ) for opt in q.options
            ]
            questions_list.append(QuestionSchema(
                id=q.id,
                text=q.text,
                options=opts,
                topic=q.topic,
                difficulty=q.difficulty,
                explanation=q.explanation if include_answers else None
            ))

        return TestResponse(
            id=t.id,
            title=t.title,
            skillName=t.skill_name,
            difficulty=t.difficulty,
            questions=questions_list,
            timeLimit=t.time_limit,
            attempts=t.attempts,
            antiCheat=AntiCheatRules(
                randomizeQuestions=t.randomize_questions,
                randomizeOptions=t.randomize_options,
                tabDetection=t.tab_detection,
                fullscreenLock=t.fullscreen_lock
            ),
            assignedTo=t.assigned_to,
            targetBatch=t.target_batch,
            targetYear=t.target_year,
            targetStudents=t.target_students,
            dueDate=t.due_date,
            createdBy=t.created_by,
            createdAt=t.created_at.strftime("%Y-%m-%d") if t.created_at else ""
        )


    @staticmethod
    async def list_tests(db: AsyncSession) -> List[TestResponse]:
        result = await db.execute(
            select(Test).options(selectinload(Test.questions).selectinload(Question.options))
        )
        tests = result.scalars().all()
        responses = []
        for t in tests:
            questions_list = []
            for q in t.questions:
                opts = [
                    QuestionOptionSchema(id=opt.id, text=opt.text, isCorrect=opt.is_correct)
                    for opt in q.options
                ]
                questions_list.append(QuestionSchema(
                    id=q.id, text=q.text, options=opts, topic=q.topic, difficulty=q.difficulty, explanation=q.explanation
                ))

            responses.append(TestResponse(
                id=t.id,
                title=t.title,
                skillName=t.skill_name,
                difficulty=t.difficulty,
                questions=questions_list,
                timeLimit=t.time_limit,
                attempts=t.attempts,
                antiCheat=AntiCheatRules(
                    randomizeQuestions=t.randomize_questions,
                    randomizeOptions=t.randomize_options,
                    tabDetection=t.tab_detection,
                    fullscreenLock=t.fullscreen_lock
                ),
                assignedTo=t.assigned_to,
                targetBatch=t.target_batch,
                targetYear=t.target_year,
                targetStudents=t.target_students,
                dueDate=t.due_date,
                createdBy=t.created_by,
                createdAt=t.created_at.strftime("%Y-%m-%d") if t.created_at else ""
            ))
        return responses

    @staticmethod
    async def submit_test(
        test_id: str,
        student: User,
        data: TestSubmitRequest,
        db: AsyncSession
    ) -> TestResultResponse:
        result = await db.execute(
            select(Test)
            .filter(Test.id == test_id)
            .options(selectinload(Test.questions).selectinload(Question.options))
        )
        test_obj = result.scalars().first()
        if not test_obj:
            raise HTTPException(status_code=404, detail="Test not found")

        total = len(test_obj.questions)
        correct_count = 0
        wrong_count = 0
        skipped_count = 0
        question_results: List[QuestionResult] = []
        topic_stats: Dict[str, Dict[str, int]] = {}

        for q in test_obj.questions:
            topic = q.topic or "General"
            if topic not in topic_stats:
                topic_stats[topic] = {"correct": 0, "total": 0}
            topic_stats[topic]["total"] += 1

            correct_opt = next((opt for opt in q.options if opt.is_correct), None)
            correct_opt_id = correct_opt.id if correct_opt else ""
            selected_opt_id = data.answers.get(q.id)

            if not selected_opt_id:
                skipped_count += 1
                question_results.append(QuestionResult(
                    questionId=q.id,
                    questionText=q.text,
                    selectedOptionId=None,
                    correctOptionId=correct_opt_id,
                    isCorrect=False,
                    skipped=True
                ))
            elif selected_opt_id == correct_opt_id:
                correct_count += 1
                topic_stats[topic]["correct"] += 1
                question_results.append(QuestionResult(
                    questionId=q.id,
                    questionText=q.text,
                    selectedOptionId=selected_opt_id,
                    correctOptionId=correct_opt_id,
                    isCorrect=True,
                    skipped=False
                ))
            else:
                wrong_count += 1
                question_results.append(QuestionResult(
                    questionId=q.id,
                    questionText=q.text,
                    selectedOptionId=selected_opt_id,
                    correctOptionId=correct_opt_id,
                    isCorrect=False,
                    skipped=False
                ))

        percentage = round((correct_count / total * 100) if total > 0 else 0, 1)
        passed = percentage >= 70.0

        topic_breakdown = [
            TopicScore(
                topic=t,
                correct=vals["correct"],
                total=vals["total"],
                percentage=round(vals["correct"] / vals["total"] * 100, 1) if vals["total"] > 0 else 0
            ) for t, vals in topic_stats.items()
        ]

        badge_earned = f"{test_obj.skill_name} Verified" if passed else None
        completed_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        # Save Attempt Record
        attempt = TestAttempt(
            test_id=test_id,
            student_id=student.id,
            test_title=test_obj.title,
            skill_name=test_obj.skill_name,
            score=correct_count,
            total=total,
            percentage=percentage,
            correct=correct_count,
            wrong=wrong_count,
            skipped=skipped_count,
            time_taken=data.timeTaken,
            tab_switches=data.tabSwitches,
            passed=passed,
            badge_earned=badge_earned,
            answers_json=json.dumps(data.answers),
            topic_breakdown_json=json.dumps([tb.model_dump() for tb in topic_breakdown]),
            question_results_json=json.dumps([qr.model_dump() for qr in question_results]),
            completed_at=completed_at
        )
        db.add(attempt)

        # Update student's skill badge & trust score if passed
        if passed:
            sk_res = await db.execute(
                select(StudentSkill)
                .filter(StudentSkill.student_id == student.id)
                .filter(StudentSkill.name.ilike(test_obj.skill_name))
            )
            existing_skill = sk_res.scalars().first()
            if existing_skill:
                existing_skill.status = "verified"
                existing_skill.score = int(percentage)
                existing_skill.last_tested = completed_at
            else:
                new_skill = StudentSkill(
                    student_id=student.id,
                    name=test_obj.skill_name,
                    status="verified",
                    score=int(percentage),
                    last_tested=completed_at
                )
                db.add(new_skill)

            # Boost trust score slightly for verified badge
            student.trust_score = min(99, student.trust_score + 3)

        await db.commit()

        return TestResultResponse(
            testId=test_id,
            testTitle=test_obj.title,
            skillName=test_obj.skill_name,
            score=correct_count,
            total=total,
            percentage=percentage,
            correct=correct_count,
            wrong=wrong_count,
            skipped=skipped_count,
            timeTaken=data.timeTaken,
            tabSwitches=data.tabSwitches,
            passed=passed,
            badgeEarned=badge_earned,
            topicBreakdown=topic_breakdown,
            questionResults=question_results,
            completedAt=completed_at
        )

    @staticmethod
    async def get_all_attempts(db: AsyncSession, test_id: Optional[str] = None) -> List[TestAttemptResponse]:
        query = select(TestAttempt).options(selectinload(TestAttempt.student))
        if test_id:
            query = query.filter(TestAttempt.test_id == test_id)
        
        result = await db.execute(query.order_by(TestAttempt.created_at.desc()))
        attempts = result.scalars().all()
        
        responses = []
        for att in attempts:
            student_name = att.student.name if att.student else "Student"
            roll_number = att.student.roll_number if att.student else "N/A"
            department = att.student.department if att.student else "CS"
            batch = att.student.batch if att.student else "Batch A"
            
            responses.append(TestAttemptResponse(
                id=att.id,
                testId=att.test_id,
                studentId=att.student_id,
                studentName=student_name,
                rollNumber=roll_number,
                department=department,
                batch=batch,
                testTitle=att.test_title or "Proctored Skill Test",
                skillName=att.skill_name or "General",
                score=att.score,
                total=att.total,
                percentage=att.percentage,
                timeTaken=att.time_taken,
                tabSwitches=att.tab_switches,
                passed=att.passed,
                badgeEarned=att.badge_earned,
                completedAt=att.completed_at or att.created_at.strftime("%Y-%m-%d %H:%M") if att.created_at else ""
            ))
        return responses

    @staticmethod
    async def get_student_attempts(student_id: str, db: AsyncSession) -> List[TestResultResponse]:
        result = await db.execute(
            select(TestAttempt)
            .filter(TestAttempt.student_id == student_id)
            .order_by(TestAttempt.created_at.desc())
        )
        attempts = result.scalars().all()
        responses = []
        for att in attempts:
            tb = []
            qr = []
            try:
                if att.topic_breakdown_json:
                    tb_data = json.loads(att.topic_breakdown_json)
                    tb = [TopicScore(**item) for item in tb_data]
            except Exception:
                pass

            try:
                if att.question_results_json:
                    qr_data = json.loads(att.question_results_json)
                    qr = [QuestionResult(**item) for item in qr_data]
            except Exception:
                pass

            responses.append(TestResultResponse(
                testId=att.test_id,
                testTitle=att.test_title or "Assessment",
                skillName=att.skill_name or "General",
                score=att.score,
                total=att.total,
                percentage=att.percentage,
                correct=att.correct,
                wrong=att.wrong,
                skipped=att.skipped,
                timeTaken=att.time_taken,
                tabSwitches=att.tab_switches,
                passed=att.passed,
                badgeEarned=att.badge_earned,
                topicBreakdown=tb,
                questionResults=qr,
                completedAt=att.completed_at or (att.created_at.strftime("%Y-%m-%d %H:%M") if att.created_at else "")
            ))
        return responses

