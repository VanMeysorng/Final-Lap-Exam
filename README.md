# Student Management System – Microservices (Node.js, MongoDB, Docker, Kubernetes/Minikube)

- **api-gateway** (port 3000) – single entry point; forwards `/api/registration/*` and `/api/search/*`
- **registration-service** (port 3001) – register, update, list students
- **search-service** (port 3002) – search student by ID or name

Pod 1: api-gateway + registration-service | Pod 2: search-service | DB: MongoDB (`studentdb.students`)

## Endpoints (via gateway)
| Method | URL | Purpose |
|---|---|---|
| POST | /api/registration/register | Register student |
| GET | /api/registration/students | All students |
| PUT | /api/registration/students/:id | Update student |
| GET | /api/search/students/id/:id | Search by ID |
| GET | /api/search/students/name/:name | Search by name |
