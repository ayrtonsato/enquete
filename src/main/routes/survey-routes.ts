/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { adaptMiddleware } from '../adapters/express-middleware-adapter'
import { adaptRoute } from '../adapters/express-router-adapter'
import { makeAddSurveyController } from '../factories/controllers/survey/add-survey/add-survey-controller-factory'
import { makeAuthMiddleware } from '../factories/middlewares/auth-middleware'

export default (router: Router): void => {
	const adminAuth = adaptMiddleware(makeAuthMiddleware('admin'))
	router.post('/surveys', adminAuth, adaptRoute(makeAddSurveyController()))
}
