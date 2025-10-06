import express from 'express';
import bodyParser from 'body-parser';
import quizzesRouter from './routes/quizzes';
import morgan from 'morgan';
const PORT = process.env.PORT || 4000;

const app = express();
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use('/quizzes', quizzesRouter);
app.get('/', (req, res) => res.send({ ok: true }));



app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));