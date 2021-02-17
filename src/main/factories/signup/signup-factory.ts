import { DbAddAccount } from '../../../data/usecases/add-account/db-add-account'
import { BcryptAdapter } from '../../../infra/criptography/bcrypt-adapter/bcrypt-adapter'
import { AccountMongoRepository } from '../../../infra/db/mongodb/account/account-mongo-repository'
import { LogMongoRepository } from '../../../infra/db/mongodb/log/log-mongo-repository'
import { SignUpController } from '../../../presentation/controllers/signup/signup-controller'
import { makeSignupValidation } from './signup-validation-factory'
import { Controller } from '../../../presentation/protocols'
import { LogControllerDecorator } from '../../decorator/log-controller-decorator'

export const makeSignupController = (): Controller => {
	const bcryptAdapter = new BcryptAdapter(12)
	const accountRepository = new AccountMongoRepository()
	const dbAddAccount = new DbAddAccount(bcryptAdapter, accountRepository)
	const signupController = new SignUpController(dbAddAccount, makeSignupValidation())
	const logMongoRepository = new LogMongoRepository()
	return new LogControllerDecorator(signupController, logMongoRepository)
}
