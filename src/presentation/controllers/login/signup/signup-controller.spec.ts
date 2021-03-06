import { SignUpController } from './signup-controller'
import { EmailInUseError, MissingParamError } from '../../../errors'
import {
	AccountModel,
	AddAccount,
	AddAccountModel,
	Validation
} from './signup-controller-protocols'
import { HttpRequest } from '../../../protocols'
import { ok, badRequest, serverError, forbidden } from '../../../helpers/http/http-helpers'
import { Authentication, AuthenticationModel } from '../login/login-controller-protocols'

interface SutTypes {
	sut: SignUpController
	addAccountStub: AddAccount
	validationStub: Validation
	authenticationStub: Authentication
}

const makeAuthentication = (): Authentication => {
	class AuthenticationStub implements Authentication {
		async auth (authentication: AuthenticationModel): Promise<string> {
			return 'any_token'
		}
	}
	return new AuthenticationStub()
}

const makeAddAccount = (): AddAccount => {
	class AddAccountStub implements AddAccount {
		async add (account: AddAccountModel): Promise<AccountModel> {
			return await new Promise(resolve => resolve(makeFakeAccount()))
		}
	}
	return new AddAccountStub()
}

const makeValidation = (): Validation => {
	class ValidationStub implements Validation {
		validate (input: any): Error {
			return null
		}
	}
	return new ValidationStub()
}

const makeFakeAccount = (): AccountModel => ({
	id: 'valid_id',
	name: 'valid_name',
	email: 'valid_email@email.com',
	password: 'valid_password'
})

const makeSut = (): SutTypes => {
	const authenticationStub = makeAuthentication()
	const addAccountStub = makeAddAccount()
	const validationStub = makeValidation()
	const sut = new SignUpController(authenticationStub, addAccountStub, validationStub)
	return {
		sut,
		addAccountStub,
		validationStub,
		authenticationStub
	}
}

const makeFakeRequest = (): HttpRequest => ({
	body: {
		name: 'any_name',
		email: 'any_email@email.com',
		password: 'any_password',
		passwordConfirmation: 'any_password'
	}
})

describe('Signup Controller', () => {
	test('Should call add account with correct values', async () => {
		const { sut, addAccountStub } = makeSut()
		const addSpy = jest.spyOn(addAccountStub, 'add')
		const httpRequest = {
			body: {
				name: 'any_name',
				email: 'any_email@email.com',
				password: 'any_password',
				passwordConfirmation: 'any_password'
			}
		}
		await sut.handle(httpRequest)
		expect(addSpy).toHaveBeenCalledWith({
			name: 'any_name',
			email: 'any_email@email.com',
			password: 'any_password'
		})
	})

	test('Should return 200 if valid data is provided', async () => {
		const { sut } = makeSut()
		const httpResponse = await sut.handle(makeFakeRequest())
		expect(httpResponse).toEqual(ok({ accessToken: 'any_token' }))
	})

	test('Should return 403 if AddAccount returns null', async () => {
		const { sut, addAccountStub } = makeSut()
		jest.spyOn(addAccountStub, 'add').mockReturnValueOnce(new Promise(resolve => resolve(null)))
		const httpResponse = await sut.handle(makeFakeRequest())
		expect(httpResponse).toEqual(forbidden(new EmailInUseError()))
	})

	test('Should call validation with correct values', async () => {
		const { sut, validationStub } = makeSut()
		const validateStub = jest.spyOn(validationStub, 'validate')
		const httpRequest = makeFakeRequest()
		await sut.handle(httpRequest)
		expect(validateStub).toHaveBeenCalledWith(httpRequest.body)
	})

	test('Should return 400 if Validation returns an error', async () => {
		const { sut, validationStub } = makeSut()
		jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))
		const httpResponse = await sut.handle(makeFakeRequest())
		expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
	})

	test('Should call Authentication with correct value', async () => {
		const { sut, authenticationStub } = makeSut()
		const isValidSpy = jest.spyOn(authenticationStub, 'auth')
		await sut.handle(makeFakeRequest())
		expect(isValidSpy).toHaveBeenCalledWith({
			email: 'any_email@email.com',
			password: 'any_password'
		})
	})

	test('Should return 500 if authentication throws', async () => {
		const { sut, authenticationStub } = makeSut()
		jest.spyOn(authenticationStub, 'auth')
			.mockReturnValueOnce(
				new Promise((resolve, reject) => reject(new Error()))
			)
		const httpResponse = await sut.handle(makeFakeRequest())
		expect(httpResponse).toEqual(serverError(new Error()))
	})
})
