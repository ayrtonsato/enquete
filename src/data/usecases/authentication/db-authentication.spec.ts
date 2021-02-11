
import { AuthenticationModel } from '../../../domain/usecases/authentication'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../add-account/db-add-account-protocols'
import { DbAuthentication } from './db-authentication'

interface SutTypes {
	sut: DbAuthentication
	loadAccountByRepositoryStub: LoadAccountByEmailRepository
}

const makeFakeAccount = (): AccountModel => ({
	id: 'any_id',
	name: 'any_name',
	email: 'any_email@email.com',
	password: 'any_password'
})
const makeFakeAuthentication = (): AuthenticationModel => ({
	email: 'any_email@email.com',
	password: 'any_password'
})

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
	class LoadAccountByRepositoryStub implements LoadAccountByEmailRepository {
		async load (email: string): Promise<AccountModel> {
			return await new Promise(resolve => resolve(makeFakeAccount()))
		}
	}
	return new LoadAccountByRepositoryStub()
}

const makeSut = (): SutTypes => {
	const loadAccountByRepositoryStub = makeLoadAccountByEmailRepository()
	const sut = new DbAuthentication(loadAccountByRepositoryStub)
	return {
		sut,
		loadAccountByRepositoryStub
	}
}

describe('DbAuthentication UseCase', () => {
	test('Should call LoadAccountByEmailRepository with correct email', async () => {
		const {
			sut,
			loadAccountByRepositoryStub
		} = makeSut()
		const loadSpy = jest.spyOn(loadAccountByRepositoryStub, 'load')
		await sut.auth(makeFakeAuthentication())
		expect(loadSpy).toHaveBeenCalledWith('any_email@email.com')
	})
})
