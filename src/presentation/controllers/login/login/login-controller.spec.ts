import { Authentication, HttpRequest, Validation } from './login-controller-protocols'
import { MissingParamError } from '../../../errors'
import { badRequest, ok, serverError, unauthorized } from '../../../helpers/http/http-helpers'
import { LoginController } from './login-controller'
import { AuthenticationModel } from '../../../../domain/usecases/authentication'

interface SutTypes {
	sut: LoginController
	validationStub: Validation
	authenticationStub: Authentication
}

const makeValidation = (): Validation => {
	class ValidationStub implements Validation {
		validate (input: any): Error {
			return null
		}
	}
	return new ValidationStub()
}

const makeAuthentication = (): Authentication => {
	class AuthenticationStub implements Authentication {
		async auth (authentication: AuthenticationModel): Promise<string> {
			return 'any_token'
		}
	}
	return new AuthenticationStub()
}

const makeFakeRequest = (): HttpRequest => ({
	body: {
		email: 'any_email@email.com',
		password: 'any_password'
	}
})

const makeSut = (): SutTypes => {
	const authenticationStub = makeAuthentication()
	const validationStub = makeValidation()
	const sut = new LoginController(authenticationStub, validationStub)
	return {
		sut,
		validationStub,
		authenticationStub
	}
}

describe('Login Controller', () => {
	test('Should call Authentication with correct value', async () => {
		const { sut, authenticationStub } = makeSut()
		const isValidSpy = jest.spyOn(authenticationStub, 'auth')
		await sut.handle(makeFakeRequest())
		expect(isValidSpy).toHaveBeenCalledWith({
			email: 'any_email@email.com',
			password: 'any_password'
		})
	})

	test('Should return 401 if invalid credentials are provided', async () => {
		const { sut, authenticationStub } = makeSut()
		jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(new Promise(resolve => resolve(null)))
		const httpResponse = await sut.handle(makeFakeRequest())
		expect(httpResponse).toEqual(
			unauthorized()
		)
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

	test('Should return 200 if valid credentials are provided', async () => {
		const { sut } = makeSut()
		const httpResponse = await sut.handle(makeFakeRequest())
		expect(httpResponse).toEqual(ok({ accessToken: 'any_token' }))
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
})
