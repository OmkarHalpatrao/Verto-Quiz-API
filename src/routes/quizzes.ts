import { Router } from 'express';
import * as controller from '../controllers/quizController';


const router = Router();


router.get('/all-quiz', controller.listQuizzes);
router.post('/', controller.createQuiz);
router.post('/:quizId/questions', controller.addQuestions); 
router.get('/:quizId/questions', controller.getQuestionsForQuiz);
router.post('/:quizId/submit', controller.submitAnswers);


export default router;