import { SignUpController } from '../../../../../presentation/controllers/login/signup/signup-controller'
import { makeSignupValidation } from './signup-validation-factory'
import { Controller } from '../../../../../presentation/protocols'
import { makeDbAuthentication } from '../../../usecases/account/authentication/db-authentication-factory'
import { makeDbAddAccount } from '../../../usecases/account/add-account/db-add-account-factory'
import { makeLogControllerDecorator } from '../../../decorators/log-controller-decorator-factory'

export const makeSignupController = (): Controller => {
	const controller = new SignUpController(makeDbAuthentication(), makeDbAddAccount(), makeSignupValidation())
	return makeLogControllerDecorator(controller)
}
