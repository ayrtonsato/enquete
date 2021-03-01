import { forbidden, ok, serverError } from '../helpers/http/http-helpers'
import { LoadAccountByToken, HttpRequest } from './auth-middleware-protocols'
import { AccessDeniedError } from '../errors'
import { AuthMiddleware } from './auth-middleware'
import { AccountModel } from '../../domain/models/account'

const makeFakeRequest = (): HttpRequest => ({
	headers: {
		'x-access-token': 'any_token'
	}
})

const makeFakeAccount = (): AccountModel => ({
	id: 'valid_id',
	name: 'valid_name',
	email: 'valid_email@email.com',
	password: 'hashed_password'
})

interface SutTypes {
	sut: AuthMiddleware
	loadAccountByTokenStub: LoadAccountByToken
}

const makeLoadAccountByToken = (): LoadAccountByToken => {
	class LoadAccountByTokenStub implements LoadAccountByToken {
		async loadByToken (accessToken: string, role?: string): Promise<AccountModel> {
			return await new Promise(resolve => resolve(makeFakeAccount()))
		}
	}
	return new LoadAccountByTokenStub()
}

const makeSut = (role?: string): SutTypes => {
	const loadAccountByTokenStub = makeLoadAccountByToken()
	const sut = new AuthMiddleware(loadAccountByTokenStub, role)
	return {
		loadAccountByTokenStub,
		sut
	}
}

describe('Auth Middleware', () => {
	test('Should return 403 if no x-access-token exists in headers', async () => {
		const { sut } = makeSut()
		const httpResponse = await sut.handle({})
		expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
	})

	test('Should call LoadAccountByToken with correct accessToken', async () => {
		const role = 'any_role'
		const { sut, loadAccountByTokenStub } = makeSut(role)
		const loadSpy = jest.spyOn(loadAccountByTokenStub, 'loadByToken')
		await sut.handle(makeFakeRequest())
		expect(loadSpy).toHaveBeenCalledWith('any_token', role)
	})

	test('Should return 403 if LoadAccountByToken returns null', async () => {
		const { sut, loadAccountByTokenStub } = makeSut()
		jest.spyOn(loadAccountByTokenStub, 'loadByToken').mockReturnValueOnce(new Promise(resolve => resolve(null)))
		const httpResponse = await sut.handle(makeFakeRequest())
		expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
	})

	test('Should return 200 if LoadAccountByToken returns an account', async () => {
		const { sut } = makeSut()
		const httpResponse = await sut.handle(makeFakeRequest())
		expect(httpResponse).toEqual(ok({ accountId: 'valid_id' }))
	})

	test('Should return 500 if LoadAccountByToken throws', async () => {
		const { sut, loadAccountByTokenStub } = makeSut()
		jest.spyOn(loadAccountByTokenStub, 'loadByToken').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const httpResponse = await sut.handle(makeFakeRequest())
		expect(httpResponse).toEqual(serverError(new Error()))
	})
})
