import { SignUpController } from './signup-controller'
import { MissingParamError } from '../../errors'
import {
	AccountModel,
	AddAccount,
	AddAccountModel,
	Validation
} from './signup-controller-protocols'
import { HttpRequest } from '../../protocols'
import { ok, badRequest } from '../../helpers/http/http-helpers'

interface SutTypes {
	sut: SignUpController
	addAccountStub: AddAccount
	validationStub: Validation
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
	const addAccountStub = makeAddAccount()
	const validationStub = makeValidation()
	const sut = new SignUpController(addAccountStub, validationStub)
	return {
		sut,
		addAccountStub,
		validationStub
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
		expect(httpResponse).toEqual(ok(makeFakeAccount()))
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
