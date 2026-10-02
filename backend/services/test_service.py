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
        if not data.title or not data.title.strip():
            raise HTTPException(status_code=400, detail="Test title cannot be empty")
        if not data.skill_name or not data.skill_name.strip():
            raise HTTPException(status_code=400, detail="Target skill name is required")
        if data.time_limit < 1 or data.time_limit > 300:
            raise HTTPException(status_code=400, detail="Time limit must be between 1 and 300 minutes")

        test_obj = Test(
            title=data.title.strip(),
            skill_name=data.skill_name.strip(),
            difficulty=data.difficulty or "Intermediate",
            time_limit=data.time_limit,
            attempts=data.attempts or 1,
            randomize_questions=data.randomize_questions,
            randomize_options=data.randomize_options,
            tab_detection=data.tab_detection,
            fullscreen_lock=data.fullscreen_lock,
            assigned_to=data.assigned_to or "batch",
            target_batch=data.target_batch or "Batch A",
            target_year=data.target_year or 4,
            due_date=data.due_date,
            created_by=created_by_name
        )
        test_obj.target_students = data.target_students or []
        db.add(test_obj)
        await db.commit()
        await db.refresh(test_obj)

        # Generate skill-specific questions using AIService (respects requested question_count, prompt & syllabus context)
        from services.ai_service import AIService
        req_count = data.question_count if data.question_count and data.question_count >= 5 else 20
        ai_generated = await AIService.generate_mcq_questions(
            skill=data.skill_name,
            difficulty=data.difficulty or "Medium",
            count=req_count
        )

        # Fallback expansion if AI returned fewer items than requested
        questions_pool = ai_generated
        if len(questions_pool) < req_count:
            # Replicate/variate pool to match target question_count exactly
            base_count = len(questions_pool)
            for i in range(len(questions_pool), req_count):
                base_q = questions_pool[i % base_count]
                variant_text = f"[{data.skill_name} Q{i+1}] {base_q['text']}"
                questions_pool.append({
                    "text": variant_text,
                    "topic": base_q.get("topic", "Technical Core"),
                    "difficulty": data.difficulty,
                    "explanation": base_q.get("explanation", f"Core concept in {data.skill_name}."),
                    "options": base_q.get("options", [
                        {"text": "Option A", "isCorrect": False},
                        {"text": "Option B (Correct)", "isCorrect": True},
                        {"text": "Option C", "isCorrect": False},
                        {"text": "Option D", "isCorrect": False},
                    ])
                })

        for qd in questions_pool[:req_count]:
            q_text = qd.get("text") or qd.get("question") or f"What is a core principle of {data.skill_name}?"
            q_topic = qd.get("topic") or "Technical Core"
            q_explanation = qd.get("explanation") or f"Core concept in {data.skill_name} architecture."
            
            q = Question(
                test_id=test_obj.id,
                text=q_text,
                topic=q_topic,
                difficulty=data.difficulty,
                explanation=q_explanation
            )
            db.add(q)
            await db.flush()

            raw_opts = qd.get("options", [])
            for opt in raw_opts:
                if isinstance(opt, dict):
                    opt_text = opt.get("text", "Option")
                    is_corr = bool(opt.get("isCorrect") or opt.get("is_correct"))
                else:
                    opt_text = str(opt)
                    is_corr = False
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
            time_taken=max(0, data.timeTaken or 0),
            tab_switches=max(0, data.tabSwitches or 0),
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

    @staticmethod
    async def delete_test(test_id: str, db: AsyncSession):
        from sqlalchemy import delete
        from models.test import QuestionOption, Question, TestAttempt, Test
        result = await db.execute(select(Test).filter(Test.id == test_id))
        t = result.scalars().first()
        if not t:
            raise HTTPException(status_code=404, detail="Test not found")

        q_ids_res = await db.execute(select(Question.id).filter(Question.test_id == test_id))
        q_ids = q_ids_res.scalars().all()
        if q_ids:
            await db.execute(delete(QuestionOption).filter(QuestionOption.question_id.in_(q_ids)))
            await db.execute(delete(Question).filter(Question.test_id == test_id))
        
        await db.execute(delete(TestAttempt).filter(TestAttempt.test_id == test_id))
        await db.execute(delete(Test).filter(Test.id == test_id))
        await db.commit()
        return {"status": "success", "message": "Test deleted successfully"}


