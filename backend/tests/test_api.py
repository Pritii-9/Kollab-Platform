def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "database" in data

def test_auth_login(client):
    response = client.post("/api/auth/login", json={
        "email": "aanya@college.edu",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "aanya@college.edu"

def test_list_students(client):
    response = client.get("/api/students")
    assert response.status_code == 200
    students = response.json()
    assert len(students) > 0
    assert any(s["name"] == "Aanya Sharma" for s in students)

def test_list_batches(client):
    response = client.get("/api/batches")
    assert response.status_code == 200
    batches = response.json()
    assert len(batches) > 0

def test_list_projects(client):
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) > 0
    assert any(p["title"] == "EduPortal" for p in projects)

def test_ai_enhance_bullet(client):
    response = client.post("/api/ai/enhance-bullet", json={
        "rawBullet": "Built user auth using JWT tokens and cookies",
        "targetRole": "Full Stack Developer"
    })
    assert response.status_code == 200
    data = response.json()
    assert "bullets" in data
    assert len(data["bullets"]) == 3

def test_ai_skill_gap(client):
    response = client.post("/api/ai/skill-gap", json={
        "skills": ["React", "Node.js", "TypeScript"],
        "targetRole": "Full Stack Developer"
    })
    assert response.status_code == 200
    data = response.json()
    assert "readinessScore" in data
    assert "missingSkills" in data
