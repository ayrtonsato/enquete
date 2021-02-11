import { DbAddAccount } from '../../data/usecases/add-account/db-add-account'
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infra/db/mongodb/account-repository/account'
import { LogMongoRepository } from '../../infra/db/mongodb/log-repository/log'
import { SignUpController } from '../../presentation/controllers/signup/signup'
import { makeSignupValidation } from './signup-validation'
import { Controller } from '../../presentation/protocols'
import { LogControllerDecorator } from '../decorator/log'

export const makeSignupController = (): Controller => {
	const bcryptAdapter = new BcryptAdapter(12)
	const accountRepository = new AccountMongoRepository()
	const dbAddAccount = new DbAddAccount(bcryptAdapter, accountRepository)
	const signupController = new SignUpController(dbAddAccount, makeSignupValidation())
	const logMongoRepository = new LogMongoRepository()
	return new LogControllerDecorator(signupController, logMongoRepository)
}
