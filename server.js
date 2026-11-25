const http = require('http');

let students = {};
let courses = {};
let registrations = [];
let nextRegId = 1;

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('/');
  
  // PUT /students/:id
  if (req.method === 'PUT' && urlParts[1] === 'students' && urlParts[2]) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const studentId = urlParts[2];
        const data = JSON.parse(body);
        students[studentId] = {
          id: studentId,
          name: data.name || '',
          status: data.status || 'active',
          coursesTaken: data.coursesTaken || []
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Student saved', student: students[studentId] }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: 'ERROR_BAD_JSON' }));
      }
    });
    return;
  }

  // PUT /courses/:id
  if (req.method === 'PUT' && urlParts[1] === 'courses' && urlParts[2]) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const courseId = urlParts[2];
        const data = JSON.parse(body);
        courses[courseId] = {
          id: courseId,
          title: data.title || '',
          prerequisites: data.prerequisites || []
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Course saved', course: courses[courseId] }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: 'ERROR_BAD_JSON' }));
      }
    });
    return;
  }

  // POST /registrations
  if (req.method === 'POST' && req.url === '/registrations') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        if (!body) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ result: 'ERROR_BAD_REQUEST' }));
        }
        const data = JSON.parse(body);
        const { studentID, courseID } = data;

        if (!studentID || !courseID) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ result: 'ERROR_BAD_REQUEST' }));
        }

        const student = students[studentID];
        if (!student) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ result: 'ERROR_NO_STUDENT' }));
        }

        if (student.status !== 'active') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ result: 'ERROR_INACTIVE_STUDENT' }));
        }

        const course = courses[courseID];
        if (!course) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ result: 'ERROR_NO_COURSE' }));
        }

        const prereqs = course.prerequisites || [];
        const studentCourses = student.coursesTaken || [];
        const hasAllPrereqs = prereqs.every(p => studentCourses.includes(p));

        if (!hasAllPrereqs) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ result: 'ERROR_PREREQUISITES' }));
        }

        const regRecord = {
          registrationID: nextRegId++,
          studentID,
          courseID,
          date: new Date().toISOString()
        };
        registrations.push(regRecord);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: 'OK', registration: regRecord }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: 'ERROR_BAD_JSON' }));
      }
    });
    return;
  }

  // GET /registrations
  if (req.method === 'GET' && req.url === '/registrations') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(registrations));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not Found' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
