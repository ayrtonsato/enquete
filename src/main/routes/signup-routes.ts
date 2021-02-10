import { Router } from 'express'
import { makeSignupController } from '../factories/signup'
import { adaptRoute } from '../adapters/express-router-adapter'

export default (router: Router): void => {
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	router.post('/signup', adaptRoute(makeSignupController()))
}
